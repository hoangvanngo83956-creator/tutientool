import { notFound } from "next/navigation";
import { ScriptDetailView } from "@/components/scripts/script-library";
import { getVideoScriptDetail } from "@/lib/module4-data";
import { formatScriptExport } from "@/lib/script-export";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ novelId: string; scriptId: string }> };
export default async function Page({ params }: PageProps) {
  const { novelId, scriptId } = await params;
  const { script, scenes } = await getVideoScriptDetail(novelId, scriptId);
  if (!script) notFound();
  return <div className="px-6 py-5"><ScriptDetailView novelId={novelId} script={script} scenes={scenes} exportText={formatScriptExport(script, scenes)} /></div>;
}
