import { describe, expect, it } from "vitest";

import { normalizeQuarterTurn } from "./rotation.ts";

describe("normalizeQuarterTurn", () => {
  it("returns each quarter turn unchanged", () => {
    expect(normalizeQuarterTurn(0)).toBe(0);
    expect(normalizeQuarterTurn(90)).toBe(90);
    expect(normalizeQuarterTurn(180)).toBe(180);
    expect(normalizeQuarterTurn(270)).toBe(270);
  });

  it("wraps full circles and negative angles onto a quarter turn", () => {
    expect(normalizeQuarterTurn(360)).toBe(0);
    expect(normalizeQuarterTurn(450)).toBe(90);
    expect(normalizeQuarterTurn(-90)).toBe(270);
    expect(normalizeQuarterTurn(-180)).toBe(180);
  });

  it("rejects non-quarter turns", () => {
    expect(() => normalizeQuarterTurn(45)).toThrow();
  });
});
