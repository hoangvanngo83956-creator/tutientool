import Link from "next/link";
import { ContentPlannerPage } from "@/components/content-planner/content-planner-page";
import { listCalendarItems, listIdeas, listProductionTasks, listSeries } from "@/lib/module5-data";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ novelId: string }> };
export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  try {
    const [series, ideas, calendar, tasks] = await Promise.all([listSeries(novelId), listIdeas(novelId), listCalendarItems(novelId), listProductionTasks(novelId)]);
    return <div className="space-y-5 px-6 py-5"><header className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-2xl font-semibold text-ink">Content Planner</h1><p className="mt-2 text-sm text-zinc-600">Series Builder, Idea Bank, Content Calendar và Production Board.</p></div><Link href={`/novels/${novelId}/script-generator`} className="inline-flex h-10 items-center rounded-md border border-line px-3 text-sm font-semibold text-ink">Script Generator</Link></header><ContentPlannerPage novelId={novelId} initialSeries={series} initialIdeas={ideas} initialCalendar={calendar} initialTasks={tasks} /></div>;
  } catch (error) {
    return <div className="px-6 py-5"><div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Module 5 cần chạy migration <strong>006_module_5_content_planner.sql</strong>. Lỗi: {error instanceof Error ? error.message : "Không đọc được Content Planner."}</div></div>;
  }
}
