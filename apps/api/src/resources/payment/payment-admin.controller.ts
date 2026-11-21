import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/role.enum";
import { PaymentCheckoutService } from "./payment-checkout.service";
import { PaymentCheckoutStatus } from "./entities/payment-checkout.entity";
import {
  McomChargeResponse,
  McomPaymentsService,
} from "./mcom-payments.service";
import { RefundPaymentDto } from "./dto/refund-payment.dto";
import { minorUnitsEqual } from "../../common/utils/money.util";

interface ListChargesQuery {
  status?: string;
  reference?: string;
  mcomUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
  limit?: string;
}

/**
 * Admin views over the MCOM Pay ledger (guide Parts B4 and G6). Refunds always
 * go through `/charges/:id/refund` so MCOM posts the reversing ledger entries;
 * the local checkout is only updated after MCOM confirms the refund.
 */
@ApiTags("Admin Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/payments")
export class PaymentAdminController {
  private readonly logger = new Logger(PaymentAdminController.name);

  constructor(
    private readonly mcomPayments: McomPaymentsService,
    private readonly checkoutService: PaymentCheckoutService,
  ) {}

  @Get("balance")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "This app's MCOM Pay payable balance (Admin only)" })
  async getBalance() {
    try {
      return await this.mcomPayments.getBalance();
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }
  }

  @Get("charges")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "List MCOM Pay charges for this app (Admin only)" })
  async listCharges(@Query() query: ListChargesQuery) {
    try {
      return await this.mcomPayments.listCharges({
        status: query.status,
        reference: query.reference,
        mcomUserId: query.mcomUserId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        page: query.page,
        limit: query.limit,
      });
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }
  }

  @Get("charges/:chargeId")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Fetch one MCOM Pay charge (Admin only)" })
  async getCharge(@Param("chargeId") chargeId: string) {
    try {
      return await this.mcomPayments.getCharge(chargeId);
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }
  }

  @Get("charges/:chargeId/splits")
  @Roles(Role.Admin)
  @ApiOperation({
    summary: "Payee splits and settlement status for a charge (Admin only)",
  })
  async getSplits(@Param("chargeId") chargeId: string) {
    try {
      return await this.mcomPayments.getSplits(chargeId);
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }
  }

  @Post("checkouts/:checkoutId/refund")
  @Roles(Role.Admin)
  @ApiOperation({
    summary: "Refund a local checkout's MCOM Pay charge (Admin only)",
  })
  async refundCheckout(
    @Param("checkoutId") checkoutId: string,
    @Body() dto: RefundPaymentDto,
  ) {
    const checkout = await this.checkoutService.findById(checkoutId);
    if (!checkout) throw new NotFoundException("Checkout not found");
    if (!checkout.chargeId) {
      throw new BadRequestException(
        "This checkout has no MCOM Pay charge to refund",
      );
    }
    if (checkout.status !== PaymentCheckoutStatus.PAID) {
      throw new BadRequestException(
        `Only paid checkouts can be refunded (current status: ${checkout.status})`,
      );
    }
    if (dto.amountMinor) {
      this.assertRefundable(checkout.amountMinor, dto.amountMinor);
    }

    const response = await this.refund(chargeIdOrThrow(checkout), dto);

    const isFullRefund =
      !dto.amountMinor ||
      BigInt(dto.amountMinor) === BigInt(checkout.amountMinor);

    if (isFullRefund) {
      await this.checkoutService.markRefunded(checkout, response.charge);
    }

    this.logger.log(
      `Refunded checkout ${checkout.id} (charge ${checkout.chargeId}, amount ${
        dto.amountMinor || "full"
      })`,
    );

    return {
      success: true,
      checkoutId: checkout.id,
      chargeId: checkout.chargeId,
      fullRefund: isFullRefund,
      refundedMinor: dto.amountMinor || checkout.amountMinor,
      status: response.charge.status,
      charge: response.charge,
    };
  }

  @Post("charges/:chargeId/refund")
  @Roles(Role.Admin)
  @ApiOperation({ summary: "Refund an MCOM Pay charge directly (Admin only)" })
  async refundCharge(
    @Param("chargeId") chargeId: string,
    @Body() dto: RefundPaymentDto,
  ) {
    const localCheckout =
      await this.checkoutService.findByChargeId(chargeId);

    if (dto.amountMinor && localCheckout) {
      this.assertRefundable(localCheckout.amountMinor, dto.amountMinor);
    }

    const response = await this.refund(chargeId, dto);

    // Prefer MCOM's own refunded total: it tells us whether the charge is now
    // fully refunded even when the caller omitted the amount.
    const isFullRefund =
      minorUnitsEqual(
        response.charge.refundedMinor,
        response.charge.amountMinor,
      ) ||
      (!dto.amountMinor &&
        (!localCheckout ||
          minorUnitsEqual(
            localCheckout.amountMinor,
            response.charge.amountMinor,
          )));

    if (localCheckout && isFullRefund) {
      await this.checkoutService.markRefunded(localCheckout, response.charge);
    }

    return {
      success: true,
      chargeId,
      fullRefund: isFullRefund,
      status: response.charge.status,
      charge: response.charge,
    };
  }

  private async refund(
    chargeId: string,
    dto: RefundPaymentDto,
  ): Promise<McomChargeResponse> {
    try {
      return await this.mcomPayments.refundCharge(
        chargeId,
        dto.amountMinor,
        dto.reason,
      );
    } catch (error) {
      this.mcomPayments.toHttpException(error);
    }
  }

  private assertRefundable(
    chargeAmountMinor: string,
    refundAmountMinor: string,
  ): void {
    if (BigInt(refundAmountMinor) > BigInt(chargeAmountMinor)) {
      throw new BadRequestException(
        "Refund amount cannot exceed the original charge amount",
      );
    }
  }
}

function chargeIdOrThrow(checkout: { chargeId?: string | null }): string {
  if (!checkout.chargeId) {
    throw new BadRequestException(
      "This checkout has no MCOM Pay charge to refund",
    );
  }
  return checkout.chargeId;
}
