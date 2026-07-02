import Link from "next/link";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ novelId: string }> };
export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  return <div className="space-y-5 px-6 py-5"><header className="border-b border-line pb-5"><h1 className="text-2xl font-semibold text-ink">Batch Generation</h1><p className="mt-2 text-sm text-zinc-600">Tạo nhanh batch idea/series. Bản MVP dùng API batch, review chi tiết trong Idea Bank.</p></header><div className="grid gap-3 md:grid-cols-3"><BatchLink novelId={novelId} label="10 ý tưởng" count={10}/><BatchLink novelId={novelId} label="30 ý tưởng" count={30}/><BatchLink novelId={novelId} label="60 ý tưởng" count={60}/></div><Link className="text-sm font-semibold text-jade-700" href={`/novels/${novelId}/content-planner`}>Quay lại Content Planner</Link></div>;
}
function BatchLink({ novelId, label, count }: { novelId: string; label: string; count: number }) { return <form action={`/api/novels/${novelId}/content-batches/generate`} method="post" className="rounded-lg border border-line bg-white p-5 shadow-panel"><h2 className="font-semibold text-ink">{label}</h2><p className="mt-2 text-sm text-zinc-500">Dùng Idea Bank để duyệt sau khi tạo.</p><button className="mt-4 h-10 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white">Generate</button><input type="hidden" name="number_of_ideas" value={count}/></form>; }
