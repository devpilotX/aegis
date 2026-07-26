/**
 * The diagnostic sink.
 *
 * Accumulating rather than returning is what allows one pass to report every
 * defect in a file instead of one per compile.
 *
 * Two guarantees, both load-bearing.
 *
 * **Emission order is preserved and never changed.** Not by code, not by
 * severity, not by position. Emission order is source order for a single forward
 * pass, so a sort could only alter the output when something upstream is already
 * wrong, and it would hide exactly that. Across stages the order also carries
 * meaning: lexical before syntactic before semantic is how an author reads a
 * failure, whereas sorting by position interleaves them and buries the finding
 * that caused the rest (I2).
 *
 * **The sink owns the cap.** At 200 diagnostics for a file it appends `AEG-1006`
 * once and reports stopped; no caller is expected to count, because a limit
 * enforced by every caller is a limit enforced by none (I11).
 *
 * Spec: docs/02 section 1.9, .kiro/specs/13-diagnostics/requirements.md.
 */

import type { Diagnostic } from "./diagnostic.js";
import { atByteOffset, makeDiagnostic } from "./diagnostic.js";

/** Diagnostics per file, docs/02 section 1.2. Inclusive: the 200th is kept. */
export const MAX_DIAGNOSTICS_PER_FILE = 200;

/** What the sink did with an offered diagnostic. */
export type SinkOutcome =
  /** Accepted and appended. */
  | "accepted"
  /** A diagnostic with the same code and location is already present. */
  | "duplicate"
  /** The cap was reached; AEG-1006 was appended and the file is finished. */
  | "capped"
  /** The cap was already reached; nothing was appended. */
  | "stopped";

/** A key that makes two diagnostics duplicates: same code, same location. */
function keyOf(diagnostic: Diagnostic): string {
  const l = diagnostic.location;
  return l.at === "span"
    ? `${diagnostic.code}@span:${l.span.start}-${l.span.end}`
    : `${diagnostic.code}@offset:${l.offset}`;
}

/**
 * A per-file sink. Construct one per file; the build-wide cap belongs to the
 * driver and is `AEG-0001`, not this component's concern.
 */
export class DiagnosticSink {
  private readonly items: Diagnostic[] = [];
  private readonly seen = new Set<string>();
  private stoppedAtCap = false;

  /**
   * Offer a diagnostic. Returns what happened rather than throwing, so a caller
   * can react to `capped` without inspecting counts.
   */
  add(diagnostic: Diagnostic): SinkOutcome {
    if (this.stoppedAtCap) return "stopped";

    const key = keyOf(diagnostic);
    if (this.seen.has(key)) return "duplicate";

    if (this.items.length >= MAX_DIAGNOSTICS_PER_FILE) {
      this.stoppedAtCap = true;
      this.appendCapDiagnostic();
      return "capped";
    }

    this.seen.add(key);
    this.items.push(diagnostic);
    return "accepted";
  }

  /**
   * Append `AEG-1006` exactly once. It carries a byte offset rather than a span
   * because the position that matters is "here, and no further", and it needs no
   * excerpt to be understood.
   */
  private appendCapDiagnostic(): void {
    const capped = makeDiagnostic({
      code: "AEG-1006",
      location: atByteOffset(0),
      notes: [
        `${MAX_DIAGNOSTICS_PER_FILE} diagnostics were reported for this file, which is the limit in docs/02 section 1.2`,
      ],
      helps: [
        "fix the reported defects and compile again; the remainder of this file was not examined",
      ],
    });
    // Cannot fail: the code is live and both lists are non-blank literals. The
    // guard exists so that this method has no throw and no unchecked result.
    if (capped.ok) this.items.push(capped.value);
  }

  /** The diagnostics, in emission order. A copy, so a caller cannot reorder ours. */
  all(): readonly Diagnostic[] {
    return Object.freeze([...this.items]);
  }

  /** How many diagnostics have been collected, including `AEG-1006` if appended. */
  count(): number {
    return this.items.length;
  }

  /** True once the cap has been reached and the file abandoned. */
  isStopped(): boolean {
    return this.stoppedAtCap;
  }

  /** True when any collected diagnostic is fatal, cap included. */
  hasFatal(): boolean {
    return this.items.some((d) => d.fatal);
  }

  /** True when any collected diagnostic is an error, fatal or not. */
  hasError(): boolean {
    return this.items.some((d) => d.severity === "error");
  }

  /** How many of each severity, for a caller that reports a summary line. */
  tally(): { readonly errors: number; readonly warnings: number } {
    let errors = 0;
    let warnings = 0;
    for (const d of this.items) {
      if (d.severity === "error") errors += 1;
      else warnings += 1;
    }
    return { errors, warnings };
  }
}
