import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { FinancialAdminService } from "./financial-admin.service";
import { EscrowStatus } from "./entities/escrow.entity";
import { PayoutStatus } from "./entities/payout-request.entity";
import {
  CreateEscrowDto,
  CreatePayoutRequestDto,
  FilterEscrowDto,
  FilterPayoutRequestDto,
} from "./dto/financial.dto";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";

@ApiTags("Admin Financials")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/financials")
export class AdminFinancialController {
  constructor(private readonly financialAdminService: FinancialAdminService) {}

  @Get("analytics")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Get financial analytics (Admin only)" })
  getAnalytics() {
    return this.financialAdminService.getAnalytics();
  }

  @Get("escrows")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List escrows (Admin only)" })
  findEscrows(@Query() filterDto: FilterEscrowDto) {
    return this.financialAdminService.findEscrows(filterDto);
  }

  @Post("escrows")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create an escrow (Admin only)" })
  createEscrow(@Body() createDto: CreateEscrowDto) {
    return this.financialAdminService.createEscrow(createDto);
  }

  @Patch("escrows/:id/release")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Release an escrow (Admin only)" })
  releaseEscrow(@Param("id", ParseUUIDPipe) id: string) {
    return this.financialAdminService.updateEscrowStatus(id, EscrowStatus.RELEASED);
  }

  @Patch("escrows/:id/refund")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Refund an escrow (Admin only)" })
  refundEscrow(@Param("id", ParseUUIDPipe) id: string) {
    return this.financialAdminService.updateEscrowStatus(id, EscrowStatus.REFUNDED);
  }

  @Get("payout-requests")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List payout requests (Admin only)" })
  findPayoutRequests(@Query() filterDto: FilterPayoutRequestDto) {
    return this.financialAdminService.findPayoutRequests(filterDto);
  }

  @Post("payout-requests")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Create a payout request (Admin only)" })
  createPayoutRequest(@Body() createDto: CreatePayoutRequestDto) {
    return this.financialAdminService.createPayoutRequest(createDto);
  }

  @Patch("payout-requests/:id/approve")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Approve a payout request (Admin only)" })
  approvePayout(@Param("id", ParseUUIDPipe) id: string) {
    return this.financialAdminService.updatePayoutStatus(id, PayoutStatus.APPROVED);
  }

  @Patch("payout-requests/:id/reject")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Reject a payout request (Admin only)" })
  rejectPayout(@Param("id", ParseUUIDPipe) id: string) {
    return this.financialAdminService.updatePayoutStatus(id, PayoutStatus.REJECTED);
  }
}