export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
  responseFormat: 'text' | 'json';
  maxTokens: number;
  temperature: number;
}

export interface PromptRenderResult {
  systemPrompt: string;
  userPrompt: string;
}

const templates = new Map<string, PromptTemplate>();

export function registerTemplate(template: PromptTemplate): void {
  const key = `${template.id}@${template.version}`;
  templates.set(key, template);
}

export function getTemplate(id: string, version: string = '1.0'): PromptTemplate | undefined {
  return templates.get(`${id}@${version}`);
}

export function getAllTemplates(): PromptTemplate[] {
  return Array.from(templates.values());
}

export function renderPrompt(
  template: PromptTemplate,
  variables: Record<string, string>,
): PromptRenderResult {
  let userPrompt = template.userPromptTemplate;

  for (const variable of template.variables) {
    const value = variables[variable] ?? `{{${variable}}}`;
    userPrompt = userPrompt.replaceAll(`{{${variable}}}`, value);
  }

  return {
    systemPrompt: template.systemPrompt,
    userPrompt,
  };
}

export function validatePrompt(prompt: string): string[] {
  const errors: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }

  const unresolvedVars = prompt.match(/\{\{(\w+)\}\}/g);
  if (unresolvedVars) {
    errors.push(`Unresolved template variables: ${unresolvedVars.join(', ')}`);
  }

  if (prompt.length > 32000) {
    errors.push('Prompt exceeds maximum length of 32000 characters');
  }

  return errors;
}
