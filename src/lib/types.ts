export type ChapterInput = {
  chapter_number: number;
  chapter_title: string;
  content: string;
};

export type NovelSummary = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  created_at: string;
  chapter_count: number;
};

export type ChapterListItem = {
  id: string;
  novel_id: string;
  chapter_number: number;
  chapter_title: string;
  created_at: string;
};

export type NovelWithChapters = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  created_at: string;
  chapters: ChapterListItem[];
};

export type ChapterWithNovel = ChapterListItem & {
  content: string;
  novel: {
    id: string;
    title: string;
    author: string | null;
  };
};
