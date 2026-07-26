/**
 * Token kinds - the closed vocabulary of the lexer.
 *
 * This module is the conformance-visible surface every golden fixture, parse
 * function, and conformance case is written against. Renaming a kind
 * invalidates every fixture downstream, so the names here are chosen once.
 *
 * Ordering is explicit and normative. `KIND_NAMES` is the single source of
 * truth and the `Kind` union is derived from it, so the two cannot drift.
 * Nothing in this module iterates an object's keys: iteration order comes from
 * the array, never from insertion or hash order (I2).
 *
 * Spec: docs/02-language-specification.md sections 1.5, 1.6, 1.7.
 */

/**
 * The keyword set is closed at 77 words - docs/02 section 1.5. Asserted as a
 * named constant rather than a literal so a drifting list fails loudly.
 */
export const KEYWORD_COUNT = 77;

/**
 * Reserved-forbidden words, 29 of them - docs/02 section 1.5. Using one is
 * AEG-1030. They lex as a distinct kind so the diagnostic can be precise.
 */
export const RESERVED_FORBIDDEN_COUNT = 29;

/**
 * Keyword kinds, in the group order docs/02 section 1.5 publishes.
 *
 * `kw.decision` is contextual: legal only in `expect decision stable`. The
 * lexer emits it wherever the word appears and the parser decides legality,
 * because position is a syntactic question the scanner cannot answer.
 */
const KEYWORDS = [
  // Structural (5)
  "kw.specification",
  "kw.package",
  "kw.import",
  "kw.as",
  "kw.export",
  // Declaration (12)
  "kw.policy",
  "kw.rule",
  "kw.capability",
  "kw.principal",
  "kw.resource_class",
  "kw.obligation",
  "kw.advice",
  "kw.schema",
  "kw.enum",
  "kw.const",
  "kw.test",
  "kw.suite",
  // Effect (11)
  "kw.allow",
  "kw.deny",
  "kw.require",
  "kw.permit",
  "kw.escalate",
  "kw.redact",
  "kw.throttle",
  "kw.halt",
  "kw.otherwise",
  "kw.unless",
  "kw.when",
  // Combining (8)
  "kw.combining",
  "kw.deny_overrides",
  "kw.permit_overrides",
  "kw.first_applicable",
  "kw.only_one_applicable",
  "kw.unanimous",
  "kw.deny_unless_permit",
  "kw.permit_unless_deny",
  // Targeting (5)
  "kw.applies_to",
  "kw.cites",
  "kw.on",
  "kw.violation",
  "kw.default",
  // Logic (17)
  "kw.and",
  "kw.or",
  "kw.not",
  "kw.implies",
  "kw.xor",
  "kw.in",
  "kw.contains",
  "kw.matches",
  "kw.if",
  "kw.then",
  "kw.else",
  "kw.forall",
  "kw.exists",
  "kw.count",
  "kw.any",
  "kw.all",
  "kw.none",
  // Temporal (7)
  "kw.within",
  "kw.before",
  "kw.after",
  "kw.since",
  "kw.until",
  "kw.during",
  "kw.now",
  // Values (3)
  "kw.true",
  "kw.false",
  "kw.some",
  // Binding and assertion (9)
  "kw.to",
  "kw.reason",
  "kw.given",
  "kw.expect",
  "kw.fired",
  "kw.stable",
  "kw.is",
  "kw.on_failure",
  "kw.decision",
] as const;

/** Reserved-forbidden kinds, in the order docs/02 section 1.5 publishes them. */
const RESERVED_FORBIDDEN = [
  "reserved.macro",
  "reserved.template",
  "reserved.extends",
  "reserved.abstract",
  "reserved.async",
  "reserved.await",
  "reserved.yield",
  "reserved.spawn",
  "reserved.import_dynamic",
  "reserved.unsafe",
  "reserved.native",
  "reserved.loop",
  "reserved.while",
  "reserved.recurse",
  "reserved.mut",
  "reserved.ref",
  "reserved.ptr",
  "reserved.type",
  "reserved.fixture",
  "reserved.set",
  "reserved.target",
  "reserved.where",
  "reserved.oblige",
  "reserved.always",
  "reserved.eventually",
  "reserved.at",
  "reserved.for",
  "reserved.ago",
  "reserved.between",
] as const;

/**
 * Literal kinds - docs/02 section 1.7. Five literal *forms* exist in the
 * language but only four are lexemes: `true` and `false` are keywords, and
 * money, percent, and set literals are built by the parser from several tokens.
 */
const LITERALS = [
  "lit.int",
  "lit.decimal",
  "lit.duration",
  "lit.string",
] as const;

/** Identifier kinds - docs/02 section 1.6. A currency code lexes as a TypeIdent. */
const IDENTIFIERS = ["ident", "type_ident"] as const;

/** Delimiters and operators - the complete set in docs/02 section 1.7. */
const PUNCTUATION = [
  "punct.lbrace",
  "punct.rbrace",
  "punct.lparen",
  "punct.rparen",
  "punct.lbracket",
  "punct.rbracket",
  "punct.comma",
  "punct.dot",
  "punct.colon",
  "punct.eq",
  "punct.eq_eq",
  "punct.bang_eq",
  "punct.lt",
  "punct.lt_eq",
  "punct.gt",
  "punct.gt_eq",
  "punct.plus",
  "punct.minus",
  "punct.star",
  "punct.slash",
  "punct.percent",
] as const;

