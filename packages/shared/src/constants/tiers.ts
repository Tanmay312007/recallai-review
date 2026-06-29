/**
 * Subscription tier entitlements (PROMPT §2 v1 scope, §10 BILLING_003,
 * §15 "Never trust client-side tier/entitlement claims").
 *
 * These are the *server-side source of truth*. The web app may read them to
 * render upgrade prompts, but every enforcement happens behind
 * EntitlementGuard on the API.
 */
import type { Tier } from '../types/index.js';

export interface TierEntitlements {
  /** Max decks a user may keep (DECK_002 when exceeded). */
  readonly maxDecks: number;
  /** Max cards per deck (CARD_002 when exceeded). */
  readonly maxCardsPerDeck: number;
  /** Max new cards introduced per day across all decks. */
  readonly maxNewCardsPerDay: number;
  /** Whether AI card regeneration is allowed (POST /cards/:id/regenerate). */
  readonly canRegenerateCards: boolean;
  /** Whether export (JSON/CSV) is allowed (EXPORT_003). */
  readonly canExport: boolean;
  /** Whether per-deck folder organization is allowed. */
  readonly canUseFolders: boolean;
}

export const TIER_ENTITLEMENTS: Readonly<Record<Tier, TierEntitlements>> = {
  FREE: {
    maxDecks: 5,
    maxCardsPerDeck: 200,
    maxNewCardsPerDay: 10,
    canRegenerateCards: false,
    canExport: false,
    canUseFolders: false,
  },
  PRO: {
    maxDecks: Number.MAX_SAFE_INTEGER,
    maxCardsPerDeck: Number.MAX_SAFE_INTEGER,
    maxNewCardsPerDay: 100,
    canRegenerateCards: true,
    canExport: true,
    canUseFolders: true,
  },
};

/** Look up entitlements for a tier. Throws on unknown tier (defense in depth). */
export function getEntitlements(tier: Tier): TierEntitlements {
  const entitlements = TIER_ENTITLEMENTS[tier];
  if (!entitlements) {
    throw new Error(`Unknown subscription tier: ${tier}`);
  }
  return entitlements;
}
