import { describe, expect, it } from "vitest";

import {
  buildLineIndex,
  endOfFilePosition,
  lineColumnAt,
  lineCount,
  lineEnd,
  lineLengthInBytes,
  lineStart,
  renderLineColumn,
} from "./lines.js";
import type { LineIndex } from "./lines.js";

const bytes = (text: string): Uint8Array => new TextEncoder().encode(text);
const index = (text: string): LineIndex => buildLineIndex(bytes(text));

/** Read a position the test expects to be derivable, without introducing a throw. */
const at = (idx: LineIndex, offset: number): string => {
  const r = lineColumnAt(idx, offset);
  expect(r.ok).toBe(true);
  return r.ok ? renderLineColumn(r.value) : `error:${r.error}`;
};

describe("the index is built in one forward pass", () => {
  it("always starts at offset 0, even for an empty source", () => {
    expect(index("").lineStarts).toEqual([0]);
    expect(lineCount(index(""))).toBe(1);
  });

  it("records one start per line for LF endings", () => {
    expect(index("a\nb\nc").lineStarts).toEqual([0, 2, 4]);
  });

  it("indexes CRLF identically to LF, so a file's endings do not change its positions", () => {
    const lf = index("policy p\nrule r\ndefault deny");
    const crlf = index("policy p\r\nrule r\r\ndefault deny");
    expect(lineCount(lf)).toBe(lineCount(crlf));
    expect(at(lf, 9)).toBe(at(crlf, 10));
    expect(at(lf, 0)).toBe("1:1");
    expect(at(crlf, 0)).toBe("1:1");
  });

  it("is frozen, index and arrays alike", () => {
    const idx = index("a\nb");
    expect(Object.isFrozen(idx)).toBe(true);
    expect(Object.isFrozen(idx.lineStarts)).toBe(true);
    expect(Object.isFrozen(idx.strayCarriageReturns)).toBe(true);
  });

  it("is built exactly once and never rebuilt by a lookup", () => {
    const idx = index("a\nb\nc\nd\ne");
    const before = idx.lineStarts;
    for (let i = 0; i < 200; i += 1) lineColumnAt(idx, i % 9);
    expect(idx.lineStarts).toBe(before);
    expect(idx.lineStarts).toEqual([0, 2, 4, 6, 8]);
  });
});

describe("LF is the sole terminator", () => {
  it("records a lone CR as AEG-1007 material rather than terminating a line", () => {
    const idx = index("a\rb");
    expect(idx.strayCarriageReturns).toEqual([{ offset: 1 }]);
    expect(lineCount(idx)).toBe(1);
    expect(at(idx, 2)).toBe("1:3");
  });

  it("records a CR at end of file as stray, since nothing follows it", () => {
    expect(index("a\r").strayCarriageReturns).toEqual([{ offset: 1 }]);
  });

  it("records every stray, in offset order", () => {
    expect(index("\ra\rb\r").strayCarriageReturns).toEqual([
      { offset: 0 }, { offset: 2 }, { offset: 4 },
    ]);
  });

  it("finds no stray in a well-formed CRLF file", () => {
    expect(index("a\r\nb\r\nc").strayCarriageReturns).toEqual([]);
  });

  it("treats NEL, LS, and PS as ordinary characters, never terminators", () => {
    for (const ch of ["\u0085", "\u2028", "\u2029"]) {
      const idx = index(`a${ch}b`);
      expect(lineCount(idx)).toBe(1);
      expect(idx.lineStarts).toEqual([0]);
    }
  });
});

describe("line counting and measurement", () => {
  it("does not add a final empty line for a file ending in LF", () => {
    expect(lineCount(index("a\nb\n"))).toBe(2);
    expect(lineCount(index("a\nb"))).toBe(2);
  });

  it("counts a file of only a terminator as one line", () => {
    expect(lineCount(index("\n"))).toBe(1);
  });

  it("excludes the terminator from a line's length, for LF and CRLF alike", () => {
    const lf = index("abcd\nxy");
    const crlf = index("abcd\r\nxy");
    expect(lineLengthInBytes(lf, 1)).toEqual({ ok: true, value: 4 });
    expect(lineLengthInBytes(crlf, 1)).toEqual({ ok: true, value: 4 });
  });

  it("measures an empty line as zero bytes under either ending", () => {
    expect(lineLengthInBytes(index("\nx"), 1)).toEqual({ ok: true, value: 0 });
    expect(lineLengthInBytes(index("\r\nx"), 1)).toEqual({ ok: true, value: 0 });
  });

  it("measures the last line, which has no terminator", () => {
    expect(lineLengthInBytes(index("a\nbcd"), 2)).toEqual({ ok: true, value: 3 });
  });

  it("measures bytes, not characters, because AEG-1011 is a byte limit", () => {
    // Three characters, seven bytes: e-acute 2, euro 3, clef 4 minus the ascii.
    expect(lineLengthInBytes(index("é€"), 1)).toEqual({ ok: true, value: 5 });
  });

  it("rejects a line number that does not exist, without throwing", () => {
    const idx = index("a\nb");
    for (const bad of [0, -1, 3, 99, 1.5, Number.NaN]) {
      expect(() => lineStart(idx, bad)).not.toThrow();
      expect(lineStart(idx, bad).ok).toBe(false);
      expect(lineEnd(idx, bad).ok).toBe(false);
      expect(lineLengthInBytes(idx, bad).ok).toBe(false);
    }
  });

  it("names the reason a line number was rejected", () => {
    const idx = index("a\nb");
    const reason = (line: number): string => {
      const r = lineLengthInBytes(idx, line);
      return r.ok ? "ok" : r.error;
    };
    expect(reason(1.5)).toBe("offset-not-an-integer");
    expect(reason(0)).toBe("offset-negative");
    expect(reason(3)).toBe("offset-out-of-range");
  });

  it("reports line boundaries for a three-line file", () => {
    const idx = index("one\ntwo\nthree");
    expect(lineStart(idx, 2)).toEqual({ ok: true, value: 4 });
    expect(lineEnd(idx, 2)).toEqual({ ok: true, value: 7 });
  });
});

