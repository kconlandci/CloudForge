// ============================================================
// CloudForge — RevenueCat Configuration
// Wiring package (prepared 2026-10-15): re-pointed from the
// one-time "Founders Pack" model to the shared Forge Labs Pro
// entitlement + subscription, following ThreatForge's config.
//
// The API key below is CloudForge's own Google Play public key,
// from the CloudForge app created in the existing Forge Labs
// RevenueCat project on 2026-10-15 (app id app8abd10f877). It is
// app-specific — not ThreatForge's key. Still outstanding for
// launch (not needed for this config to be correct): create the
// Play Console subscription "cloudforge_pro" (RevenueCat will
// register it as "cloudforge_pro:<base-plan-id>"), attach it to
// Forge Labs Pro, and upload the Play service-account credentials
// to the RevenueCat app — all launch-time steps.
// ============================================================

/** Google Play public API key from RevenueCat dashboard (CloudForge app) */
export const REVENUECAT_API_KEY = "goog_fInNzKxtnsKUNDMHQlJmrayprXQ";

/** RevenueCat entitlement identifier — shared across the Forge family.
 *  Exact string as configured in ThreatForge/TechForge and in the
 *  RevenueCat dashboard: "Forge Labs Pro" (case- and space-sensitive). */
export const ENTITLEMENT_ID = "Forge Labs Pro";

/** Google Play subscription product identifier (must match Play Console
 *  and the product attached to Forge Labs Pro in RevenueCat).
 *  Naming follows ThreatForge's pattern: "<app>_pro"
 *  (ThreatForge uses "threatforge_pro"). Monthly/yearly are base
 *  plans on this one Play subscription product.
 *  VERIFY IN DASHBOARD: create/confirm this exact ID before launch. */
export const SUBSCRIPTION_ID = "cloudforge_pro";

/** Optional one-time lifetime product identifier, following the family
 *  pattern "<app>_lifetime" (ThreatForge: "threatforge_lifetime",
 *  TechForge: "techforge_lifetime"). NOT required for the subscription
 *  pivot and NOT used by CloudForge's current purchase flow — create
 *  and attach it to Forge Labs Pro only if Kevin wants a lifetime SKU. */
export const LIFETIME_PRODUCT_ID = "cloudforge_lifetime";

/** Backwards-compatible alias: CloudForge's existing usePurchase.ts
 *  imports PRODUCT_ID. It now points at the subscription product so
 *  this config is a true drop-in with no hook changes. (ThreatForge's
 *  hook instead takes a productId argument; mirror that refactor
 *  later if multiple products get separate buy buttons.) */
export const PRODUCT_ID = SUBSCRIPTION_ID;
