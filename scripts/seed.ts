import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "../src/lib/supabase";

const KNOWLEDGE_DIR = path.join(__dirname, "..", "knowledge");
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSION = 768;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Groups markdown into sections at H1/H2 boundaries, then further splits any
// section that's still too long by paragraph. Headers already give natural
// retrieval boundaries for these knowledge docs, so no overlap is needed.
function chunkMarkdown(markdown: string, maxChars = 1000): string[] {
  const lines = markdown.split("\n");
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,2}\s/.test(line) && current.length > 0) {
      sections.push(current.join("\n").trim());
      current = [];
    }
    current.push(line);
  }
  if (current.length) sections.push(current.join("\n").trim());

  const chunks: string[] = [];
  for (const section of sections) {
    if (section.length <= maxChars) {
      chunks.push(section);
      continue;
    }
    const paragraphs = section.split(/\n\n+/);
    let buffer = "";
    for (const paragraph of paragraphs) {
      if (buffer && (buffer + "\n\n" + paragraph).length > maxChars) {
        chunks.push(buffer.trim());
        buffer = paragraph;
      } else {
        buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      }
    }
    if (buffer) chunks.push(buffer.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

function l2Normalize(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vector : vector.map((v) => v / norm);
}

async function embed(text: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSION,
      taskType: "RETRIEVAL_DOCUMENT",
    },
  });
  const values = response.embeddings?.[0]?.values;
  if (!values) throw new Error(`No embedding returned for text: ${text.slice(0, 60)}...`);
  // MRL-truncated embeddings (any dimension other than the model's native
  // 3072) aren't pre-normalized — normalize before storing for cosine search.
  return l2Normalize(values);
}

function titleFromMarkdown(markdown: string, fallback: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : fallback;
}

async function seedDocument(filename: string) {
  const filePath = path.join(KNOWLEDGE_DIR, filename);
  const markdown = await readFile(filePath, "utf-8");
  const title = titleFromMarkdown(markdown, filename);

  const { data: document, error: documentError } = await supabaseAdmin
    .from("documents")
    .insert({ title, source: filename })
    .select()
    .single();
  if (documentError) throw documentError;

  const chunks = chunkMarkdown(markdown);
  console.log(`  ${filename}: ${chunks.length} chunk(s)`);

  for (const content of chunks) {
    const embedding = await embed(content);
    const { error: chunkError } = await supabaseAdmin
      .from("chunks")
      .insert({ document_id: document.id, content, embedding });
    if (chunkError) throw chunkError;
  }
}

async function main() {
  console.log("Clearing existing documents/chunks...");
  // chunks cascade-deletes via document_id FK when documents are deleted.
  const { error: clearError } = await supabaseAdmin
    .from("documents")
    .delete()
    .not("id", "is", null);
  if (clearError) throw clearError;

  const files = (await readdir(KNOWLEDGE_DIR)).filter((f) => f.endsWith(".md"));
  console.log(`Seeding ${files.length} document(s) from ${KNOWLEDGE_DIR}`);

  for (const filename of files) {
    await seedDocument(filename);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
