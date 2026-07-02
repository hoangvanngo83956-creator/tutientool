"use client";

import { Clipboard, Trash2 } from "lucide-react";
import type { ResearchNote } from "@/lib/module2-types";
import { formatDateTime } from "@/lib/format";

const NOTE_LABELS: Record<string, string> = {
  character: "Nhân vật",
  item: "Vật phẩm",
  technique: "Công pháp",
  realm: "Cảnh giới",
  sect: "Tông môn",
  location: "Địa danh",
  event: "Sự kiện",
  other: "Khác"
};

export function ResearchNoteCard({ note, onDelete }: { note: ResearchNote; onDelete: (note: ResearchNote) => void }) {
  async function copyNote() {
    await navigator.clipboard.writeText(`${note.title}\n\n${note.content}${note.user_note ? `\n\nGhi chú: ${note.user_note}` : ""}`);
  }

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-jade-100 bg-jade-50 px-2.5 py-1 text-xs font-semibold text-jade-800">
              {NOTE_LABELS[note.note_type] || "Khác"}
            </span>
            <span className="text-xs text-zinc-500">{formatDateTime(note.created_at)}</span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-ink">{note.title}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {note.chapter_number ? `Chương ${note.chapter_number}` : "Không rõ chương"}
            {note.chapter_title ? ` · ${note.chapter_title}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={copyNote}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
          >
            <Clipboard className="h-4 w-4" />
            Copy note
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-red-100 px-3 text-sm font-semibold text-red-600 hover:border-red-300 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-700">{note.content}</p>
      {note.user_note ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
          {note.user_note}
        </div>
      ) : null}
    </article>
  );
}