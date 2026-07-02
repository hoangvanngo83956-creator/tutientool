import { UploadCloud } from "lucide-react";
import { DatabaseSetupNotice } from "@/components/database-setup-notice";
import { UploadNovelForm } from "@/components/upload-novel-form";
import { assertSupabaseConfigured, isSupabaseConfigError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  const configError = getConfigError();

  return (
    <div className="space-y-5">
      <header className="border-b border-line px-6 py-5">
        <h1 className="text-2xl font-semibold text-ink">Upload truyện</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Tải file `.txt`, nhập metadata cơ bản, hệ thống sẽ tách chương và lưu vào Supabase.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl space-y-5 px-6 pb-8">
        {configError ? <DatabaseSetupNotice message={configError} /> : null}

        <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-jade-50 text-jade-700">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">Nhập truyện TXT</h2>
              <p className="text-sm text-zinc-500">Pattern chương: `Chương 1`, `Chương 2`, `Chapter 1`.</p>
            </div>
          </div>
          <UploadNovelForm disabledReason={configError} />
        </section>
      </main>
    </div>
  );
}

function getConfigError() {
  try {
    assertSupabaseConfigured();
    return null;
  } catch (error) {
    if (isSupabaseConfigError(error)) {
      return error.message;
    }

    throw error;
  }
}
