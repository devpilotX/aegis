/**
 * The line index and lazy position derivation.
 *
 * A token stores a byte span and nothing else. Line and column are derived from
 * this index on demand, which is why no token can ever carry a stale position.
 *
 * Construction is one forward pass over the bytes, O(n), performed once per
 * source. Derivation is a binary search over line starts, O(log n). Both are
 * total: every function returns a `Result` and none throws (I4).
 *
 * Line terminator rules - docs/02 section 1.3, which is normative:
 *   - LF is the sole terminator.
 *   - A CR immediately before an LF is part of that terminator, not part of the
 *     line's text. CRLF files index identically to LF files.
 *   - A CR anywhere else is AEG-1007. This module reports it as a position, not
 *     as a diagnostic object; the diagnostic type arrives in task 13.1.
 *   - U+0085, U+2028, and U+2029 are ordinary characters. Deliberately.
 *
 * Spec: docs/02-language-specification.md sections 1.3, 1.8.
 */

import type { Pos, Result } from "./span.js";
import { err, ok } from "./span.js";

const LF = 0x0a;
const CR = 0x0d;

/** A 1-based rendered position. Derived, never stored on a token. */
export interface LineColumn {
  /** 1-based line number. */
  readonly line: number;
  /** 1-based column, counted in Unicode scalar values. */
  readonly column: number;
}

/** A lone CR, which is `AEG-1007`. Reported by offset so the caller can span it. */
export interface StrayCarriageReturn {
  readonly offset: Pos;
}

/**
 * An immutable index over one source. Construct with `buildLineIndex`, which is
 * the only way to obtain one, so an index can never disagree with its source.
 */
export interface LineIndex {
  /** The source bytes this index describes. */
  readonly source: Uint8Array;
  /** Byte offset of the first byte of each line. Always starts with 0. */
  readonly lineStarts: readonly Pos[];
  /** Offsets of every lone CR found during construction - each one is AEG-1007. */
  readonly strayCarriageReturns: readonly StrayCarriageReturn[];
}

/**
 * Build the index in a single forward pass.
 *
 * Every iteration advances the cursor by at least one byte, which is the
 * termination argument (I1). A CR is examined with one byte of lookahead: CRLF
 * is one terminator, and a CR followed by anything else - including end of file -
 * is recorded as a stray.
 */
export function buildLineIndex(source: Uint8Array): LineIndex {
  const lineStarts: Pos[] = [0];
  const strays: StrayCarriageReturn[] = [];

  for (let i = 0; i < source.length; i += 1) {
    const byte = source[i];
    if (byte === LF) {
      lineStarts.push(i + 1);
      continue;
    }
    if (byte === CR) {
      if (source[i + 1] === LF) {
        // CRLF: one terminator, two bytes. Skip the LF so it is not counted twice.
        lineStarts.push(i + 2);
        i += 1;
        continue;
      }
      strays.push({ offset: i });
    }
  }

  return Object.freeze({
    source,
    lineStarts: Object.freeze(lineStarts),
    strayCarriageReturns: Object.freeze(strays),
  });
}

/** Number of lines. A file ending in LF does not gain a final empty line. */
export function lineCount(index: LineIndex): number {
  const starts = index.lineStarts;
  const last = starts[starts.length - 1];
  // A trailing terminator pushes a start at end-of-file; that is not a line.
  if (starts.length > 1 && last === index.source.length) return starts.length - 1;
  return starts.length;
}

/** Byte offset where the 1-based `line` begins, or an error if it does not exist. */
export function lineStart(index: LineIndex, line: number): Result<Pos> {
  if (!Number.isInteger(line)) return err("offset-not-an-integer");
  if (line < 1) return err("offset-negative");
  if (line > lineCount(index)) return err("offset-out-of-range");
  return ok(index.lineStarts[line - 1] as Pos);
}

/**
 * Offset one past the last byte of `line`'s text, excluding its terminator.
 *
 * Private, and takes a line already known to be in range, which is what lets it
 * return a `Pos` rather than a `Result`. A public wrapper that validated and
 * then had to handle its own validated result would carry an unreachable branch,
 * and unreachable code cannot be tested.
 */
