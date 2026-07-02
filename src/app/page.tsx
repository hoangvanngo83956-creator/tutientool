import { BookOpen, FileText, UploadCloud } from "lucide-react";
import Link from "next/link";
import { ChapterPreview } from "@/components/chapter-preview";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { NovelTable } from "@/components/novel-table";
import { StatCard } from "@/components/stat-card";
import { UploadNovelForm } from "@/components/upload-novel-form";
import { getDashboardData } from "@/lib/data";
import { formatNumber } from "@/lib/format";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const state = await loadDashboard();
  const latestNovel = state.data?.novels[0];
  const latestChapter = state.data?.latestChapter;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Nhập truyện gốc, tách chương, lưu dữ liệu để chuẩn bị cho engine kịch bản.
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-jade-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-jade-800"
        >
          <UploadCloud className="h-4 w-4" />
          Upload TXT
        </Link>
      </header>

      <main className="space-y-5 px-6 pb-8">
        {state.error ? <DatabaseSetupNotice message={state.error} /> : null}

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={BookOpen}
            label="Truyện đã lưu"
            value={formatNumber(state.data?.novels.length ?? 0)}
          />
          <StatCard
            icon={FileText}
            label="Chương đã tách"
            value={formatNumber(state.data?.chapterCount ?? 0)}
          />
          <StatCard
            icon={UploadCloud}
            label="Upload gần nhất"
            value={latestNovel?.title ?? "Chưa có"}
            compact
          />
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-panel">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-jade-50 text-jade-700">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-ink">Upload & nhập truyện</h2>
                <p className="text-sm text-zinc-500">Hỗ trợ `.txt`, tối đa 50MB.</p>
              </div>
            </div>
            <UploadNovelForm disabledReason={state.error} />
          </div>

          <NovelTable novels={state.data?.novels ?? []} />
        </section>

        <ChapterPreview novel={latestNovel} chapter={latestChapter} />
      </main>
    </div>
  );
}

async function loadDashboard() {
  try {
    const data = await getDashboardData();
    return { data, error: null };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { data: null, error: error.message };
    }

    throw error;
  }
}
