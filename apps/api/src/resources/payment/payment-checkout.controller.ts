import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PaymentCheckoutService } from "./payment-checkout.service";

/**
 * Resolve a checkout from a provider reference (PayPal order token / Stripe
 * PaymentIntent id). Used by the frontend return pages when the provider only
 * sends its own token back.
 */
@ApiTags("Payment")
@ApiBearerAuth()
@Controller("payment")
export class PaymentCheckoutController {
  constructor(private readonly checkoutService: PaymentCheckoutService) {}

  @Get("checkout/resolve")
  @ApiOperation({
    summary: "Resolve a local checkout from a provider reference",
  })
  async resolve(
    @CurrentUser() user: any,
    @Query("providerRef") providerRef: string,
  ) {
    if (!providerRef) {
      throw new NotFoundException("providerRef is required");
    }

    const checkout = await this.checkoutService.findByProviderRef(providerRef);
    if (!checkout) {
      throw new NotFoundException("Checkout not found");
    }
    if (checkout.businessId && checkout.businessId !== user.id) {
      throw new ForbiddenException("This checkout belongs to another business");
    }

    return {
      checkoutId: checkout.id,
      chargeId: checkout.chargeId,
      purpose: checkout.purpose,
      status: checkout.status,
      amountMinor: checkout.amountMinor,
      currency: checkout.currency,
      method: checkout.method,
      metadata: checkout.metadata,
    };
  }
}
