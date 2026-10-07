import { Role } from "../role.enum";

export interface User {
  id: string;
  role: Role;
  email?: string;
  isEmailVerified?: boolean;
  hasActiveSubscription?: boolean;
  isSuperBusiness?: boolean;
  /**
   * Tenant owner id for scoping.
   * Business -> own id, Staff -> parent business id.
   * Optional for backwards compat with tokens issued before this field existed.
   */
  businessId?: string;
}
