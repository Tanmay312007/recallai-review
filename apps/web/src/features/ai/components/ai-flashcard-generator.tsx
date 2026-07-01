'use client';

import { useState } from 'react';
import { useAiGeneration } from '../hooks/use-ai-generation';
import { AiGenerationProgress } from './ai-generation-progress';
import type { KnowledgeChunk } from '@recallai/shared';

interface AiFlashcardGeneratorProps {
  documentId: string;
  chunks: KnowledgeChunk[];
  onCardsGenerated?: (cards: import('@/features/flashcards/types').Flashcard[]) => void;
}

export function AiFlashcardGenerator({
  documentId,
  chunks,
  onCardsGenerated,
}: AiFlashcardGeneratorProps) {
  const {
    status,
    progress,
    error,
    generatedCards,
    validationResults,
    provider,
    model,
    totalTokens,
    durationMs,
    generate,
    reset,
  } = useAiGeneration();

  const [count, setCount] = useState(10);

  const handleGenerate = async () => {
    await generate(chunks, documentId, { count });
    onCardsGenerated?.(generatedCards);
  };

  const validCount = validationResults.filter((r) => r.valid).length;
  const failedCount = validationResults.filter((r) => !r.valid).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          AI Flashcard Generation
        </h3>
        {chunks.length > 0 && (
          <p className="text-xs text-foreground-muted">
            {chunks.length} chunks available
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-foreground-muted">
          Cards to generate:
        </label>
        <select
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="rounded border border-bg-overlay bg-background-surface px-2 py-1 text-sm text-foreground"
        >
          {[5, 10, 15, 20].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button
          onClick={handleGenerate}
          disabled={status !== 'idle' && status !== 'completed' && status !== 'failed'}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {status === 'idle' ? 'Generate with AI' : 'Regenerate'}
        </button>
      </div>

      <AiGenerationProgress
        status={status as any}
        progress={progress}
        error={error}
        provider={provider}
        model={model}
        totalTokens={totalTokens}
        durationMs={durationMs}
        onRetry={handleGenerate}
        onReset={reset}
      />

      {generatedCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">
              Generated: {generatedCards.length} cards
            </span>
            {validCount > 0 && (
              <span className="text-xs text-semantic-success">
                ({validCount} valid)
              </span>
            )}
            {failedCount > 0 && (
              <span className="text-xs text-semantic-error">
                ({failedCount} failed validation)
              </span>
            )}
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {generatedCards.map((card, i) => {
              const vr = validationResults[i];
              const isValid = vr?.valid;
              return (
                <div
                  key={card.id}
                  className={`rounded-lg border p-3 ${
                    isValid
                      ? 'border-bg-overlay bg-background-elevated'
                      : 'border-semantic-error/30 bg-semantic-error/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">{card.question}</p>
                      <p className="mt-1 text-xs text-foreground-muted line-clamp-2">{card.answer}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-foreground-muted">
                      {card.cardType.replace('_', ' ')}
                    </span>
                  </div>
                  {!isValid && vr && vr.errors.length > 0 && (
                    <p className="mt-1 text-[10px] text-semantic-error">
                      {vr.errors.join(', ')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
