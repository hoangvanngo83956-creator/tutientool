import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Brain, CalendarDays, Database, FileText, NotebookPen, Search, Sparkles, UserRound, KanbanSquare, Youtube } from "lucide-react";
import { ChapterList } from "@/components/chapter-list";
import { getNovelWithChapters } from "@/lib/data";
import { formatDateTime, formatNumber } from "@/lib/format";
import { NovelContentStats } from "@/components/content-planner/novel-content-stats";

export const dynamic = "force-dynamic";

type NovelDetailPageProps = {
  params: Promise<{
    novelId: string;
  }>;
};

export default async function NovelDetailPage({ params }: NovelDetailPageProps) {
  const { novelId } = await params;
  const novel = await getNovelWithChapters(novelId);

  if (!novel) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">{novel.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
              {novel.description || "Chưa có mô tả."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/novels/${novel.id}/search`}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white hover:bg-jade-800"
              >
                <Search className="h-4 w-4" />
                Search truyện
              </Link>
              <Link
                href={`/novels/${novel.id}/research-notes`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
              >
                <NotebookPen className="h-4 w-4" />
                Research Notes
              </Link>
              <Link
                href={`/novels/${novel.id}/ai-research`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
              >
                <Brain className="h-4 w-4" />
                AI Research
              </Link>
              <Link
                href={`/novels/${novel.id}/entities`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
              >
                <Database className="h-4 w-4" />
                Entity Explorer
              </Link>
              <Link
                href={`/novels/${novel.id}/content-planner`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 hover:border-amber-500 hover:bg-amber-100"
              >
                <KanbanSquare className="h-4 w-4" />
                Content Planner
              </Link>
              <Link
                href={`/novels/${novel.id}/script-generator`}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Sparkles className="h-4 w-4" />
                Script Generator
              </Link>
              <Link
                href={`/novels/${novel.id}/scripts`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
              >
                <FileText className="h-4 w-4" />
                Script Library
              </Link>
              <Link
                href={`/novels/${novel.id}/youtube-studio`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 hover:border-red-500 hover:bg-red-100"
              >
                <Youtube className="h-4 w-4" />
                YouTube Studio
              </Link>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-3 lg:min-w-[520px]">
            <MetaItem icon={UserRound} label="Tác giả" value={novel.author || "Không rõ"} />
            <MetaItem icon={BookOpen} label="Số chương" value={formatNumber(novel.chapters.length)} />
            <MetaItem icon={CalendarDays} label="Ngày tạo" value={formatDateTime(novel.created_at)} />
          </div>
        </div>
      </header>

      <main className="px-6 pb-8">
        <div className="mb-5"><NovelContentStats novelId={novel.id} /></div><ChapterList novelId={novel.id} chapters={novel.chapters} />
      </main>
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 truncate font-semibold text-ink">{value}</div>
    </div>
  );
}


