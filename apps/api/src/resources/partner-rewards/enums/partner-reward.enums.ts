export enum RewardIssuanceStatus {
  /** Issued and awaiting redemption. */
  ISSUED = "ISSUED",
  /** Redeemed by the recipient (or marked redeemed by the calling partner). */
  REDEEMED = "REDEEMED",
  /** Passed its expiry without redemption. */
  EXPIRED = "EXPIRED",
  /** Explicitly revoked by the calling partner. */
  REVOKED = "REVOKED",
  /** Delivery failed and could not be completed. */
  FAILED = "FAILED",
}

/** Lifecycle events emitted to the calling partner. */
export enum PartnerRewardEvent {
  ISSUED = "reward.issued",
  REDEEMED = "reward.redeemed",
  EXPIRED = "reward.expired",
  REVOKED = "reward.revoked",
}
