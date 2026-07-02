import Link from "next/link";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { ScriptLibrary } from "@/components/scripts/script-library";
import { listVideoScripts } from "@/lib/module4-data";

export const dynamic = "force-dynamic";
type PageProps = { params: Promise<{ novelId: string }> };
export default async function Page({ params }: PageProps) {
  const { novelId } = await params;
  try {
    const scripts = await listVideoScripts(novelId);
    return <div className="space-y-5 px-6 py-5"><header className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between"><div><h1 className="text-2xl font-semibold text-ink">Script Library</h1><p className="mt-2 text-sm text-zinc-600">Quản lý kịch bản TikTok/Reels đã tạo.</p></div><Link href={`/novels/${novelId}/script-generator`} className="inline-flex h-10 items-center rounded-md bg-jade-700 px-3 text-sm font-semibold text-white">Tạo script mới</Link></header><ScriptLibrary novelId={novelId} initialScripts={scripts} /></div>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không đọc được Script Library.";
    return <div className="space-y-5 px-6 py-5"><header className="border-b border-line pb-5"><h1 className="text-2xl font-semibold text-ink">Script Library</h1></header><DatabaseSetupNotice message={`Module 4 cần chạy migration supabase/migrations/004_module_4_video_scripts.sql. Lỗi hiện tại: ${message}`} /></div>;
  }
}
