
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { applyCoupon, findCoupon } from "@/lib/content";
import { tiers as allTiers } from "@/lib/content";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("PayPal client ID or secret is not configured.");
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: Request) {
  const { tier_id, plan_type, coupon_code } = await req.json();

  const tier = allTiers.find((t) => t.id === tier_id);

  if (!tier) {
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  }

  const basePrice =
    plan_type === "annually"
      ? parseFloat(tier.annualPrice)
      : parseFloat(tier.quaterlyPrice);
  const coupon = findCoupon(coupon_code);
  const { final: price } = applyCoupon(basePrice, coupon);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "GBP",
          value: price.toFixed(2),
        },
        description: `Tier: ${tier.name}, Plan: ${plan_type}`,
      },
    ],
  });

  try {
    const order = await client.execute(request);
    return NextResponse.json({ id: order.result.id });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
