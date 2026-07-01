import { logger } from '@/lib/logger';

export interface JsonValidationResult {
  valid: boolean;
  data: unknown;
  errors: string[];
}

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  arrayType?: 'string' | 'number' | 'object';
  fields?: SchemaField[];
}

const CARD_SCHEMA: SchemaField[] = [
  { name: 'front', type: 'string', required: true },
  { name: 'back', type: 'string', required: true },
  { name: 'bloom_level', type: 'string', required: true },
  { name: 'card_type', type: 'string', required: true },
  { name: 'key_concept', type: 'string', required: true },
];

const VALID_BLOOM_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE'];
const VALID_CARD_TYPES = ['BASIC', 'CLOZE', 'DEFINITION'];

export function validateJsonResponse(
  raw: string,
): JsonValidationResult {
  const errors: string[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    errors.push('Response is not valid JSON');
    return { valid: false, data: null, errors };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    errors.push('Response must be a JSON object');
    return { valid: false, data: null, errors };
  }

  const obj = parsed as Record<string, unknown>;

  if (!Array.isArray(obj.cards)) {
    errors.push('Response must contain a "cards" array');
    return { valid: false, data: obj, errors };
  }

  if (obj.cards.length === 0) {
    errors.push('Cards array is empty');
    return { valid: false, data: obj, errors };
  }

  for (let i = 0; i < obj.cards.length; i++) {
    const card = obj.cards[i];
    const cardErrors = validateCardObject(card);

    if (cardErrors.length > 0) {
      errors.push(`Card ${i + 1}: ${cardErrors.join('; ')}`);
    }

    if (typeof card === 'object' && card !== null) {
      const c = card as Record<string, unknown>;
      if (typeof c.front === 'string' && typeof c.back === 'string' && c.front === c.back) {
        errors.push(`Card ${i + 1}: front and back are identical`);
      }
    }
  }

  if (errors.length > 0) {
    logger.warn('JSON validation failed', { errors });
  }

  return {
    valid: errors.length === 0,
    data: obj,
    errors,
  };
}

function validateCardObject(card: unknown): string[] {
  const errors: string[] = [];

  if (typeof card !== 'object' || card === null) {
    errors.push('Must be an object');
    return errors;
  }

  const c = card as Record<string, unknown>;

  for (const field of CARD_SCHEMA) {
    const value = c[field.name];

    if (field.required && (value === undefined || value === null)) {
      errors.push(`Missing required field "${field.name}"`);
      continue;
    }

    if (value !== undefined && value !== null && typeof value !== field.type) {
      errors.push(`Field "${field.name}" must be ${field.type}, got ${typeof value}`);
    }
  }

  if (c.bloom_level && !VALID_BLOOM_LEVELS.includes(c.bloom_level as string)) {
    errors.push(`Invalid bloom_level "${c.bloom_level}". Must be one of: ${VALID_BLOOM_LEVELS.join(', ')}`);
  }

  if (c.card_type && !VALID_CARD_TYPES.includes(c.card_type as string)) {
    errors.push(`Invalid card_type "${c.card_type}". Must be one of: ${VALID_CARD_TYPES.join(', ')}`);
  }

  if (typeof c.front === 'string' && c.front.length < 10) {
    errors.push('Question too short (min 10 chars)');
  }

  if (typeof c.front === 'string' && c.front.length > 500) {
    errors.push('Question too long (max 500 chars)');
  }

  if (typeof c.back === 'string' && c.back.length < 5) {
    errors.push('Answer too short (min 5 chars)');
  }

  if (typeof c.back === 'string' && c.back.length > 2000) {
    errors.push('Answer too long (max 2000 chars)');
  }

  return errors;
}
