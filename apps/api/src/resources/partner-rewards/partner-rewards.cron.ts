import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RewardIssuanceService } from "./services/reward-issuance.service";

/**
 * Scheduled maintenance for the partner rewards lifecycle:
 *  - expire due issuances and notify their issuing partner over the mesh;
 *  - release stale reservations as a backstop (mall sweeps at 30 min).
 */
@Injectable()
export class PartnerRewardsCron {
  private readonly logger = new Logger(PartnerRewardsCron.name);

  constructor(private readonly issuanceService: RewardIssuanceService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handle(): Promise<void> {
    try {
      const expired = await this.issuanceService.expireDue();
      if (expired > 0) {
        this.logger.log(`Marked ${expired} partner issuance(s) as expired`);
      }
    } catch (err) {
      this.logger.error(
        `Issuance expiry sweep failed: ${(err as Error).message}`,
      );
    }

    try {
      const released = await this.issuanceService.releaseStaleReservations();
      if (released > 0) {
        this.logger.log(
          `Released ${released} stale reservation(s) back to ISSUED`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Stale reservation sweep failed: ${(err as Error).message}`,
      );
    }
  }
}
