import type { Flashcard } from '../types';

export function exportAsJson(cards: Flashcard[], filename: string): void {
  const data = cards.map((c) => ({
    id: c.id,
    documentId: c.documentId,
    question: c.question,
    answer: c.answer,
    cardType: c.cardType,
    difficulty: c.difficulty,
    bloomLevel: c.bloomLevel,
    tags: c.tags,
    sourcePage: c.sourcePage,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportAsCsv(cards: Flashcard[], filename: string): void {
  const headers = ['id', 'question', 'answer', 'cardType', 'difficulty', 'bloomLevel', 'tags', 'sourcePage', 'createdAt'];
  const rows = cards.map((c) => [
    c.id,
    escapeCsv(c.question),
    escapeCsv(c.answer),
    c.cardType,
    c.difficulty,
    c.bloomLevel,
    c.tags.join('; '),
    c.sourcePage ?? '',
    c.createdAt,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportAsAnki(cards: Flashcard[], filename: string): void {
  const rows = cards.map((c) => [
    escapeCsv(c.question),
    escapeCsv(c.answer),
    ...c.tags.map((t) => t.replace(/\s+/g, '_')),
  ]);

  const csv = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}_anki.csv`);
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
