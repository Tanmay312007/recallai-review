'use client';

import { useState, useCallback } from 'react';
import { useAiGeneration } from '../hooks/use-ai-generation';
import { AiGenerationProgress } from './ai-generation-progress';
import type { KnowledgeChunk } from '@lumora/shared';
import { AI_PROVIDER_LABELS, type AiProviderType } from '../types';
import { aiProviderRegistry } from '../providers/registry';
import { useFlashcardStore } from '@/features/flashcards/store/flashcard-store';

interface AiFlashcardGeneratorProps {
  documentId: string;
  chunks: KnowledgeChunk[];
  onCardsGenerated?: (cards: import('@/features/flashcards/types').Flashcard[]) => void;
}

const GENERATION_COUNTS = [5, 10, 15, 20];

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

  const updateCard = useFlashcardStore((s) => s.updateCard);

  const [count, setCount] = useState(10);
  const [selectedProvider, setSelectedProvider] = useState<AiProviderType>('openai');

  const availableProviders = (Object.keys(AI_PROVIDER_LABELS) as AiProviderType[]).filter(
    (p) => aiProviderRegistry.get(p) !== undefined,
  );

  const handleGenerate = useCallback(async () => {
    await generate(chunks, documentId, {
      provider: selectedProvider,
      count,
    });

    if (generatedCards.length > 0) {
      for (const card of generatedCards) {
        updateCard(card.id, card);
      }
      onCardsGenerated?.(generatedCards);
    }
  }, [chunks, documentId, selectedProvider, count, generate, generatedCards, updateCard, onCardsGenerated]);

  const handleRetry = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

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

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-foreground-muted">Provider:</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as AiProviderType)}
            className="rounded border border-bg-overlay bg-background-surface px-2 py-1 text-sm text-foreground"
            disabled={status !== 'idle' && status !== 'completed' && status !== 'failed'}
          >
            {availableProviders.map((p) => (
              <option key={p} value={p}>
                {AI_PROVIDER_LABELS[p]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-foreground-muted">Cards:</label>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="rounded border border-bg-overlay bg-background-surface px-2 py-1 text-sm text-foreground"
            disabled={status !== 'idle' && status !== 'completed' && status !== 'failed'}
          >
            {GENERATION_COUNTS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={chunks.length === 0 || (status !== 'idle' && status !== 'completed' && status !== 'failed')}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {status === 'idle' ? 'Generate with AI' : 'Regenerate'}
        </button>
      </div>

      <AiGenerationProgress
        status={status}
        progress={progress}
        error={error}
        provider={provider}
        model={model}
        totalTokens={totalTokens}
        durationMs={durationMs}
        onRetry={handleRetry}
        onReset={reset}
      />

      {generatedCards.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span>Generated: {generatedCards.length} cards</span>
            {validCount > 0 && (
              <span className="text-semantic-success">({validCount} valid)</span>
            )}
            {failedCount > 0 && (
              <span className="text-semantic-error">({failedCount} failed validation)</span>
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
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{card.question}</p>
                      <p className="mt-1 text-xs text-foreground-muted line-clamp-2">{card.answer}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-foreground-muted capitalize">
                      {card.cardType.replace(/_/g, ' ')}
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
