const MIN_CHUNK_LENGTH = 500;
const MAX_CHUNK_LENGTH = 1200;

export function splitContentIntoChunks(content: string) {
  const paragraphs = content
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const pieces = paragraph.length > MAX_CHUNK_LENGTH ? splitLongParagraph(paragraph) : [paragraph];

    for (const piece of pieces) {
      if (!current) {
        current = piece;
        continue;
      }

      const candidate = `${current}\n\n${piece}`;
      if (candidate.length <= MAX_CHUNK_LENGTH || current.length < MIN_CHUNK_LENGTH) {
        current = candidate;
      } else {
        chunks.push(current);
        current = piece;
      }
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

function splitLongParagraph(paragraph: string) {
  const sentences = paragraph
    .split(/(?<=[.!?。！？…])\s+/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1) {
    return splitByLength(paragraph);
  }

  const pieces: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= MAX_CHUNK_LENGTH) {
      current = candidate;
    } else {
      if (current) {
        pieces.push(current);
      }
      current = sentence;
    }
  }

  if (current) {
    pieces.push(current);
  }

  return pieces.flatMap((piece) => (piece.length > MAX_CHUNK_LENGTH ? splitByLength(piece) : [piece]));
}

function splitByLength(text: string) {
  const pieces: string[] = [];
  for (let start = 0; start < text.length; start += MAX_CHUNK_LENGTH) {
    pieces.push(text.slice(start, start + MAX_CHUNK_LENGTH).trim());
  }
  return pieces.filter(Boolean);
}