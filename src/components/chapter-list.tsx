import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import type { ChapterListItem } from "@/lib/types";
import { formatChapterHeading, formatDateTime } from "@/lib/format";

export function ChapterList({
  novelId,
  chapters
}: {
  novelId: string;
  chapters: ChapterListItem[];
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <BookOpen className="h-5 w-5 text-zinc-600" />
        <h2 className="text-base font-semibold text-ink">Danh sách chương</h2>
      </div>

      <div className="divide-y divide-line">
        {chapters.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-500">Chưa có chương nào.</div>
        ) : (
          chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/novels/${novelId}/chapters/${chapter.id}`}
              className="grid gap-3 px-5 py-4 transition hover:bg-zinc-50 sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <div className="font-semibold text-ink">
                  {formatChapterHeading(chapter.chapter_number, chapter.chapter_title)}
                </div>
                <div className="mt-1 text-sm text-zinc-500">Lưu lúc {formatDateTime(chapter.created_at)}</div>
              </div>
              <span className="text-sm text-zinc-500">Chương {chapter.chapter_number}</span>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
