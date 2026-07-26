/**
 * `token` - the closed vocabulary of the lexer, plus the span and token value
 * types built on it.
 *
 * Position in the pipeline: the bottom. This package imports nothing from the
 * pipeline, and `lexer` imports it along with `diag` and nothing else. That
 * dependency direction is what makes the Phase 6 translation to Go a
 * translation rather than a redesign.
 *
 * Contains no scanning, no keyword lookup table, no line index, and no
 * diagnostics. Those are tasks 1.4, 1.5, 1.2, and 13.1 respectively.
 */

export type {
  Kind,
  KindCategory,
  Keyword,
  ReservedForbidden,
  Literal,
  Identifier,
  Punctuation,
  Trivia,
} from "./kind.js";

export {
  KEYWORD_COUNT,
  RESERVED_FORBIDDEN_COUNT,
  KIND_NAMES,
  categoryOf,
  isIdentifier,
  isKeyword,
  isLiteral,
  isPunctuation,
  isReservedForbidden,
  isTrivia,
  renderKindTable,
} from "./kind.js";

export type { ConstructionError, Pos, Result, Span } from "./span.js";

export {
  areAdjacent,
  err,
  isZeroWidth,
  makeSpan,
  ok,
  spanLength,
  spansEqual,
  zeroWidthAt,
} from "./span.js";

export type { Token } from "./token.js";

export {
  TOKEN_KEYS,
  eofToken,
  makeToken,
  renderToken,
  tokensEqual,
  utf8Length,
} from "./token.js";

export type { LineColumn, LineIndex, StrayCarriageReturn } from "./lines.js";

export {
  buildLineIndex,
  endOfFilePosition,
  lineColumnAt,
  lineCount,
  lineEnd,
  lineLengthInBytes,
  lineStart,
  renderLineColumn,
} from "./lines.js";
