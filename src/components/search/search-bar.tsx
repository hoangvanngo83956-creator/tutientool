"use client";

import { Search } from "lucide-react";

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  loading
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          className="h-11 w-full rounded-md border border-line bg-white pl-10 pr-3 text-sm outline-none transition focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
          placeholder="Nhập tên nhân vật, vật phẩm, công pháp, cảnh giới, địa danh..."
        />
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || !query.trim()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-jade-700 px-5 text-sm font-semibold text-white transition hover:bg-jade-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        <Search className="h-4 w-4" />
        {loading ? "Đang tìm..." : "Search"}
      </button>
    </div>
  );
}