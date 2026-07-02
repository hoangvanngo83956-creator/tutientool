import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { ResearchNotesList } from "@/components/research-notes/research-notes-list";
import { getNovelWithChapters } from "@/lib/data";
import { listResearchNotes } from "@/lib/module2-data";

export const dynamic = "force-dynamic";

type ResearchNotesPageProps = {
  params: Promise<{ novelId: string }>;
};

export default async function ResearchNotesPage({ params }: ResearchNotesPageProps) {
  const { novelId } = await params;
  const [novel, notes] = await Promise.all([getNovelWithChapters(novelId), listResearchNotes(novelId)]);

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
            <h1 className="text-2xl font-semibold text-ink">Research Notes: {novel.title}</h1>
            <p className="mt-1 text-sm text-zinc-500">Các đoạn nguyên tác đã lưu để chuẩn bị dữ kiện cho Module 3.</p>
          </div>
          <Link
            href={`/novels/${novel.id}/search`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
          >
            <Search className="h-4 w-4" />
            Search truyện
          </Link>
        </div>
      </header>

      <main className="px-6 pb-8">
        <ResearchNotesList initialNotes={notes} novelId={novel.id} />
      </main>
    </div>
  );
}