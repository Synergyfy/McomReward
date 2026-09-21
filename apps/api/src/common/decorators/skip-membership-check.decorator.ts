import { SetMetadata } from "@nestjs/common";

export const SKIP_MEMBERSHIP_CHECK_KEY = "skipMembershipCheck";
export const SKIP_SUBSCRIPTION_CHECK_KEY = SKIP_MEMBERSHIP_CHECK_KEY;

export const SkipMembershipCheck = () =>
  SetMetadata(SKIP_MEMBERSHIP_CHECK_KEY, true);

export const SkipSubscriptionCheck = SkipMembershipCheck;
