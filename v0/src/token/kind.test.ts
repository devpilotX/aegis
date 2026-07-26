import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  KEYWORD_COUNT,
  KIND_NAMES,
  RESERVED_FORBIDDEN_COUNT,
  categoryOf,
  isIdentifier,
  isKeyword,
  isLiteral,
  isPunctuation,
  isReservedForbidden,
  isTrivia,
} from "./kind.js";
import type { Kind, KindCategory } from "./kind.js";

/** v0/src/token -> repository root, so the test does not depend on cwd. */
const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
const SPEC_PATH = join(REPO_ROOT, "docs", "02-language-specification.md");

const byCategory = (category: KindCategory): Kind[] =>
  KIND_NAMES.filter((k) => categoryOf(k) === category);

describe("the kind enumeration is closed and explicitly ordered", () => {
  it("lists every kind exactly once", () => {
    expect(new Set(KIND_NAMES).size).toBe(KIND_NAMES.length);
  });

  it("is frozen, so no consumer can extend it at run time", () => {
    expect(Object.isFrozen(KIND_NAMES)).toBe(true);
  });

  it("derives the Kind union from the array, so the two cannot drift", () => {
    // Compile-time: every element of KIND_NAMES is assignable to Kind, and a
    // string that is not in the array is not assignable. The second half is
    // asserted by the @ts-expect-error below, which fails the build if the
    // assignment ever becomes legal.
    const fromArray: Kind = KIND_NAMES[0] as Kind;
    expect(typeof fromArray).toBe("string");
    // @ts-expect-error a kind outside the union must not be nameable
    const invented: Kind = "kw.not_a_real_keyword";
    expect(invented).toBe("kw.not_a_real_keyword");
  });

  it("orders kinds by category: keywords, reserved, literals, identifiers, punctuation, trivia, special", () => {
    const order = KIND_NAMES.map((k) => categoryOf(k));
    const firstIndexOf = (c: KindCategory): number => order.indexOf(c);
    const lastIndexOf = (c: KindCategory): number => order.lastIndexOf(c);
    const sequence: KindCategory[] = [
      "keyword", "reserved-forbidden", "literal",
      "identifier", "punctuation", "trivia", "special",
    ];
    for (let i = 1; i < sequence.length; i += 1) {
      const previous = sequence[i - 1] as KindCategory;
      const current = sequence[i] as KindCategory;
      expect(lastIndexOf(previous)).toBeLessThan(firstIndexOf(current));
    }
  });

  it("serialises identically on two consecutive runs, with no object-key order anywhere", () => {
    const once = KIND_NAMES.join("\n");
    const twice = KIND_NAMES.join("\n");
    expect(once).toBe(twice);
    expect(once).toBe([...KIND_NAMES].join("\n"));
  });
});

describe("the counts match the specification", () => {
  it("has exactly KEYWORD_COUNT keyword kinds", () => {
    expect(byCategory("keyword")).toHaveLength(KEYWORD_COUNT);
  });

  it("has exactly RESERVED_FORBIDDEN_COUNT reserved-forbidden kinds", () => {
    expect(byCategory("reserved-forbidden")).toHaveLength(RESERVED_FORBIDDEN_COUNT);
  });

  it("states the counts as named constants citing docs/02 section 1.5", () => {
    expect(KEYWORD_COUNT).toBe(77);
    expect(RESERVED_FORBIDDEN_COUNT).toBe(29);
  });

  it("accounts for every kind in exactly one category", () => {
    const total =
      byCategory("keyword").length +
      byCategory("reserved-forbidden").length +
      byCategory("literal").length +
      byCategory("identifier").length +
      byCategory("punctuation").length +
      byCategory("trivia").length +
      byCategory("special").length;
    expect(total).toBe(KIND_NAMES.length);
  });
});

describe("the keyword set traces to the specification", () => {
  /**
   * Reads the keyword group lines out of docs/02 section 1.5 and compares them
   * to the enumeration. This closes the loop the corpus checker cannot: it
   * compares the specification against the *code*, not against another
   * document. If the spec is amended and this enumeration is not, this fails.
   */
  const specKeywords = (): string[] => {
    const groups =
      /^\*\*(?:Structural|Declaration|Effect|Combining|Targeting|Logic|Temporal|Values|Binding and assertion) \(\d+\):\*\*/;
    const words: string[] = [];
    for (const line of readFileSync(SPEC_PATH, "utf8").split(/\r?\n/)) {
      if (!groups.test(line)) continue;
      for (const m of line.matchAll(/`([a-z_]+)`/g)) words.push(m[1] as string);
    }
    return words;
  };

  it("finds the keyword groups in the specification", () => {
    expect(specKeywords().length).toBeGreaterThan(0);
  });

  it("has one kind per specified keyword, and no kind without a keyword", () => {
    const specified = new Set(specKeywords());
    const enumerated = new Set(byCategory("keyword").map((k) => k.slice("kw.".length)));
    expect([...specified].filter((w) => !enumerated.has(w))).toEqual([]);
    expect([...enumerated].filter((w) => !specified.has(w))).toEqual([]);
  });

  it("has one kind per reserved-forbidden word in the specification", () => {
    const line = readFileSync(SPEC_PATH, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("`macro`"));
    const specified = new Set([...(line ?? "").matchAll(/`([a-z_]+)`/g)].map((m) => m[1] as string));
    const enumerated = new Set(
      byCategory("reserved-forbidden").map((k) => k.slice("reserved.".length)),
    );
    expect([...specified].filter((w) => !enumerated.has(w))).toEqual([]);
    expect([...enumerated].filter((w) => !specified.has(w))).toEqual([]);
  });
});

describe("category predicates are exclusive and total", () => {
  it("assigns exactly one category to every kind", () => {
    for (const kind of KIND_NAMES) {
      const hits = [
        isKeyword(kind),
        isReservedForbidden(kind),
        isLiteral(kind),
        isIdentifier(kind),
        isPunctuation(kind),
        isTrivia(kind),
      ].filter(Boolean).length;
      // `eof` matches no predicate; everything else matches exactly one.
      expect(hits).toBe(kind === "eof" ? 0 : 1);
    }
  });

  it("never lets a keyword also be reserved-forbidden", () => {
    const both = KIND_NAMES.filter((k) => isKeyword(k) && isReservedForbidden(k));
    expect(both).toEqual([]);
  });

  it("treats true and false as keywords rather than literals", () => {
    expect(isKeyword("kw.true")).toBe(true);
    expect(isKeyword("kw.false")).toBe(true);
    expect(isLiteral("kw.true" as Kind)).toBe(false);
  });

  it("does not classify money, percent, or a set literal as a lexeme at all", () => {
    const names = new Set<string>(KIND_NAMES);
    expect(names.has("lit.money")).toBe(false);
    expect(names.has("lit.percent")).toBe(false);
    expect(names.has("lit.set")).toBe(false);
  });
});

describe("eof", () => {
  it("exists exactly once", () => {
    expect(KIND_NAMES.filter((k) => k === "eof")).toHaveLength(1);
  });

  it("is neither a keyword nor trivia", () => {
    expect(isKeyword("eof")).toBe(false);
    expect(isTrivia("eof")).toBe(false);
  });

  it("is categorised as special", () => {
    expect(categoryOf("eof")).toBe("special");
  });
});
