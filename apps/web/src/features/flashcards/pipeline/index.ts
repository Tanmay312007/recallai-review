import type { KnowledgeChunk } from '@lumora/shared';

export interface LearningUnit {
  id: string;
  documentId: string;
  chunks: KnowledgeChunk[];
  type: LearningUnitType;
  title: string;
  keyConcepts: string[];
  definitions: string[];
  relationships: string[];
  wordCount: number;
}

export type LearningUnitType =
  | 'concept'
  | 'definition'
  | 'formula'
  | 'list'
  | 'cause_effect'
  | 'process'
  | 'comparison';

export interface GeneratedQuestion {
  id: string;
  text: string;
  answer: string;
  cardType: string;
  sourceChunkIds: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
}

export interface FlashcardCandidate {
  id: string;
  documentId: string;
  chunkId: string;
  question: string;
  answer: string;
  cardType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
  tags: string[];
  sourcePage: number | null;
  confidence: number;
  metadata: FlashcardMetadata;
}

export interface FlashcardMetadata {
  generatedAt: string;
  sourceChunkIds: string[];
  wordCount: number;
  validationStatus: ValidationStatus;
  validationErrors: string[];
}

export type ValidationStatus = 'pending' | 'passed' | 'failed';
