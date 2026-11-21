import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import {
  CaptureWalletHoldDto,
  PlaceWalletHoldDto,
  ReleaseWalletHoldDto,
} from "./dto/wallet-hold.dto";

@ApiTags("Wallet")
@Controller("wallet")
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private businessId(req: any): string {
    // businessId claim (new tokens) with fallback for pre-claim tokens.
    return req.user?.businessId ?? req.user?.id;
  }

  @Get("my-balance")
  @Roles(Role.Business)
  async getMyBalance(@Request() req) {
    return this.walletService.getWallet(this.businessId(req));
  }

  @Get("my-transactions")
  @Roles(Role.Business)
  @ApiOperation({
    summary: "Transactions this platform originated for the user's MCOM wallet",
  })
  async getMyTransactions(@Request() req) {
    return this.walletService.getCentralTransactions(this.businessId(req));
  }

  @Post("holds")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Reserve funds in the user's MCOM wallet" })
  async placeHold(@Request() req, @Body() dto: PlaceWalletHoldDto) {
    return this.walletService.placeHold(this.businessId(req), dto.amount, {
      description: dto.description,
      reference: dto.reference,
      metadata: dto.metadata,
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post("holds/:holdId/capture")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Capture a wallet hold as a real debit" })
  async captureHold(
    @Request() req,
    @Param("holdId") holdId: string,
    @Body() dto: CaptureWalletHoldDto,
  ) {
    return this.walletService.captureHold(this.businessId(req), holdId, {
      idempotencyKey: dto.idempotencyKey,
    });
  }

  @Post("holds/:holdId/release")
  @Roles(Role.Business)
  @ApiOperation({ summary: "Release a wallet hold back to available balance" })
  async releaseHold(
    @Request() req,
    @Param("holdId") holdId: string,
    @Body() dto: ReleaseWalletHoldDto,
  ) {
    return this.walletService.releaseHold(this.businessId(req), holdId, {
      idempotencyKey: dto.idempotencyKey,
    });
  }

  // Admin endpoint to manually top up (for testing or manual ops)
  @Post("admin/allocate/:businessId")
  @Roles(Role.Admin)
  async allocateFunds(
    @Param("businessId") businessId: string,
    @Body("amount") amount: number,
  ) {
    return this.walletService.addTierAllocation(businessId, amount);
  }
}
