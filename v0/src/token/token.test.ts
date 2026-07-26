import { describe, expect, it } from "vitest";

import { makeSpan } from "./span.js";
import {
  TOKEN_KEYS,
  eofToken,
  makeToken,
  renderToken,
  tokensEqual,
  utf8Length,
} from "./token.js";
import type { Token } from "./token.js";

const span = (start: number, end: number) => {
  const r = makeSpan(start, end);
  expect(r.ok).toBe(true);
  if (!r.ok) return { start: -1, end: -1 };
  return r.value;
};

const token = (kind: Parameters<typeof makeToken>[0], text: string, start: number): Token => {
  const r = makeToken(kind, text, span(start, start + utf8Length(text)));
  expect(r.ok).toBe(true);
  if (!r.ok) return { kind: "eof", text: "", span: span(0, 0) };
  return r.value;
};

describe("a token carries kind, text, and span, and nothing else", () => {
  it("has exactly those three own keys", () => {
    expect(Object.keys(token("kw.deny", "deny", 0)).sort()).toEqual([...TOKEN_KEYS].sort());
  });

  it("declares that key set as data, so the assertion cannot drift from the type", () => {
    expect([...TOKEN_KEYS].sort()).toEqual(["kind", "span", "text"]);
  });

  it("carries no line, column, or file", () => {
    const keys = Object.keys(token("kw.deny", "deny", 0));
    for (const forbidden of ["line", "column", "col", "file", "path", "offset"]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it("is frozen", () => {
    expect(Object.isFrozen(token("kw.deny", "deny", 0))).toBe(true);
  });

  it("compares structurally", () => {
    expect(tokensEqual(token("kw.deny", "deny", 0), token("kw.deny", "deny", 0))).toBe(true);
    expect(tokensEqual(token("kw.deny", "deny", 0), token("kw.deny", "deny", 1))).toBe(false);
    expect(tokensEqual(token("kw.deny", "deny", 0), token("kw.allow", "deny", 0))).toBe(false);
  });

  it("renders deterministically with a fixed field order", () => {
    expect(renderToken(token("lit.string", '"eu"', 4))).toBe('4..8  lit.string  "\\"eu\\""');
    expect(renderToken(token("kw.deny", "deny", 0))).toBe('0..4  kw.deny  "deny"');
  });
});

describe("makeToken is total and enforces the text-span agreement", () => {
  it("accepts text whose UTF-8 length equals the span length", () => {
    const r = makeToken("ident", "region", span(10, 16));
    expect(r.ok).toBe(true);
  });

  it("rejects text shorter than its span", () => {
    const r = makeToken("ident", "region", span(10, 20));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("text-length-does-not-match-span");
  });

  it("rejects text longer than its span", () => {
    const r = makeToken("ident", "region", span(10, 12));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("text-length-does-not-match-span");
  });

  it("measures multi-byte text in bytes, not UTF-16 code units", () => {
    // A string literal may contain any UTF-8; identifiers may not. Both are
    // spanned in bytes, which is the unit AEG-1011 and AEG-1012 count.
    expect(utf8Length("é")).toBe(2);
    expect(utf8Length("€")).toBe(3);
    expect(utf8Length("𝄞")).toBe(4);
    expect(makeToken("lit.string", '"€"', span(0, 5)).ok).toBe(true);
    expect(makeToken("lit.string", '"€"', span(0, 3)).ok).toBe(false);
  });

  it("never throws for adversarial text", () => {
    const hostile = [
      "",
      "\u0000",
      "\uD800", // lone high surrogate
      "\uDFFF", // lone low surrogate
      "\uFEFF", // byte order mark
      "\u202E", // right-to-left override, which is AEG-1002 at scan time
      "a".repeat(4096),
      "𝄞".repeat(64),
      "\r\n",
      "\t",
    ];
    for (const text of hostile) {
      expect(() => makeToken("lit.string", text, span(0, utf8Length(text)))).not.toThrow();
      expect(makeToken("lit.string", text, span(0, utf8Length(text))).ok).toBe(true);
    }
  });
});

describe("eofToken", () => {
  it("is zero-width at the end offset", () => {
    const r = eofToken(1234);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.kind).toBe("eof");
      expect(r.value.text).toBe("");
      expect(r.value.span.start).toBe(1234);
      expect(r.value.span.end).toBe(1234);
    }
  });

  it("is span [0, 0) for an empty file", () => {
    const r = eofToken(0);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.span).toEqual({ start: 0, end: 0 });
  });

  it("fails without throwing on an impossible offset", () => {
    for (const bad of [-1, 0.5, Number.NaN]) {
      expect(() => eofToken(bad)).not.toThrow();
      expect(eofToken(bad).ok).toBe(false);
    }
  });

  it("propagates the span error rather than inventing one", () => {
    const r = eofToken(-1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("offset-negative");
  });
});
