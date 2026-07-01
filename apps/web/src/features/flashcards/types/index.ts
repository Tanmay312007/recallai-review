export type FlashcardCardType =
  | 'basic_qa'
  | 'definition'
  | 'fill_blank'
  | 'true_false'
  | 'list_recall'
  | 'process_recall'
  | 'comparison'
  | 'concept_mapping';

export type FlashcardDifficulty = 'easy' | 'medium' | 'hard';

export type FlashcardValidationStatus = 'pending' | 'passed' | 'failed';

export interface FlashcardGenerationMetadata {
  generatedAt: string;
  sourceChunkIds: string[];
  wordCount: number;
  validationStatus: FlashcardValidationStatus;
  validationErrors: string[];
  aiGenerated: boolean;
  modelVersion: string | null;
}

export interface Flashcard {
  id: string;
  documentId: string;
  chunkId: string;
  question: string;
  answer: string;
  cardType: FlashcardCardType;
  difficulty: FlashcardDifficulty;
  bloomLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE';
  tags: string[];
  sourcePage: number | null;
  confidence: number;
  metadata: FlashcardGenerationMetadata;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardFilters {
  search?: string;
  cardType?: FlashcardCardType;
  difficulty?: FlashcardDifficulty;
  validationStatus?: FlashcardValidationStatus;
  page: number;
  perPage: number;
}

export const FLASHCARD_CARD_TYPE_LABELS: Record<FlashcardCardType, string> = {
  basic_qa: 'Basic Q&A',
  definition: 'Definition',
  fill_blank: 'Fill in the Blank',
  true_false: 'True / False',
  list_recall: 'List Recall',
  process_recall: 'Process Recall',
  comparison: 'Comparison',
  concept_mapping: 'Concept Mapping',
};

export const FLASHCARD_CARD_TYPES: FlashcardCardType[] = [
  'basic_qa',
  'definition',
  'fill_blank',
  'true_false',
  'list_recall',
  'process_recall',
  'comparison',
  'concept_mapping',
];

export const DIFFICULTY_LABELS: Record<FlashcardDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
