export const NOTE_TYPES = [
  "character",
  "item",
  "technique",
  "realm",
  "sect",
  "location",
  "event",
  "other"
] as const;

export type NoteType = (typeof NOTE_TYPES)[number];

export type ChapterChunk = {
  id: string;
  novel_id: string;
  chapter_id: string;
  chapter_number: number;
  chunk_index: number;
  content: string;
  created_at: string;
};

export type SearchMatchMode = "exact" | "fuzzy";

export type SearchResult = ChapterChunk & {
  score: number;
  match_count: number;
  novel_title: string;
  chapter_title: string;
};

export type ResearchNote = {
  id: string;
  novel_id: string;
  chapter_id: string | null;
  chunk_id: string | null;
  title: string;
  note_type: NoteType;
  content: string;
  user_note: string | null;
  created_at: string;
  chapter_number: number | null;
  chapter_title: string | null;
};