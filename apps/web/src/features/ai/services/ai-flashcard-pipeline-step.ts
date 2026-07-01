import type { PipelineStep, PipelineInput, PipelineOutput } from '@/lib/pipeline';
import type { KnowledgeChunk } from '@lumora/shared';
import type { Flashcard } from '@/features/flashcards/types';
import type { AiProviderType } from '../types';
import { generateFlashcardsWithAI } from './flashcard-generation';

export interface AiFlashcardStepInput {
  chunks: KnowledgeChunk[];
  documentId: string;
  options?: {
    provider?: AiProviderType;
    count?: number;
    title?: string;
  };
}

export interface AiFlashcardStepOutput {
  flashcards: Flashcard[];
  provider: string;
  model: string;
  totalTokens: number;
  latencyMs: number;
  errors: string[];
  validationResults: { cardId: string; valid: boolean; errors: string[]; warnings: string[] }[];
}

export class AiFlashcardGenerationStep
  implements PipelineStep<AiFlashcardStepInput, AiFlashcardStepOutput>
{
  readonly name = 'ai-flashcard-generation';

  async execute(
    input: PipelineInput<AiFlashcardStepInput>,
  ): Promise<PipelineOutput<AiFlashcardStepOutput>> {
    const { data, context } = input;

    const result = await generateFlashcardsWithAI(
      data.chunks,
      data.documentId,
      data.options,
    );

    context.stages[this.name] = 'completed';

    return {
      data: {
        flashcards: result.flashcards,
        provider: result.provider,
        model: result.model,
        totalTokens: result.totalTokens,
        latencyMs: result.latencyMs,
        errors: result.errors,
        validationResults: result.validationResults,
      },
      context,
    };
  }
}
