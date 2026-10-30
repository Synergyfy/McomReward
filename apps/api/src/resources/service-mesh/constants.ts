/**
 * MCOM Ecosystem Service Mesh constants.
 *
 * The mesh is a zero-hop / direct peer-to-peer model: MCOM Central issues
 * short-lived RS256 service tokens (control plane) which apps verify offline
 * via cached JWKS. MCOM is never in the data path.
 */
export const SERVICE_MESH_ISSUER = "mcom-solutions";

/** How long the public ecosystem service registry is cached locally (ms). */
export const ECOSYSTEM_SERVICES_CACHE_TTL_MS = 60_000;

/** Refresh a service token when it is within this window of expiring (ms). */
export const SERVICE_TOKEN_SAFETY_MARGIN_MS = 60_000;

/** Fallback TTL if Central does not return `expires_in`. */
export const DEFAULT_SERVICE_TOKEN_TTL_SECONDS = 300;

// ─── Partner API scopes (scopes THIS app serves) ─────────────────────────────
export const SERVICE_SCOPE_REWARDS_READ = "rewards:read";
export const SERVICE_SCOPE_REWARDS_ISSUE = "rewards:issue";

// ─── Mall peer scopes (scopes THIS app requests from Central) ────────────────
// Declared on `mcom-rewards` in the Central Console and mirrored by the mall
// app, which serves the partner catalog (`mall:read`) and events/instruments
// (`mall:write`). See the MCOM Rewards ⇄ MCOM Mall integration handbook §4/D.
export const SERVICE_SCOPE_MALL_READ = "mall:read";
export const SERVICE_SCOPE_MALL_WRITE = "mall:write";

/** Default ecosystem clientId for the MCOM Mall peer. */
export const DEFAULT_MALL_CLIENT_ID = "mcom-mall";

// ─── Central Hub peer scopes (scopes THIS app requests from Central) ─────────
// Declared on `mcom-rewards` in the Central Console. Central serves its
// partner catalogue (`central:read`) and grants/coupons (`central:issue`).
export const SERVICE_SCOPE_CENTRAL_READ = "central:read";
export const SERVICE_SCOPE_CENTRAL_ISSUE = "central:issue";

/** Default ecosystem clientId for the MCOM Central Hub peer. */
export const DEFAULT_CENTRAL_CLIENT_ID = "mcom-central";

/**
 * Admin-level gifting: lets a peer admin (e.g. FundOrDonate's back office)
 * grant a platform (MCOM) catalogue reward to an MCOM user without a sponsoring
 * business. Issued on the platform's behalf, so it is deliberately separate
 * from `rewards:issue` (which requires an entitled business sponsor).
 */
export const SERVICE_SCOPE_REWARDS_GIFT = "rewards:gift";
