-- PostgREST can't express a `<=>` (cosine distance) ORDER BY through its
-- query builder, so retrieval goes through this RPC instead.
create function match_chunks(query_embedding vector(768), match_count int default 5)
returns table (
  id uuid,
  document_id uuid,
  content text,
  similarity float
)
language sql stable
as $$
  select
    chunks.id,
    chunks.document_id,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;
