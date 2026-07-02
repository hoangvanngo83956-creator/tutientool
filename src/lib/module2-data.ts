import { splitContentIntoChunks } from "@/lib/chunking";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NOTE_TYPES, type NoteType, type ResearchNote, type SearchMatchMode, type SearchResult } from "@/lib/module2-types";

const SEARCH_LIMIT = 50;
const SEARCH_FETCH_LIMIT = 300;

type ChapterForChunking = {
  id: string;
  novel_id: string;
  chapter_number: number;
  content: string;
};

type ChunkSearchRow = {
  id: string;
  novel_id: string;
  chapter_id: string;
  chapter_number: number;
  chunk_index: number;
  content: string;
  created_at: string;
  chapters: { chapter_title: string | null } | null;
  novels: { title: string | null } | null;
};

type ResearchNoteRow = Omit<ResearchNote, "chapter_number" | "chapter_title"> & {
  chapters: { chapter_number: number | null; chapter_title: string | null } | null;
};

export async function generateChunksForNovel(novelId: string) {
  const supabase = getSupabaseServerClient();
  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id,novel_id,chapter_number,content")
    .eq("novel_id", novelId)
    .order("chapter_number", { ascending: true });

  if (chaptersError) {
    throw chaptersError;
  }

  const rows = ((chapters ?? []) as ChapterForChunking[]).flatMap((chapter) =>
    splitContentIntoChunks(chapter.content).map((content, chunkIndex) => ({
      novel_id: chapter.novel_id,
      chapter_id: chapter.id,
      chapter_number: chapter.chapter_number,
      chunk_index: chunkIndex,
      content
    }))
  );

  if (rows.length === 0) {
    return { created: 0 };
  }

  const { error } = await supabase.from("chapter_chunks").upsert(rows, {
    onConflict: "novel_id,chapter_id,chunk_index",
    ignoreDuplicates: true
  });

  if (error) {
    throw error;
  }

  return { created: rows.length };
}

export async function searchNovelChunks(input: {
  novelId: string;
  query: string;
  fromChapter?: number | null;
  toChapter?: number | null;
  matchMode: SearchMatchMode;
}) {
  const query = input.query.trim();
  if (!query) {
    return [];
  }

  const supabase = getSupabaseServerClient();
  let request = supabase
    .from("chapter_chunks")
    .select("id,novel_id,chapter_id,chapter_number,chunk_index,content,created_at,chapters(chapter_title),novels(title)")
    .eq("novel_id", input.novelId)
    .order("chapter_number", { ascending: true })
    .order("chunk_index", { ascending: true })
    .limit(SEARCH_FETCH_LIMIT);

  if (input.fromChapter != null) {
    request = request.gte("chapter_number", input.fromChapter);
  }

  if (input.toChapter != null) {
    request = request.lte("chapter_number", input.toChapter);
  }

  if (input.matchMode === "exact") {
    request = request.ilike("content", `%${sanitizeLikeTerm(query)}%`);
  } else {
    const terms = tokenize(query).slice(0, 8);
    if (terms.length === 0) {
      return [];
    }
    request = request.or(terms.map((term) => `content.ilike.%${sanitizeLikeTerm(term)}%`).join(","));
  }

  const { data, error } = await request;
  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as ChunkSearchRow[];
  return rows
    .map((row) => scoreSearchResult(row, query, input.matchMode))
    .filter((result) => result.match_count > 0)
    .sort((a, b) => b.score - a.score || a.chapter_number - b.chapter_number || a.chunk_index - b.chunk_index)
    .slice(0, SEARCH_LIMIT);
}

export async function createResearchNote(input: {
  novelId: string;
  chapterId: string;
  chunkId: string;
  title: string;
  noteType: NoteType;
  content: string;
  userNote: string;
}) {
  const supabase = getSupabaseServerClient();
  const noteType = NOTE_TYPES.includes(input.noteType) ? input.noteType : "other";
  const { data, error } = await supabase
    .from("research_notes")
    .insert({
      novel_id: input.novelId,
      chapter_id: input.chapterId,
      chunk_id: input.chunkId,
      title: input.title,
      note_type: noteType,
      content: input.content,
      user_note: input.userNote || null
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listResearchNotes(novelId: string): Promise<ResearchNote[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("research_notes")
    .select("id,novel_id,chapter_id,chunk_id,title,note_type,content,user_note,created_at,chapters(chapter_number,chapter_title)")
    .eq("novel_id", novelId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as ResearchNoteRow[]).map((note) => ({
    id: note.id,
    novel_id: note.novel_id,
    chapter_id: note.chapter_id,
    chunk_id: note.chunk_id,
    title: note.title,
    note_type: normalizeNoteType(note.note_type),
    content: note.content,
    user_note: note.user_note,
    created_at: note.created_at,
    chapter_number: note.chapters?.chapter_number ?? null,
    chapter_title: note.chapters?.chapter_title ?? null
  }));
}

export async function deleteResearchNote(noteId: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("research_notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }
}

function scoreSearchResult(row: ChunkSearchRow, query: string, matchMode: SearchMatchMode): SearchResult {
  const normalizedContent = row.content.toLocaleLowerCase("vi-VN");
  const normalizedQuery = query.toLocaleLowerCase("vi-VN");
  const exactCount = countOccurrences(normalizedContent, normalizedQuery);
  const termCount = tokenize(query).reduce(
    (total, term) => total + countOccurrences(normalizedContent, term.toLocaleLowerCase("vi-VN")),
    0
  );
  const matchCount = matchMode === "exact" ? exactCount : termCount;
  const score = exactCount * 10 + termCount + (matchMode === "exact" && exactCount > 0 ? 25 : 0);

  return {
    id: row.id,
    novel_id: row.novel_id,
    chapter_id: row.chapter_id,
    chapter_number: row.chapter_number,
    chunk_index: row.chunk_index,
    content: row.content,
    created_at: row.created_at,
    score,
    match_count: matchCount,
    novel_title: row.novels?.title || "Không rõ truyện",
    chapter_title: row.chapters?.chapter_title || `Chương ${row.chapter_number}`
  };
}

function tokenize(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .split(/[\s,.;:!?()[\]{}"'“”‘’]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function countOccurrences(text: string, query: string) {
  if (!query) {
    return 0;
  }

  let count = 0;
  let index = text.indexOf(query);
  while (index !== -1) {
    count += 1;
    index = text.indexOf(query, index + query.length);
  }
  return count;
}

function sanitizeLikeTerm(value: string) {
  return value.replace(/[%,]/g, "").trim();
}

function normalizeNoteType(value: string): NoteType {
  return NOTE_TYPES.includes(value as NoteType) ? (value as NoteType) : "other";
}