export function HighlightText({ text, query, exact }: { text: string; query: string; exact: boolean }) {
  const terms = exact ? [query.trim()] : tokenize(query);

  if (terms.length === 0) {
    return <>{text}</>;
  }

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "giu");
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, index) =>
        terms.some((term) => part.toLocaleLowerCase("vi-VN") === term.toLocaleLowerCase("vi-VN")) ? (
          <mark key={`${part}-${index}`} className="rounded bg-amber-200 px-1 py-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

function tokenize(value: string) {
  return value
    .split(/[\s,.;:!?()[\]{}"'“”‘’]+/u)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}