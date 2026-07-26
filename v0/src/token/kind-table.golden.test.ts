import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { KIND_NAMES, renderKindTable } from "./kind.js";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const GOLDEN = join(HERE, "__golden__", "kind-table.txt");

/**
 * The kind table is the conformance-visible surface every downstream fixture is
 * written against. A rename or a reorder invalidates all of them, so it must be
 * a visible diff in review rather than a silent change.
 *
 * Regenerate deliberately with UPDATE_GOLDEN=1 and read the diff before
 * committing it.
 */
describe("the golden kind table", () => {
  it("matches byte for byte", () => {
    const rendered = renderKindTable();
    if (process.env["UPDATE_GOLDEN"] === "1") {
      writeFileSync(GOLDEN, rendered, "utf8");
    }
    const expected = readFileSync(GOLDEN, "utf8");
    expect(rendered).toBe(expected);
  });

  it("renders every kind exactly once, in enumeration order", () => {
    const body = renderKindTable().split("\n").filter((l) => /^\d{3}  /.test(l));
    expect(body).toHaveLength(KIND_NAMES.length);
    body.forEach((line, index) => {
      expect(line.startsWith(String(index).padStart(3, "0"))).toBe(true);
      expect(line.endsWith(KIND_NAMES[index] as string)).toBe(true);
    });
  });

  it("renders identically twice, so the fixture cannot be order-dependent", () => {
    expect(renderKindTable()).toBe(renderKindTable());
  });

  it("ends with a trailing newline, so the fixture is a well-formed text file", () => {
    expect(renderKindTable().endsWith("\n")).toBe(true);
    expect(renderKindTable().endsWith("\n\n")).toBe(false);
  });
});
