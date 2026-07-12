import { generateObject } from "ai";
import { z } from "zod";
import { getLlmAdapter } from "./llm";

export const UrgencyEnum = z.enum(["asap", "this_month", "researching", "unknown"]);
export const InsuranceEnum = z.enum(["has_insurance", "no_insurance", "unknown"]);

export type Urgency = z.infer<typeof UrgencyEnum>;
export type Insurance = z.infer<typeof InsuranceEnum>;

const extractionSchema = z.object({
  name: z.string().nullable().describe("Visitor's name, if they've given it"),
  contact: z.string().nullable().describe("Email or phone number, if given"),
  service: z.string().nullable().describe("Dental service they're interested in, if mentioned"),
  urgency: UrgencyEnum,
  insurance: InsuranceEnum,
});

export type ExtractedFields = z.infer<typeof extractionSchema>;

export type QualificationResult = ExtractedFields & { score: number };

type ChatMessage = { role: "user" | "assistant"; content: string };

const EXTRACTION_PROMPT = `Read this conversation between a visitor and a dental clinic's chat assistant. Extract what's known about the visitor so far. Only use "asap" or "this_month" for urgency if the visitor actually indicated a timeline; use "researching" if they said they're just looking, and "unknown" if it was never discussed. Same logic for insurance: only "has_insurance" or "no_insurance" if stated, otherwise "unknown".`;

export async function extractLeadFields(messages: ChatMessage[]): Promise<ExtractedFields> {
  const { model } = getLlmAdapter();
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const { object } = await generateObject({
    model,
    schema: extractionSchema,
    prompt: `${EXTRACTION_PROMPT}\n\nConversation:\n${transcript}`,
  });

  return object;
}

// Deterministic — the model extracts facts, but scoring itself is pure code,
// not something we trust the model's arithmetic for.
export function computeScore(fields: ExtractedFields): number {
  let score = 0;
  if (fields.contact) score += 40;
  if (fields.service) score += 20;
  if (fields.urgency === "asap" || fields.urgency === "this_month") score += 25;
  if (fields.insurance === "has_insurance") score += 15;
  return score;
}

export const QUALIFIED_THRESHOLD = 60;

export async function qualifyConversation(
  messages: ChatMessage[],
): Promise<QualificationResult> {
  const fields = await extractLeadFields(messages);
  return { ...fields, score: computeScore(fields) };
}
