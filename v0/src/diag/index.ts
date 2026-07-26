/**
 * `diag` - the diagnostic value type, the sink, and the code registry.
 *
 * Imports `token` for `Span` and `Pos`, and nothing else from the pipeline. May
 * be imported by anything, which is what lets the lexer report before a parser
 * exists.
 *
 * Contains no renderer. Source excerpts, carets, gutters, secondary-span layout,
 * `= note:` and `= help:` formatting, colour, `NO_COLOR`, and `--json` shaping
 * are tasks 13.5 to 13.8 and land in Phase 3. In Phase 1 a diagnostic is a
 * structured value that is collected and counted, never a string.
 */

export type { Code, CodeEntry, CodeLookupError, Severity } from "./code.js";

export { CODES, RETIRED_CODES, isLiveCode, isRetiredCode, lookupCode } from "./code.js";

export type {
  Diagnostic,
  DiagnosticError,
  DiagnosticInput,
  DiagnosticResult,
  Location,
  NonEmpty,
  SecondaryLabel,
} from "./diagnostic.js";

export {
  atByteOffset,
  atSpan,
  escalate,
  isPositioned,
  makeDiagnostic,
} from "./diagnostic.js";

export type { SinkOutcome } from "./sink.js";

export { DiagnosticSink, MAX_DIAGNOSTICS_PER_FILE } from "./sink.js";
