import { CalendarDays, CheckCircle2, ClipboardList, Lightbulb, ListVideo } from "lucide-react";
import { listCalendarItems, listIdeas, listProductionTasks, listSeries } from "@/lib/module5-data";

export async function NovelContentStats({ novelId }: { novelId: string }) {
  try {
    const [series, ideas, calendar, tasks] = await Promise.all([listSeries(novelId), listIdeas(novelId), listCalendarItems(novelId), listProductionTasks(novelId)]);
    const scripts = ideas.filter((idea) => idea.status === "script_generated").length;
    const scheduled = calendar.filter((item) => ["scheduled", "ready", "planned"].includes(item.status)).length;
    const published = calendar.filter((item) => item.status === "published").length;
    const remainingTasks = tasks.filter((task) => !["done", "skipped"].includes(task.status)).length;
    return <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Widget icon={ListVideo} label="Series" value={series.length} /><Widget icon={Lightbulb} label="Ideas" value={ideas.length} /><Widget icon={CalendarDays} label="Scheduled" value={scheduled} /><Widget icon={ClipboardList} label="Tasks còn lại" value={remainingTasks} /><Widget icon={CheckCircle2} label="Scripts" value={scripts} /><Widget icon={CheckCircle2} label="Published" value={published} /><IdeaQualityWidget ideas={ideas} /><ProductionProgressWidget tasks={tasks} /></section>;
  } catch { return null; }
}
export function UpcomingPostsWidget(){return null;}
export function ProductionProgressWidget({ tasks }: { tasks: any[] }) { const done=tasks.filter(t=>t.status==="done").length; return <Widget icon={CheckCircle2} label="Task done" value={`${done}/${tasks.length}`} />; }
export function IdeaQualityWidget({ ideas }: { ideas: any[] }) { const strong=ideas.filter(i=>i.evidence_strength_score>=7).length; return <Widget icon={Lightbulb} label="Evidence mạnh" value={`${strong}/${ideas.length}`} />; }
function Widget({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) { return <div className="rounded-lg border border-line bg-white p-4 shadow-panel"><div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500"><Icon className="h-4 w-4" />{label}</div><div className="mt-2 text-2xl font-semibold text-ink">{value}</div></div>; }
