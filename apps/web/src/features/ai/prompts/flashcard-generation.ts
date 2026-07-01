import type { PromptTemplate } from './template-engine';

export const FLASHCARD_GENERATION_SYSTEM_PROMPT = `You are a flashcard generation assistant. Your task is to create high-quality educational flashcards from provided source content.

Generate flashcards that test understanding, not just memorization. Each card should have:
- A clear, specific question
- A complete, accurate answer
- Appropriate difficulty level
- Proper Bloom's taxonomy level

Output your response as a valid JSON object with the following schema:
{
  "cards": [
    {
      "front": "string - The question or prompt",
      "back": "string - The answer or explanation",
      "bloom_level": "REMEMBER | UNDERSTAND | APPLY | ANALYZE",
      "card_type": "BASIC | CLOZE | DEFINITION",
      "key_concept": "string - The main concept this card tests"
    }
  ]
}

CRITICAL RULES:
1. Always output valid JSON. No markdown fences, no extra text.
2. Each card must test a single, specific concept.
3. Questions must be self-contained and answerable from the content.
4. Answers must be factually accurate based only on the provided content.
5. Vary difficulty - include some easy, medium, and hard cards.
6. Use higher Bloom levels (APPLY, ANALYZE) for complex topics.
7. Generate {{count}} cards unless the content is too limited.`;

export const FLASHCARD_GENERATION_USER_PROMPT = `Generate flashcards from the following source content.

Source content:
{{content}}

Document title: {{title}}

Create {{count}} flashcards covering the key concepts. Include a mix of:
- Basic recall questions (what is X?)
- Definition cards (define X)
- Concept application (how does X apply to Y?)
- Analysis cards (compare X and Y, why does X happen?)

Ensure each card has accurate content based strictly on the provided source.`;

export const FLASHCARD_GENERATION_FEW_SHOT = [
  {
    input: {
      content: 'Photosynthesis is the process by which plants convert light energy into chemical energy. The process occurs in chloroplasts and requires carbon dioxide, water, and sunlight. The products are glucose and oxygen. Photosynthesis has two stages: light-dependent reactions and the Calvin cycle.',
      title: 'Biology: Photosynthesis',
      count: '3',
    },
    output: JSON.stringify({
      cards: [
        {
          front: 'What are the inputs and outputs of photosynthesis?',
          back: 'Inputs: carbon dioxide, water, and sunlight. Outputs: glucose and oxygen.',
          bloom_level: 'REMEMBER',
          card_type: 'BASIC',
          key_concept: 'Photosynthesis overview',
        },
        {
          front: 'Define the Calvin cycle and its role in photosynthesis.',
          back: 'The Calvin cycle is the second stage of photosynthesis that uses energy from light-dependent reactions to convert carbon dioxide into glucose.',
          bloom_level: 'UNDERSTAND',
          card_type: 'DEFINITION',
          key_concept: 'Calvin cycle',
        },
        {
          front: 'Compare the light-dependent reactions and the Calvin cycle in terms of their inputs, outputs, and location within the chloroplast.',
          back: 'Light-dependent reactions occur in thylakoid membranes, use light energy to produce ATP and NADPH, and release oxygen. The Calvin cycle occurs in the stroma, uses ATP and NADPH to fix carbon dioxide into glucose.',
          bloom_level: 'ANALYZE',
          card_type: 'BASIC',
          key_concept: 'Photosynthesis stages comparison',
        },
      ],
    }),
  },
];

export const flashcardGenerationTemplate: PromptTemplate = {
  id: 'flashcard-generation',
  version: '1.0',
  name: 'Flashcard Generation',
  description: 'Generates educational flashcards from source content using AI',
  systemPrompt: FLASHCARD_GENERATION_SYSTEM_PROMPT,
  userPrompt: FLASHCARD_GENERATION_USER_PROMPT,
  variables: [
    { name: 'content', description: 'The source text content to generate cards from', required: true },
    { name: 'title', description: 'The document or section title', required: true },
    { name: 'count', description: 'Number of cards to generate', required: false, defaultValue: '10' },
  ],
  fewShotExamples: FLASHCARD_GENERATION_FEW_SHOT,
  metadata: {
    author: 'RecallAI',
    created: '2026-07-01',
    updated: '2026-07-01',
    tags: ['flashcard', 'generation', 'educational'],
    expectedOutputType: 'json',
  },
};
