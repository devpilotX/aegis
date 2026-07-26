/**
 * Source positions and spans.
 *
 * A span is a half-open range `[start, end)` of **0-based raw file byte
 * offsets** - docs/02 section 1.8. Raw, because source is never normalised
 * (section 1.1); byte offsets, because that is what bounds memory; half-open,
 * because it makes length subtraction and adjacency trivial and makes a
 * zero-width span expressible without a sentinel.
 *
 * Nothing here stores a line or a column. Rendered positions are 1-based and
 * count Unicode scalar values, and they are derived on demand from a line index
 * built during scanning - task 1.2. A token that carried a position could carry
 * a stale one.
 *
 * Every constructor is total: it returns a `Result` and never throws (I4).
 */

/** A 0-based offset into the raw source bytes. */
export type Pos = number;

/** A half-open byte range `[start, end)`. Construct only via `makeSpan`. */
export interface Span {
  readonly start: Pos;
  readonly end: Pos;
}

/** Why a span or token could not be constructed. */
export type ConstructionError =
  | "offset-not-an-integer"
  | "offset-negative"
  | "end-before-start"
  | "text-length-does-not-match-span";

/** A total result. There is no thrown error anywhere in this package. */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: ConstructionError };

/** Wrap a value as a successful result. */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/** Wrap an error as a failed result. */
export function err<T>(error: ConstructionError): Result<T> {
  return { ok: false, error };
}

function validOffset(offset: Pos): ConstructionError | null {
  if (!Number.isInteger(offset)) return "offset-not-an-integer";
  if (offset < 0) return "offset-negative";
  return null;
}

/**
 * Construct a span. Fails, without throwing, on a non-integer offset, a
 * negative offset, or an end before its start. A zero-width span is legal:
 * `eof` uses one, and so will every synthetic token the parser inserts during
 * recovery.
 */
export function makeSpan(start: Pos, end: Pos): Result<Span> {
  const startProblem = validOffset(start);
  if (startProblem !== null) return err(startProblem);
  const endProblem = validOffset(end);
  if (endProblem !== null) return err(endProblem);
  if (end < start) return err("end-before-start");
  return ok(Object.freeze({ start, end }));
}

/** A zero-width span at `at`. Used for `eof` and for synthetic tokens. */
export function zeroWidthAt(at: Pos): Result<Span> {
  return makeSpan(at, at);
}

/** Length in bytes. Half-open, so this is exactly `end - start`. */
export function spanLength(span: Span): number {
  return span.end - span.start;
}

/** True when the span covers no bytes. */
export function isZeroWidth(span: Span): boolean {
  return span.start === span.end;
}

/** Structural equality. Spans are values, not identities. */
export function spansEqual(a: Span, b: Span): boolean {
  return a.start === b.start && a.end === b.end;
}

/**
 * True when `b` starts exactly where `a` ends. This is the property that lets
 * tokens plus trivia reprint the source byte for byte: an unbroken chain of
 * adjacent spans covering `[0, size)` loses nothing.
 */
export function areAdjacent(a: Span, b: Span): boolean {
  return a.end === b.start;
}
