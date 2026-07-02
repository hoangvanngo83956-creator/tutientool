import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { ChapterReader } from "@/components/chapter-reader";
import { getChapter } from "@/lib/data";
import { formatChapterHeading, formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

type ChapterPageProps = {
  params: Promise<{
    novelId: string;
    chapterId: string;
  }>;
};

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { novelId, chapterId } = await params;
  const chapter = await getChapter(chapterId);

  if (!chapter || chapter.novel_id !== novelId) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <Link
          href={`/novels/${chapter.novel.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jade-700 hover:text-jade-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách chương
        </Link>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <BookOpen className="h-4 w-4" />
              {chapter.novel.title}
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              {formatChapterHeading(chapter.chapter_number, chapter.chapter_title)}
            </h1>
          </div>
          <p className="text-sm text-zinc-500">Lưu lúc {formatDateTime(chapter.created_at)}</p>
        </div>
      </header>

      <main className="px-6 pb-10">
        <ChapterReader content={chapter.content} />
      </main>
    </div>
  );
}
