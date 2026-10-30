import type { BusinessReward } from '@/services/business-reward/types';

export interface RewardLookups {
  templateNames?: Record<string, string>;
  productNames?: Record<string, string>;
  serviceNames?: Record<string, string>;
}

export interface RewardCardDetails {
  typeLabel: string;
  typeClass: string;
  templateLabel?: string;
  accessLabel?: string;
  accessTitle?: string;
  valueLabel?: string;
  valueTitle?: string;
  isMall: boolean;
}

const read = (reward: BusinessReward, camel: string, snake: string) =>
  (reward as any)?.[camel] ?? (reward as any)?.[snake];

const buildNameList = (
  productIds: string[],
  serviceIds: string[],
  lookups: RewardLookups,
) => {
  const names = [
    ...productIds.map((id) => lookups.productNames?.[id]),
    ...serviceIds.map((id) => lookups.serviceNames?.[id]),
  ].filter((name): name is string => Boolean(name));

  const count = productIds.length + serviceIds.length;
  if (count === 0) return null;

  if (names.length === 0) {
    return {
      short: `${count} item${count === 1 ? '' : 's'} selected`,
      full: `${productIds.length} product${
        productIds.length === 1 ? '' : 's'
      }, ${serviceIds.length} service${serviceIds.length === 1 ? '' : 's'}`,
    };
  }

  const short =
    names.slice(0, 2).join(', ') + (count > 2 ? ` +${count - 2}` : '');
  return { short, full: names.join(', ') };
};

/**
 * Build the information shown on a reward card: what kind of reward it is, the
 * Mall template it fulfils with, the product/service access it grants and its
 * value/discount. Kept as a plain helper so the card stays presentational.
 */
