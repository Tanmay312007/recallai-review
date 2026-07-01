'use client';

import type { GenerationStatus } from '../store/ai-generation-store';
import { AI_PROVIDER_LABELS, type AiProviderType } from '../types';

interface AiGenerationProgressProps {
  status: GenerationStatus;
  progress: string;
  error: string | null;
  provider: string;
  model: string;
  totalTokens: number;
  durationMs: number;
  onRetry: () => void;
  onReset: () => void;
}

const STATUS_LABELS: Record<GenerationStatus, string> = {
  idle: 'Ready',
  building_prompt: 'Building prompt...',
  calling_provider: 'Calling AI provider...',
  parsing: 'Parsing response...',
  validating: 'Validating flashcards...',
  completed: 'Complete',
  failed: 'Failed',
};

const STATUS_COLORS: Record<GenerationStatus, string> = {
  idle: 'bg-bg-overlay text-foreground-muted',
  building_prompt: 'bg-brand/10 text-brand',
  calling_provider: 'bg-brand/10 text-brand',
  parsing: 'bg-brand/10 text-brand',
  validating: 'bg-semantic-warning/10 text-semantic-warning',
  completed: 'bg-semantic-success/10 text-semantic-success',
  failed: 'bg-semantic-error/10 text-semantic-error',
};

export function AiGenerationProgress({
  status,
  progress: progressText,
  error,
  provider,
  model,
  totalTokens,
  durationMs,
  onRetry,
  onReset,
}: AiGenerationProgressProps) {
  const isActive = status !== 'idle' && status !== 'completed' && status !== 'failed';

  return (
    <div className="rounded-lg border border-bg-overlay bg-background-elevated p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </span>
          {isActive && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          )}
        </div>

        <div className="flex gap-2">
          {status === 'failed' && (
            <button
              onClick={onRetry}
              className="rounded border border-bg-overlay px-3 py-1 text-xs text-foreground hover:bg-bg-overlay"
            >
              Retry
            </button>
          )}
          {(status === 'completed' || status === 'failed') && (
            <button
              onClick={onReset}
              className="rounded border border-bg-overlay px-3 py-1 text-xs text-foreground hover:bg-bg-overlay"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isActive && progressText && (
        <p className="mt-2 text-sm text-foreground-muted">{progressText}</p>
      )}

      {error && (
        <p className="mt-2 text-sm text-semantic-error">{error}</p>
      )}

      {status === 'completed' && (
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-foreground-muted">
          {provider && (
            <div>
              <span className="font-medium text-foreground">Provider: </span>
              {AI_PROVIDER_LABELS[provider as AiProviderType] || provider}
            </div>
          )}
          {model && (
            <div>
              <span className="font-medium text-foreground">Model: </span>
              {model}
            </div>
          )}
          {totalTokens > 0 && (
            <div>
              <span className="font-medium text-foreground">Tokens: </span>
              {totalTokens.toLocaleString()}
            </div>
          )}
          {durationMs > 0 && (
            <div>
              <span className="font-medium text-foreground">Duration: </span>
              {(durationMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}
    </div>
  );
}
