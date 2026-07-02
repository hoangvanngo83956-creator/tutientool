import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Brain } from "lucide-react";
import { EntityExplorer } from "@/components/entities/entity-explorer";
import { getNovelWithChapters } from "@/lib/data";
import { listEntities } from "@/lib/module3-data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ novelId: string }> };

export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  const [novel, entities] = await Promise.all([getNovelWithChapters(novelId), listEntities(novelId)]);
  if (!novel) notFound();
  return <div className="space-y-5"><header className="border-b border-line px-6 py-5"><Link href={`/novels/${novel.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jade-700"><ArrowLeft className="h-4 w-4" />Quay lại truyện</Link><div className="flex items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold text-ink">Entity Explorer: {novel.title}</h1><p className="mt-1 text-sm text-zinc-500">Kho tri thức đã trích xuất từ nguyên tác.</p></div><Link href={`/novels/${novel.id}/ai-research`} className="inline-flex h-10 items-center gap-2 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white"><Brain className="h-4 w-4" />Run AI Research</Link></div></header><main className="px-6 pb-8"><EntityExplorer novelId={novel.id} initialEntities={entities} /></main></div>;
}