/**
 * Trivia kinds - docs/02 section 1.4. Trivia produces no syntactic token; it is
 * retained on the following token so that tokens plus trivia reprint the source
 * byte for byte. These kinds exist so trivia can be typed, not so it can be
 * parsed.
 */
const TRIVIA = [
  "trivia.whitespace",
  "trivia.newline",
  "trivia.line_comment",
  "trivia.doc_comment",
] as const;

/** Exactly one EOF token is emitted on every path - docs/02 section 1.9. */
const SPECIAL = ["eof"] as const;

/**
 * Every kind, in normative order. Iteration anywhere in the toolchain uses this
 * array; nothing may iterate a map or an object to enumerate kinds (I2).
 */
export const KIND_NAMES = Object.freeze([
  ...KEYWORDS,
  ...RESERVED_FORBIDDEN,
  ...LITERALS,
  ...IDENTIFIERS,
  ...PUNCTUATION,
  ...TRIVIA,
  ...SPECIAL,
] as const);

/** A token kind. Closed: there is no way to name a kind outside this union. */
export type Kind = (typeof KIND_NAMES)[number];

/** The 77 usable keywords. */
export type Keyword = (typeof KEYWORDS)[number];
/** The 29 words that are always AEG-1030. */
export type ReservedForbidden = (typeof RESERVED_FORBIDDEN)[number];
/** The four literal lexemes. */
export type Literal = (typeof LITERALS)[number];
/** `ident` and `type_ident`. */
export type Identifier = (typeof IDENTIFIERS)[number];
/** Delimiters and operators. */
export type Punctuation = (typeof PUNCTUATION)[number];
/** Whitespace, line terminators, and comments. */
export type Trivia = (typeof TRIVIA)[number];

/** The category a kind belongs to. Used for predicates and for the golden table. */
export type KindCategory =
  | "keyword"
  | "reserved-forbidden"
  | "literal"
  | "identifier"
  | "punctuation"
  | "trivia"
  | "special";

const KEYWORD_SET: ReadonlySet<string> = new Set<string>(KEYWORDS);
const RESERVED_SET: ReadonlySet<string> = new Set<string>(RESERVED_FORBIDDEN);
const LITERAL_SET: ReadonlySet<string> = new Set<string>(LITERALS);
const IDENTIFIER_SET: ReadonlySet<string> = new Set<string>(IDENTIFIERS);
const PUNCTUATION_SET: ReadonlySet<string> = new Set<string>(PUNCTUATION);
const TRIVIA_SET: ReadonlySet<string> = new Set<string>(TRIVIA);

/** True when `kind` is one of the 77 usable keywords. */
export function isKeyword(kind: Kind): kind is Keyword {
  return KEYWORD_SET.has(kind);
}

/** True when `kind` is one of the 29 reserved-forbidden words, which are AEG-1030. */
export function isReservedForbidden(kind: Kind): kind is ReservedForbidden {
  return RESERVED_SET.has(kind);
}

/** True when `kind` is a literal lexeme. `true` and `false` are keywords, not literals. */
export function isLiteral(kind: Kind): kind is Literal {
  return LITERAL_SET.has(kind);
}

/** True when `kind` is `ident` or `type_ident`. */
export function isIdentifier(kind: Kind): kind is Identifier {
  return IDENTIFIER_SET.has(kind);
}

/** True when `kind` is a delimiter or operator. */
export function isPunctuation(kind: Kind): kind is Punctuation {
  return PUNCTUATION_SET.has(kind);
}

/** True when `kind` is trivia: whitespace, a line terminator, or a comment. */
export function isTrivia(kind: Kind): kind is Trivia {
  return TRIVIA_SET.has(kind);
}

/**
 * Reached only for `eof`. The parameter type is the exhaustiveness proof: adding
 * a kind without giving it a category makes this call a compile error rather
 * than a runtime surprise, and it does so without a throw (I4).
 */
function specialCategory(_kind: "eof"): KindCategory {
  return "special";
}

/** The category of a kind. Total, and proven total at compile time. */
export function categoryOf(kind: Kind): KindCategory {
  if (isKeyword(kind)) return "keyword";
  if (isReservedForbidden(kind)) return "reserved-forbidden";
  if (isLiteral(kind)) return "literal";
  if (isIdentifier(kind)) return "identifier";
  if (isPunctuation(kind)) return "punctuation";
  if (isTrivia(kind)) return "trivia";
  return specialCategory(kind);
}

/**
 * Render the kind table deterministically. The golden fixture built from this
 * is what makes a rename or a reorder a visible diff rather than a silent
 * invalidation of every downstream fixture.
 */
export function renderKindTable(): string {
  const out: string[] = [
    "AEGIS token kinds",
    "",
    `total                ${KIND_NAMES.length}`,
    `keywords             ${KEYWORDS.length}`,
    `reserved-forbidden   ${RESERVED_FORBIDDEN.length}`,
    `literals             ${LITERALS.length}`,
    `identifiers          ${IDENTIFIERS.length}`,
    `punctuation          ${PUNCTUATION.length}`,
    `trivia               ${TRIVIA.length}`,
    `special              ${SPECIAL.length}`,
    "",
  ];
  KIND_NAMES.forEach((name, index) => {
    out.push(`${String(index).padStart(3, "0")}  ${categoryOf(name).padEnd(18)}  ${name}`);
  });
  return `${out.join("\n")}\n`;
}
