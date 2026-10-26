import {
  extractTierFromPlanName,
  formatPlanDisplayName,
  stripTierSuffix,
} from "./plan-display.util";

describe("plan display helpers", () => {
  it("appends the variant tier to the plan family name", () => {
    expect(formatPlanDisplayName("Gold", "PRO")).toBe("Gold Pro");
    expect(formatPlanDisplayName("Gold", "PRO_PLUS")).toBe("Gold Pro+");
    expect(formatPlanDisplayName("Gold", "STANDARD")).toBe("Gold");
    expect(formatPlanDisplayName("Gold", null)).toBe("Gold");
  });

  it("does not duplicate a tier already present in the name", () => {
    expect(formatPlanDisplayName("Gold Pro", "PRO")).toBe("Gold Pro");
    expect(formatPlanDisplayName("Gold Pro+", "PRO_PLUS")).toBe("Gold Pro+");
  });

  it("extracts the tier encoded in a Central plan name", () => {
    expect(extractTierFromPlanName("Gold Pro")).toBe("PRO");
    expect(extractTierFromPlanName("Gold Pro+")).toBe("PRO_PLUS");
    expect(extractTierFromPlanName("Gold Pro Plus")).toBe(null);
    expect(extractTierFromPlanName("Gold Standard")).toBe("STANDARD");
    expect(extractTierFromPlanName("Loyalty Pro")).toBe("PRO");
    expect(extractTierFromPlanName("Gold")).toBe(null);
  });

  it("strips a trailing tier token to find the plan family", () => {
    expect(stripTierSuffix("Gold Pro")).toBe("Gold");
    expect(stripTierSuffix("Gold Pro+")).toBe("Gold");
    expect(stripTierSuffix("Gold Standard")).toBe("Gold");
    expect(stripTierSuffix("Gold")).toBe("Gold");
  });
});
