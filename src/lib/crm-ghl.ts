import type { CrmAdapter, CrmLead } from "./crm";

/**
 * Stub only — demonstrates how a real deployment would swap the CRM sink
 * from Google Sheets to GoHighLevel (the CRM many dental clinics and the
 * agencies serving them actually run on) without touching any other part
 * of the app: `qualifyAndSync` in api/chat/route.ts only depends on the
 * `CrmAdapter` interface, not on `SheetsAdapter` specifically.
 *
 * Not wired up or tested against a real GHL account — this is a portfolio
 * artifact showing the shape of the swap, not a working integration.
 */
export class GhlAdapter implements CrmAdapter {
  private apiKey = process.env.GHL_API_KEY!;
  private locationId = process.env.GHL_LOCATION_ID!;

  async sync(lead: CrmLead): Promise<void> {
    // GHL's v2 API upserts a contact by matching on email/phone, then tags
    // it and stashes the qualification fields as custom fields — so this
    // is naturally idempotent across repeat syncs of the same Lead, same
    // as SheetsAdapter's find-or-append.
    const response = await fetch("https://services.leadconnectorhq.com/contacts/upsert", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId: this.locationId,
        name: lead.name,
        email: lead.contact?.includes("@") ? lead.contact : undefined,
        phone: lead.contact?.includes("@") ? undefined : lead.contact,
        tags: [`score-${lead.score}`, lead.urgency, lead.insurance],
        customFields: [
          { key: "leadpilot_lead_id", field_value: lead.id },
          { key: "service_interest", field_value: lead.service ?? "" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`GHL contact upsert failed: ${response.status} ${await response.text()}`);
    }
  }
}
