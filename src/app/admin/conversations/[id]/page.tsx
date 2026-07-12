import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type StoredMessage = { role: "user" | "assistant"; content: string };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (!conversation) notFound();

  const messages = conversation.messages as StoredMessage[];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/admin" className="text-sm text-accent hover:underline">
        ← Back to leads
      </Link>
      <h1 className="mt-4 mb-6 text-xl font-semibold text-foreground">Transcript</h1>
      <div className="space-y-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
              message.role === "user"
                ? "bg-accent/10"
                : "border border-border bg-surface"
            }`}
          >
            <div className="mb-1 text-xs font-medium uppercase text-foreground/50">
              {message.role}
            </div>
            {message.content}
          </div>
        ))}
      </div>
    </main>
  );
}