export const getRewardCardDetails = (
  reward: BusinessReward,
  lookups: RewardLookups = {},
): RewardCardDetails => {
  const rewardType = (read(reward, 'rewardType', 'reward_type') ??
    'Voucher') as string;
  const mallRewardType = read(reward, 'mallRewardType', 'mall_reward_type') as
    | 'VOUCHER'
    | 'GIFT_CARD'
    | 'COUPON'
    | undefined;
  const kind = read(reward, 'fulfilmentKind', 'fulfilment_kind') as
    | string
    | undefined;
  const fulfilmentProvider = read(
    reward,
    'fulfilmentProvider',
    'fulfilment_provider',
  ) as string | undefined;
  const config =
    (read(reward, 'fulfilmentConfig', 'fulfilment_config') as any) ?? {};
  const templateId = read(
    reward,
    'fulfilmentTemplateId',
    'fulfilment_template_id',
  ) as string | undefined;

  const mallRewardValue = Number(
    read(reward, 'mallRewardValue', 'mall_reward_value') ?? 0,
  );
  const mallDiscountType = read(
    reward,
    'mallDiscountType',
    'mall_discount_type',
  ) as 'percentage' | 'fixed' | undefined;
  const mallDiscountValue = Number(
    read(reward, 'mallDiscountValue', 'mall_discount_value') ?? 0,
  );

  // Rewards created by the Unified wizard default to
  // `{ provider: 'NONE', kind: 'MALL_DISCOUNT' }`, so never treat a NONE
  // provider as a mall reward.
  const isProviderNone = fulfilmentProvider === 'NONE';
  const hasDiscountConfig =
    Boolean(mallDiscountType) && mallDiscountValue > 0;

  const isMallDiscount =
    rewardType === 'MallDiscount' ||
    (!isProviderNone &&
      (kind === 'MALL_DISCOUNT' || hasDiscountConfig));
  const isGiftCard =
    mallRewardType === 'GIFT_CARD' ||
    kind === 'MALL_GIFT_CARD' ||
    rewardType === 'gift card';
  const isCoupon =
    mallRewardType === 'COUPON' ||
    kind === 'MALL_COUPON' ||
    rewardType === 'coupon';
  const isVoucher =
    mallRewardType === 'VOUCHER' ||
    kind === 'MALL_VOUCHER' ||
    rewardType === 'Voucher';
  const isMallInstrument = isGiftCard || isCoupon || isVoucher;

  let typeLabel = rewardType;
  let typeClass =
    'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300';
  if (isMallDiscount) {
    typeLabel = 'Mall Discount';
    typeClass =
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/50 dark:bg-orange-900/20 dark:text-orange-300';
  } else if (isGiftCard) {
    typeLabel = 'Gift Card';
    typeClass =
      'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-300';
  } else if (isVoucher) {
    typeLabel = 'Voucher';
    typeClass =
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300';
  } else if (isCoupon) {
    typeLabel = 'Coupon';
    typeClass =
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300';
  } else if (rewardType === 'point offer') {
    typeLabel = 'Point Offer';
  } else if (rewardType === 'physical product') {
    typeLabel = 'Physical Product';
  }

  const isMallIntegrated =
    !isProviderNone &&
    (read(reward, 'isMallIntegrated', 'is_mall_integrated') === true ||
      mallRewardValue > 0 ||
      Boolean(kind?.startsWith('MALL_')));

  // Template
  const isMall =
    isMallDiscount || (isMallInstrument && isMallIntegrated);

  let templateLabel: string | undefined;
  if (isMall && isMallInstrument) {
    templateLabel = templateId
      ? lookups.templateNames?.[templateId] || 'Mall template selected'
      : 'Default Mall template';
  }

  // Access scope
  const scope = config?.scope ?? null;
  const mallTargetScope = read(
    reward,
    'mallTargetScope',
    'mall_target_scope',
  ) as 'SPECIFIC' | 'ALL' | undefined;
  const scopeMode =
    scope?.mode ?? (mallTargetScope === 'SPECIFIC' ? 'ITEMS' : 'ALL');
  const productIds: string[] =
    (scope?.productIds?.length ? scope.productIds : undefined) ??
    (read(reward, 'mallTargetProductIds', 'mall_target_product_ids') as
      | string[]
      | undefined) ??
    [];
  const serviceIds: string[] =
    (scope?.serviceIds?.length ? scope.serviceIds : undefined) ??
    (read(reward, 'mallTargetServiceIds', 'mall_target_service_ids') as
      | string[]
      | undefined) ??
    [];

  const isAllScope =
    scopeMode === 'ALL' ||
    scopeMode === 'NO_SCOPE' ||
    (scopeMode !== 'ITEMS' && scopeMode !== 'SPECIFIC');

  let accessLabel: string | undefined;
  let accessTitle: string | undefined;
  if (isMallDiscount) {
    if (isAllScope) {
      accessLabel = 'Whole business';
    } else {
      const names = buildNameList(productIds, serviceIds, lookups);
      accessLabel = names?.short ?? 'No products/services selected';
      accessTitle = names?.full;
    }
  } else if (isMallInstrument && isMallIntegrated) {
    if (isAllScope) {
      accessLabel = 'All products & services';
    } else {
      const names = buildNameList(productIds, serviceIds, lookups);
      accessLabel = names?.short ?? 'No products/services selected';
      accessTitle = names?.full;
    }
  }

  // Value / discount
  let valueLabel: string | undefined;
  let valueTitle: string | undefined;
  if (isMallDiscount) {
    const maxDiscount = Number(
      read(reward, 'mallMaxDiscount', 'mall_max_discount') ?? 0,
    );
    const minSpend = Number(
      read(reward, 'mallMinSpend', 'mall_min_spend') ?? 0,
    );

    if (mallDiscountValue > 0) {
      const base =
        mallDiscountType === 'fixed'
          ? `£${mallDiscountValue.toFixed(2)} off`
          : `${mallDiscountValue}% off`;
      const extras = [
        maxDiscount > 0 ? `max £${maxDiscount.toFixed(2)}` : null,
        minSpend > 0 ? `min spend £${minSpend.toFixed(2)}` : null,
      ].filter(Boolean);
      valueLabel = extras.length ? `${base} · ${extras.join(' · ')}` : base;
      valueTitle = valueLabel;
    }
  } else if (isMallInstrument && mallRewardValue > 0) {
    valueLabel = `£${mallRewardValue.toFixed(2)}`;
    valueTitle = valueLabel;
  }

  return {
    typeLabel,
    typeClass,
    templateLabel,
    accessLabel,
    accessTitle,
    valueLabel,
    valueTitle,
    isMall,
  };
};
