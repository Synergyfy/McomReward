/** Demo policy: these two packs keep their reward copy managed by admins. */
const ADMIN_MANAGED_REWARD_DETAILS_SECTORS = new Set(["salon", "gym"]);

export function areRewardDetailsAdminManaged(sectorKey: string, isBuiltIn = false): boolean {
  return isBuiltIn && ADMIN_MANAGED_REWARD_DETAILS_SECTORS.has(sectorKey.trim().toLowerCase());
}
