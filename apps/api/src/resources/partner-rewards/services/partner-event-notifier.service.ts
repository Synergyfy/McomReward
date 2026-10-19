import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ServiceMeshService } from "../../service-mesh/services/service-mesh.service";
import {
  DEFAULT_MALL_CLIENT_ID,
  SERVICE_SCOPE_MALL_WRITE,
  SERVICE_SCOPE_REWARDS_ISSUE,
} from "../../service-mesh/constants";

/**
 * Outbound half of the partner lifecycle: pushes reward events to the calling
 * peer (e.g. FundOrDonate, MCOM Mall) as a DIRECT backend-to-backend call
 * authenticated with a short-lived RS256 service token.
 *
 * There is deliberately NO shared webhook secret / HMAC here — per the MCOM
 * Ecosystem M2M contract, app-to-app traffic never uses webhook keys. The peer
 * verifies the token offline via Central's JWKS, exactly like our own
 * {@link ServiceAuthGuard}.
 *
 * The requested scope is resolved PER TARGET: mall serves its events under
 * `mall:write`, whereas other partners (e.g. FundOrDonate) accept
 * `rewards:issue`. A single global scope would send mall's scope to every peer.
 */
@Injectable()
export class PartnerEventNotifier {
  private readonly logger = new Logger(PartnerEventNotifier.name);

  constructor(
    private readonly serviceMesh: ServiceMeshService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Fire-and-forget lifecycle notification. Never throws: a peer outage must
   * not fail the local reward transaction. Returns whether delivery succeeded.
   */
  async notify(
    targetClientId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    const path =
      this.configService.get<string>("MCOM_PARTNER_EVENT_PATH") ||
      "/api/v1/partner/events";
    const scope = this.resolveScope(targetClientId);

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      source: this.serviceMesh.getClientId(),
      data,
    };

    try {
      await this.serviceMesh.callPeerByClientId(
        targetClientId,
        path,
        { method: "POST", data: payload, timeout: 10_000 },
        scope,
      );
      return true;
    } catch (err) {
      this.logger.warn(
        `Partner event "${event}" → "${targetClientId}" failed: ${(err as Error).message}`,
      );
      return false;
    }
  }

  /** Per-target event scope: mall serves events under `mall:write`. */
  private resolveScope(targetClientId: string): string {
    const mallClientId =
      this.configService.get<string>("MCOM_MALL_CLIENT_ID") ||
      DEFAULT_MALL_CLIENT_ID;

    if (targetClientId === mallClientId) {
      return (
        this.configService.get<string>("MCOM_MALL_EVENT_SCOPE") ||
        SERVICE_SCOPE_MALL_WRITE
      );
    }

    return (
      this.configService.get<string>("MCOM_PARTNER_EVENT_SCOPE") ||
      SERVICE_SCOPE_REWARDS_ISSUE
    );
  }
}
