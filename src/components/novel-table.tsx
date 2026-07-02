"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, ChevronRight, Loader2, Trash2, X } from "lucide-react";
import type { NovelSummary } from "@/lib/types";
import { formatDateTime, formatNumber } from "@/lib/format";

type DeleteState = {
  novel: NovelSummary | null;
  error: string | null;
};

export function NovelTable({ novels }: { novels: NovelSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [deleteState, setDeleteState] = useState<DeleteState>({ novel: null, error: null });
  const [isPending, startTransition] = useTransition();
  const showViewAll = pathname !== "/novels";

  function closeDialog() {
    if (!isPending) {
      setDeleteState({ novel: null, error: null });
    }
  }

  function confirmDelete() {
    if (!deleteState.novel) {
      return;
    }

    const novelId = deleteState.novel.id;
    setDeleteState((current) => ({ ...current, error: null }));

    startTransition(async () => {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setDeleteState((current) => ({
          ...current,
          error: payload.error || "Xóa truyện thất bại."
        }));
        return;
      }

      setDeleteState({ novel: null, error: null });
      router.refresh();
    });
  }

  return (
    <>
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-zinc-600" />
            <h2 className="text-base font-semibold text-ink">Truyện & chương gần đây</h2>
          </div>
          {showViewAll ? (
            <Link
              href="/novels"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-ink transition hover:border-jade-700 hover:text-jade-700"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-5 py-3">Tên truyện</th>
                <th className="px-5 py-3">Tác giả</th>
                <th className="px-5 py-3">Chương</th>
                <th className="px-5 py-3">Ngày tạo</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="w-20 px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {novels.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-zinc-500" colSpan={6}>
                    Chưa có truyện nào. Upload file TXT để bắt đầu.
                  </td>
                </tr>
              ) : (
                novels.map((novel) => (
                  <tr key={novel.id} className="transition hover:bg-zinc-50/70">
                    <td className="px-5 py-4">
                      <Link href={`/novels/${novel.id}`} className="font-semibold text-ink hover:text-jade-700">
                        {novel.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-600">{novel.author || "Không rõ"}</td>
                    <td className="px-5 py-4 text-zinc-600">{formatNumber(novel.chapter_count)}</td>
                    <td className="px-5 py-4 text-zinc-600">{formatDateTime(novel.created_at)}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Đã lưu
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteState({ novel, error: null })}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-100 text-red-600 transition hover:border-red-300 hover:bg-red-50"
                        aria-label={`Xóa ${novel.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {deleteState.novel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-lg border border-line bg-white shadow-panel">
            <div className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-ink">Xác nhận xóa truyện</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Bạn sắp xóa <span className="font-semibold text-ink">{deleteState.novel.title}</span> và toàn bộ chương đã tách.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 disabled:opacity-50"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <p className="text-sm leading-6 text-zinc-600">
                Hành động này không thể hoàn tác. Dữ liệu chương liên quan sẽ bị xóa khỏi database.
              </p>
              {deleteState.error ? <p className="text-sm font-medium text-red-600">{deleteState.error}</p> : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={isPending}
                  className="h-10 rounded-md border border-line px-4 text-sm font-semibold text-ink transition hover:border-zinc-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-zinc-300"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Xóa truyện
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}