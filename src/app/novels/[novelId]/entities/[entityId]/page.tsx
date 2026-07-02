import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clapperboard } from "lucide-react";
import { AIReportViewer, AnalyzeEntityButton, EntityDetailPanel, EntityRelationshipGraph, EvidenceList } from "@/components/entities/entity-detail-panel";
import { getEntityDetail } from "@/lib/module3-data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ novelId: string; entityId: string }> };

export default async function Page({ params }: PageProps) {
  const { novelId, entityId } = await params;
  const detail = await getEntityDetail(entityId);
  if (!detail.entity) notFound();
  return <div className="space-y-5"><header className="border-b border-line px-6 py-5"><Link href={`/novels/${novelId}/entities`} className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-jade-700"><ArrowLeft className="h-4 w-4" />Entity Explorer</Link><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold text-ink">{detail.entity.name}</h1><p className="mt-1 text-sm text-zinc-500">Chi tiết entity, evidence và report liên quan.</p></div><div className="flex gap-2"><AnalyzeEntityButton novelId={novelId} entityId={entityId} /><button className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm font-semibold text-ink"><Clapperboard className="h-4 w-4" />Create TikTok Script</button></div></div></header><main className="space-y-5 px-6 pb-8"><EntityDetailPanel entity={detail.entity} /><EvidenceList evidence={detail.evidence} /><EntityRelationshipGraph relationships={detail.relationships} /><AIReportViewer reports={detail.reports} /></main></div>;
}