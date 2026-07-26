import { describe, expect, it } from "vitest";

import {
  MAX_SOURCE_BYTES,
  admitSource,
  hexDump,
  validateUtf8,
} from "./admit.js";

/** Build a byte array from hex, so the tests read like the stress corpus. */
const hex = (...values: number[]): Uint8Array => Uint8Array.from(values);
const text = (s: string): Uint8Array => new TextEncoder().encode(s);

/** The code an admission produced, or "ok". */
const codeOf = (source: Uint8Array): string => {
  const r = admitSource(source);
  return r.ok ? "ok" : r.error.code;
};

/** The AEG-1001 offset and defect, as one comparable string. */
const utf8Failure = (source: Uint8Array): string => {
  const r = validateUtf8(source);
  if (r.ok) return "ok";
  if (r.error.code !== "AEG-1001") return r.error.code;
  return `${r.error.offset}:${r.error.defect}`;
};

/**
 * Cases drawn from Markus Kuhn's UTF-8 decoder capability and stress test, which
 * is the canonical corpus for exactly the seven classes docs/02 section 1.1
 * enumerates. Boundary cases here - `ED 9F BF` valid but `ED A0 80` not,
 * `F4 8F BF BF` valid but `F4 90 80 80` not - are ones a hand-written test set
 * does not think to include.
 */
describe("valid UTF-8 is accepted, including the awkward boundaries", () => {
  it("accepts an empty file, which is valid AEGIS", () => {
    expect(codeOf(hex())).toBe("ok");
  });

  it("accepts the first possible sequence of each length (Kuhn 2.1)", () => {
    expect(utf8Failure(hex(0x01))).toBe("ok");             // U+0001
    expect(utf8Failure(hex(0xc2, 0x80))).toBe("ok");       // U+0080
    expect(utf8Failure(hex(0xe0, 0xa0, 0x80))).toBe("ok"); // U+0800
    expect(utf8Failure(hex(0xf0, 0x90, 0x80, 0x80))).toBe("ok"); // U+10000
  });

  it("accepts the last possible sequence of each length (Kuhn 2.2)", () => {
    expect(utf8Failure(hex(0x7f))).toBe("ok");                   // U+007F
    expect(utf8Failure(hex(0xdf, 0xbf))).toBe("ok");             // U+07FF
    expect(utf8Failure(hex(0xef, 0xbf, 0xbf))).toBe("ok");       // U+FFFF
    expect(utf8Failure(hex(0xf4, 0x8f, 0xbf, 0xbf))).toBe("ok"); // U+10FFFF
  });

  it("accepts the sequences either side of the surrogate block (Kuhn 2.3)", () => {
    expect(utf8Failure(hex(0xed, 0x9f, 0xbf))).toBe("ok"); // U+D7FF
    expect(utf8Failure(hex(0xee, 0x80, 0x80))).toBe("ok"); // U+E000
    expect(utf8Failure(hex(0xef, 0xbf, 0xbd))).toBe("ok"); // U+FFFD
  });

  it("accepts noncharacters, which are an encoding question only in appearance", () => {
    expect(utf8Failure(hex(0xef, 0xbf, 0xbe))).toBe("ok"); // U+FFFE
    expect(utf8Failure(hex(0xef, 0xbf, 0xbf))).toBe("ok"); // U+FFFF
  });

  it("accepts ordinary policy source", () => {
    expect(codeOf(text('policy p {\n  rule r { deny true reason "€ é 𝄞" }\n}\n'))).toBe("ok");
  });
});

describe("class 1: a continuation byte in leader position (Kuhn 3.1)", () => {
  it("rejects a lone continuation byte at its exact offset", () => {
    expect(utf8Failure(hex(0x80))).toBe("0:continuation-byte-in-leader-position");
    expect(utf8Failure(hex(0xbf))).toBe("0:continuation-byte-in-leader-position");
  });

  it("reports the offset of the first offender, not the last", () => {
    expect(utf8Failure(hex(0x61, 0x62, 0x80, 0xbf))).toBe("2:continuation-byte-in-leader-position");
  });

  it("rejects all 64 continuation bytes in leader position", () => {
    for (let b = 0x80; b <= 0xbf; b += 1) {
      expect(utf8Failure(hex(b))).toBe("0:continuation-byte-in-leader-position");
    }
  });
});

describe("class 2: truncated sequences (Kuhn 3.3, 3.4)", () => {
  it("rejects a sequence whose last byte is missing", () => {
    expect(utf8Failure(hex(0xc2))).toBe("0:truncated-sequence");
    expect(utf8Failure(hex(0xe0, 0xa0))).toBe("0:truncated-sequence");
    expect(utf8Failure(hex(0xf0, 0x90, 0x80))).toBe("0:truncated-sequence");
  });

  it("rejects truncation at end of file, reporting the leader's offset", () => {
    expect(utf8Failure(hex(0x61, 0xe2, 0x82))).toBe("1:truncated-sequence");
  });

  it("rejects a leader followed by a non-continuation byte (Kuhn 3.2)", () => {
    expect(utf8Failure(hex(0xc2, 0x20))).toBe("0:truncated-sequence");
    expect(utf8Failure(hex(0xe0, 0xa0, 0x20))).toBe("0:truncated-sequence");
  });
});

