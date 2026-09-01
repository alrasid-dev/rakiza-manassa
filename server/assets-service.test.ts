import { describe, expect, it } from "vitest";
import { canClearProfile } from "./assets-service";

describe("asset custody clearance policy", () => {
  it("allows clearance only when there are no open custodies", () => {
    expect(canClearProfile(0)).toBe(true);
    expect(canClearProfile(1)).toBe(false);
    expect(canClearProfile(3)).toBe(false);
  });

  it("rejects invalid counts rather than accidentally clearing a profile", () => {
    expect(canClearProfile(Number.NaN)).toBe(false);
    expect(canClearProfile(-1)).toBe(false);
  });
});
