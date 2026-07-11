import { streamText, type ModelMessage } from "ai";
import { buildContextBlock, retrieveContext } from "@/lib/rag";
import { buildSystemPrompt, getLlmAdapter } from "@/lib/llm";
import { supabaseAdmin } from "@/lib/supabase";

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
      await persistConversation(sessionId, [
        ...messages,
        { role: "assistant", content: text },
      ]);
    },
  });

  return result.toTextStreamResponse();
}

async function persistConversation(sessionId: string, messages: ChatMessage[]) {
  const { error } = await supabaseAdmin
    .from("conversations")
    .upsert({ session_id: sessionId, messages }, { onConflict: "session_id" });
  if (error) console.error("Failed to persist conversation:", error);
}
