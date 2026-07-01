import type { KnowledgeChunk } from '@recallai/shared';
import { logger } from '@/lib/logger';
import type { LearningUnit, LearningUnitType } from '../pipeline';

interface PatternMatch {
  unitType: LearningUnitType;
  score: number;
  indicators: string[];
}

const PATTERNS: Record<LearningUnitType, { keywords: RegExp[]; minScore: number }> = {
  concept: {
    keywords: [
      /is defined as/i, /refers to/i, /is a (type|kind|form) of/i,
      /concept of/i, /can be defined/i, /is characterized by/i,
    ],
    minScore: 1,
  },
  definition: {
    keywords: [
      /^[A-Z][a-z]+(\s+[a-z]+)*\s+is\s+/i, /means that/i,
      /is the (process|result|ability|condition)/i,
      /may be defined/i, /is known as/i,
    ],
    minScore: 1,
  },
  formula: {
    keywords: [
      /=|≈|≠|≤|≥/, /formula/i, /equation/i, /expression/i,
      /calculated (as|using)/i, /is given by/i,
    ],
    minScore: 1,
  },
  list: {
    keywords: [
      /^\s*[-*•]\s/m, /^\s*\d+\.\s/m,
      /(first|second|third|finally|next|then|lastly)/i,
      /there are (\d+|several|many|three|four|five)/i,
      /includes? the following/i, /as follows/i,
    ],
    minScore: 1,
  },
  cause_effect: {
    keywords: [
      /because|since|as a result|therefore|thus|hence/i,
      /leads? to|causes?|results? in|due to/i,
      /consequently|accordingly|so that/i,
      /if.*then/i, /triggered? by/i,
    ],
    minScore: 1,
  },
  process: {
    keywords: [
      /step (\d+|one|two|first|second)/i, /process of/i,
      /proceed(s|ed|ing) to/i, /next stage/i,
      /phase (\d+|one|two)/i, /sequence/i,
      /algorithm/i, /workflow/i, /pipeline/i,
    ],
    minScore: 1,
  },
  comparison: {
    keywords: [
      /similar|different|compared (to|with)/i,
      /on the (one|other) hand/i, /whereas|while|although/i,
      /both|neither|either/i, /in contrast/i,
      /likewise|similarly|however/i, /versus|vs/i,
    ],
    minScore: 1,
  },
};

export function detectLearningUnits(
  chunks: KnowledgeChunk[],
  documentId: string,
): LearningUnit[] {
  const units: LearningUnit[] = [];

  for (const chunk of chunks) {
    const match = analyzeChunk(chunk);

    const existing = units.find(
      (u) =>
        u.type === match.unitType &&
        u.chunks.length < 3 &&
        areAdjacent(u.chunks[u.chunks.length - 1], chunk),
    );

    if (existing) {
      existing.chunks.push(chunk);
      existing.wordCount += chunk.metadata.wordCount;
      mergeConcepts(existing, chunk);
    } else {
      units.push({
        id: generateUnitId(),
        documentId,
        chunks: [chunk],
        type: match.unitType,
        title: deriveTitle(chunk, match.unitType),
        keyConcepts: extractKeyConcepts(chunk),
        definitions: extractDefinitions(chunk),
        relationships: extractRelationships(chunk),
        wordCount: chunk.metadata.wordCount,
      });
    }
  }

  logger.info(`Detected ${units.length} learning units from ${chunks.length} chunks`, {
    documentId,
    unitTypes: units.map((u) => u.type),
  });

  return units;
}

function analyzeChunk(chunk: KnowledgeChunk): PatternMatch {
  const scores: PatternMatch[] = Object.entries(PATTERNS).map(([type, pattern]) => {
    const indicators: string[] = [];
    let score = 0;

    for (const regex of pattern.keywords) {
      if (regex.test(chunk.content)) {
        score++;
        indicators.push(regex.source.slice(0, 40));
      }
    }

    return {
      unitType: type as LearningUnitType,
      score,
      indicators,
    };
  });

  scores.sort((a, b) => b.score - a.score);

  return scores[0] ?? { unitType: 'concept', score: 0, indicators: [] };
}

function areAdjacent(a: KnowledgeChunk | undefined, b: KnowledgeChunk): boolean {
  if (!a) return false;
  const aEnd = a.metadata.paragraphIndex + a.metadata.wordCount;
  const bStart = b.metadata.paragraphIndex;
  return Math.abs(bStart - aEnd) < 5;
}

function mergeConcepts(unit: LearningUnit, chunk: KnowledgeChunk): void {
  unit.keyConcepts.push(...extractKeyConcepts(chunk));
  unit.definitions.push(...extractDefinitions(chunk));
  unit.relationships.push(...extractRelationships(chunk));
}

function extractKeyConcepts(chunk: KnowledgeChunk): string[] {
  const concepts: string[] = [];
  const sentences = chunk.content.split(/[.!?]+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.match(/^(the |a |an )?[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+is\s+/)) {
      const name = trimmed.split(/\s+is\s+/)[0]?.trim();
      if (name && name.length < 100) concepts.push(name);
    }
  }

  return concepts;
}

function extractDefinitions(chunk: KnowledgeChunk): string[] {
  const defs: string[] = [];
  const sentences = chunk.content.split(/[.!?]+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (
      trimmed.match(/(is defined as|refers to|means that|is a .+ of)/i) &&
      trimmed.length < 300
    ) {
      defs.push(trimmed);
    }
  }

  return defs;
}

function extractRelationships(chunk: KnowledgeChunk): string[] {
  const rels: string[] = [];
  const sentences = chunk.content.split(/[.!?]+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (
      trimmed.match(/(causes?|leads? to|results? in|depends on|related to)/i) &&
      trimmed.length < 300
    ) {
      rels.push(trimmed);
    }
  }

  return rels;
}

function deriveTitle(chunk: KnowledgeChunk, type: LearningUnitType): string {
  const sectionTitle = chunk.metadata.sectionTitle;
  if (sectionTitle && sectionTitle !== 'Document') return `${type}: ${sectionTitle}`;

  const firstSentence = chunk.content.split(/[.!?]+/)[0]?.trim();
  if (firstSentence && firstSentence.length < 80) return firstSentence;

  return `${type} unit`;
}

let unitCounter = 0;
function generateUnitId(): string {
  return `lu_${Date.now()}_${++unitCounter}`;
}
