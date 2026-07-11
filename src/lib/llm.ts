import { createGoogle } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export interface LlmAdapter {
  model: LanguageModel;
}

const google = createGoogle({ apiKey: process.env.GEMINI_API_KEY });

// GroqAdapter slots in the same way once @ai-sdk/groq is installed:
// const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
// adapters.groq = () => ({ model: groq("llama-3.3-70b-versatile") });
const adapters: Record<string, () => LlmAdapter> = {
  gemini: () => ({ model: google("gemini-flash-latest") }),
};

export function getLlmAdapter(): LlmAdapter {
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  const factory = adapters[provider];
  if (!factory) throw new Error(`Unknown LLM_PROVIDER: ${provider}`);
  return factory();
}

export function buildSystemPrompt(contextBlock: string): string {
  return `You are a friendly receptionist for Riverside Dental Clinic, answering questions from the clinic's website.

Answer ONLY using the context below. If the answer isn't in the context, say you're not sure and offer to take the visitor's contact details so the clinic can follow up — never invent pricing, medical advice, or anything not stated in the context.

Context:
${contextBlock}`;
}
