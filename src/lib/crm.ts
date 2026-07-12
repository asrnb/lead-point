import { google } from "googleapis";

const SHEET_NAME = "Leads";
const HEADER = [
  "Lead ID",
  "Name",
  "Contact",
  "Service",
  "Urgency",
  "Insurance",
  "Score",
  "Created At",
];

export type CrmLead = {
  id: string;
  name: string | null;
  contact: string | null;
  service: string | null;
  urgency: string;
  insurance: string;
  score: number;
  createdAt: string;
};

export interface CrmAdapter {
  sync(lead: CrmLead): Promise<void>;
}

function getAuth() {
  const keyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!keyBase64) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY_BASE64 is not set");
  const credentials = JSON.parse(Buffer.from(keyBase64, "base64").toString("utf-8"));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function rowFor(lead: CrmLead): string[] {
  return [
    lead.id,
    lead.name ?? "",
    lead.contact ?? "",
    lead.service ?? "",
    lead.urgency,
    lead.insurance,
    String(lead.score),
    lead.createdAt,
  ];
}

// A GhlAdapter (GoHighLevel) would implement the same CrmAdapter interface,
// posting to GHL's contacts API instead of a spreadsheet — nothing else in
// the app would need to change.
export class SheetsAdapter implements CrmAdapter {
  private sheets = google.sheets({ version: "v4", auth: getAuth() });
  private spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
  private sheetReady: Promise<void> | null = null;

  async sync(lead: CrmLead): Promise<void> {
    await this.ensureSheetTab();
    await this.ensureHeader();
    const rowNumber = await this.findRowNumber(lead.id);
    const values = [rowFor(lead)];

    if (rowNumber === null) {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A:H`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    } else {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A${rowNumber}:H${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });
    }
  }

  // New Google Sheets default to a "Sheet1" tab, not "Leads" — create the
  // tab if it's missing rather than asking users to rename it by hand.
  private async ensureSheetTab(): Promise<void> {
    if (!this.sheetReady) {
      this.sheetReady = (async () => {
        const { data } = await this.sheets.spreadsheets.get({
          spreadsheetId: this.spreadsheetId,
          fields: "sheets.properties.title",
        });
        const exists = data.sheets?.some((s) => s.properties?.title === SHEET_NAME);
        if (!exists) {
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: { requests: [{ addSheet: { properties: { title: SHEET_NAME } } }] },
          });
        }
      })();
    }
    await this.sheetReady;
  }

  private async findRowNumber(leadId: string): Promise<number | null> {
    const { data } = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${SHEET_NAME}!A:A`,
    });
    const rows = data.values ?? [];
    const index = rows.findIndex((row) => row[0] === leadId);
    return index === -1 ? null : index + 1; // Sheets rows are 1-indexed
  }

  private async ensureHeader(): Promise<void> {
    const { data } = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${SHEET_NAME}!A1:H1`,
    });
    if (!data.values || data.values.length === 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${SHEET_NAME}!A1:H1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADER] },
      });
    }
  }
}

export function getCrmAdapter(): CrmAdapter {
  return new SheetsAdapter();
}
