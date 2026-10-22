import { BadRequestException } from "@nestjs/common";

/**
 * MCOM Pay stores money in minor units (pence) as exact integer strings.
 * Never send a float to MCOM — always convert through this helper.
 *
 * See MCOM Payments Partner Integration Guide, Part B2.
 */
export function toMinorUnits(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(value)) {
    throw new BadRequestException(`Invalid monetary amount: ${amount}`);
  }
  if (value < 0) {
    throw new BadRequestException("Monetary amount cannot be negative");
  }

  // + Number.EPSILON avoids classic float artefacts such as 1.005 * 100.
  const minor = Math.round((value + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(minor)) {
    throw new BadRequestException(`Monetary amount is too large: ${amount}`);
  }

  return String(minor);
}

export function fromMinorUnits(minor: string | number): number {
  const value = typeof minor === "string" ? Number(minor) : minor;

  if (!Number.isSafeInteger(value)) {
    throw new BadRequestException(`Invalid minor-unit amount: ${minor}`);
  }

  return value / 100;
}

export function formatMinorUnits(minor: string | number): string {
  return fromMinorUnits(minor).toFixed(2);
}
