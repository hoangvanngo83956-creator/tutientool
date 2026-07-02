import Link from "next/link";
import { ScriptGeneratorPage } from "@/components/scripts/script-generator-page";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listEntities } from "@/lib/module3-data";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ novelId: string }> };

export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  const supabase = getSupabaseServerClient();
  const [entities, notesResult, reportsResult] = await Promise.all([
    listEntities(novelId),
    supabase.from("research_notes").select("id,title,note_type,content").eq("novel_id", novelId).order("created_at", { ascending: false }).limit(100),
    supabase.from("ai_research_reports").select("id,title,report_type,summary").eq("novel_id", novelId).order("created_at", { ascending: false }).limit(100)
  ]);
  if (notesResult.error) throw notesResult.error;
  if (reportsResult.error) throw reportsResult.error;
  return <div className="space-y-5 px-6 py-5"><header className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-2xl font-semibold text-ink">AI TikTok/Reels Script Generator</h1><p className="mt-2 text-sm text-zinc-600">Tạo kịch bản từ entity, evidence, research notes và AI report.</p></div><Link href={`/novels/${novelId}/scripts`} className="inline-flex h-10 items-center rounded-md border border-line px-3 text-sm font-semibold text-ink">Script Library</Link></header><ScriptGeneratorPage novelId={novelId} entities={entities} notes={(notesResult.data ?? []) as any} reports={(reportsResult.data ?? []) as any} /></div>;
}
