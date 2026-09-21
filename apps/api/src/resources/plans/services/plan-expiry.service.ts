import { Injectable } from "@nestjs/common";
import { PlanTierLevelEnum } from "../entities/plan-tier-level.entity";

@Injectable()
export class PlanExpiryService {
  /**
   * Adds specified number of calendar days in strict UTC
   */
  addDays(start: Date, days: number): Date {
    const result = new Date(start);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  /**
   * Adds exactly 1 calendar year with leap-day clamping (e.g. Feb 29 -> Feb 28 on non-leap years)
   */
  addCalendarYear(start: Date): Date {
    const result = new Date(start);
    const targetYear = result.getUTCFullYear() + 1;
    const month = result.getUTCMonth();
    const day = result.getUTCDate();

    // Clamp to last day of month when original day doesn't exist in target year (Feb 29 -> Feb 28)
    const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
    result.setUTCFullYear(targetYear, month, Math.min(day, lastDay));
    return result;
  }

  standardExpiry(start: Date = new Date()): Date {
    return this.addDays(start, 90);
  }

  proExpiry(start: Date = new Date()): Date {
    return this.addDays(start, 180);
  }

  proPlusExpiry(start: Date = new Date()): Date {
    return this.addCalendarYear(start);
  }

  calculateExpiryForTierLevel(
    tierLevelName: string | PlanTierLevelEnum,
    start: Date = new Date(),
  ): Date {
    switch (tierLevelName?.toUpperCase()) {
      case PlanTierLevelEnum.PRO_PLUS:
      case "PRO_PLUS":
      case "PRO+":
      case "ANNUAL":
      case "YEARLY":
        return this.proPlusExpiry(start);

      case PlanTierLevelEnum.PRO:
      case "PRO":
      case "QUARTERLY":
        return this.proExpiry(start);

      case PlanTierLevelEnum.STANDARD:
      case "STANDARD":
      case "BASIC":
      case "MONTHLY":
      default:
        return this.standardExpiry(start);
    }
  }
}
