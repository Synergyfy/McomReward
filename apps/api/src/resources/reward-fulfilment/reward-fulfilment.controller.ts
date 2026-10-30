import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Role } from "../../common/role.enum";
import { SkipMembershipCheck } from "../../common/decorators/skip-membership-check.decorator";
import { Business } from "../business/entities/business.entity";
import { CentralIntegrationService } from "../central-integration/central-integration.service";
import { MallIntegrationService } from "../mall-integration/mall-integration.service";
import { RewardFulfilmentService } from "./reward-fulfilment.service";
import { ListFulfilmentsQueryDto } from "./dto/reward-fulfilment.dto";

type TemplateKind = "gift-cards" | "vouchers" | "coupons";

/**
 * Fulfilment configuration and operations surface.
 *
 * Admin endpoints read the Central plan catalogue and the Mall-wide catalogue,
 * and reconcile failed fulfilments. Business endpoints are restricted to the
 * caller's own Mall templates.
 */
@ApiTags("Reward Fulfilment")
@ApiBearerAuth()
@Controller("rewards")
@SkipMembershipCheck()
export class RewardFulfilmentController {
  constructor(
    private readonly fulfilment: RewardFulfilmentService,
    private readonly central: CentralIntegrationService,
    private readonly mall: MallIntegrationService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  // ─── Central catalogue ─────────────────────────────────────────────────────

  @Get("admin/central/memberships")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: Central membership catalogue" })
  listCentralMemberships() {
    return this.central.listMemberships();
  }

  @Get("admin/central/memberships/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: one Central membership plan" })
  getCentralMembership(@Param("id") id: string) {
    return this.central.getMembership(id);
  }

  @Get("admin/central/access-plans")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: Central access-plan catalogue" })
  listCentralAccessPlans() {
    return this.central.listAccessPlans();
  }

  @Get("admin/central/access-plans/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: one Central access plan" })
  getCentralAccessPlan(@Param("id") id: string) {
    return this.central.getAccessPlan(id);
  }

  // ─── Mall-wide catalogue ───────────────────────────────────────────────────

  @Get("admin/mall/listings")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: browse all Mall listings" })
  @ApiQuery({ name: "query", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  listMallListings(@Query() query: Record<string, string>) {
    return this.mall.listGlobalListings(query);
  }

  @Get("admin/mall/listings/:id")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: one Mall listing with products/services" })
  getMallListing(@Param("id") id: string) {
    return this.mall.getGlobalListing(id);
  }

  @Get("admin/mall/products")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: browse all Mall products" })
  listMallProducts(@Query() query: Record<string, string>) {
    return this.mall.listGlobalProducts(query);
  }

  @Get("admin/mall/services")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: browse all Mall services" })
  listMallServices(@Query() query: Record<string, string>) {
    return this.mall.listGlobalServices(query);
  }

  @Get("admin/mall/templates")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: Mall templates (optionally per business)" })
  listMallTemplates(
    @Query("kind") kind: TemplateKind,
    @Query() query: Record<string, string>,
  ) {
    return this.mall.listTemplates(this.normaliseKind(kind), {
      businessId: query.businessId,
      mcomUserId: query.mcomUserId,
      email: query.email,
      includePlatform: query.includePlatform !== "false",
      includeInactive: query.includeInactive === "true",
    });
  }

  // ─── Business templates ────────────────────────────────────────────────────

  @Get("business/mall/templates")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Business: own Mall templates" })
  async listBusinessMallTemplates(
    @CurrentUser() user: any,
    @Query("kind") kind: TemplateKind,
  ) {
    const business = await this.businessRepository.findOne({
      where: { id: user.id },
    });
    if (!business) {
      return { business: null, templates: [] };
    }
    return this.mall.listTemplates(this.normaliseKind(kind), {
      businessId: undefined,
      mcomUserId: business.mcomUserId,
      email: business.email,
      includePlatform: false,
      includeInactive: false,
    });
  }

  // ─── Reconciliation ────────────────────────────────────────────────────────

  @Get("admin/fulfilments")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: fulfilments needing attention" })
  listFulfilments(@Query() query: ListFulfilmentsQueryDto) {
    return this.fulfilment.listNeedsAttention(query.page, query.limit);
  }

  @Post("admin/fulfilments/:issuanceId/retry")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: retry a failed fulfilment" })
  retryFulfilment(@Param("issuanceId") issuanceId: string) {
    return this.fulfilment.retry(issuanceId);
  }

  @Post("admin/fulfilments/:issuanceId/revoke")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Admin: revoke a fulfilled reward" })
  revokeFulfilment(
    @Param("issuanceId") issuanceId: string,
    @Body() body: { reason?: string },
  ) {
    return this.fulfilment.revoke(issuanceId, body?.reason);
  }

  private normaliseKind(kind: TemplateKind): TemplateKind {
    if (kind === "vouchers" || kind === "coupons") return kind;
    return "gift-cards";
  }
}
