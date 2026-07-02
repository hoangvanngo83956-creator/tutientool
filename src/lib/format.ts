export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatChapterHeading(chapterNumber: number, chapterTitle: string) {
  const normalized = chapterTitle.trim();

  if (/^(chương|chapter)\s+\d+/i.test(normalized)) {
    return normalized;
  }

  return `Chương ${chapterNumber}: ${normalized}`;
}
