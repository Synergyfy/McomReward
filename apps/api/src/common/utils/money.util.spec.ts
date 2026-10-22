import { BadRequestException } from "@nestjs/common";
import { formatMinorUnits, fromMinorUnits, toMinorUnits } from "./money.util";

describe("money.util", () => {
  describe("toMinorUnits", () => {
    it("converts whole pounds to pence", () => {
      expect(toMinorUnits(50)).toBe("5000");
      expect(toMinorUnits("102.70")).toBe("10270");
      expect(toMinorUnits(0)).toBe("0");
    });

    it("rounds to the nearest penny", () => {
      expect(toMinorUnits(1.005)).toBe("101");
      expect(toMinorUnits(0.1 + 0.2)).toBe("30");
      expect(toMinorUnits(19.999)).toBe("2000");
    });

    it("rejects invalid and negative amounts", () => {
      expect(() => toMinorUnits("not-a-number")).toThrow(BadRequestException);
      expect(() => toMinorUnits(Number.NaN)).toThrow(BadRequestException);
      expect(() => toMinorUnits(-1)).toThrow(BadRequestException);
    });
  });

  describe("fromMinorUnits / formatMinorUnits", () => {
    it("converts pence back to pounds", () => {
      expect(fromMinorUnits("10270")).toBe(102.7);
      expect(formatMinorUnits("10270")).toBe("102.70");
      expect(formatMinorUnits(1)).toBe("0.01");
    });

    it("rejects non-integer minor amounts", () => {
      expect(() => fromMinorUnits("10.5")).toThrow(BadRequestException);
    });
  });
});
