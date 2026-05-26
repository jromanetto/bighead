// Centralized premium status helper.
// Single source of truth for "is this user premium right now?".
//
// Usage:
//   import { isUserPremium } from "../utils/premium";
//   if (isUserPremium(profile)) { ... }
//
// Accepts either the full user profile or any object with `is_premium` +
// `premium_expires_at` fields (e.g. raw DB row, useAuth().profile).

export type PremiumLike = {
  is_premium?: boolean | null;
  premium_expires_at?: string | null;
} | null | undefined;

export function isUserPremium(user: PremiumLike): boolean {
  if (!user) return false;
  if (user.is_premium !== true) return false;
  // Lifetime premium (no expiry) → still premium
  if (!user.premium_expires_at) return true;
  // Time-bound premium → premium only if expiry is in the future
  return new Date(user.premium_expires_at) > new Date();
}
