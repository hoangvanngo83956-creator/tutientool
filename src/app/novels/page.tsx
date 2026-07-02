import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { NovelTable } from "@/components/novel-table";
import { listNovels } from "@/lib/data";
import { isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NovelsPage() {
  const state = await loadNovels();

  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <h1 className="text-2xl font-semibold text-ink">Truyện</h1>
        <p className="mt-1 text-sm text-zinc-500">Danh sách truyện đã upload và số chương đã tách.</p>
      </header>

      <main className="space-y-5 px-6 pb-8">
        {state.error ? <DatabaseSetupNotice message={state.error} /> : null}
        <NovelTable novels={state.novels} />
      </main>
    </div>
  );
}

async function loadNovels() {
  try {
    return { novels: await listNovels(), error: null };
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return { novels: [], error: error.message };
    }

    throw error;
  }
}
