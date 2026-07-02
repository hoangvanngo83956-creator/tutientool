import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { ChapterWithNovel, NovelSummary } from "@/lib/types";
import { formatChapterHeading } from "@/lib/format";

export function ChapterPreview({
  novel,
  chapter
}: {
  novel?: NovelSummary;
  chapter?: ChapterWithNovel | null;
}) {
  return (
    <section className="rounded-lg border border-line bg-white shadow-panel">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-zinc-600" />
          <h2 className="text-base font-semibold text-ink">Đọc thử chương</h2>
        </div>
      </div>

      <div className="grid min-h-80 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line p-4 lg:border-b-0 lg:border-r">
          {novel ? (
            <Link
              href={`/novels/${novel.id}`}
              className="block rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:border-jade-700 hover:text-jade-700"
            >
              {novel.title}
            </Link>
          ) : (
            <div className="rounded-md border border-line px-3 py-2 text-sm text-zinc-500">Chưa có truyện</div>
          )}
          <div className="mt-3 space-y-2">
            {chapter ? (
              <Link
                href={`/novels/${chapter.novel.id}/chapters/${chapter.id}`}
                className="block rounded-md border-l-4 border-jade-700 bg-jade-50 px-3 py-2 text-sm font-medium text-jade-800"
              >
                {formatChapterHeading(chapter.chapter_number, chapter.chapter_title)}
              </Link>
            ) : (
              <p className="text-sm leading-6 text-zinc-500">Upload truyện TXT để xem chương đã tách.</p>
            )}
          </div>
        </aside>

        <div className="p-6">
          {chapter ? (
            <>
              <h3 className="font-serif text-2xl font-semibold text-jade-800">
                {formatChapterHeading(chapter.chapter_number, chapter.chapter_title)}
              </h3>
              <div className="my-5 flex items-center gap-4 text-gold">
                <div className="h-px flex-1 bg-amber-200" />
                <span className="text-lg">◆</span>
                <div className="h-px flex-1 bg-amber-200" />
              </div>
              <p className="line-clamp-6 whitespace-pre-line font-serif text-base leading-8 text-zinc-700">
                {chapter.content}
              </p>
            </>
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center text-sm text-zinc-500">
              Chưa có nội dung chương.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
