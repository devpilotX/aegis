import { describe, expect, it } from "vitest";

import { makeSpan } from "../token/index.js";
import type { Span } from "../token/index.js";
import { atByteOffset, atSpan, makeDiagnostic } from "./diagnostic.js";
import type { Diagnostic } from "./diagnostic.js";
import { DiagnosticSink, MAX_DIAGNOSTICS_PER_FILE } from "./sink.js";

const span = (start: number, end: number): Span => {
  const r = makeSpan(start, end);
  return r.ok ? r.value : { start: -1, end: -1 };
};

const diag = (code: string, at: number): Diagnostic => {
  const r = makeDiagnostic({
    code,
    location: atSpan(span(at, at + 1)),
    notes: ["why"],
    helps: ["fix"],
  });
  if (!r.ok) throw new Error("unreachable in a passing test");
  return r.value;
};

describe("the sink preserves emission order and never reorders", () => {
  it("returns diagnostics in the order they were added", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 40));
    sink.add(diag("AEG-1011", 10));
    sink.add(diag("AEG-1007", 25));
    expect(sink.all().map((d) => d.code)).toEqual(["AEG-1005", "AEG-1011", "AEG-1007"]);
  });

  it("keeps an order that a sort would change, so the guarantee is load-bearing", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 40));
    sink.add(diag("AEG-1011", 10));
    sink.add(diag("AEG-1007", 25));

    const emitted = sink.all();
    const byPosition = [...emitted].sort((a, b) => {
      const x = a.location.at === "span" ? a.location.span.start : -1;
      const y = b.location.at === "span" ? b.location.span.start : -1;
      return x - y;
    });
    const byCode = [...emitted].sort((a, b) => a.code.localeCompare(b.code));

    // If either sort produced the same sequence the test would prove nothing.
    expect(byPosition.map((d) => d.code)).not.toEqual(emitted.map((d) => d.code));
    expect(byCode.map((d) => d.code)).not.toEqual(emitted.map((d) => d.code));
  });

  it("does not group by severity", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-2020", 1));
    sink.add(diag("AEG-1005", 2));
    sink.add(diag("AEG-2021", 3));
    expect(sink.all().map((d) => d.severity)).toEqual(["warning", "error", "warning"]);
  });

  it("hands out a frozen copy, so a caller cannot reorder the sink's own list", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 1));
    const first = sink.all();
    expect(Object.isFrozen(first)).toBe(true);
    sink.add(diag("AEG-1007", 2));
    expect(first).toHaveLength(1);
    expect(sink.all()).toHaveLength(2);
  });
});

describe("duplicates", () => {
  it("keeps exactly one diagnostic with the same code and location", () => {
    const sink = new DiagnosticSink();
    expect(sink.add(diag("AEG-1005", 7))).toBe("accepted");
    expect(sink.add(diag("AEG-1005", 7))).toBe("duplicate");
    expect(sink.count()).toBe(1);
  });

  it("treats the same code at a different location as distinct", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 7));
    expect(sink.add(diag("AEG-1005", 8))).toBe("accepted");
    expect(sink.count()).toBe(2);
  });

  it("treats a different code at the same location as distinct", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 7));
    expect(sink.add(diag("AEG-1007", 7))).toBe("accepted");
  });

  it("distinguishes a span location from a byte-offset location", () => {
    const sink = new DiagnosticSink();
    const offsetDiag = makeDiagnostic({
      code: "AEG-1001", location: atByteOffset(7), notes: ["why"], helps: ["fix"],
    });
    expect(offsetDiag.ok).toBe(true);
    if (offsetDiag.ok) {
      sink.add(diag("AEG-1001", 7));
      expect(sink.add(offsetDiag.value)).toBe("accepted");
    }
  });
});

describe("the sink owns the cap", () => {
  const fill = (sink: DiagnosticSink, n: number): void => {
    for (let i = 0; i < n; i += 1) sink.add(diag("AEG-1005", i));
  };

  it("accepts 199 without capping", () => {
    const sink = new DiagnosticSink();
    fill(sink, 199);
    expect(sink.count()).toBe(199);
    expect(sink.isStopped()).toBe(false);
  });

  it("accepts the 200th, because the limit is inclusive", () => {
    const sink = new DiagnosticSink();
    fill(sink, MAX_DIAGNOSTICS_PER_FILE);
    expect(sink.count()).toBe(MAX_DIAGNOSTICS_PER_FILE);
    expect(sink.isStopped()).toBe(false);
    expect(sink.all().every((d) => d.code === "AEG-1005")).toBe(true);
  });

  it("replaces the 201st with AEG-1006 and reports capped", () => {
    const sink = new DiagnosticSink();
    fill(sink, MAX_DIAGNOSTICS_PER_FILE);
    expect(sink.add(diag("AEG-1007", 9999))).toBe("capped");
    expect(sink.isStopped()).toBe(true);
    const all = sink.all();
    expect(all).toHaveLength(MAX_DIAGNOSTICS_PER_FILE + 1);
    expect(all[all.length - 1]?.code).toBe("AEG-1006");
    // The offered diagnostic is not kept; the cap diagnostic takes its place.
    expect(all.filter((d) => d.code === "AEG-1007")).toHaveLength(0);
  });

  it("emits AEG-1006 exactly once however many more are offered", () => {
    const sink = new DiagnosticSink();
    fill(sink, MAX_DIAGNOSTICS_PER_FILE);
    for (let i = 0; i < 50; i += 1) {
      const outcome = sink.add(diag("AEG-1007", 5000 + i));
      expect(outcome).toBe(i === 0 ? "capped" : "stopped");
    }
    expect(sink.all().filter((d) => d.code === "AEG-1006")).toHaveLength(1);
    expect(sink.count()).toBe(MAX_DIAGNOSTICS_PER_FILE + 1);
  });

  it("makes the cap diagnostic fatal, so the caller need not count to know to stop", () => {
    const sink = new DiagnosticSink();
    fill(sink, MAX_DIAGNOSTICS_PER_FILE);
    sink.add(diag("AEG-1007", 9999));
    expect(sink.hasFatal()).toBe(true);
  });

  it("uses the limit from docs/02 rather than a literal", () => {
    expect(MAX_DIAGNOSTICS_PER_FILE).toBe(200);
  });
});

describe("the sink reports what it holds", () => {
  it("starts empty and quiet", () => {
    const sink = new DiagnosticSink();
    expect(sink.count()).toBe(0);
    expect(sink.all()).toEqual([]);
    expect(sink.hasError()).toBe(false);
    expect(sink.hasFatal()).toBe(false);
    expect(sink.isStopped()).toBe(false);
    expect(sink.tally()).toEqual({ errors: 0, warnings: 0 });
  });

  it("tallies errors and warnings separately", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1005", 1));
    sink.add(diag("AEG-2020", 2));
    sink.add(diag("AEG-2021", 3));
    expect(sink.tally()).toEqual({ errors: 1, warnings: 2 });
  });

  it("reports an error without reporting a fatal", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1011", 1));
    expect(sink.hasError()).toBe(true);
    expect(sink.hasFatal()).toBe(false);
  });

  it("reports a fatal for a catalogued fatal code", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-1010", 0));
    expect(sink.hasFatal()).toBe(true);
  });

  it("holds only warnings without claiming an error", () => {
    const sink = new DiagnosticSink();
    sink.add(diag("AEG-2060", 1));
    expect(sink.hasError()).toBe(false);
    expect(sink.tally()).toEqual({ errors: 0, warnings: 1 });
  });
});
