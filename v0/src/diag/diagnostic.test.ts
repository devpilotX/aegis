import { describe, expect, it } from "vitest";

import { makeSpan } from "../token/index.js";
import type { Span } from "../token/index.js";
import {
  atByteOffset,
  atSpan,
  escalate,
  isPositioned,
  makeDiagnostic,
} from "./diagnostic.js";
import type { Diagnostic, Location } from "./diagnostic.js";

const span = (start: number, end: number): Span => {
  const r = makeSpan(start, end);
  expect(r.ok).toBe(true);
  return r.ok ? r.value : { start: -1, end: -1 };
};

const build = (code: string, location: Location = atSpan(span(0, 4))): Diagnostic => {
  const r = makeDiagnostic({
    code,
    location,
    notes: ["the rule that was violated"],
    helps: ["what to do instead"],
  });
  expect(r.ok).toBe(true);
  if (!r.ok) throw new Error("unreachable in a passing test");
  return r.value;
};

describe("a diagnostic takes its identity from the registry", () => {
  it("copies summary, severity, and fatality rather than trusting the caller", () => {
    const d = build("AEG-4101");
    expect(d.summary).toBe("currency mismatch in comparison");
    expect(d.severity).toBe("error");
    expect(d.fatal).toBe(false);
  });

  it("marks a 2xxx code as a warning", () => {
    expect(build("AEG-2020").severity).toBe("warning");
  });

  it("marks a catalogued fatal as fatal", () => {
    const d = build("AEG-1010");
    expect(d.fatal).toBe(true);
    expect(d.severity).toBe("error");
  });

  it("is frozen", () => {
    expect(Object.isFrozen(build("AEG-1005"))).toBe(true);
  });

  it("defaults secondary and specRefs to empty rather than absent", () => {
    const d = build("AEG-1005");
    expect(d.secondary).toEqual([]);
    expect(d.specRefs).toEqual([]);
  });
});

describe("the location is a variant, not a nullable field", () => {
  it("carries a span in the ordinary case", () => {
    const d = build("AEG-4101", atSpan(span(10, 20)));
    expect(d.location.at).toBe("span");
    if (d.location.at === "span") expect(d.location.span).toEqual({ start: 10, end: 20 });
    expect(isPositioned(d)).toBe(true);
  });

  it("carries a byte offset for AEG-1001, which has no derivable position", () => {
    const d = build("AEG-1001", atByteOffset(1428));
    expect(d.location.at).toBe("byte-offset");
    if (d.location.at === "byte-offset") expect(d.location.offset).toBe(1428);
    expect(isPositioned(d)).toBe(false);
  });

  it("forces a consumer to handle both cases exhaustively", () => {
    // The `never` binding is the proof: adding a third variant makes this a
    // compile error, which is the whole reason the location is a union.
    const describeLocation = (location: Location): string => {
      switch (location.at) {
        case "span":
          return `span ${location.span.start}..${location.span.end}`;
        case "byte-offset":
          return `offset ${location.offset}`;
        default: {
          const exhaustive: never = location;
          return exhaustive;
        }
      }
    };
    expect(describeLocation(atSpan(span(1, 2)))).toBe("span 1..2");
    expect(describeLocation(atByteOffset(7))).toBe("offset 7");
  });
});

describe("a diagnostic without a fix is not representable", () => {
  it("requires at least one note and one help in the type", () => {
    // @ts-expect-error notes must be a non-empty tuple
    makeDiagnostic({ code: "AEG-1005", location: atSpan(span(0, 1)), notes: [], helps: ["x"] });
    // @ts-expect-error helps must be a non-empty tuple
    makeDiagnostic({ code: "AEG-1005", location: atSpan(span(0, 1)), notes: ["x"], helps: [] });
    expect(true).toBe(true);
  });

  it("rejects a blank note, which is an absent note in disguise", () => {
    const r = makeDiagnostic({
      code: "AEG-1005", location: atSpan(span(0, 1)), notes: ["   "], helps: ["fix it"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("empty-note");
  });

  it("rejects a blank help", () => {
    const r = makeDiagnostic({
      code: "AEG-1005", location: atSpan(span(0, 1)), notes: ["why"], helps: [""],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("empty-help");
  });

  it("rejects a blank secondary label", () => {
    const r = makeDiagnostic({
      code: "AEG-4101",
      location: atSpan(span(0, 1)),
      notes: ["why"],
      helps: ["fix"],
      secondary: [{ span: span(5, 9), label: " " }],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("empty-secondary-label");
  });

  it("accepts several notes, helps, secondary labels, and spec refs", () => {
    const r = makeDiagnostic({
      code: "AEG-4101",
      location: atSpan(span(0, 15)),
      notes: ["currency is part of the Money type", "type rule 2"],
      helps: ["convert explicitly", "record the rate for the auditor"],
      secondary: [{ span: span(18, 35), label: "Money[USD]" }],
      specRefs: ["docs/02 section 4"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.notes).toHaveLength(2);
      expect(r.value.helps).toHaveLength(2);
      expect(r.value.secondary[0]?.label).toBe("Money[USD]");
      expect(r.value.specRefs).toEqual(["docs/02 section 4"]);
    }
  });
});

describe("construction is total", () => {
  it("refuses an unknown code without throwing", () => {
    const r = makeDiagnostic({
      code: "AEG-9999", location: atSpan(span(0, 1)), notes: ["n"], helps: ["h"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("unknown-code");
  });

  it("refuses a retired code without throwing", () => {
    const r = makeDiagnostic({
      code: "AEG-1050", location: atSpan(span(0, 1)), notes: ["n"], helps: ["h"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("retired-code");
  });

  it("never throws for any code string", () => {
    for (const code of ["", "AEG-", "AEG-abcd", "AEG-1005", "AEG-1013"]) {
      expect(() =>
        makeDiagnostic({ code, location: atByteOffset(0), notes: ["n"], helps: ["h"] }),
      ).not.toThrow();
    }
  });
});

describe("escalation changes severity and never fatality", () => {
  it("turns a warning into an error", () => {
    const warning = build("AEG-2020");
    expect(warning.severity).toBe("warning");
    expect(escalate(warning).severity).toBe("error");
  });

  it("leaves fatality untouched for a warning", () => {
    const escalated = escalate(build("AEG-2020"));
    expect(escalated.fatal).toBe(false);
  });

  it("leaves a non-fatal error non-fatal", () => {
    const escalated = escalate(build("AEG-1011"));
    expect(escalated.severity).toBe("error");
    expect(escalated.fatal).toBe(false);
  });

  it("leaves a fatal error fatal, and returns it unchanged", () => {
    const fatal = build("AEG-1010");
    expect(escalate(fatal)).toBe(fatal);
    expect(escalate(fatal).fatal).toBe(true);
  });

  it("preserves everything except severity", () => {
    const before = build("AEG-2021", atSpan(span(3, 9)));
    const after = escalate(before);
    expect(after.code).toBe(before.code);
    expect(after.summary).toBe(before.summary);
    expect(after.location).toEqual(before.location);
    expect(after.notes).toEqual(before.notes);
    expect(after.helps).toEqual(before.helps);
    expect(Object.isFrozen(after)).toBe(true);
  });
});