function textEndOf(index: LineIndex, line: number): Pos {
  const source = index.source;
  const start = index.lineStarts[line - 1] as Pos;

  if (line === lineCount(index)) {
    // The last line may still be followed by a terminator: a file ending in LF
    // gains no extra line, so that terminator belongs to this line's ending and
    // not to its text.
    let end = source.length;
    if (end > start && source[end - 1] === LF) {
      end -= 1;
      if (end > start && source[end - 1] === CR) end -= 1;
    }
    return end;
  }

  // The next line's start is just past a terminator: either LF, or CRLF.
  const nextStart = index.lineStarts[line] as Pos;
  let end = nextStart - 1;
  if (end > start && source[end - 1] === CR && source[end] === LF) end -= 1;
  return end;
}

/**
 * Byte offset one past the last byte of the 1-based `line`, excluding its
 * terminator. This is what `AEG-1011` measures: a 4,096-byte line followed by
 * CRLF is legal, because the CR and the LF are not the line's text.
 */
export function lineEnd(index: LineIndex, line: number): Result<Pos> {
  const start = lineStart(index, line);
  if (!start.ok) return start;
  return ok(textEndOf(index, line));
}

/** Length of the 1-based `line` in bytes, excluding its terminator. */
export function lineLengthInBytes(index: LineIndex, line: number): Result<number> {
  const start = lineStart(index, line);
  if (!start.ok) return start;
  return ok(textEndOf(index, line) - start.value);
}

/** True when `byte` is a UTF-8 continuation byte, `10xxxxxx`. */
function isContinuation(byte: number | undefined): boolean {
  return byte !== undefined && (byte & 0xc0) === 0x80;
}

/**
 * Find the 1-based line containing `offset` by binary search over line starts.
 * O(log n), and the index is never rebuilt.
 */
function lineOf(index: LineIndex, offset: Pos): number {
  const starts = index.lineStarts;
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if ((starts[mid] as Pos) <= offset) low = mid;
    else high = mid - 1;
  }
  return low + 1;
}

/**
 * Derive the 1-based line and column of a byte offset.
 *
 * The column counts **Unicode scalar values**, so a line holding `é`, `€`, and
 * `𝄞` advances one column per character rather than per byte. A tab is one
 * column.
 *
 * Total for every integer input. An offset equal to the source length is valid:
 * it is the end-of-file position (docs/02 section 1.8). An offset that lands
 * inside a multi-byte sequence returns `offset-not-a-character-boundary` rather
 * than a rounded position, because a caret pointing at half a character is a
 * diagnostic that misleads.
 */
export function lineColumnAt(index: LineIndex, offset: Pos): Result<LineColumn> {
  if (!Number.isInteger(offset)) return err("offset-not-an-integer");
  if (offset < 0) return err("offset-negative");
  if (offset > index.source.length) return err("offset-out-of-range");
  if (isContinuation(index.source[offset])) return err("offset-not-a-character-boundary");

  // A file ending in a terminator has a line start at end-of-file, and that
  // start is not a line (docs/02 section 1.8). Clamping here is what keeps
  // end-of-file at the end of the last real line instead of on a phantom one.
  const line = Math.min(lineOf(index, offset), lineCount(index));
  const start = index.lineStarts[line - 1] as Pos;

  // A terminator is not part of its line's text, so a position at or past it
  // reports the end of the line rather than a column inside the terminator.
  // This is also why CRLF and LF give identical positions.
  const limit = Math.min(offset, textEndOf(index, line));

  let column = 1;
  for (let i = start; i < limit; i += 1) {
    if (!isContinuation(index.source[i])) column += 1;
  }
  return ok({ line, column });
}

/** The end-of-file position: the end of the last line. */
export function endOfFilePosition(index: LineIndex): Result<LineColumn> {
  return lineColumnAt(index, index.source.length);
}

/** Render a position as `line:column`, the form diagnostics use. */
export function renderLineColumn(at: LineColumn): string {
  return `${at.line}:${at.column}`;
}
