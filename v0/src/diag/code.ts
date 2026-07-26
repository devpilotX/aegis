/**
 * The diagnostic code registry.
 *
 * `docs/10-error-catalog.md` is the source of truth. These entries were
 * generated from it and are held to it by a traceability test that reads the
 * catalogue and asserts every code has an entry here with byte-identical summary
 * text, matching severity, and matching fatality. Editing a summary here without
 * editing the catalogue fails the build, and so does the reverse.
 *
 * Severity is derived from the range and asserted, not transcribed: `2xxx` is the
 * advisory range and is `warning`, everything else is `error`. Fatality is
 * transcribed from the catalogue's own `**fatal**` marker, so this file invents
 * nothing.
 *
 * Spec: docs/10-error-catalog.md, .kiro/specs/13-diagnostics/requirements.md.
 */

/** A diagnostic code, `AEG-` followed by four digits. */
export type Code = `AEG-${string}`;

/**
 * Severity is `error` or `warning`, and that is the whole set. Fatality is a
 * separate flag on the entry, because a fatal is an error that stops the
 * pipeline rather than a third severity - docs/10.
 */
export type Severity = "error" | "warning";

/** One catalogue entry. */
export interface CodeEntry {
  readonly code: Code;
  /** Byte-identical to the catalogue's message column. */
  readonly summary: string;
  readonly severity: Severity;
  /** True when this diagnostic stops the pipeline. Independent of severity. */
  readonly fatal: boolean;
}

const FATAL = true;
const NOT_FATAL = false;

/**
 * The advisory range. A code in `2000`-`2999` is a warning; every other range is
 * an error. Deriving severity rather than transcribing it removes one field a
 * human could get wrong, and the traceability test checks the derivation against
 * the catalogue's own range table.
 */
function severityOf(code: Code): Severity {
  return code.startsWith("AEG-2") ? "warning" : "error";
}

function entry(code: Code, summary: string, fatal: boolean): CodeEntry {
  return Object.freeze({ code, summary, severity: severityOf(code), fatal });
}

/**
 * Every live code, in catalogue order. Retired and relocated codes are absent by
 * construction: they are excluded from this list and an attempt to look one up
 * fails, which is what stops a burned number returning to life.
 */
