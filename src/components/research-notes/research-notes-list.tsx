"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import { NOTE_TYPES, type NoteType, type ResearchNote } from "@/lib/module2-types";
import { ResearchNoteCard } from "@/components/research-notes/research-note-card";

const NOTE_LABELS: Record<NoteType | "all", string> = {
  all: "Tất cả",
  character: "Nhân vật",
  item: "Vật phẩm",
  technique: "Công pháp",
  realm: "Cảnh giới",
  sect: "Tông môn",
  location: "Địa danh",
  event: "Sự kiện",
  other: "Khác"
};

export function ResearchNotesList({ initialNotes, novelId }: { initialNotes: ResearchNote[]; novelId: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [typeFilter, setTypeFilter] = useState<NoteType | "all">("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return notes.filter((note) => {
      const typeMatches = typeFilter === "all" || note.note_type === typeFilter;
      const queryMatches =
        !normalizedQuery ||
        [note.title, note.content, note.user_note || "", note.chapter_title || ""]
          .join(" ")
          .toLocaleLowerCase("vi-VN")
          .includes(normalizedQuery);
      return typeMatches && queryMatches;
    });
  }, [notes, query, typeFilter]);

  function deleteNote(note: ResearchNote) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/research-notes/${note.id}?novelId=${novelId}`, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Xóa note thất bại.");
        return;
      }

      setNotes((current) => current.filter((item) => item.id !== note.id));
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase text-zinc-500">Tìm trong notes</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-md border border-line pl-10 pr-3 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
                placeholder="Tìm nội dung, tiêu đề hoặc ghi chú..."
              />
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {["all", ...NOTE_TYPES].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type as NoteType | "all")}
                className={
                  typeFilter === type
                    ? "h-9 rounded-md bg-jade-700 px-3 text-sm font-semibold text-white"
                    : "h-9 rounded-md border border-line px-3 text-sm font-semibold text-ink hover:border-jade-700 hover:text-jade-700"
                }
              >
                {NOTE_LABELS[type as NoteType | "all"]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {isPending ? <div className="text-sm text-zinc-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Đang cập nhật...</div> : null}

      {filteredNotes.length > 0 ? (
        <div className="space-y-3">
          {filteredNotes.map((note) => (
            <ResearchNoteCard key={note.id} note={note} onDelete={deleteNote} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-44 items-center justify-center rounded-lg border border-dashed border-line bg-white text-center text-sm text-zinc-500">
          Chưa có Research Notes phù hợp.
        </div>
      )}
    </div>
  );
}