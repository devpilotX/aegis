import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { CODES, RETIRED_CODES, isLiveCode, isRetiredCode, lookupCode } from "./code.js";

/** v0/src/diag -> repository root, so the test does not depend on cwd. */
const REPO_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
const CATALOGUE = join(REPO_ROOT, "docs", "10-error-catalog.md");

interface CatalogueRow {
  readonly code: string;
  readonly summary: string;
  readonly fatal: boolean;
}

/**
 * Parse the catalogue the way the corpus checker does: a table row whose first
 * cell is a four-digit code. Rows in the retired table are separated out, and
 * the fatal marker is the catalogue's own bolded `**fatal...**`.
 */
function parseCatalogue(): { live: CatalogueRow[]; retired: string[] } {
  const src = readFileSync(CATALOGUE, "utf8");
  const retiredBlock = src.split("## Retired and relocated codes")[1] ?? "";
  const retired = [...retiredBlock.matchAll(/^\| (\d{4}) \|/gm)].map((m) => `AEG-${m[1] as string}`);
  const retiredSet = new Set(retired);

  const live: CatalogueRow[] = [];
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(/^\| (\d{4}) \| ([^|]+?) \|(.*)$/);
    if (!m) continue;
    const code = `AEG-${m[1] as string}`;
    if (retiredSet.has(code)) continue;
    live.push({
      code,
      summary: (m[2] ?? "").trim(),
      fatal: /\*\*fatal\b[^*]*\*\*/.test(m[3] ?? ""),
    });
  }
  return { live, retired };
}

/**
 * This is the highest-value test in the task. It makes `docs/10` the source of
 * truth in code rather than in prose: a summary edited in one place and not the
 * other fails the build, in either direction.
 */
describe("the code registry traces to docs/10", () => {
  const catalogue = parseCatalogue();

  it("finds the catalogue and its rows", () => {
    expect(catalogue.live.length).toBeGreaterThan(80);
    expect(catalogue.retired.length).toBeGreaterThan(0);
  });

  it("has exactly one registry entry per live catalogue code, and no extras", () => {
    const inCatalogue = catalogue.live.map((r) => r.code).sort();
    const inRegistry = CODES.map((e) => e.code).sort();
    expect(inRegistry).toEqual(inCatalogue);
  });

  it("carries byte-identical summary text for every code", () => {
    for (const row of catalogue.live) {
      const found = lookupCode(row.code);
      expect(found.ok).toBe(true);
      if (found.ok) expect(found.value.summary).toBe(row.summary);
    }
  });

  it("matches the catalogue's fatality marker for every code", () => {
    for (const row of catalogue.live) {
      const found = lookupCode(row.code);
      if (found.ok) {
        expect({ code: row.code, fatal: found.value.fatal })
          .toEqual({ code: row.code, fatal: row.fatal });
      }
    }
  });

  it("derives severity from the range: 2xxx is a warning, everything else an error", () => {
    for (const entry of CODES) {
      const expected = entry.code.startsWith("AEG-2") ? "warning" : "error";
      expect({ code: entry.code, severity: entry.severity })
        .toEqual({ code: entry.code, severity: expected });
    }
  });

  it("lists exactly the codes the catalogue retired", () => {
    expect([...RETIRED_CODES].sort()).toEqual([...catalogue.retired].sort());
  });

  it("reports the six diagnostics the catalogue marks fatal, and only those", () => {
    const fatal = CODES.filter((e) => e.fatal).map((e) => e.code).sort();
    expect(fatal).toEqual([
      "AEG-0001", "AEG-1001", "AEG-1006", "AEG-1008", "AEG-1009", "AEG-1010",
    ]);
  });

  it("keeps fatality independent of severity: every fatal is an error, not all errors are fatal", () => {
    for (const entry of CODES.filter((e) => e.fatal)) {
      expect(entry.severity).toBe("error");
    }
    const nonFatalErrors = CODES.filter((e) => e.severity === "error" && !e.fatal);
    expect(nonFatalErrors.length).toBeGreaterThan(0);
  });
});

describe("lookup distinguishes unknown from retired", () => {
  it("resolves a live code", () => {
    const found = lookupCode("AEG-4101");
    expect(found.ok).toBe(true);
    if (found.ok) expect(found.value.summary).toBe("currency mismatch in comparison");
  });

  it("refuses a retired code by name, so a burned number cannot return to life", () => {
    for (const retired of RETIRED_CODES) {
      const found = lookupCode(retired);
      expect(found.ok).toBe(false);
      if (!found.ok) expect(found.error).toBe("retired-code");
    }
  });

  it("refuses a code that never existed", () => {
    for (const bogus of ["AEG-9999", "AEG-0000", "", "4101", "AEG-41011", "nonsense"]) {
      const found = lookupCode(bogus);
      expect(found.ok).toBe(false);
      if (!found.ok) expect(found.error).toBe("unknown-code");
    }
  });

  it("answers the predicates consistently with lookup", () => {
    expect(isLiveCode("AEG-1005")).toBe(true);
    expect(isRetiredCode("AEG-1005")).toBe(false);
    expect(isLiveCode("AEG-1050")).toBe(false);
    expect(isRetiredCode("AEG-1050")).toBe(true);
  });

  it("never throws for any input", () => {
    for (const input of ["", "x", "AEG-", "AEG-abcd", "AEG-99999999"]) {
      expect(() => lookupCode(input)).not.toThrow();
    }
  });
});

describe("the registry is immutable", () => {
  it("freezes the list and every entry", () => {
    expect(Object.isFrozen(CODES)).toBe(true);
    for (const entry of CODES) expect(Object.isFrozen(entry)).toBe(true);
  });

  it("contains no duplicate code", () => {
    expect(new Set(CODES.map((e) => e.code)).size).toBe(CODES.length);
  });

  it("shares no code between the live and retired lists", () => {
    const live = new Set(CODES.map((e) => e.code));
    expect(RETIRED_CODES.filter((c) => live.has(c))).toEqual([]);
  });
});
