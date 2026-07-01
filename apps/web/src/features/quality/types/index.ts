/* ── Quality Scoring ── */

export type QualityCategory =
  | 'question_clarity'
  | 'answer_quality'
  | 'answer_completeness'
  | 'educational_usefulness'
  | 'source_grounding'
  | 'metadata_completeness';

export interface CategoryScore {
  category: QualityCategory;
  score: number;        // 0–1
  weight: number;       // contribution to overall
  label: string;
  details: string[];
}

export interface QualityScore {
  overall: number;              // 0–1 composite
  categories: CategoryScore[];
  calculatedAt: string;
}

/* ── Duplicate Detection ── */

export type DuplicateType = 'exact' | 'near' | 'concept';

export interface DuplicateInfo {
  type: DuplicateType;
  matchCardId: string;
  matchQuestion: string;
  similarity: number;        // 0–1
}

/* ── Difficulty Estimation ── */

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

/* ── Human Review ── */

export type ReviewStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'edited'
  | 'regenerated'
  | 'flagged';

export type ReviewAction =
  | 'approve'
  | 'reject'
  | 'edit'
  | 'regenerate'
  | 'flag'
  | 'unflag';

export interface ReviewRecord {
  id: string;
  cardId: string;
  action: ReviewAction;
  timestamp: string;
  note: string;
  previousStatus?: ReviewStatus;
}

export interface CardReview {
  cardId: string;
  status: ReviewStatus;
  score: QualityScore | null;
  duplicates: DuplicateInfo[];
  difficulty: DifficultyLevel;
  notes: ReviewRecord[];
  flagged: boolean;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

/* ── Batch Operations ── */

export interface BatchSelection {
  cardIds: Set<string>;
  selectAll: boolean;
}

export interface BatchActionResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

/* ── Analytics ── */

export interface GenerationAnalytics {
  provider: string;
  model: string;
  promptVersion: string;
  generationDurationMs: number;
  totalTokens: number;
  estimatedCostUsd: number;
  validationPassed: number;
  validationFailed: number;
  approvalRate: number;
  averageQualityScore: number;
  totalCards: number;
}

/* ── Constants ── */

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  edited: 'Edited',
  regenerated: 'Regenerated',
  flagged: 'Flagged',
};

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  pending: 'bg-bg-overlay text-foreground-muted',
  approved: 'bg-semantic-success/10 text-semantic-success',
  rejected: 'bg-semantic-error/10 text-semantic-error',
  edited: 'bg-brand/10 text-brand',
  regenerated: 'bg-semantic-warning/10 text-semantic-warning',
  flagged: 'bg-semantic-error/10 text-semantic-error',
};

export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
};

export const DIFFICULTY_LEVEL_COLORS: Record<DifficultyLevel, string> = {
  easy: 'text-semantic-success',
  medium: 'text-semantic-warning',
  hard: 'text-semantic-error',
  expert: 'text-semantic-error',
};

export const QUALITY_SCORE_COLORS: Record<string, string> = {
  high: 'text-semantic-success',
  medium: 'text-semantic-warning',
  low: 'text-semantic-error',
};
