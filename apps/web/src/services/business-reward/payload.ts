import type {
  CreateBusinessRewardDto,
  Reward,
  RewardStatus,
} from './types';

export interface BuildBusinessRewardPayloadOptions {
  /** Status to send on create (updates keep the persisted status). */
  status?: RewardStatus;
  /** Whether to include the expiry date (create only). */
  includeExpiry?: boolean;
  /** Fallback when the wizard did not return a reward type. */
  fallbackRewardType?: string;
}

/**
 * Normalise the reward wizard output into the API payload.
 *
 * The wizard emits a mix of camelCase and snake_case keys (it also supports
 * catalogue templates). This helper makes sure every field configured in the
 * form — including the MCOM Mall fulfilment attachment and discount targeting
 * — is forwarded to the API for both create and update.
 */
export const buildBusinessRewardPayload = (
  rewardData: Reward,
  options: BuildBusinessRewardPayloadOptions = {},
): CreateBusinessRewardDto => {
  const rewardType =
    rewardData.reward_type ??
    rewardData.rewardType ??
    options.fallbackRewardType ??
    'Voucher';

  const isMallIntegrated =
    rewardData.is_mall_integrated ??
    (rewardData.mall_reward_value ?? rewardData.mallRewardValue ?? 0) > 0;

  const payload: CreateBusinessRewardDto = {
    title: rewardData.title,
    description: rewardData.description,
    points_required: rewardData.points_required ?? rewardData.pointsRequired ?? 0,
    stamps_required: rewardData.stamps_required ?? rewardData.stampsRequired ?? 0,
    is_points_enabled: rewardData.is_points_enabled,
    is_stamps_enabled: rewardData.is_stamps_enabled,
    image: rewardData.image,
    gallery: rewardData.gallery,
    quantity: rewardData.quantity,
    disabled: rewardData.disabled,
    reward_type: rewardType,
    is_mall_integrated: isMallIntegrated,
    mall_reward_type:
      rewardData.mall_reward_type ?? rewardData.mallRewardType ?? null,
    mall_reward_value:
      rewardData.mall_reward_value ?? rewardData.mallRewardValue ?? 0,
    mall_target_scope:
      rewardData.mall_target_scope ?? rewardData.mallTargetScope,
    mall_target_product_ids:
      rewardData.mall_target_product_ids ?? rewardData.mallTargetProductIds,
    mall_target_service_ids:
      rewardData.mall_target_service_ids ?? rewardData.mallTargetServiceIds,
    mall_discount_type:
      rewardData.mall_discount_type ?? rewardData.mallDiscountType,
    mall_discount_value:
      rewardData.mall_discount_value ?? rewardData.mallDiscountValue,
    mall_max_discount:
      rewardData.mall_max_discount ?? rewardData.mallMaxDiscount ?? null,
    mall_min_spend:
      rewardData.mall_min_spend ?? rewardData.mallMinSpend ?? null,
    image_source_type: rewardData.image_source_type,
    stamp_emoji: rewardData.stamp_emoji ?? rewardData.stampEmoji,
    emoji: rewardData.emoji,
    fulfilment: rewardData.fulfilment,
  };

  if (options.status) {
    payload.status = options.status;
  }
  if (options.includeExpiry) {
    payload.expiry_datetime = rewardData.expiry_datetime;
  }

  return payload;
};