describe("class 3: overlong encodings (Kuhn 4.1, 4.2, 4.3)", () => {
  it("rejects an overlong solidus in three bytes", () => {
    expect(utf8Failure(hex(0xe0, 0x80, 0xaf))).toBe("0:overlong-encoding");
  });

  it("rejects an overlong solidus in four bytes", () => {
    expect(utf8Failure(hex(0xf0, 0x80, 0x80, 0xaf))).toBe("0:overlong-encoding");
  });

  it("rejects the maximum overlong forms", () => {
    expect(utf8Failure(hex(0xe0, 0x9f, 0xbf))).toBe("0:overlong-encoding");
    expect(utf8Failure(hex(0xf0, 0x8f, 0xbf, 0xbf))).toBe("0:overlong-encoding");
  });

  it("rejects an overlong NUL, which is how a NUL hides from a naive scanner", () => {
    expect(utf8Failure(hex(0xe0, 0x80, 0x80))).toBe("0:overlong-encoding");
    expect(utf8Failure(hex(0xf0, 0x80, 0x80, 0x80))).toBe("0:overlong-encoding");
  });
});

describe("class 4: encoded surrogates (Kuhn 5.1, 5.2)", () => {
  it("rejects every single surrogate boundary", () => {
    const cases: ReadonlyArray<readonly [Uint8Array, string]> = [
      [hex(0xed, 0xa0, 0x80), "U+D800"],
      [hex(0xed, 0xad, 0xbf), "U+DB7F"],
      [hex(0xed, 0xae, 0x80), "U+DB80"],
      [hex(0xed, 0xaf, 0xbf), "U+DBFF"],
      [hex(0xed, 0xb0, 0x80), "U+DC00"],
      [hex(0xed, 0xbe, 0x80), "U+DF80"],
      [hex(0xed, 0xbf, 0xbf), "U+DFFF"],
    ];
    for (const [bytes] of cases) {
      expect(utf8Failure(bytes)).toBe("0:encoded-surrogate");
    }
  });

  it("rejects a paired surrogate at the first of the pair", () => {
    expect(utf8Failure(hex(0xed, 0xa0, 0x80, 0xed, 0xb0, 0x80))).toBe("0:encoded-surrogate");
  });
});

describe("class 5: codepoints above U+10FFFF (Kuhn 2.3)", () => {
  it("rejects the first codepoint past the maximum", () => {
    expect(utf8Failure(hex(0xf4, 0x90, 0x80, 0x80))).toBe("0:codepoint-above-max");
  });

  it("rejects the top of the F4 range", () => {
    expect(utf8Failure(hex(0xf4, 0xbf, 0xbf, 0xbf))).toBe("0:codepoint-above-max");
  });
});

describe("class 6: five- and six-byte sequences (Kuhn 2.1, 3.3)", () => {
  it("rejects a five-byte sequence", () => {
    expect(utf8Failure(hex(0xf8, 0x88, 0x80, 0x80, 0x80))).toBe("0:five-or-six-byte-sequence");
  });

  it("rejects a six-byte sequence", () => {
    expect(utf8Failure(hex(0xfc, 0x84, 0x80, 0x80, 0x80, 0x80))).toBe("0:five-or-six-byte-sequence");
  });

  it("rejects their last-possible forms too (Kuhn 2.2)", () => {
    expect(utf8Failure(hex(0xfb, 0xbf, 0xbf, 0xbf, 0xbf))).toBe("0:five-or-six-byte-sequence");
    expect(utf8Failure(hex(0xfd, 0xbf, 0xbf, 0xbf, 0xbf, 0xbf))).toBe("0:five-or-six-byte-sequence");
  });
});

describe("class 7: leader bytes that can never be valid (Kuhn 3.5, 4.1)", () => {
  it("rejects C0 and C1 as leaders rather than as overlong forms", () => {
    // C0 AF is an overlong solidus in substance, but its code is the
    // leader-byte code: docs/02 section 1.1 makes the classes disjoint.
    expect(utf8Failure(hex(0xc0, 0xaf))).toBe("0:invalid-leader-byte");
    expect(utf8Failure(hex(0xc1, 0xbf))).toBe("0:invalid-leader-byte");
  });

  it("rejects F5 to F7, which could only lead a codepoint past the maximum", () => {
    for (const b of [0xf5, 0xf6, 0xf7]) {
      expect(utf8Failure(hex(b, 0x80, 0x80, 0x80))).toBe("0:invalid-leader-byte");
    }
  });

  it("rejects FE and FF, which lead nothing at all", () => {
    expect(utf8Failure(hex(0xfe))).toBe("0:invalid-leader-byte");
    expect(utf8Failure(hex(0xff))).toBe("0:invalid-leader-byte");
    expect(utf8Failure(hex(0xfe, 0xfe, 0xff, 0xff))).toBe("0:invalid-leader-byte");
  });

  it("covers every byte value: each one is either a valid leader or a named defect", () => {
    const defects = new Set<string>();
    for (let b = 0x00; b <= 0xff; b += 1) {
      const r = validateUtf8(hex(b));
      if (!r.ok && r.error.code === "AEG-1001") defects.add(r.error.defect);
    }
    // A single byte can only fail as a continuation, a truncation, or a bad leader.
    expect([...defects].sort()).toEqual([
      "continuation-byte-in-leader-position",
      "five-or-six-byte-sequence",
      "invalid-leader-byte",
      "truncated-sequence",
    ]);
  });
});

