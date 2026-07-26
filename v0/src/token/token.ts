/**
 * The Token type.
 *
 * A token carries exactly three things: its kind, the raw text of its lexeme,
 * and its span. Nothing else. In particular it carries no line, no column, and
 * no file: those are derived from a line index when a diagnostic needs them
 * (task 1.2), because a position stored on a token is a position that can go
 * stale. The test asserts the exact own-key set, so an addition fails the build
 * rather than passing quietly.
 *
 * Every constructor is total and never throws (I4).
 *
 * Spec: docs/02-language-specification.md sections 1.8, 1.9.
 */

import type { Kind } from "./kind.js";
import type { Result, Pos, Span } from "./span.js";
import { err, ok, spanLength, zeroWidthAt } from "./span.js";

/** A lexed token. Frozen; tokens are values, not mutable records. */
export interface Token {
  readonly kind: Kind;
  readonly text: string;
  readonly span: Span;
}

/** The exact set of own keys a Token has. Asserted by test, not by convention. */
export const TOKEN_KEYS = Object.freeze(["kind", "text", "span"] as const);

const UTF8 = new TextEncoder();

/** Length of `text` in UTF-8 bytes, which is the unit spans are measured in. */
export function utf8Length(text: string): number {
  return UTF8.encode(text).length;
}

/**
 * Construct a token.
 *
 * Fails, without throwing, when the text's UTF-8 byte length does not equal the
 * span's length. That invariant is what makes the byte-exact reprint property
 * achievable: if a token's text and span disagree, reprinting silently loses or
 * duplicates bytes, and the loss would surface much later as a corrupted
 * evidence hash rather than as a lexer bug.
 */
export function makeToken(kind: Kind, text: string, span: Span): Result<Token> {
  if (utf8Length(text) !== spanLength(span)) {
    return err("text-length-does-not-match-span");
  }
  return ok(Object.freeze({ kind, text, span }));
}

/**
 * The EOF token: empty text, zero-width span at the end offset.
 *
 * Exactly one is emitted on every path, including an empty file and every fatal
 * error path, so the parser never needs a special case for its absence -
 * docs/02 section 1.9.
 */
export function eofToken(endOffset: Pos): Result<Token> {
  const span = zeroWidthAt(endOffset);
  if (!span.ok) return err(span.error);
  return makeToken("eof", "", span.value);
}

/** Structural equality. */
export function tokensEqual(a: Token, b: Token): boolean {
  return (
    a.kind === b.kind &&
    a.text === b.text &&
    a.span.start === b.span.start &&
    a.span.end === b.span.end
  );
}

/**
 * A deterministic one-line rendering, for golden fixtures and debugging. Field
 * order is fixed here so that fixture bytes cannot change with an object
 * literal's key order (I2).
 */
export function renderToken(token: Token): string {
  return `${token.span.start}..${token.span.end}  ${token.kind}  ${JSON.stringify(token.text)}`;
}
