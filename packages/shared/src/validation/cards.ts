/**
 * Card & Deck request validation (PROMPT §6). Card length limits mirror the
 * Prisma CHECK constraints + the §7.2 generation rules so a hand-edited card
 * can never violate the same invariants an AI card must satisfy.
 */
import { z } from 'zod';
import {
  MAX_CARD_BACK_LENGTH,
  MAX_CARD_FRONT_LENGTH,
  MIN_CARD_BACK_LENGTH,
  MIN_CARD_FRONT_LENGTH,
} from '../constants/limits.js';
import { nonEmptyString, uuidSchema } from './common.js';

export const bloomLevelSchema = z.enum([
  'REMEMBER',
  'UNDERSTAND',
  'APPLY',
  'ANALYZE',
]);
export const cardTypeSchema = z.enum(['BASIC', 'CLOZE', 'DEFINITION']);

export const createDeckSchema = z
  .object({
    name: nonEmptyString.max(255, 'Name must be 255 characters or fewer'),
    description: z.string().max(2000).optional(),
    colorTag: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color, e.g. #6366f1')
      .optional(),
    folderId: uuidSchema.optional(),
  })
  .strict();

export type CreateDeckRequest = z.infer<typeof createDeckSchema>;

export const updateDeckSchema = createDeckSchema.partial().strict();
export type UpdateDeckRequest = z.infer<typeof updateDeckSchema>;

export const createCardSchema = z
  .object({
    deckId: uuidSchema,
    front: nonEmptyString
      .min(MIN_CARD_FRONT_LENGTH)
      .max(MAX_CARD_FRONT_LENGTH, `Front must be ${MAX_CARD_FRONT_LENGTH} characters or fewer`),
    back: nonEmptyString
      .min(MIN_CARD_BACK_LENGTH)
      .max(MAX_CARD_BACK_LENGTH, `Back must be ${MAX_CARD_BACK_LENGTH} characters or fewer`),
    cardType: cardTypeSchema.default('BASIC'),
    bloomLevel: bloomLevelSchema.default('REMEMBER'),
  })
  .strict();

export type CreateCardRequest = z.infer<typeof createCardSchema>;

export const updateCardSchema = z
  .object({
    front: nonEmptyString.min(MIN_CARD_FRONT_LENGTH).max(MAX_CARD_FRONT_LENGTH),
    back: nonEmptyString.min(MIN_CARD_BACK_LENGTH).max(MAX_CARD_BACK_LENGTH),
  })
  .strict();

export type UpdateCardRequest = z.infer<typeof updateCardSchema>;

export const createFolderSchema = z
  .object({
    name: nonEmptyString.max(255),
    sortOrder: z.number().int().default(0),
  })
  .strict();

export type CreateFolderRequest = z.infer<typeof createFolderSchema>;
