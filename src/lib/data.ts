import type { ChapterInput, ChapterListItem, ChapterWithNovel, NovelSummary, NovelWithChapters } from "@/lib/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type NovelRow = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  created_at: string;
};

type NovelWithChapterIds = NovelRow & {
  chapters?: { id: string }[];
};

export async function getDashboardData() {
  const [novels, latestChapter] = await Promise.all([listNovels(), getLatestChapter()]);
  const chapterCount = novels.reduce((total, novel) => total + novel.chapter_count, 0);

  return {
    novels,
    latestChapter,
    chapterCount
  };
}

export async function listNovels(): Promise<NovelSummary[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("novels")
    .select("id,title,author,description,created_at,chapters(id)")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as NovelWithChapterIds[]).map((novel) => ({
    id: novel.id,
    title: novel.title,
    author: novel.author,
    description: novel.description,
    created_at: novel.created_at,
    chapter_count: novel.chapters?.length ?? 0
  }));
}

export async function getNovelWithChapters(novelId: string): Promise<NovelWithChapters | null> {
  const supabase = getSupabaseServerClient();

  const [{ data: novel, error: novelError }, { data: chapters, error: chaptersError }] = await Promise.all([
    supabase.from("novels").select("id,title,author,description,created_at").eq("id", novelId).maybeSingle(),
    supabase
      .from("chapters")
      .select("id,novel_id,chapter_number,chapter_title,created_at")
      .eq("novel_id", novelId)
      .order("chapter_number", { ascending: true })
  ]);

  if (novelError) {
    throw novelError;
  }

  if (chaptersError) {
    throw chaptersError;
  }

  if (!novel) {
    return null;
  }

  return {
    ...(novel as NovelRow),
    chapters: (chapters ?? []) as ChapterListItem[]
  };
}

export async function getChapter(chapterId: string): Promise<ChapterWithNovel | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id,novel_id,chapter_number,chapter_title,content,created_at,novels(id,title,author)")
    .eq("id", chapterId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as Omit<ChapterWithNovel, "novel"> & {
    novels: ChapterWithNovel["novel"];
  };

  return {
    id: row.id,
    novel_id: row.novel_id,
    chapter_number: row.chapter_number,
    chapter_title: row.chapter_title,
    content: row.content,
    created_at: row.created_at,
    novel: row.novels
  };
}

export async function getLatestChapter(): Promise<ChapterWithNovel | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("id,novel_id,chapter_number,chapter_title,content,created_at,novels(id,title,author)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as unknown as Omit<ChapterWithNovel, "novel"> & {
    novels: ChapterWithNovel["novel"];
  };

  return {
    id: row.id,
    novel_id: row.novel_id,
    chapter_number: row.chapter_number,
    chapter_title: row.chapter_title,
    content: row.content,
    created_at: row.created_at,
    novel: row.novels
  };
}

export async function createNovelWithChapters(input: {
  title: string;
  author: string;
  description: string;
  chapters: ChapterInput[];
}) {
  const supabase = getSupabaseServerClient();
  const { data: novel, error: novelError } = await supabase
    .from("novels")
    .insert({
      title: input.title,
      author: input.author || null,
      description: input.description || null
    })
    .select("id,title")
    .single();

  if (novelError) {
    throw novelError;
  }

  const chapterRows = input.chapters.map((chapter) => ({
    novel_id: novel.id,
    chapter_number: chapter.chapter_number,
    chapter_title: chapter.chapter_title,
    content: chapter.content
  }));

  const { error: chaptersError } = await supabase.from("chapters").insert(chapterRows);

  if (chaptersError) {
    await supabase.from("novels").delete().eq("id", novel.id);
    throw chaptersError;
  }

  return novel;
}

export async function deleteNovel(novelId: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("novels").delete().eq("id", novelId);

  if (error) {
    throw error;
  }
}