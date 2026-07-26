import { describe, expect, it } from "vitest";

import {
  areAdjacent,
  isZeroWidth,
  makeSpan,
  spanLength,
  spansEqual,
  zeroWidthAt,
} from "./span.js";

/** Unwrap a span the test knows is valid, without introducing a throw. */
const span = (start: number, end: number) => {
  const r = makeSpan(start, end);
  expect(r.ok).toBe(true);
  if (!r.ok) return { start: -1, end: -1 };
  return r.value;
};

describe("spans are half-open, 0-based, raw byte offsets", () => {
  it("reports length as end minus start", () => {
    expect(spanLength(span(0, 0))).toBe(0);
    expect(spanLength(span(0, 1))).toBe(1);
    expect(spanLength(span(10, 42))).toBe(32);
  });

  it("accepts offset 0, which is what 0-based means", () => {
    const r = makeSpan(0, 3);
    expect(r.ok).toBe(true);
  });

  it("treats a span with equal start and end as zero-width", () => {
    expect(isZeroWidth(span(7, 7))).toBe(true);
    expect(isZeroWidth(span(7, 8))).toBe(false);
  });

  it("builds a zero-width span at an offset", () => {
    const r = zeroWidthAt(12);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.start).toBe(12);
      expect(r.value.end).toBe(12);
    }
  });

  it("carries no line, column, or file field", () => {
    // Structural, not stylistic: a well-meaning future addition of `line` fails
    // here rather than silently allowing a stale position onto a span.
    expect(Object.keys(span(3, 9)).sort()).toEqual(["end", "start"]);
  });

  it("freezes the span, so a consumer cannot mutate a shared value", () => {
    expect(Object.isFrozen(span(3, 9))).toBe(true);
  });
});

describe("makeSpan is total and never throws", () => {
  it("rejects an end before its start", () => {
    const r = makeSpan(9, 3);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("end-before-start");
  });

  it("rejects a negative offset", () => {
    for (const [s, e] of [[-1, 3], [0, -1], [-5, -2]] as const) {
      const r = makeSpan(s, e);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe("offset-negative");
    }
  });

  it("rejects a non-integer offset", () => {
    for (const [s, e] of [[0.5, 3], [0, 3.5], [Number.NaN, 0], [0, Number.POSITIVE_INFINITY]] as const) {
      const r = makeSpan(s, e);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe("offset-not-an-integer");
    }
  });

  it("never throws for any numeric input, however hostile", () => {
    const hostile = [
      0, 1, -1, 0.5, -0.5, Number.NaN, Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER,
      Number.EPSILON, -0,
    ];
    for (const a of hostile) {
      for (const b of hostile) {
        expect(() => makeSpan(a, b)).not.toThrow();
      }
    }
  });

  it("reports the first problem it finds, deterministically", () => {
    // start is validated before end, so a doubly-invalid pair reports start's
    // problem every time rather than whichever check happened to run first.
    const r = makeSpan(-1, -2);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("offset-negative");
  });
});

describe("span comparison", () => {
  it("compares structurally, not by identity", () => {
    expect(spansEqual(span(2, 5), span(2, 5))).toBe(true);
    expect(spansEqual(span(2, 5), span(2, 6))).toBe(false);
  });

  it("detects adjacency, which is what makes a byte-exact reprint possible", () => {
    expect(areAdjacent(span(0, 4), span(4, 9))).toBe(true);
    expect(areAdjacent(span(0, 4), span(5, 9))).toBe(false);
    expect(areAdjacent(span(0, 0), span(0, 0))).toBe(true);
  });
});
