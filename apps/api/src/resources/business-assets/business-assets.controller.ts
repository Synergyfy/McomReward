import { Controller, Get, Query, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { BusinessAssetsService } from "./business-assets.service";

@ApiTags("Business Assets")
@ApiBearerAuth()
@Roles(Role.Business, Role.Staff, Role.Admin)
@Controller("business")
export class BusinessAssetsController {
  constructor(private readonly businessAssetsService: BusinessAssetsService) {}

  private tenantId(req: any, businessId?: string): string {
    // TenantOwnershipGuard guarantees user.businessId for Business/Staff.
    // Explicit businessId (admin impersonation / query) wins when present.
    return businessId ?? req.user?.businessId ?? req.user?.id;
  }

  @Get("storefront-media")
  @ApiOperation({ summary: "Get storefront media for the current business" })
  getStorefrontMedia(@Req() req, @Query("businessId") businessId?: string) {
    return this.businessAssetsService.getStorefrontMedia(this.tenantId(req, businessId));
  }

  @Get("assets/overview")
  @ApiOperation({ summary: "Get asset overview aggregates for the dashboard" })
  getAssetOverview(@Req() req, @Query("businessId") businessId?: string) {
    return this.businessAssetsService.getAssetOverview(this.tenantId(req, businessId));
  }

  @Get("nfc-cards")
  @ApiOperation({ summary: "List NFC cards for the current business" })
  getNfcCards(@Req() req, @Query("businessId") businessId?: string) {
    return this.businessAssetsService.getNfcCards(this.tenantId(req, businessId));
  }

  @Get("marketing-materials")
  @ApiOperation({ summary: "List marketing materials for the current business" })
  getMarketingMaterials(@Req() req, @Query("businessId") businessId?: string) {
    return this.businessAssetsService.getMarketingMaterials(
      this.tenantId(req, businessId),
    );
  }

  @Get("partner-network")
  @ApiOperation({ summary: "Get partner network for the current business" })
  getPartnerNetwork(@Req() req, @Query("businessId") businessId?: string) {
    return this.businessAssetsService.getPartnerNetwork(
      this.tenantId(req, businessId),
    );
  }
}
