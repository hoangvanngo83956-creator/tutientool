import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Database } from "lucide-react";
import { AIResearchPage } from "@/components/ai-research/ai-research-page";
import { getNovelWithChapters } from "@/lib/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ novelId: string }> };

export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  const novel = await getNovelWithChapters(novelId);
  if (!novel) notFound();
  return <div className="space-y-5"><header className="border-b border-line px-6 py-5"><Link href={`/novels/${novel.id}`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jade-700"><ArrowLeft className="h-4 w-4" />Quay lại truyện</Link><div className="flex items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold text-ink">AI Research: {novel.title}</h1><p className="mt-1 text-sm text-zinc-500">Trích xuất entity có evidence từ nguyên tác.</p></div><Link href={`/novels/${novel.id}/entities`} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink"><Database className="h-4 w-4" />Entity Explorer</Link></div></header><main className="px-6 pb-8"><AIResearchPage novelId={novel.id} /></main></div>;
}