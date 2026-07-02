import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  compact = false
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p
            className={[
              "mt-2 truncate font-semibold text-ink",
              compact ? "text-xl" : "text-3xl"
            ].join(" ")}
          >
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-jade-50 text-jade-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
