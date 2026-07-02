import type { SearchMatchMode } from "@/lib/module2-types";

export function SearchFilters({
  fromChapter,
  toChapter,
  matchMode,
  onFromChapterChange,
  onToChapterChange,
  onMatchModeChange
}: {
  fromChapter: string;
  toChapter: string;
  matchMode: SearchMatchMode;
  onFromChapterChange: (value: string) => void;
  onToChapterChange: (value: string) => void;
  onMatchModeChange: (value: SearchMatchMode) => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-line bg-white p-4 md:grid-cols-[1fr_1fr_1.3fr]">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase text-zinc-500">Từ chương</span>
        <input
          value={fromChapter}
          onChange={(event) => onFromChapterChange(event.target.value)}
          type="number"
          min="1"
          className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
          placeholder="Toàn bộ"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase text-zinc-500">Đến chương</span>
        <input
          value={toChapter}
          onChange={(event) => onToChapterChange(event.target.value)}
          type="number"
          min="1"
          className="h-10 w-full rounded-md border border-line px-3 text-sm outline-none focus:border-jade-700 focus:ring-2 focus:ring-jade-100"
          placeholder="Toàn bộ"
        />
      </label>
      <div>
        <span className="mb-1.5 block text-xs font-semibold uppercase text-zinc-500">Chế độ tìm</span>
        <div className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-zinc-50 p-1">
          <button
            type="button"
            onClick={() => onMatchModeChange("fuzzy")}
            className={matchMode === "fuzzy" ? activeClass : inactiveClass}
          >
            Gần đúng
          </button>
          <button
            type="button"
            onClick={() => onMatchModeChange("exact")}
            className={matchMode === "exact" ? activeClass : inactiveClass}
          >
            Chính xác cụm từ
          </button>
        </div>
      </div>
    </div>
  );
}

const activeClass = "h-9 rounded bg-white text-sm font-semibold text-jade-800 shadow-sm";
const inactiveClass = "h-9 rounded text-sm font-medium text-zinc-500 transition hover:text-ink";