export const CODES: readonly CodeEntry[] = Object.freeze([
  entry("AEG-0001", "build diagnostic limit reached, stopping", FATAL),
  entry("AEG-1001", "invalid UTF-8 byte sequence", FATAL),
  entry("AEG-1002", "bidirectional override character not permitted in source", NOT_FATAL),
  entry("AEG-1003", "confusable character in string literal or quoted name", NOT_FATAL),
  entry("AEG-1004", "non-ASCII identifier not permitted", NOT_FATAL),
  entry("AEG-1005", "unexpected character", NOT_FATAL),
  entry("AEG-1006", "too many lexical errors, stopping", FATAL),
  entry("AEG-1007", "carriage return not followed by a line feed", NOT_FATAL),
  entry("AEG-1008", "byte order mark at start of file", FATAL),
  entry("AEG-1009", "NUL byte in source", FATAL),
  entry("AEG-1010", "source file exceeds 4 MiB", FATAL),
  entry("AEG-1011", "line exceeds 4,096 bytes", NOT_FATAL),
  entry("AEG-1012", "identifier exceeds 128 bytes", NOT_FATAL),
  entry("AEG-1014", "numeric literal exceeds 38 significant digits", NOT_FATAL),
  entry("AEG-1019", "duration outside the range 1 ms to 100 y", NOT_FATAL),
  entry("AEG-1030", "reserved keyword is forbidden in AEGIS", NOT_FATAL),
  entry("AEG-1040", "unknown escape sequence", NOT_FATAL),
  entry("AEG-1041", "unterminated string literal at end of line", NOT_FATAL),
  entry("AEG-1042", "unterminated string literal at end of file", NOT_FATAL),
  entry("AEG-1055", "malformed duration literal", NOT_FATAL),
  entry("AEG-1056", "duration magnitude must be an integer", NOT_FATAL),
  entry("AEG-1057", "exponent notation is not supported", NOT_FATAL),
  entry("AEG-2010", "irreversible high-criticality capability has no human gate", NOT_FATAL),
  entry("AEG-2020", "`default permit` is fail-open and will be highlighted in the audit report", NOT_FATAL),
  entry("AEG-2021", "`first_applicable` is order-sensitive; prefer an order-independent algorithm", NOT_FATAL),
  entry("AEG-2030", "citation refers to a superseded clause version", NOT_FATAL),
  entry("AEG-2040", "rule is unreachable; here is a witness", NOT_FATAL),
  entry("AEG-2041", "rule is subsumed by an earlier rule", NOT_FATAL),
  entry("AEG-2042", "rules contradict: identical condition, opposing effects", NOT_FATAL),
  entry("AEG-2050", "coverage gap; here is a request no rule matches", NOT_FATAL),
  entry("AEG-2060", "declaration is never used", NOT_FATAL),
  entry("AEG-2070", "obligation cannot be discharged by any known enforcement point", NOT_FATAL),
  entry("AEG-2080", "data class may reach a permit path without a redaction obligation", NOT_FATAL),
  entry("AEG-2090", "doc comment missing in strict mode", NOT_FATAL),
  entry("AEG-2091", "doc comment does not precede a declaration", NOT_FATAL),
  entry("AEG-2100", "advisory suppressed here; this suppression will appear in the audit report", NOT_FATAL),
  entry("AEG-2106", "static resource bound is within 10% of the configured budget", NOT_FATAL),
  entry("AEG-3001", "missing `specification` declaration", NOT_FATAL),
  entry("AEG-3002", "missing `package` declaration", NOT_FATAL),
  entry("AEG-3003", "package name does not match directory path", NOT_FATAL),
  entry("AEG-3010", "circular import (full cycle shown)", NOT_FATAL),
  entry("AEG-3020", "required capability field missing", NOT_FATAL),
  entry("AEG-3021", "duplicate tool name", NOT_FATAL),
  entry("AEG-3022", "duplicate declaration identifier", NOT_FATAL),
  entry("AEG-3023", "a three-letter uppercase name is reserved for a currency code", NOT_FATAL),
  entry("AEG-3024", "schema name must be one of the nine request roots", NOT_FATAL),
  entry("AEG-3025", "import alias collides with a local declaration identifier", NOT_FATAL),
  entry("AEG-3026", "schema for this root is already declared by an imported package", NOT_FATAL),
  entry("AEG-3030", "policy does not declare a combining algorithm", NOT_FATAL),
  entry("AEG-3031", "policy does not declare `applies_to`", NOT_FATAL),
  entry("AEG-3032", "policy declares no rules", NOT_FATAL),
  entry("AEG-3040", "duplicate rule identifier in policy", NOT_FATAL),
  entry("AEG-3041", "denying or escalating rule requires a `reason`", NOT_FATAL),
  entry("AEG-3050", "obligation missing an `on <effect>` block or `on_failure`", NOT_FATAL),
  entry("AEG-3060", "release build blocked: a policy test is failing", NOT_FATAL),
  entry("AEG-3070", "expected X, found Y", NOT_FATAL),
  entry("AEG-3080", "illegal character in quoted name", NOT_FATAL),
  entry("AEG-3081", "quantifier nesting exceeds depth 3", NOT_FATAL),
  entry("AEG-3082", "import graph exceeds depth 32", NOT_FATAL),
  entry("AEG-3083", "quoted name exceeds 256 characters", NOT_FATAL),
  entry("AEG-4010", "attribute is not declared in any schema (did you mean ...)", NOT_FATAL),
  entry("AEG-4011", "declaration shadows a predeclared identifier", NOT_FATAL),
  entry("AEG-4012", "Optional binding is not in scope here", NOT_FATAL),
  entry("AEG-4013", "Optional binding shadows a keyword, a prelude name, or an enclosing binding", NOT_FATAL),
  entry("AEG-4020", "test `given` value does not match the schema type", NOT_FATAL),
  entry("AEG-4101", "currency mismatch in comparison", NOT_FATAL),
  entry("AEG-4102", "cannot compare values of different enum types", NOT_FATAL),
  entry("AEG-4103", "regex construct not supported by RE2", NOT_FATAL),
  entry("AEG-4110", "Optional value must be discharged before use", NOT_FATAL),
  entry("AEG-4120", "comparison operators are non-associative", NOT_FATAL),
  entry("AEG-4121", "logical operator requires Bool; there is no truthiness", NOT_FATAL),
  entry("AEG-4130", "construct would require type-level computation and is forbidden", NOT_FATAL),
  entry("AEG-4140", "unknown currency code", NOT_FATAL),
  entry("AEG-4141", "duration outside the permitted range", NOT_FATAL),
  entry("AEG-4160", "collection exceeds 4,096 elements", NOT_FATAL),
  entry("AEG-4170", "concatenated string value exceeds 64 KiB", NOT_FATAL),
  entry("AEG-5001", "required request attribute missing; decision is Indeterminate, resolved to Deny", NOT_FATAL),
  entry("AEG-5002", "request attribute type mismatch; decision is Indeterminate", NOT_FATAL),
  entry("AEG-5010", "quantifier iteration cap reached", NOT_FATAL),
  entry("AEG-6001", "bad bytecode magic", NOT_FATAL),
  entry("AEG-6002", "unsupported bytecode major version", NOT_FATAL),
  entry("AEG-6003", "bytecode integrity hash mismatch", NOT_FATAL),
  entry("AEG-6010", "bundle signature verification failed", NOT_FATAL),
  entry("AEG-6011", "bundle references an unknown signing key", NOT_FATAL),
]);

/**
 * Codes that were published and then retired or relocated. They are listed so
 * that looking one up fails loudly rather than silently returning nothing -
 * docs/10's retired table is the reason this list exists.
 */
export const RETIRED_CODES: readonly Code[] = Object.freeze([
  "AEG-1013", "AEG-1015", "AEG-1016", "AEG-1017", "AEG-1018", "AEG-1050",
]);

const BY_CODE: ReadonlyMap<string, CodeEntry> = new Map(CODES.map((e) => [e.code, e]));
const RETIRED: ReadonlySet<string> = new Set(RETIRED_CODES);

/** Why a code could not be resolved. */
export type CodeLookupError = "unknown-code" | "retired-code";

/** Look up a code. Total: never throws, and distinguishes unknown from retired. */
export function lookupCode(code: string):
  | { readonly ok: true; readonly value: CodeEntry }
  | { readonly ok: false; readonly error: CodeLookupError } {
  const found = BY_CODE.get(code);
  if (found !== undefined) return { ok: true, value: found };
  return { ok: false, error: RETIRED.has(code) ? "retired-code" : "unknown-code" };
}

/** True when the code is live: present in the catalogue and not retired. */
export function isLiveCode(code: string): boolean {
  return BY_CODE.has(code);
}

/** True when the code was published and then withdrawn. */
export function isRetiredCode(code: string): boolean {
  return RETIRED.has(code);
}
