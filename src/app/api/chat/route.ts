import { streamText, type ModelMessage } from "ai";
import { buildContextBlock, retrieveContext } from "@/lib/rag";
import { buildSystemPrompt, getLlmAdapter } from "@/lib/llm";
import { supabaseAdmin } from "@/lib/supabase";
import { qualifyConversation, QUALIFIED_THRESHOLD } from "@/lib/qualify";
import { getCrmAdapter } from "@/lib/crm";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const { sessionId, messages } = (await req.json()) as {
    sessionId: string;
    messages: ChatMessage[];
  };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    return new Response("No user message in request", { status: 400 });
  }

  const chunks = await retrieveContext(lastUserMessage.content);

  if (process.env.NODE_ENV !== "production") {
    console.log(`[rag] query: "${lastUserMessage.content}"`);
    for (const [i, chunk] of chunks.entries()) {
      console.log(
        `[rag]   #${i + 1} similarity=${chunk.similarity.toFixed(3)} "${chunk.content.slice(0, 80).replace(/\n/g, " ")}..."`,
      );
    }
  }

  const { model } = getLlmAdapter();

  const result = streamText({
    model,
    system: buildSystemPrompt(buildContextBlock(chunks)),
    messages: messages as ModelMessage[],
    onFinish: async ({ text }) => {
      const fullMessages = [...messages, { role: "assistant" as const, content: text }];
      const conversation = await persistConversation(sessionId, fullMessages);
      if (conversation) await qualifyAndSync(conversation.id, fullMessages);
    },
  });

  return result.toTextStreamResponse();
}

async function persistConversation(sessionId: string, messages: ChatMessage[]) {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .upsert({ session_id: sessionId, messages }, { onConflict: "session_id" })
    .select()
    .single();
  if (error) {
    console.error("Failed to persist conversation:", error);
    return null;
  }
  return data;
}

// Runs every turn (see docs/adr/0001-lead-lifecycle.md): a Lead is upserted
// keyed by conversation_id, and once it exists it keeps getting updated and
// re-synced even if a later recomputed score dips back under the threshold.
async function qualifyAndSync(conversationId: string, messages: ChatMessage[]) {
  const { data: existingLead } = await supabaseAdmin
    .from("leads")
    .select("id")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  const result = await qualifyConversation(messages);
  const isQualified = result.score >= QUALIFIED_THRESHOLD;
  if (!existingLead && !isQualified) return;

  const { data: lead, error } = await supabaseAdmin
    .from("leads")
    .upsert(
      {
        conversation_id: conversationId,
        name: result.name,
        contact: result.contact,
        service: result.service,
        urgency: result.urgency,
        insurance: result.insurance,
        score: result.score,
      },
      { onConflict: "conversation_id" },
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to upsert lead:", error);
    return;
  }

  try {
    await getCrmAdapter().sync({
      id: lead.id,
      name: lead.name,
      contact: lead.contact,
      service: lead.service,
      urgency: lead.urgency,
      insurance: lead.insurance,
      score: lead.score,
      createdAt: lead.created_at,
    });
    await supabaseAdmin.from("leads").update({ synced_to_crm: true }).eq("id", lead.id);
  } catch (err) {
    console.error("Failed to sync lead to CRM:", err);
  }
}
