import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { ServiceAuthGuard } from "../../service-mesh/guards/service-auth.guard";
import { ServiceScopesGuard } from "../../service-mesh/guards/service-scopes.guard";
import { RequireServiceScopes } from "../../service-mesh/decorators/require-service-scopes.decorator";
import { SERVICE_SCOPE_REWARDS_ISSUE } from "../../service-mesh/constants";
import { AuthenticatedServiceRequest } from "../../service-mesh/interfaces/authenticated-service-request.interface";
import { RewardFulfilmentService } from "../../reward-fulfilment/reward-fulfilment.service";

/**
 * Secondary provider event channel (Mall → Rewards).
 *
 * The primary consumption callback is `POST /partner/issuances/:id/redeem`.
 * Mall also emits `reward.*` events; accepting them makes reconciliation
 * resilient to a missed primary callback.
 */
@ApiTags("Partner Events")
@ApiSecurity("mcom-service-token")
@Controller("partner/events")
@Public()
@UseGuards(ServiceAuthGuard, ServiceScopesGuard)
export class PartnerEventsController {
  constructor(private readonly fulfilment: RewardFulfilmentService) {}

  @Post()
  @RequireServiceScopes(SERVICE_SCOPE_REWARDS_ISSUE)
  @ApiOperation({ summary: "Receive a peer lifecycle event (idempotent)" })
  async receive(
    @Body() body: any,
    @Req() req: AuthenticatedServiceRequest,
  ) {
    const event = body?.event ?? "partner.event";
    const data = body?.data ?? body ?? {};
    await this.fulfilment.handleProviderEvent(event, data);
    return {
      received: true,
      caller: req.serviceCaller?.callerAppId ?? null,
    };
  }
}
