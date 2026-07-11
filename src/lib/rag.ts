import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "./supabase";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768;
const TOP_K = 5;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vector : vector.map((v) => v / norm);
}

async function embedQuery(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSION,
      taskType: "RETRIEVAL_QUERY",
    },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error("No embedding returned for query");
  return l2Normalize(values);
}

export type RetrievedChunk = {
  id: string;
  documentId: string;
  content: string;
  similarity: number;
};

export async function retrieveContext(query: string): Promise<RetrievedChunk[]> {
  const queryEmbedding = await embedQuery(query);

  type MatchChunksRow = {
    id: string;
    document_id: string;
    content: string;
    similarity: number;
  };

  const { data, error } = await supabaseAdmin.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: TOP_K,
  });
  if (error) throw error;

  return ((data ?? []) as MatchChunksRow[]).map((row) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    similarity: row.similarity,
  }));
}

export function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.content}`)
    .join("\n\n---\n\n");
}
