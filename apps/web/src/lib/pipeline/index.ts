export type PipelineStage = 'pending' | 'running' | 'completed' | 'failed';

export interface PipelineContext {
  documentId: string;
  startedAt: string;
  stages: Record<string, PipelineStage>;
  errors: string[];
}

export interface PipelineInput<I> {
  data: I;
  context: PipelineContext;
}

export interface PipelineOutput<O> {
  data: O;
  context: PipelineContext;
}

export interface PipelineStep<I, O> {
  readonly name: string;
  execute(input: PipelineInput<I>): Promise<PipelineOutput<O>>;
}

export interface Pipeline<I, O> {
  readonly name: string;
  readonly steps: PipelineStep<unknown, unknown>[];
  execute(input: I): Promise<PipelineOutput<O>>;
}

export function createPipelineContext(documentId: string): PipelineContext {
  return {
    documentId,
    startedAt: new Date().toISOString(),
    stages: {},
    errors: [],
  };
}

export function createPipeline<I, O>(
  name: string,
  steps: PipelineStep<unknown, unknown>[],
): Pipeline<I, O> {
  return {
    name,
    steps,
    async execute(input: I): Promise<PipelineOutput<O>> {
      const context = createPipelineContext(
        (input as Record<string, unknown>)?.documentId as string ?? 'unknown',
      );

      let currentInput: unknown = input;

      for (const step of steps) {
        context.stages[step.name] = 'running';
        try {
          const result = await step.execute({
            data: currentInput,
            context,
          });
          context.stages[step.name] = 'completed';
          currentInput = result.data;
        } catch (err) {
          context.stages[step.name] = 'failed';
          const message = err instanceof Error ? err.message : 'Step failed';
          context.errors.push(`[${step.name}] ${message}`);
          throw err;
        }
      }

      return { data: currentInput as O, context };
    },
  };
}