describe("the pre-scan checks run in normative order", () => {
  it("reports size before anything else", () => {
    const tooBig = new Uint8Array(MAX_SOURCE_BYTES + 1);
    tooBig[0] = 0xff; // also invalid UTF-8, and also a NUL-filled buffer
    expect(codeOf(tooBig)).toBe("AEG-1010");
  });

  it("accepts a file of exactly the limit, which is inclusive", () => {
    const exact = new Uint8Array(MAX_SOURCE_BYTES).fill(0x61);
    expect(codeOf(exact)).toBe("ok");
  });

  it("reports invalid UTF-8 before the BOM check", () => {
    // A BOM followed by invalid UTF-8: UTF-8 validity comes first.
    expect(codeOf(hex(0xef, 0xbb, 0xbf, 0xff))).toBe("AEG-1001");
  });

  it("reports invalid UTF-8 before the NUL check", () => {
    expect(codeOf(hex(0xff, 0x00))).toBe("AEG-1001");
  });

  it("reports the BOM before the NUL check", () => {
    expect(codeOf(hex(0xef, 0xbb, 0xbf, 0x00))).toBe("AEG-1008");
  });
});

describe("AEG-1008: a byte order mark at the start of the file", () => {
  it("rejects it rather than stripping it", () => {
    const r = admitSource(hex(0xef, 0xbb, 0xbf, 0x61));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe("AEG-1008");
      if (r.error.code === "AEG-1008") expect(r.error.offset).toBe(0);
    }
  });

  it("leaves the source unchanged when it succeeds, so offsets mean what was written", () => {
    const source = text("policy p");
    const r = admitSource(source);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.source).toBe(source);
  });

  it("accepts U+FEFF at any offset other than zero, which is OPEN not decided", () => {
    expect(codeOf(hex(0x61, 0xef, 0xbb, 0xbf))).toBe("ok");
  });

  it("does not mistake a two-byte prefix of the mark for the mark", () => {
    expect(codeOf(hex(0xef, 0xbb, 0x61))).toBe("AEG-1001");
  });
});

describe("AEG-1009: a NUL byte anywhere", () => {
  it("rejects a NUL at offset 0", () => {
    expect(codeOf(hex(0x00))).toBe("AEG-1009");
  });

  it("reports the offset of the first NUL", () => {
    const r = admitSource(text("policy p\u0000 rule"));
    expect(r.ok).toBe(false);
    if (!r.ok && r.error.code === "AEG-1009") expect(r.error.offset).toBe(8);
  });

  it("rejects a NUL inside what would be a string literal", () => {
    expect(codeOf(text('reason "a\u0000b"'))).toBe("AEG-1009");
  });
});

describe("admission is total", () => {
  it("never throws for any single byte value", () => {
    for (let b = 0x00; b <= 0xff; b += 1) {
      expect(() => admitSource(hex(b))).not.toThrow();
    }
  });

  it("never throws for any two-byte combination of interesting leaders", () => {
    const interesting = [0x00, 0x41, 0x7f, 0x80, 0xbf, 0xc0, 0xc2, 0xdf, 0xe0, 0xed, 0xef, 0xf0, 0xf4, 0xf5, 0xf8, 0xfe, 0xff];
    for (const a of interesting) {
      for (const b of interesting) {
        expect(() => admitSource(hex(a, b))).not.toThrow();
      }
    }
  });

  it("returns a result rather than throwing on an empty buffer", () => {
    expect(() => validateUtf8(hex())).not.toThrow();
    expect(validateUtf8(hex()).ok).toBe(true);
  });
});

describe("hexDump renders what AEG-1001 cannot show as an excerpt", () => {
  it("renders up to eight uppercase bytes from the offset", () => {
    const source = hex(0xed, 0xa0, 0x80, 0x20, 0x72, 0x65, 0x67, 0x69, 0x6f, 0x6e);
    expect(hexDump(source, 0)).toBe("ED A0 80 20 72 65 67 69");
  });

  it("stops at end of source rather than padding", () => {
    expect(hexDump(hex(0xff, 0xfe), 0)).toBe("FF FE");
    expect(hexDump(hex(0xff, 0xfe), 1)).toBe("FE");
  });

  it("pads single-digit bytes to two characters", () => {
    expect(hexDump(hex(0x00, 0x0a), 0)).toBe("00 0A");
  });

  it("returns empty for an offset that cannot be rendered, without throwing", () => {
    expect(hexDump(hex(0x61), -1)).toBe("");
    expect(hexDump(hex(0x61), 1.5)).toBe("");
    expect(hexDump(hex(0x61), 9)).toBe("");
    expect(hexDump(hex(0x61), 0, 0)).toBe("");
  });
});
