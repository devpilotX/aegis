/**
 * The Diagnostic value type.
 *
 * A diagnostic is a **structured value**, never a string. Nothing here formats,
 * aligns, colours, or renders anything: the renderer is task 13.5 onward and
 * lands in Phase 3. In Phase 1 a diagnostic is collected and counted, and that
 * is all.
 *
 * Two shapes are deliberate rather than conventional.
 *
 * `Location` is a discriminated union, not a nullable span. `AEG-1001` has no
 * derivable line and column - the line index may only be built over valid UTF-8,
 * and the whole point of `AEG-1001` is that the bytes are not - so it carries a
 * byte offset instead. Modelling that as an absent field would let a renderer
 * forget the case; modelling it as a variant makes `tsc` refuse to compile a
 * renderer that does not handle it.
 *
 * `notes` and `helps` are non-empty tuple types, so a diagnostic without a fix is
 * not representable. docs/10 requires at least one of each, and a required field
 * cannot be forgotten under deadline pressure the way an optional one can (I8).
 *
 * Spec: docs/10-error-catalog.md, .kiro/specs/13-diagnostics/requirements.md.
 */

import type { Pos, Span } from "../token/index.js";
import type { Code, CodeEntry, Severity } from "./code.js";
import { lookupCode } from "./code.js";

/**
 * Where a diagnostic points.
 *
 * `at: "span"` is the ordinary case and renders as `file:line:col` with an
 * excerpt. `at: "byte-offset"` is the `AEG-1001` case: a position exists in the
 * file but no line or column can be derived from it, so it renders as a byte
 * offset and a hex dump.
 */
export type Location =
  | { readonly at: "span"; readonly span: Span }
  | { readonly at: "byte-offset"; readonly offset: Pos };

/** A labelled second location. Absent entirely when no second location exists. */
export interface SecondaryLabel {
  readonly span: Span;
  readonly label: string;
}

/** A non-empty list. The type is the enforcement; there is no runtime check to skip. */
export type NonEmpty<T> = readonly [T, ...T[]];

/** A diagnostic: structured, frozen, and never a rendered string. */
export interface Diagnostic {
  readonly code: Code;
  readonly severity: Severity;
  /** Whether this stops the pipeline. Independent of severity. */
  readonly fatal: boolean;
  /** Byte-identical to the catalogue summary for this code. */
  readonly summary: string;
  readonly location: Location;
  /** At least one note explaining the rule that was violated. */
  readonly notes: NonEmpty<string>;
  /** At least one help proposing an actionable fix. */
  readonly helps: NonEmpty<string>;
  /** Empty when no second location is relevant. */
  readonly secondary: readonly SecondaryLabel[];
  /** Optional specification references. Empty is the common case. */
  readonly specRefs: readonly string[];
}

/** Everything a caller supplies. Code, severity, fatality, and summary come from the registry. */
export interface DiagnosticInput {
  readonly code: string;
  readonly location: Location;
  readonly notes: NonEmpty<string>;
  readonly helps: NonEmpty<string>;
  readonly secondary?: readonly SecondaryLabel[];
  readonly specRefs?: readonly string[];
}

/** Why a diagnostic could not be constructed. */
export type DiagnosticError =
  | "unknown-code"
  | "retired-code"
  | "empty-note"
  | "empty-help"
  | "empty-secondary-label";

/** Total result. */
export type DiagnosticResult =
  | { readonly ok: true; readonly value: Diagnostic }
  | { readonly ok: false; readonly error: DiagnosticError };

const blank = (s: string): boolean => s.trim().length === 0;

/**
 * Construct a diagnostic.
 *
 * The summary, severity, and fatality are taken from the registry rather than
 * from the caller, so a diagnostic cannot disagree with the catalogue about what
 * its own code means. The caller supplies only what varies: where it happened,
 * why, and what to do.
 *
 * Fails, without throwing, on an unknown or retired code, or on a note, help, or
 * secondary label that is present but blank - a whitespace help is an absent help
 * wearing a disguise.
 */
export function makeDiagnostic(input: DiagnosticInput): DiagnosticResult {
  const found = lookupCode(input.code);
  if (!found.ok) return { ok: false, error: found.error };

  if (input.notes.some(blank)) return { ok: false, error: "empty-note" };
  if (input.helps.some(blank)) return { ok: false, error: "empty-help" };

  const secondary = input.secondary ?? [];
  if (secondary.some((s) => blank(s.label))) {
    return { ok: false, error: "empty-secondary-label" };
  }

  const entry: CodeEntry = found.value;
  return {
    ok: true,
    value: Object.freeze({
      code: entry.code,
      severity: entry.severity,
      fatal: entry.fatal,
      summary: entry.summary,
      location: input.location,
      notes: input.notes,
      helps: input.helps,
      secondary: Object.freeze([...secondary]),
      specRefs: Object.freeze([...(input.specRefs ?? [])]),
    }),
  };
}

/** A location at a span. */
export function atSpan(span: Span): Location {
  return { at: "span", span };
}

/** A location at a byte offset, for a diagnostic with no derivable position. */
export function atByteOffset(offset: Pos): Location {
  return { at: "byte-offset", offset };
}

/**
 * Escalate a warning to an error, as `--strict` does.
 *
 * Fatality is deliberately untouched: whether the pipeline can continue is a
 * property of the defect, not of the build configuration - docs/10.
 */
export function escalate(diagnostic: Diagnostic): Diagnostic {
  if (diagnostic.severity === "error") return diagnostic;
  return Object.freeze({ ...diagnostic, severity: "error" as const });
}

/** True when the diagnostic points at a span rather than a bare byte offset. */
export function isPositioned(diagnostic: Diagnostic): boolean {
  return diagnostic.location.at === "span";
}
