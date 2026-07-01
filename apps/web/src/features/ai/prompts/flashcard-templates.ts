import { registerTemplate } from './index';

export const FLASHCARD_GENERATION_TEMPLATE = {
  id: 'flashcard-generation',
  name: 'Flashcard Generation',
  version: '1.0',
  systemPrompt: `You are a flashcard generation system. Your task is to create high-quality flashcards from document content.

Generate flashcards in the following JSON format:
{
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "cardType": "basic_qa" | "definition" | "fill_blank" | "true_false" | "list_recall" | "process_recall" | "comparison" | "concept_mapping",
      "difficulty": "easy" | "medium" | "hard",
      "bloomLevel": "REMEMBER" | "UNDERSTAND" | "APPLY" | "ANALYZE",
      "tags": ["string"],
      "sourcePage": number | null
    }
  ]
}

Rules:
- Questions must be self-contained and clear
- Answers must be accurate and complete
- Each flashcard must reference specific content from the source
- Use appropriate card types based on content structure
- Assign realistic difficulty levels
- Tags should include key topics and concepts
- Maximum 10 flashcards per generation call
- Never invent information not in the source text`,
  userPromptTemplate: `Generate flashcards from the following document content.

Document Title: {{documentTitle}}
Total Chunks: {{totalChunks}}

Content:
{{content}}

Generate {{count}} flashcards covering the main concepts, definitions, and key information.`,
  variables: ['documentTitle', 'totalChunks', 'content', 'count'],
  responseFormat: 'json' as const,
  maxTokens: 4096,
  temperature: 0.7,
};

export function registerFlashcardTemplates(): void {
  registerTemplate(FLASHCARD_GENERATION_TEMPLATE);
}