describe("columns count Unicode scalar values", () => {
  it("advances one column per character across two- three- and four-byte sequences", () => {
    // "é€𝄞x" is 1+1+1+1 characters and 2+3+4+1 bytes.
    const idx = index("é€𝄞x");
    expect(at(idx, 0)).toBe("1:1");
    expect(at(idx, 2)).toBe("1:2");
    expect(at(idx, 5)).toBe("1:3");
    expect(at(idx, 9)).toBe("1:4");
    expect(at(idx, 10)).toBe("1:5");
  });

  it("counts a tab as one column", () => {
    expect(at(index("\t\tx"), 2)).toBe("1:3");
  });

  it("restarts the column at each line", () => {
    const idx = index("abc\ndé€\nx");
    expect(at(idx, 4)).toBe("2:1");
    expect(at(idx, 5)).toBe("2:2");
    expect(at(idx, 7)).toBe("2:3");
    expect(at(idx, 11)).toBe("3:1");
  });

  it("returns an error, not a rounded position, for an offset inside a character", () => {
    const idx = index("é€𝄞");
    // Every continuation byte of every sequence.
    for (const inside of [1, 3, 4, 6, 7, 8]) {
      const r = lineColumnAt(idx, inside);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error).toBe("offset-not-a-character-boundary");
    }
  });
});

describe("derivation is total", () => {
  it("treats an offset equal to the source length as the end-of-file position", () => {
    const idx = index("ab\ncd");
    expect(at(idx, 5)).toBe("2:3");
    const eof = endOfFilePosition(idx);
    expect(eof.ok).toBe(true);
    if (eof.ok) expect(renderLineColumn(eof.value)).toBe("2:3");
  });

  it("places end-of-file at the end of the last line when the file ends in a terminator", () => {
    // Not 2:1 - a file ending in LF gains no final empty line - and not 1:4,
    // because the terminator is not part of the line's text.
    const eof = endOfFilePosition(index("ab\n"));
    expect(eof.ok).toBe(true);
    if (eof.ok) expect(renderLineColumn(eof.value)).toBe("1:3");
  });

  it("gives the same end-of-file position for LF and CRLF", () => {
    const lf = endOfFilePosition(index("ab\n"));
    const crlf = endOfFilePosition(index("ab\r\n"));
    expect(lf.ok && crlf.ok).toBe(true);
    if (lf.ok && crlf.ok) {
      expect(renderLineColumn(lf.value)).toBe(renderLineColumn(crlf.value));
    }
  });

  it("reports a terminator byte as the end of its line, not a column inside it", () => {
    expect(at(index("ab\ncd"), 2)).toBe("1:3");
    expect(at(index("ab\r\ncd"), 2)).toBe("1:3");
    expect(at(index("ab\r\ncd"), 3)).toBe("1:3");
  });

  it("gives 1:1 for an empty source", () => {
    expect(at(index(""), 0)).toBe("1:1");
  });

  it("rejects an offset beyond the source without throwing", () => {
    const idx = index("abc");
    const r = lineColumnAt(idx, 4);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("offset-out-of-range");
  });

  it("never throws for any integer or non-integer input", () => {
    const idx = index("a\nb\né€\n");
    const hostile = [
      0, 1, -1, 7, 8, 99, 0.5, -0.5, Number.NaN, Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, -0,
    ];
    for (const offset of hostile) {
      expect(() => lineColumnAt(idx, offset)).not.toThrow();
    }
  });

  it("reports the specific reason for each class of bad offset", () => {
    const idx = index("abc");
    const reason = (offset: number): string => {
      const r = lineColumnAt(idx, offset);
      return r.ok ? "ok" : r.error;
    };
    expect(reason(1.5)).toBe("offset-not-an-integer");
    expect(reason(-1)).toBe("offset-negative");
    expect(reason(99)).toBe("offset-out-of-range");
    expect(reason(3)).toBe("ok");
  });
});

describe("derivation is logarithmic in the number of lines", () => {
  it("resolves a position in a large file, and resolves it correctly", () => {
    const lines = 5_000;
    const idx = index(Array.from({ length: lines }, (_, i) => `line ${i}`).join("\n"));
    expect(lineCount(idx)).toBe(lines);
    // Line 4,001 starts after 4,000 lines; check its first column and its content offset.
    const start = lineStart(idx, 4001);
    expect(start.ok).toBe(true);
    if (start.ok) expect(at(idx, start.value)).toBe("4001:1");
  });
});
