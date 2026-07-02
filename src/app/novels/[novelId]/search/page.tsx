import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, NotebookPen } from "lucide-react";
import { NovelSearchWorkspace } from "@/components/search/novel-search-workspace";
import { getNovelWithChapters } from "@/lib/data";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  params: Promise<{ novelId: string }>;
};

export default async function NovelSearchPage({ params }: SearchPageProps) {
  const { novelId } = await params;
  const novel = await getNovelWithChapters(novelId);

  if (!novel) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <Link href={`/novels/${novel.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jade-700 hover:text-jade-800">
          <ArrowLeft className="h-4 w-4" />
          Quay lại truyện
        </Link>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-ink">Search: {novel.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">Tìm đoạn nguyên tác liên quan để research trước khi dựng kịch bản TikTok/Reels.</p>
          </div>
          <Link
            href={`/novels/${novel.id}/research-notes`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
          >
            <NotebookPen className="h-4 w-4" />
            Research Notes
          </Link>
        </div>
      </header>

      <main className="px-6 pb-8">
        <NovelSearchWorkspace novelId={novel.id} />
      </main>
    </div>
  );
}