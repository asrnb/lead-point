import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ data: leads }, { count: conversationCount }] = await Promise.all([
    supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("conversations").select("*", { count: "exact", head: true }),
  ]);

  const qualifiedCount = leads?.length ?? 0;
  const totalConversations = conversationCount ?? 0;
  const conversionRate =
    totalConversations > 0 ? Math.round((qualifiedCount / totalConversations) * 100) : 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-foreground">LeadPilot Admin</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Conversations" value={totalConversations} />
        <StatCard label="Qualified Leads" value={qualifiedCount} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-foreground/70">
            <tr>
              <th className="px-4 py-2">Score</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Service</th>
              <th className="px-4 py-2">Urgency</th>
              <th className="px-4 py-2">Insurance</th>
              <th className="px-4 py-2">Synced</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Transcript</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-t border-border">
                <td className="px-4 py-2 font-medium">{lead.score}</td>
                <td className="px-4 py-2">{lead.name ?? "—"}</td>
                <td className="px-4 py-2">{lead.contact ?? "—"}</td>
                <td className="px-4 py-2">{lead.service ?? "—"}</td>
                <td className="px-4 py-2">{lead.urgency}</td>
                <td className="px-4 py-2">{lead.insurance}</td>
                <td className="px-4 py-2">{lead.synced_to_crm ? "✓" : "—"}</td>
                <td className="px-4 py-2">{new Date(lead.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/conversations/${lead.conversation_id}`}
                    className="text-accent hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {(leads ?? []).length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-foreground/50">
                  No qualified leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-xs text-foreground/60">{label}</div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
