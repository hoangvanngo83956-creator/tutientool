"use client";

import { useMemo, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";

export function ChapterReader({ content }: { content: string }) {
  const [fontSize, setFontSize] = useState(18);
  const paragraphs = useMemo(
    () =>
      content
        .split(/\n{2,}/)
        .map((item) => item.trim())
        .filter(Boolean),
    [content]
  );

  return (
    <article className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-line bg-white shadow-panel">
      <div className="flex items-center justify-end gap-2 border-b border-line px-4 py-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-zinc-600 transition hover:border-jade-700 hover:text-jade-700"
          type="button"
          onClick={() => setFontSize((size) => Math.max(16, size - 1))}
          aria-label="Giảm cỡ chữ"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-zinc-600 transition hover:border-jade-700 hover:text-jade-700"
          type="button"
          onClick={() => setFontSize((size) => Math.min(24, size + 1))}
          aria-label="Tăng cỡ chữ"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-zinc-500">
          <Maximize2 className="h-4 w-4" />
        </div>
      </div>

      <div className="px-6 py-8 sm:px-10">
        <div className="my-2 flex items-center gap-4 text-gold">
          <div className="h-px flex-1 bg-amber-200" />
          <span className="text-lg">◆</span>
          <div className="h-px flex-1 bg-amber-200" />
        </div>
        <div className="mt-8 space-y-5 font-serif leading-9 text-zinc-800" style={{ fontSize }}>
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
