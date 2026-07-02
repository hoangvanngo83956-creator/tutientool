"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, X } from "lucide-react";
import { NOTE_TYPES, type NoteType, type SearchResult } from "@/lib/module2-types";

const NOTE_LABELS: Record<NoteType, string> = {
  character: "Nhân vật",
  item: "Vật phẩm",
  technique: "Công pháp",
  realm: "Cảnh giới",
  sect: "Tông môn",
  location: "Địa danh",
  event: "Sự kiện",
  other: "Khác"
};

export function AddToResearchNoteModal({
  result,
  onClose,
  onSaved
}: {
  result: SearchResult | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [noteType, setNoteType] = useState<NoteType>("other");
  const [title, setTitle] = useState("");
  const [userNote, setUserNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!result) {
    return null;
  }

  function saveNote() {
    if (!result) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/research-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId: result.novel_id,
          chapterId: result.chapter_id,
          chunkId: result.id,
          title: title.trim() || `${result.chapter_title} - đoạn ${result.chunk_index + 1}`,
          noteType,
          content: result.content,
          userNote
        })
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Lưu research note thất bại.");
        return;
      }

      onSaved();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-lg border border-line bg-white shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h3 className="text-base font-semibold text-ink">Thêm vào Research Notes</h3>
            <p className="mt-1 text-sm text-zinc-500">Lưu đoạn gốc để chuẩn bị research trước khi viết kịch bản.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Tiêu đề note</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
              placeholder={`${result.chapter_title} - đoạn ${result.chunk_index + 1}`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Loại dữ kiện</span>
            <select
              value={noteType}
              onChange={(event) => setNoteType(event.target.value as NoteType)}
              className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
            >
              {NOTE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {NOTE_LABELS[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Ghi chú cá nhân</span>
            <textarea
              value={userNote}
              onChange={(event) => setUserNote(event.target.value)}
              className="min-h-24 w-full resize-y rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
              placeholder="Ví dụ: đoạn này xác nhận lai lịch nhân vật, vật phẩm xuất hiện lần đầu..."
            />
          </label>

          <div className="max-h-36 overflow-y-auto rounded-md border border-line bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
            {result.content}
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="h-10 rounded-md border border-line px-4 text-sm font-semibold text-ink hover:border-zinc-400 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={saveNote}
              disabled={isPending}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-jade-700 px-4 text-sm font-semibold text-white hover:bg-jade-800 disabled:bg-zinc-300"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}