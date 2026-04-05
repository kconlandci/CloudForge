// ============================================================
// CloudForge — Premium Status Hook
// Phase 2: RevenueCat as source of truth, Preferences cache fallback
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { Preferences } from "@capacitor/preferences";
import { Purchases } from "@revenuecat/purchases-capacitor";
import { ENTITLEMENT_ID } from "../config/revenuecat";
import { useRevenueCatReady } from "../App";

const PREMIUM_KEY_BASE = "cloudforge_is_premium";
const PREMIUM_CACHE_TIME_KEY_BASE = "cloudforge_premium_cache_time";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7-day offline grace period

function premiumKey(uid: string | null): string {
  return uid ? `${PREMIUM_KEY_BASE}_${uid}` : PREMIUM_KEY_BASE;
}

function premiumCacheTimeKey(uid: string | null): string {
  return uid ? `${PREMIUM_CACHE_TIME_KEY_BASE}_${uid}` : PREMIUM_CACHE_TIME_KEY_BASE;
}

interface PremiumStatus {
  isPremium: boolean;
  isLoading: boolean;
  refreshPremiumStatus: () => Promise<void>;
}

async function checkRevenueCat(): Promise<boolean | null> {
  try {
    const { isConfigured } = await Purchases.isConfigured();
    if (!isConfigured) return null; // SDK not ready yet
    const { customerInfo } = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return null; // RevenueCat unreachable
  }
}

async function readCache(uid: string | null): Promise<boolean> {
  try {
    const { value: premiumValue } = await Preferences.get({
      key: premiumKey(uid),
    });
    const { value: cacheTimeValue } = await Preferences.get({
      key: premiumCacheTimeKey(uid),
    });

    if (premiumValue !== "true") return false;

    const cacheTime = cacheTimeValue ? parseInt(cacheTimeValue, 10) : 0;
    const isExpired = Date.now() - cacheTime > CACHE_TTL_MS;

    if (isExpired) {
      console.warn(
        "[CloudForge] Premium cache expired — treating as non-premium until verified."
      );
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function usePremiumStatus(uid?: string | null): PremiumStatus {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isRevenueCatReady = useRevenueCatReady();

  const checkPremiumStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try RevenueCat first (source of truth)
      const rcResult = await checkRevenueCat();

      if (rcResult !== null) {
        // RevenueCat responded — update cache and state
        setIsPremium(rcResult);
        await setPremiumStatus(rcResult, uid ?? null);
        return;
      }

      // RevenueCat unreachable — fall back to cache
      console.warn(
        "[CloudForge] RevenueCat unreachable, falling back to cache."
      );
      const cached = await readCache(uid ?? null);
      setIsPremium(cached);
    } catch (error) {
      console.error("[CloudForge] Failed to check premium status:", error);
      const cached = await readCache(uid ?? null);
      setIsPremium(cached);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (!isRevenueCatReady) {
      // SDK not configured yet — stay in loading state
      setIsLoading(true);
      return;
    }
    checkPremiumStatus();
  }, [isRevenueCatReady, checkPremiumStatus]);

  return { isPremium, isLoading, refreshPremiumStatus: checkPremiumStatus };
}

/** Write premium status to local cache */
export async function setPremiumStatus(isPremium: boolean, uid?: string | null): Promise<void> {
  await Preferences.set({
    key: premiumKey(uid ?? null),
    value: isPremium ? "true" : "false",
  });
  await Preferences.set({
    key: premiumCacheTimeKey(uid ?? null),
    value: Date.now().toString(),
  });
}
