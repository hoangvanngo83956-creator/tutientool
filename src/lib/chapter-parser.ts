import type { ChapterInput } from "@/lib/types";

const CHAPTER_HEADING_REGEX = /^[ \t]*(?:#{1,6}[ \t]*)?(Chương|Chapter)\s+([0-9]+|[IVXLCDM]+)(?:[ \t]*[:.\-–—][ \t]*(.*)|[ \t]+(.+))?[ \t]*$/gimu;

export function parseChaptersFromText(rawText: string): ChapterInput[] {
  const text = normalizeText(rawText);
  const matches = [...text.matchAll(CHAPTER_HEADING_REGEX)];

  return matches
    .map((match, index) => {
      const nextMatch = matches[index + 1];
      const contentStart = match.index + match[0].length;
      const contentEnd = nextMatch?.index ?? text.length;
      const chapterNumber = parseChapterNumber(match[2]);
      const fallbackTitle = `${match[1]} ${match[2]}`;
      const rawTitle = match[3] || match[4] || fallbackTitle;
      const title = rawTitle.trim();
      const content = text.slice(contentStart, contentEnd).trim();

      return {
        chapter_number: chapterNumber,
        chapter_title: title,
        content
      };
    })
    .filter((chapter) => Number.isFinite(chapter.chapter_number) && chapter.content.length > 0);
}

function normalizeText(rawText: string) {
  return rawText.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

function parseChapterNumber(value: string) {
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  return romanToNumber(value.toUpperCase());
}

function romanToNumber(value: string) {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
  };
  let total = 0;
  let previous = 0;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    const current = map[value[index]] ?? 0;
    total += current < previous ? -current : current;
    previous = current;
  }

  return total;
}