create extension if not exists pg_trgm;

create table if not exists public.chapter_chunks (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  chapter_number integer not null,
  chunk_index integer not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chapter_chunks_unique unique (novel_id, chapter_id, chunk_index)
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  novel_id uuid not null references public.novels(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete set null,
  chunk_id uuid references public.chapter_chunks(id) on delete set null,
  title text not null,
  note_type text not null default 'other' check (
    note_type in ('character', 'item', 'technique', 'realm', 'sect', 'location', 'event', 'other')
  ),
  content text not null,
  user_note text,
  created_at timestamptz not null default now()
);

create index if not exists chapter_chunks_novel_id_idx on public.chapter_chunks (novel_id);
create index if not exists chapter_chunks_chapter_id_idx on public.chapter_chunks (chapter_id);
create index if not exists chapter_chunks_novel_chapter_idx on public.chapter_chunks (novel_id, chapter_number, chunk_index);
create index if not exists chapter_chunks_content_trgm_idx on public.chapter_chunks using gin (content gin_trgm_ops);
create index if not exists research_notes_novel_id_idx on public.research_notes (novel_id);
create index if not exists research_notes_note_type_idx on public.research_notes (novel_id, note_type);
create index if not exists research_notes_created_at_idx on public.research_notes (created_at desc);

alter table public.chapter_chunks enable row level security;
alter table public.research_notes enable row level security;

comment on table public.chapter_chunks is 'Searchable natural text chunks generated from chapters.';
comment on table public.research_notes is 'Saved source excerpts for pre-script research.';