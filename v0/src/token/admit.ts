/**
 * Source admission: the four pre-scan checks, in normative order.
 *
 *   bytes -> size -> UTF-8 validity -> BOM -> NUL -> (line index -> scan)
 *
 * Each stage assumes its predecessors succeeded, which is why validation
 * precedes the line index: the index walks bytes looking for terminators and is
 * entitled to assume they are valid UTF-8.
 *
 * All four failures are fatal and pre-scan. A caller that receives a failure
 * receives **no token stream at all, not even EOF** - docs/02 section 1.9 -
 * because a stream would imply the file had been lexed.
 *
 * The UTF-8 validator is hand-rolled rather than delegated to `TextDecoder`.
 * `TextDecoder` with `fatal: true` reports that the input is invalid and never
 * where, and `AEG-1001` must name a byte offset. It is also the wrong shape for
 * a project whose v1 is Go: specified range checks produce the same offset in
 * both implementations by construction, where two vendors' decoders would agree
 * only by coincidence, and the Phase 6 differential harness exists to catch that
 * class of coincidence rather than to depend on it.
 *
 * Single forward pass, byte comparisons only, no decoded string, no allocation
 * per byte. Total: every function returns a `Result` and none throws (I4).
 *
 * Spec: docs/02-language-specification.md sections 1.1, 1.2, 1.9.
 */

/** Maximum source size, docs/02 section 1.2. Inclusive: 4 MiB exactly is legal. */
export const MAX_SOURCE_BYTES = 4 * 1024 * 1024;

/** Which of the seven forbidden UTF-8 classes was found, per docs/02 section 1.1. */
export type Utf8Defect =
  | "continuation-byte-in-leader-position"
  | "truncated-sequence"
  | "overlong-encoding"
  | "encoded-surrogate"
  | "codepoint-above-max"
  | "five-or-six-byte-sequence"
  | "invalid-leader-byte";

/** A pre-scan rejection. Carries its code and enough detail to render it. */
export type AdmissionError =
  | { readonly code: "AEG-1010"; readonly size: number; readonly limit: number }
  | { readonly code: "AEG-1001"; readonly offset: number; readonly defect: Utf8Defect }
  | { readonly code: "AEG-1008"; readonly offset: 0 }
  | { readonly code: "AEG-1009"; readonly offset: number };

/** Total result of admission. No token stream exists when `ok` is false. */
export type Admission =
  | { readonly ok: true; readonly source: Uint8Array }
  | { readonly ok: false; readonly error: AdmissionError };

const NUL = 0x00;
const BOM = [0xef, 0xbb, 0xbf] as const;

function reject(error: AdmissionError): Admission {
  return { ok: false, error };
}

function utf8Failure(offset: number, defect: Utf8Defect): Admission {
  return reject({ code: "AEG-1001", offset, defect });
}

/** True for `10xxxxxx`. */
function isContinuation(byte: number | undefined): boolean {
  return byte !== undefined && (byte & 0xc0) === 0x80;
}

/**
 * Classify a leader byte into the length of its sequence, or name why it cannot
 * lead one. Returns a positive length, or a defect.
 *
 * The class boundaries follow docs/02 section 1.1 exactly, and the exact ones
 * matter: `C0`, `C1`, `F5`-`F7`, `FE`, and `FF` are class 7, invalid leaders
 * rejected on sight, not class 3 or class 5. `C0 AF` is an overlong `/` in
 * substance, but its code is the leader-byte code, and codes are part of the
 * conformance surface.
 */
function sequenceLength(leader: number): number | Utf8Defect {
  if (leader < 0x80) return 1;
  if (leader < 0xc0) return "continuation-byte-in-leader-position";
  if (leader === 0xc0 || leader === 0xc1) return "invalid-leader-byte";
  if (leader < 0xe0) return 2;
  if (leader < 0xf0) return 3;
  if (leader < 0xf5) return 4;
  if (leader < 0xf8) return "invalid-leader-byte";
  if (leader < 0xfe) return "five-or-six-byte-sequence";
  return "invalid-leader-byte";
}

/**
 * Validate one sequence beginning at `start`, whose leader implies `length`
 * bytes. Returns null when valid, or the defect found.
 *
 * The three checks beyond continuation-byte shape are the ones a naive validator
 * omits and a stress corpus catches: overlong encodings, encoded surrogates, and
 * codepoints above the maximum.
 */
function validateSequence(source: Uint8Array, start: number, length: number): Utf8Defect | null {
  if (start + length > source.length) return "truncated-sequence";

  for (let i = 1; i < length; i += 1) {
    if (!isContinuation(source[start + i])) return "truncated-sequence";
  }

  if (length === 3) {
    const b0 = source[start] as number;
    const b1 = source[start + 1] as number;
    // E0 80..9F would encode below U+0800; ED A0..BF encodes a surrogate.
    if (b0 === 0xe0 && b1 < 0xa0) return "overlong-encoding";
    if (b0 === 0xed && b1 >= 0xa0) return "encoded-surrogate";
  }

  if (length === 4) {
    const b0 = source[start] as number;
    const b1 = source[start + 1] as number;
    // F0 80..8F would encode below U+10000; F4 90.. exceeds U+10FFFF.
    if (b0 === 0xf0 && b1 < 0x90) return "overlong-encoding";
    if (b0 === 0xf4 && b1 >= 0x90) return "codepoint-above-max";
  }

  return null;
}

/**
 * Validate the whole buffer. Reports the offset of the **first** offending byte,
 * which is the leader of the bad sequence rather than the byte that failed the
 * check, because that is the position an author can act on.
 */
export function validateUtf8(source: Uint8Array): Admission {
  let i = 0;
  while (i < source.length) {
    const leader = source[i] as number;
    const length = sequenceLength(leader);
    if (typeof length === "string") return utf8Failure(i, length);

    const defect = validateSequence(source, i, length);
    if (defect !== null) return utf8Failure(i, defect);

    i += length;
  }
  return { ok: true, source };
}

/** True when the buffer begins with the UTF-8 encoding of U+FEFF. */
function startsWithBom(source: Uint8Array): boolean {
  return BOM.every((byte, i) => source[i] === byte);
}

/**
 * Run the four pre-scan checks in normative order and return the source
 * unchanged on success. Unchanged is the point: nothing is stripped, decoded, or
 * normalised, so every later byte offset means what the author wrote.
 */
export function admitSource(source: Uint8Array): Admission {
  if (source.length > MAX_SOURCE_BYTES) {
    return reject({ code: "AEG-1010", size: source.length, limit: MAX_SOURCE_BYTES });
  }

  const utf8 = validateUtf8(source);
  if (!utf8.ok) return utf8;

  if (startsWithBom(source)) {
    return reject({ code: "AEG-1008", offset: 0 });
  }

  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === NUL) return reject({ code: "AEG-1009", offset: i });
  }

  return { ok: true, source };
}

/**
 * Hex dump of up to `count` bytes from `offset`, uppercase, space separated.
 * This is how `AEG-1001` shows the reader what is there, since it is the one
 * diagnostic that cannot render a source excerpt - docs/10.
 */
export function hexDump(source: Uint8Array, offset: number, count = 8): string {
  if (!Number.isInteger(offset) || offset < 0) return "";
  const end = Math.min(source.length, offset + Math.max(0, count));
  const parts: string[] = [];
  for (let i = offset; i < end; i += 1) {
    parts.push((source[i] as number).toString(16).toUpperCase().padStart(2, "0"));
  }
  return parts.join(" ");
}
