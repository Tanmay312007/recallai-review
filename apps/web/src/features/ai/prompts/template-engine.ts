import { logger } from '@/lib/logger';

export interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface PromptTemplate {
  id: string;
  version: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  variables: PromptVariable[];
  fewShotExamples: FewShotExample[];
  metadata: {
    author: string;
    created: string;
    updated: string;
    tags: string[];
    expectedOutputType: 'json' | 'text';
  };
}

export interface FewShotExample {
  input: Record<string, string>;
  output: string;
}

export interface RenderedPrompt {
  system: string;
  user: string;
  usedVariables: string[];
  warnings: string[];
}

const templateStore = new Map<string, PromptTemplate>();

export function registerTemplate(template: PromptTemplate): void {
  const key = `${template.id}@${template.version}`;
  templateStore.set(key, template);
  logger.info(`Prompt template registered: ${key}`);
}

export function unregisterTemplate(id: string, version: string): void {
  templateStore.delete(`${id}@${version}`);
}

export function getTemplate(id: string, version: string): PromptTemplate | undefined {
  return templateStore.get(`${id}@${version}`);
}

export function getAllTemplates(): PromptTemplate[] {
  return Array.from(templateStore.values());
}

export function renderPrompt(
  id: string,
  version: string,
  variables: Record<string, string>,
  options?: { includeFewShot?: boolean },
): RenderedPrompt {
  const template = getTemplate(id, version);
  if (!template) {
    throw new Error(`Prompt template not found: ${id}@${version}`);
  }

  const warnings: string[] = [];
  const usedVariables: string[] = [];

  const resolvedVariables: Record<string, string> = {};

  for (const v of template.variables) {
    const value = variables[v.name] ?? v.defaultValue;
    if (v.required && !value) {
      warnings.push(`Missing required variable: ${v.name}`);
      resolvedVariables[v.name] = `{{${v.name}}}`;
    } else if (value) {
      resolvedVariables[v.name] = value;
      usedVariables.push(v.name);
    }
  }

  let system = template.systemPrompt;
  let user = template.userPrompt;

  for (const [key, value] of Object.entries(resolvedVariables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    system = system.replace(regex, value);
    user = user.replace(regex, value);
  }

  const unmatchedSystem = system.match(/\{\{\w+\}\}/g);
  const unmatchedUser = user.match(/\{\{\w+\}\}/g);
  if (unmatchedSystem?.length || unmatchedUser?.length) {
    warnings.push(`Unresolved variables: ${[...new Set([...(unmatchedSystem ?? []), ...(unmatchedUser ?? [])])].join(', ')}`);
  }

  if (options?.includeFewShot && template.fewShotExamples.length > 0) {
    const examples = template.fewShotExamples
      .map((ex, i) => {
        const rendered = template.userPrompt.replace(/\{\{(\w+)\}\}/g, (_, name) => ex.input[name] ?? `{{${name}}}`);
        return `Example ${i + 1}:\nInput: ${rendered}\nOutput: ${ex.output}`;
      })
      .join('\n\n');

    user = `${user}\n\n${examples}`;
  }

  return { system, user, usedVariables, warnings };
}

export class PromptTemplateEngine {
  private readonly templates = new Map<string, PromptTemplate>();

  register(template: PromptTemplate): void {
    const key = `${template.id}@${template.version}`;
    this.templates.set(key, template);
    registerTemplate(template);
  }

  get(id: string, version: string): PromptTemplate | undefined {
    return this.templates.get(`${id}@${version}`);
  }

  render(
    id: string,
    version: string,
    variables: Record<string, string>,
    options?: { includeFewShot?: boolean },
  ): RenderedPrompt {
    return renderPrompt(id, version, variables, options);
  }

  getAll(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const promptEngine = new PromptTemplateEngine();
