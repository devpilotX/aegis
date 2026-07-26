# 02 - AEGIS Language Specification (NORMATIVE)

**Version 1.0-draft. This document is normative. Where implementation and this document disagree, this document is correct.**

Key words: MUST, MUST NOT, SHOULD, MAY carry their usual normative force.

---

## 1. Lexical structure

### 1.1 Source representation

Source text MUST be valid UTF-8. Invalid UTF-8 is `AEG-1001` and is fatal (section 1.9).

**`AEG-1001` rejects exactly these seven classes.** The list is normative and closed, because "valid UTF-8" is a phrase two implementations can read differently, and a decoder that silently accepts one of these would let two conforming toolchains disagree about what a policy says.

| # | Rejected | Example bytes |
|---|---|---|
| 1 | A continuation byte in leader position | `80`, `BF` |
| 2 | A truncated sequence, including truncation at end of file | `E2 82` |
| 3 | An overlong encoding: any codepoint written in more bytes than the minimum | `E0 80 AF` for `/` |
| 4 | A surrogate codepoint `U+D800`-`U+DFFF` encoded as UTF-8 (CESU-8, WTF-8) | `ED A0 80` |
| 5 | A codepoint above `U+10FFFF` | `F4 90 80 80` |
| 6 | A five- or six-byte sequence | `F8 88 80 80 80` |
| 7 | The leader bytes that can never be valid | `C0`, `C1`, `F5`-`FF` |

**The classes are disjoint, and the boundary between 3, 5, and 7 is where an implementation goes wrong.** `C0` and `C1` are class 7 rather than class 3: they are structurally incapable of leading a valid sequence, so they are rejected on sight without inspecting what follows. The same holds for `F5`-`F7`, which could only lead a codepoint above the maximum, and for `FE` and `FF`, which lead nothing. Class 3 is therefore reached only by a leader that *could* have been valid - `E0` or `F0` - followed by a continuation byte too low to justify the length. Class 5 is reached only by `F4` followed by `90` or above. An implementation that reports class 3 for `C0 AF` is not wrong about the input, but it is wrong about the code, and diagnostic codes are part of the conformance surface.

**Noncharacters are not rejected.** `U+FFFE` and `U+FFFF` are well-formed UTF-8 and are accepted here; they are a Unicode-semantics question, not an encoding one, and the invisible-character work in `AEG-1002`/`AEG-1003` is where they belong if anywhere.

**A byte order mark at the start of the file is `AEG-1008` and is fatal.** A leading `U+FEFF` is rejected, not stripped. Stripping it would shift every byte offset by three, and a span is an offset into the raw file bytes (I2); accepting it would put the mark inside the first token's span, where no author put it. The help text is literal, because the fix is: *save the file as UTF-8 without a byte order mark*. This will be the most frequently hit diagnostic in the catalogue for contributors on editors that add a mark by default.

A `U+FEFF` at any other offset is an ordinary character for now. **OPEN:** it belongs with the invisible-character and confusable work in `AEG-1002`/`AEG-1003`, and is deliberately not decided here.

**A NUL byte anywhere in the source is `AEG-1009` and is fatal.** `U+0000` is valid UTF-8 and is never valid AEGIS, including inside a string literal. It is detected before scanning because the early message is the useful one: a NUL almost always means the file is binary or was saved as UTF-16, and the help text says exactly that. Discovering it at scan time would produce a puzzling complaint about an unexpected character instead.

**No normalisation is ever performed.** An implementation MUST NOT apply NFC, NFD, NFKC, NFKD, case folding, or any other transformation to source text at any stage. Two consequences are normative: spans are offsets into the raw file bytes as authored, and every lexical check operates on those same raw bytes.

The reasoning is worth recording, because the opposite choice looks harmless. Identifiers are ASCII-only (section 1.6), so normalisation buys nothing where homoglyph attacks actually matter. Inside a string literal, normalisation would silently rewrite author-visible text - a disclosure notice, a rule reason, a channel name - and that text is hashed as policy identity. A compiler that quietly alters the words of a legally binding artifact is not acceptable at any price in convenience.

Bidirectional override characters anywhere in the source are `AEG-1002`. Confusable homoglyphs are `AEG-1003`, which applies **only to string literals and quoted names**; an identifier cannot contain a confusable, because a non-ASCII byte in an identifier is already `AEG-1004`.

### 1.2 Hard limits

**All limits are inclusive maxima. A value equal to the limit is legal; a value exceeding it is the stated diagnostic.** An identifier of exactly 128 bytes compiles; 129 bytes is `AEG-1012`. This sentence governs every row of the table below and every other numeric limit in this document.

| Limit | Value | Diagnostic | Detected by |
|---|---|---|---|
| Source size | 4 MiB | AEG-1010 (fatal) | lexer |
| Line length | 4,096 bytes | AEG-1011 | lexer |
| Identifier length | 128 bytes | AEG-1012 | lexer |
| Decimal significant digits | 38 | AEG-1014 | lexer |
| Duration magnitude | 1 ms to 100 y inclusive | AEG-1019 | lexer |
| Diagnostics per file | 200 | AEG-1006 (fatal for that file) | lexer |
| Diagnostics per build | 2,000 | AEG-0001 (fatal for the build) | driver |
| Quoted name length | 256 characters | AEG-3083 | parser |
| Quoted name character set | `[A-Za-z0-9_./:-]` | AEG-3080 | parser |
| Quantifier nesting depth | 3 | AEG-3081 | parser |
| Import graph depth | 32 | AEG-3082 | loader |
| Collection cardinality | 4,096 | AEG-4160 | checker |
| Concatenated string value | 64 KiB | AEG-4170 | checker |

<!-- retired-ok: AEG-1015 -->
There is deliberately **one limit per axis, at the layer that owns the axis**. `AEG-1011` bounds a single physical line in bytes, which is a lexical fact. The size of a string *value* is a semantic fact, because adjacent string literals concatenate at parse time (section 1.7), so it is bounded separately at 64 KiB by `AEG-4170`. The old lexical code `AEG-1015` stays retired: it measured the wrong thing at the wrong layer.

Only the first six rows are lexical. The rest are detected by the first component that can actually see the construct, and each code sits in that component's range.

**Diagnostic caps are two-level.** 200 per file stops that file; 2,000 across a build stops the build with `AEG-0001`. Without the second, a forty-file bundle could emit eight thousand diagnostics under the per-file cap alone, which is the memory-growth hazard the cap exists to prevent (I11).

**Duration range** is evaluated on the canonical millisecond value, not on the written unit. The permitted closed interval is 1 ms to 3,153,600,000,000 ms, where 100 y = 36,500 d = 3,153,600,000,000 ms. `0s` is `AEG-1019`. `36501d` is `AEG-1019`, even though `100y` is legal.

**Significant digits** for `AEG-1014` are the digits of the coefficient after removing underscores and after removing leading zeros of the integer part. Trailing zeros in the fractional part are **not** removed, because they carry declared scale. Therefore `10_000` has 5, `0.85` has 2, `1.500` has 4, `0.0085` has 2, and `0` has 1.

**Underscores** are legal as separators inside the integer part and inside the fractional part of a numeric literal. They are illegal leading, illegal trailing, illegal adjacent to the decimal point on either side, and illegal doubled. `1_000.000_1` is legal; `_1`, `1_`, `1_.0`, `1._0`, and `1__0` are `AEG-1005`.

### 1.3 Line terminators and whitespace

**LF (U+000A) is the sole line terminator.**

A CR (U+000D) immediately preceding an LF is part of that terminator. A CRLF file therefore lexes identically to an LF file, and the CR is **not** part of the line's text.

A CR in any other position is `AEG-1007`, "carriage return not followed by a line feed". A lone CR makes column counting and line-length measurement ambiguous - is it a terminator, or a character on the line? - and an ambiguous position is an I2 violation, because two implementations would report different columns for the same byte. It is detectable in one forward pass with one byte of lookahead, so the check costs nothing.

**U+0085 NEL, U+2028 LINE SEPARATOR, and U+2029 PARAGRAPH SEPARATOR are ordinary characters and are never line terminators.** This is stated explicitly because it is the single most likely place a contributor will add Unicode awareness helpfully: a scanner that treated U+2028 as a terminator would make line numbers depend on the Unicode version in use, and would let a policy's rendered line numbering differ from what every editor and diff tool shows.

Whitespace is space and tab only, and is insignificant except as a token separator. Whitespace and line terminators are trivia (section 1.4).

### 1.4 Comments

`//` begins a line comment. `///` begins a doc comment. Maximal munch applies, so `////` is a single line comment whose text begins with `/`. Block comments do not exist.

**Comments are trivia.** The lexer MUST NOT emit a syntactic token for a comment. It MUST retain each comment's exact bytes and span as *leading trivia* on the next token, so that reprinting the token stream together with its trivia reproduces the source **byte for byte**. Whitespace and line terminators are trivia by the same mechanism and the same rule.

A doc comment is trivia carrying the flag `doc`. **Attachment happens in the parser**, which is the only component that knows what a declaration is; requiring the lexer to attach would force a dependency on the AST that the layering forbids. A doc comment that does not immediately precede a declaration is warning `AEG-2091`. Doc comment text MUST be carried into the audit report - I5.

### 1.5 Keywords

The keyword set is closed. It contains **77 unique words**, admitted by the rule in section 1.5.1 and by nothing else.

**Structural (5):** `specification` `package` `import` `as` `export`
**Declaration (12):** `policy` `rule` `capability` `principal` `resource_class` `obligation` `advice` `schema` `enum` `const` `test` `suite`
**Effect (11):** `allow` `deny` `require` `permit` `escalate` `redact` `throttle` `halt` `otherwise` `unless` `when`
**Combining (8):** `combining` `deny_overrides` `permit_overrides` `first_applicable` `only_one_applicable` `unanimous` `deny_unless_permit` `permit_unless_deny`
**Targeting (5):** `applies_to` `cites` `on` `violation` `default`
**Logic (17):** `and` `or` `not` `implies` `xor` `in` `contains` `matches` `if` `then` `else` `forall` `exists` `count` `any` `all` `none`
**Temporal (7):** `within` `before` `after` `since` `until` `during` `now`
**Values (3):** `true` `false` `some`
**Binding and assertion (9):** `to` `reason` `given` `expect` `fired` `stable` `is` `on_failure` `decision`

`none` appears once, in Logic. It has exactly one token kind and the parser interprets it by position: quantifier head in `none(v in C : P)`, absence in `x is none`. Earlier drafts listed it twice; that was a listing error, not two words.

`decision` is a **contextual keyword with exactly one legal position**: the test expectation `expect decision stable`. It is a keyword there because no identifier can stand in that position. It is legal nowhere else, and in particular it is not a value, not a request root, and not usable in an expression. Anywhere else, `AEG-3070` reports it as a keyword in an illegal position.

**Reserved and forbidden (29).** Using one is `AEG-1030`, whose message MUST name the invariant or the scope rule that forbids it. These words lex as a single reserved kind so that the error is precise and so that the design cannot be pressured into them later by accident.

`macro` `template` `extends` `abstract` `async` `await` `yield` `spawn` `import_dynamic` `unsafe` `native` `loop` `while` `recurse` `mut` `ref` `ptr` `type` `fixture` `set` `target` `where` `oblige` `always` `eventually` `at` `for` `ago` `between`

The last twelve are reserved for a different reason from the first seventeen. They were listed as keywords in earlier drafts but had no grammar production and no semantics anywhere in this document. Rather than ship a keyword that does nothing, scope discipline reserves them: they error loudly today and remain available to a future amendment that actually specifies them. `between` in particular is removed as sugar for two comparisons that is not worth a precedence level of its own.

### 1.5.1 Keyword admission rule (normative)

> **A word is a keyword only if it appears in a syntactic position where an identifier could not appear.**

Everything else is a predeclared identifier or an enum member. This rule exists so that the question "is this word a keyword?" has one mechanical answer forever, and so that the keyword set stops growing every time a declaration gains a field.

**One exception, narrowly drawn.** Literal forms are keywords even though an identifier could stand in their position, because they denote values rather than name them: `true`, `false`, `some`, `none`, `now`. They are therefore not shadowable.

**Predeclared identifiers.** These are ordinary identifiers bound in a prelude scope, lexed as identifiers, resolved by the checker. Shadowing one is `AEG-4011`.

| Group | Names |
|---|---|
| Request roots (closed set of 9) | `subject` `action` `resource` `context` `model` `evals` `trace` `human` `clock` |
| Constructors and pure functions | `money` `duration` `percent` `convert` `eval` `card` `is_some` `is_none` |
| Obligation and effect actions | `audit` `notify` `disclose` |

`money(...)`, `duration(...)`, and `percent(...)` are therefore **calls**, not literal syntax and not keywords. See section 1.7.

**Contextual field labels.** The label position inside a declaration body is a position where an identifier can appear, so labels are identifiers matched by the parser against the declaration being parsed, not keywords: `tool` `criticality` `reversible` `data_classes` `description` `role` `scope` `mfa` `jurisdiction` `retention` `action`. Two of these read like keywords and are not: `action` is both a request root and the obligation label, and `scope` is a principal label that earlier drafts listed as a keyword.

**Enum members.** The values these labels accept are members of predeclared enums, resolved nominally by the checker against the declared field type. They are identifiers: `low` `medium` `high` `critical` (`criticality`), `workspace` `tenant` `global` (`principal_scope`), `required` `optional` (`mfa_requirement`). Predeclared enums are specified in `docs/09-stdlib.md`.

**Demotions recorded for the avoidance of doubt.** `action` and the other eight request roots, `low`/`medium`/`high`/`critical`, `workspace`/`tenant`/`global`, `required`/`optional`, `scope`, `money`, `duration`, and `percent` were keywords or keyword-shaped in earlier drafts and are now identifiers. `to`, `reason`, `given`, `expect`, `fired`, `stable`, `is`, `on_failure`, and `decision` were terminals used by the grammar without ever being listed and are now keywords.

`decision` is admitted by the rule rather than by enumeration, but **only in one position**: `expect decision stable`, where no identifier can stand. It is a contextual keyword, not a general one. The expression form `when decision == permit` that appeared in earlier drafts is **deleted** from the language: it put `decision` in a position where an identifier could stand, which the admission rule forbids, and it named something no scope bound. Obligations now attach to an effect directly (section 3.8).

### 1.6 Identifiers

Three lexical classes, ASCII only.

| Class | Pattern | Used for |
|---|---|---|
| `ident` | `[a-z][a-z0-9_]*` | declarations, attributes, field labels, enum members, quantifier variables |
| `TypeIdent` | `[A-Z][A-Za-z0-9_]*` | type names: `Bool` `String` `Timestamp` `Duration` `Decimal` `Percent` `Money` `Set` `Record` `Optional` `Enum` |
| currency | `[A-Z]{3}` | currency codes, e.g. `EUR` |

A currency code is **lexed as a `TypeIdent`** and disambiguated by the parser from its position as the second argument of `money(...)` or the `to:` argument of `convert(...)`. The lexer performs no currency validation whatsoever; validity against ISO 4217 is a check-time concern, `AEG-4140`. This is the only sound arrangement, because `EUR` and `Set` are indistinguishable to a scanner with one token of lookahead.

**Every `TypeIdent` matching `^[A-Z]{3}$` is reserved as a currency code**, whether or not it is a live ISO 4217 code. Declaring a type named `EUR`, `XYZ`, or `ABC` is `AEG-3023`. The reservation is deliberately table-independent: if legality depended on membership of the currency table, the same source would compile or fail according to which table revision was in force, and a compile outcome that varies with a data file is an I2 violation waiting to happen.

Non-ASCII in any identifier class is `AEG-1004`. Non-ASCII is rejected outright to prevent homoglyph substitution in text that carries legal weight, which is also why `AEG-1003` does not apply to identifiers: there is nothing left for it to catch.

The 128-byte limit (`AEG-1012`, inclusive) applies to `ident` and `TypeIdent` alike.

### 1.7 Literals

**Five literal lexemes.** Exactly these forms are produced by the lexer as single tokens.

| Kind | Form | Notes |
|---|---|---|
| Integer | `10_000` | Underscore rules in section 1.2. Exponent notation is `AEG-1057`. |
| Decimal | `0.85` | Arbitrary precision. No float conversion at any stage. |
| Duration | `5m` `30d` `1y` | One token. See below. |
| String | `"text"` | Single-line. Escapes: `\"` `\\` `\n` `\t`. No interpolation. |
| Boolean | `true` `false` | |

**Three forms that look like literals and are not.** Each is built by the parser from several tokens, which is what allows the lexer to stay context-free and one-token-lookahead.

| Form | Lexes as | Built by |
|---|---|---|
| `money(10_000, EUR)` | ident `money`, `(`, integer, `,`, TypeIdent, `)` | parser, as a call |
| `85%` | decimal or integer, then `%` | parser, as a Percent literal |
| `{ a, b, c }` | `{`, expressions, `}` | parser, as a set literal, canonically ordered at IR time |

**Duration** is one token and the only place where a number and a following letter sequence fuse. Maximal munch applies: digits immediately followed, with no intervening whitespace or comment, by one of `ms` `s` `m` `h` `d` `w` `y`. `y` is exactly 365 d and `w` is exactly 7 d, because calendar arithmetic is timezone-dependent and therefore forbidden by I2. `5 m` is two tokens and fails in the parser, not the lexer. A non-integer magnitude such as `1.5h` is `AEG-1056`. An unknown unit such as `30days` is `AEG-1055`. A magnitude outside the range in section 1.2 is `AEG-1019`.

**String** literals may not span a line. Unterminated at end of line is `AEG-1041`; unterminated at end of file is `AEG-1042`; an unknown escape is `AEG-1040`. There is no interpolation, because policy text must be statically readable by an auditor.

**Adjacent string literals concatenate at parse time.** Two or more string literals separated only by whitespace, line terminators, or comments join into one value, in source order, with nothing inserted between them:

```aegis
reason "This action was refused because the transfer is irreversible "
       "and no fresh human approval was on record at the moment of the "
       "request. See the linked evidence record for the exact bindings."
```

There is no operator, no runtime cost, and no ambiguity: the join happens in the parser and the result is a single literal in the IR. The lexer emits one token per literal and performs no joining.

This exists for a specific regulatory reason. An Article 50 transparency notice, a `description`, or a substantial `reason` cannot fit inside a 4,096-byte line, and the alternative - a multi-line string - would make the line-length limit unenforceable and the caret rendering ambiguous. The joined value is bounded at 64 KiB by `AEG-4170`, checked after concatenation, which is where the size of a value can first be known.

Concatenation applies to string literals in value positions: `reason`, `description`, expression operands, and `expect reason contains`. It does **not** apply to a quoted name (`tool`, `role`), to the `specification` version, or to a `test` or `suite` name. Those four are **identities, not prose**: each is hashed as part of policy identity or used as a uniqueness key, so each must be a single literal whose bytes are visible in one place. Joining an identity from fragments would let two declarations that look different hash the same, or the reverse.

**Reserved semantics.** Section 1.5 reserves *words*. This reserves *meanings*, which is the other way a language drifts: nobody adds a keyword by accident, but everybody reaches for a familiar operator.

| Token | Status in AEGIS | Absent meaning, and why | Diagnostic |
|---|---|---|---|
| `%` | postfix percent | no modulo; sign behaviour on negative operands has two defensible answers | - |
| `!` | only as part of `!=` | negation is `not`; a lone `!` is too easy to miss in a legal artifact | AEG-1005 |
| `&` `\|` `^` | unavailable | bitwise operations have no governance meaning | AEG-1005 |
| `&&` `\|\|` | unavailable | use `and` and `or`; two spellings of one operator is two ways to read a rule | AEG-1005 |
| `~` | unavailable | no bitwise negation, and no regex-match sugar; matching is `matches` | AEG-1005 |
| `<<` `>>` | unavailable | no shifts, no stream operators | AEG-3070 |
| `**` | unavailable | no exponentiation; it is the shortest route to unbounded magnitude (I11) | AEG-3070 |
| `++` | unavailable | no increment; there is no mutable state to increment | AEG-3070 |
| `?` | unavailable | no ternary; use `if C then A else B`, which reads aloud | AEG-1005 |
| `?.` | unavailable | **Optional is discharged with `is`, never silently propagated** | AEG-1005 |
| `=>` `->` | unavailable | no lambdas, because there are no functions | AEG-3070 |
| `::` | unavailable | package paths use `.` | AEG-3070 |
| `@` `#` `$` | unavailable | reserved for a future annotation syntax | AEG-1005 |

`?.` is the most consequential row. It is the first thing a TypeScript-trained contributor reaches for, it looks like a convenience, and it directly violates I7: optional chaining turns an absent value into another absent value and defers the decision, which is precisely the deferral that fail-closed forbids. An `Optional` in AEGIS is discharged where it is read, by a construct the auditor can see.

There is no modulo operator in AEGIS and there will not be one. A language whose output is used to answer regulators cannot ship an operator whose result depends on which rounding convention the implementer happened to know. No governance policy has needed it. `85 % 2` is therefore a Percent literal followed by an integer, and the parser reports it with `AEG-3070` carrying help that says so.

**Delimiters and operators - the complete set.**

| Group | Tokens |
|---|---|
| Brackets | `{` `}` `(` `)` `[` `]` |
| Separators | `,` `.` `:` |
| Assignment | `=` |
| Comparison | `==` `!=` `<` `<=` `>` `>=` |
| Arithmetic | `+` `-` `*` `/` |
| Postfix | `%` |

Nothing else is punctuation. **`;` is not in the language**; AEGIS is newline-insensitive and needs no statement terminator. Any character outside this table, outside a literal, and outside a comment is `AEG-1005`, including `;` `!` `?` `~` `&` `|` `^` `@` `#` `$` `\` and any control character other than a line terminator or a tab.

Maximal munch resolves every overlap: `//` before `/`, `///` before `//`, `<=` before `<`, `!=` before a lone `!` which has no meaning of its own. Note the consequence, deliberately accepted: `3 // 2` is an integer followed by a comment, not a division. There is no integer-division operator and no lexical ambiguity, only a reading that a formatter should make obvious.

### 1.8 Positions and spans

| Property | Decision |
|---|---|
| Span | Half-open `[start, end)` over **raw file bytes**, **0-based** |
| Rendered line and column | **1-based**, as in `payments.aegis:31:12` |
| Column unit | **Unicode scalar values**, not bytes and not grapheme clusters |
| Tab | One column; renders as one space in the caret line |
| Line length limit | Measured in **bytes** (`AEG-1011`) |

**The line-length limit measures the line's text and excludes its terminator.** A line of exactly 4,096 bytes followed by CRLF is legal, and so is the same line followed by LF. Counting the terminator would make the same text legal or illegal depending on how the file was saved, which is the sort of accident that produces a diagnostic nobody can reproduce.

**A file ending in LF does not gain a final empty line.** A file of three lines each ending in LF has three lines, not four, and its last reportable position is at the end of line three.

**A file not ending in LF is legal.** Its last line simply has no terminator. Whether to add one is a formatter question, not a lexer one, and no diagnostic is emitted for it.

**A byte offset equal to the file length is a valid position.** It is the end-of-file position, and it renders as the end of the last line. `eofToken`'s span is zero-width there. This is what makes "expected a declaration, found end of file" reportable at a real location rather than at a sentinel.

Two different units appear on one axis: `AEG-1011` counts bytes while a column counts scalar values. That is acceptable only because it is now stated. The byte count is what bounds memory; the scalar count is what makes a caret land where the author's editor puts the cursor.

A token stores its span and nothing else about position. Line and column are derived on demand from a line index, so that the scanner's hot path stays branch-light and so that no token can carry a stale position.

### 1.9 Lexical error recovery

### 1.9 Lexical pipeline order and error recovery

**The pipeline order is normative.** Each stage may assume its predecessors succeeded.

```
bytes -> size check -> UTF-8 validity -> BOM check -> NUL check -> line index -> scan
```

Validation precedes the line index deliberately: the index walks bytes looking for terminators, and it is entitled to assume the bytes are valid UTF-8. An index built over invalid bytes would produce positions that no editor agrees with, which is worse than no index at all.

**Exactly one diagnostic per lexeme.** Where several could apply, the first match in this order wins, and the others are suppressed:

```
AEG-1010  file too large                             fatal, pre-scan
AEG-1001  invalid UTF-8                              fatal, pre-scan
AEG-1008  byte order mark at start of file           fatal, pre-scan
AEG-1009  NUL byte in source                         fatal, pre-scan
AEG-1007  carriage return not followed by a line feed
AEG-1002  bidirectional override
AEG-1004  non-ASCII identifier
AEG-1005  unexpected character
literal-form codes    AEG-1040 1041 1042 1055 1056 1057
limit codes           AEG-1011 1012 1014 1019
```

`AEG-1007` precedes `AEG-1005` because a lone CR would otherwise be reported as a merely unexpected character, which tells the author nothing about the line ending that produced it.

**The first four are fatal and pre-scan: report exactly one diagnostic and stop.** No token stream is produced, not one token, **not even EOF**, and no later stage is attempted. This is not a truncated lex; it is a file that could not be lexed at all, and a caller that received a token stream from it would be entitled to believe otherwise.

**`AEG-1006` is fatal but mid-scan.** The 200-diagnostic cap is reached with a partial token stream already built, so that stream is returned and it ends with EOF like any other.

**Every other lexical error skips the offending lexeme and continues**, so that one pass reports every lexical defect in the file rather than one per compile.

**Diagnostics are capped at 200 per file.** On reaching the cap the lexer emits `AEG-1006` and stops lexing that file. A second cap of 2,000 diagnostics across a whole build is enforced by the driver and stops the build with `AEG-0001`. An unbounded diagnostic list on hostile input is a memory-growth hazard, and I11 does not stop being true because the input is invalid.

**Where a token stream exists, it ends with exactly one EOF token.** For an empty file - which is valid - the stream is EOF alone, with span `[0, 0)`. After a mid-scan fatal, EOF sits zero-width at the offset where scanning stopped. A parser handed a token stream may therefore assume EOF without a special case; a parser handed a pre-scan failure is handed no stream to parse.

---

## 2. Program structure

A compilation unit MUST begin with `specification "<version>"`, then exactly one `package` declaration, then zero or more `import` declarations, then declarations in any order. Declaration order MUST NOT affect meaning; binding is two-pass. Missing `specification` is `AEG-3001`. Missing `package` is `AEG-3002`. Package name not matching directory path is `AEG-3003`. Circular import is `AEG-3010`, reported with the full cycle. Import graph depth beyond 32 is `AEG-3082`.

A declaration identifier MUST be unique within a compilation unit across every declaration kind - `capability`, `principal`, `resource_class`, `enum`, `schema`, `const`, `policy`, `obligation`, `advice`, `suite`. A collision is `AEG-3022`, reported with both spans. **The check is local to the compilation unit**: two packages may each declare `transfer_funds`, because a package namespaces its declarations, and a cross-package coincidence of names is not an error. A collision between an import alias and a local declaration identifier **is** an error, `AEG-3025`, because the two would be indistinguishable at a use site.

Two narrower duplicates keep their own codes because their messages can say more: duplicate `tool` name is `AEG-3021` and duplicate rule identifier within a policy is `AEG-3040`.

---

## 3. Declarations

### 3.1 capability

Fields: `tool` (quoted name, MUST be unique in the unit), `criticality` (member of predeclared enum `criticality`: `low` | `medium` | `high` | `critical`), `reversible` (Bool), `data_classes` (set), `description` (optional string). Missing required field is `AEG-3020`. Duplicate tool name is `AEG-3021`. An irreversible `high` or `critical` capability with no human gate anywhere in the unit is warning `AEG-2010`.

Field labels and field values here are identifiers, not keywords, per section 1.5.1. The parser matches the label against the declaration it is parsing; the checker resolves the value against the field's declared enum type.

### 3.2 principal

Fields: `role` (quoted name), `scope` (member of `principal_scope`: `workspace` | `tenant` | `global`), `mfa` (member of `mfa_requirement`: `required` | `optional`).

### 3.3 resource_class

Fields: `data_classes` (set), `jurisdiction` (set), `retention` (optional Duration).

### 3.4 enum

Ordered variants. Ordering is significant and defines the comparison relation. `enum risk_tier { minimal, limited, high, unacceptable }` makes `model.risk_tier <= limited` meaningful.

### 3.5 schema

Declares the request surface. Every attribute path used anywhere MUST be declared in some schema. Undeclared attribute access is `AEG-4010`, with a did-you-mean suggestion. There is no dynamic attribute access.

**A schema's name is the request root it constrains, and it MUST be one of the nine.** Schemas do not float:

```aegis
schema resource {
  reviewers : Set[Record{ id: String, role: String }]
  amount    : Money[EUR]
}

schema context { region : String, channel : String }
```

`schema request { ... }` is illegal, because `request` is not a root: `AEG-3024`, with the nine legal names listed in the help line. Before this was settled, a schema named `request` declaring `reviewers` and a rule referring to `resource.reviewers` could both look correct while agreeing about nothing.

**Schemas do not merge.** Exactly one schema per root, in exactly one package. No contributions from imports, no field merging, no extension, no reopening. A second schema for a root within the unit is `AEG-3022`; a schema for a root that an imported package has already declared is `AEG-3026`.

The rationale is worth recording, because a shared schema library sounds obviously useful. Cross-package field merging would make a root's type depend on the import set, so the same policy text would mean different things in different bundles - and would typecheck in one and not another. That is an I2 violation dressed up as a convenience. A team that wants a shared request surface declares it once, in one package, and imports the policies rather than the fields.

The nine request roots are predeclared identifiers bound in the prelude scope, not keywords (section 1.5.1). Shadowing one with a declaration identifier, a `const`, or a quantifier variable is `AEG-4011`, because a policy in which `action` means something other than the action under evaluation is unreadable by the auditor who has to accept it.

### 3.6 policy

MUST declare `combining` (there is no default - `AEG-3030`), `applies_to` (`AEG-3031`), at least one `rule` (`AEG-3032`). MAY declare `cites`, `default`, and `on violation`. `default permit` produces loud warning `AEG-2020` and MUST be highlighted in the audit report. `combining first_applicable` always produces warning `AEG-2021` because it is the only order-sensitive algorithm.

### 3.7 rule and desugaring

Three surface forms desugar to one core form. Desugaring MUST be total and span-preserving.

| Surface | Core condition | Core effect |
|---|---|---|
| `deny C unless G` | `C and not G` | Deny |
| `require C otherwise E` | `not C` | E |
| `allow C when G` | `C and G` | Permit |

Core form: `Rule(id, condition: Expr[Bool], effect, reason, obligations)`.

Rule identifiers MUST be unique within a policy (`AEG-3040`). A `reason` string is MANDATORY on any rule that can deny or escalate (`AEG-3041`) - I8.

### 3.8 obligation and advice

An `obligation` attaches to a **decision effect**, not to a condition on a decision value:

```aegis
export obligation attach_ai_disclosure {
  on permit when context.channel == "external" {
    disclose(text: eu.transparency_notice())
  }
  on deny {
    audit.emit(severity: medium, evidence: full_trace)
  }
  on_failure deny
  cites eu.article(50)
}
```

An obligation MUST declare at least one `on <effect>` block and exactly one `on_failure` (`AEG-3050`). The trigger effect is `permit` or `deny`. A block MAY carry a `when` guard.

**The guard is constrained.** It is a Bool expression over the request roots and `const` declarations only. It MUST NOT reference `decision`, which does not exist in expression position; it MUST NOT reference an obligation, an advice, or another obligation's discharge state; and it MUST NOT reference a rule, a rule's firing, or a policy's outcome. Violations are `AEG-4010` for an unknown name and `AEG-4130` for a construct that would require the evaluator to observe its own decision process. The trigger already carries the decision; a guard that could also inspect rules would make obligations order-dependent on rule evaluation, and I2 does not survive that.

The earlier form `when decision == permit and <condition>` is deleted. It placed `decision` in an expression position, which the keyword admission rule forbids, and it referenced a name that no scope bound. The `on <effect> [when <guard>]` form expresses exactly the same thing with the trigger and the guard separated, which is also how the audit report reads it: "on permit, where the channel is external, disclose ...".

Obligations are binding: the PEP MUST discharge them, and failure to discharge MUST fail closed. `advice` is non-binding, keeps its `when <condition>` form because it never mentions a decision, and MUST NOT affect the outcome.

### 3.9 test

`given` blocks MUST validate against a declared schema (`AEG-4020`). `expect` assertions cover decision, rule firing, reason content, obligations, and `decision stable` (determinism). In release mode a unit with a failing test MUST NOT compile (`AEG-3060`).

---

## 4. Type system

Nine normative rules.

1. **No implicit conversion.** Ever, between any two types.
2. **Currency is part of the Money type.** `Money[EUR]` and `Money[USD]` are distinct and incomparable (`AEG-4101`).
3. **No floating point.** Decimal is arbitrary-precision, sign plus scaled integer.
4. **No null.** Absence is `Optional[T]` and MUST be explicitly discharged before use (`AEG-4110`).
5. **Comparison operators are non-associative.** `a < b < c` is `AEG-4120`, not a misparse.
6. **Logical operators accept only Bool.** No truthiness coercion (`AEG-4121`).
7. **Enums are ordered and nominal.** Cross-enum comparison is `AEG-4102`.
8. **`Percent` is a subtype of `Decimal`.** Subtyping is a partial order; subsumption applies at argument and comparison positions.
9. **Type checking is bidirectional with local inference only.** No global unification, no type-level computation (`AEG-4130` for any construct requiring it).

---

## 5. Expressions

### 5.1 Precedence, lowest to highest

| Level | Operators | Associativity |
|---|---|---|
| 1 | `implies` | right |
| 2 | `or` `xor` | left |
| 3 | `and` | left |
| 4 | `not` | prefix |
| 5 | `==` `!=` `<` `<=` `>` `>=` | **non-associative** |
| 6 | `in` `contains` `matches` `is` | non-associative |
| 7 | temporal: `within` `before` `after` `since` `until` `during` | non-associative |
| 8 | `+` `-` binary | left |
| 9 | `*` `/` | left |
| 10 | `-` unary | prefix |
| 11 | member access, call, index, `%` | postfix |

`between` is removed from level 6 and reserved-forbidden; it was sugar for two comparisons and did not earn a precedence level. `is` occupies the vacancy and carries Optional discharge (section 5.5).

**Unary minus** at level 10 binds tighter than `*` and `/`, so `-a * b` is `(-a) * b`. It exists because negative amounts must be expressible: refunds, chargebacks, reversals, and credit adjustments are core governance cases, and until now the language could not write one. Unary minus on a `Money[CUR]` yields `Money[CUR]`; on `Decimal` yields `Decimal`; on `Percent` yields `Decimal`, because a negative percentage is not a percentage of anything and the subtype buys nothing there.

### 5.2 Quantifiers

**Quantifier bodies are delimited. The parentheses are mandatory.**

```
quant "(" ident "in" collection ":" body ")"
```

```aegis
count(r in resource.reviewers : r.role == "legal.approver") >= 2
forall(r in resource.reviewers : r.mfa is some m)
exists(a in resource.attachments : a.data_class == "special_category")
```

Six quantifier heads: `forall`, `exists`, `count`, `any`, `all`, `none`. The delimiter is not decoration. Without it the body is an `expr` that extends as far to the right as it can, so `count r in c : r.role == "x" >= 2` parses its body as `r.role == "x" >= 2` - a non-associative comparison chain, `AEG-4120` - and the parse the author intended is not derivable at all. Parentheses make the body a closed subexpression, so the intended parse becomes the only parse.

The collection MUST have statically known maximum cardinality; exceeding 4,096 is `AEG-4160`, detected by the checker, which is the first component that knows a collection's declared size. Nesting depth MUST NOT exceed 3; exceeding it is `AEG-3081`, detected by the parser, which is the first component that can count nesting. This is the only form of iteration in the language - I1.

### 5.3 Temporal operators

Evaluated over the finite `trace` attribute and the injected logical `clock`. Six operators: `within D`, `before T`, `after T`, `since T`, `until T`, `during W`. `now` resolves to `clock.now`, which is injected, never read from the host - I3.

`always`, `eventually`, `at`, `for`, and `ago` are reserved-forbidden (section 1.5). They were listed as temporal keywords in earlier drafts with no production and no semantics. Freshness is expressed with `within`, which is sufficient for the Article 14 idiom that motivated the family: `human.approved_by(reviewer) within 5m`, and for a timestamp, `human.approved_at within 2m`.

### 5.4 Builtins

`money(n, CUR)`, `convert(m, to:, rate:)`, `eval(name)` (returns `.score` and `.age`), `human.approved_by(p)`, `audit.emit(severity:, evidence:)`, `notify(target)`, `disclose(text:)`, `redact(field)`, `throttle(rate:)`. These are predeclared identifiers resolved in the prelude scope (section 1.5.1), not keywords, and shadowing one is `AEG-4011`. An unknown currency code passed to `money` or `convert` is `AEG-4140`; a `duration(n, unit)` call outside the range in section 1.2 is `AEG-4141`. Regex via `matches` is RE2 only; backreferences and lookaround are `AEG-4103` - I11.

### 5.5 Optional discharge

Absence is `Optional[T]` and MUST be discharged explicitly before the value is used (`AEG-4110`, type rule 4). The discharge form is the `is` test:

```
is_expr = expr "is" ( "none" | "some" ident )
```

`x is none` yields Bool. `x is some v` yields Bool and binds `v : T`, narrowing `Optional[T]` to `T` inside the scope defined below and nowhere else. The rule is deliberately narrow, because a scoping rule that requires reasoning about which branch "holds" is a rule that authors and auditors will get wrong. It is defined by recursion on the expression, not by operand position: a positional rule cannot see through a chain of `and`.

**Binding introduction - normative.** Define `binds(E)`, the set of names an expression introduces in positive position, recursively:

```
binds(E is some v)   = { v }
binds(A and B)       = binds(A) union binds(B)
binds(A implies B)   = { }        -- nothing escapes an implication
binds(A or B)        = { }
binds(A xor B)       = { }
binds(not A)         = { }
binds(anything else) = { }
```

**Scope rule - two clauses, and no others.**

- In `A and B`, every name in `binds(A)` is in scope throughout `B`.
- In `A implies B`, every name in `binds(A)` is in scope throughout `B`.

Nowhere else. Not in a sibling rule, not in another rule's condition, not in a `reason` string, and not to the left of the test that introduced it.

Four consequences, all normative.

**1. Chains of any length work, because `binds` distributes over `and`.** This is the case a positional rule cannot express:

```aegis
deny resource.primary_reviewer   is some v
 and resource.secondary_reviewer is some w
 and v.id == w.id
  reason "The two approvers must be different people."
```

That parses left-associatively as `((v-test and w-test) and v.id == w.id)`. The outer `and`'s left operand is itself an `and` node, not an `is some` test, so a rule phrased in terms of "the left operand is an `is some` test" would bind nothing in the third operand and reject both names. Under `binds`, `binds(v-test and w-test) = {v, w}`, and both are in scope in the third operand. The recursion is what makes the headline safety feature usable with two Optionals at once.

**2. An implication is a binding barrier.** `binds(A implies B) = { }`, so `(resource.reviewer is some v implies p) and v.x` is `AEG-4012`. This is deliberate: `v` is known to exist only on the branch where the antecedent held, and an implication as a whole is true precisely when the antecedent is false. A name that may have been introduced by a condition that did not hold is not a name.

**3. Two bindings with the same name anywhere in one chain is `AEG-4013`.** `binds` is a set union, so a collision is ambiguity rather than shadowing: `a is some v and b is some v and v.x` has no defensible reading, and picking one silently is exactly the class of decision this language exists to refuse.

**4. `not (a is some v)` binds nothing**, even though the negation is informative - it tells you `a` is absent. Fail-closed applies to type information too: the compiler declines to carry a fact whose usefulness depends on which branch a reader is thinking about.

**Position table - derived from `binds()`, non-normative where the two disagree.** It remains a correct summary of what each operator position does, and `binds` is the definition.

| Position of `E is some v` | `v` is in scope in | Why |
|---|---|---|
| left operand of `and` | the right operand | the right operand is evaluated only where the left held |
| antecedent of `implies` | the consequent | the consequent is asserted only where the antecedent held |
| either operand of `or` | nowhere | either operand may be the one that held |
| either operand of `xor` | nowhere | as `or`, and the exclusivity makes it worse |
| operand of `not` | nowhere | the binding exists precisely where the negation does not |
| right operand of `and`, consequent of `implies` | nowhere further | nothing to the right of it remains in the expression |
| anywhere else | nowhere | including a sibling rule, another rule's condition, and any `reason` string |

Referencing a name outside its scope is `AEG-4012`, whose help names the two legal positions. A colliding or shadowing binding is `AEG-4013`.

```aegis
// Legal: left operand of `and`, so r is in scope on the right.
deny resource.reviewer is some r and r.role != "finance.approver"
  reason "The assigned reviewer does not hold the approver role."

// Legal: antecedent of `implies`, so m is in scope in the consequent.
require resource.reviewer is some m implies m.mfa == required
  otherwise deny
  reason "An assigned reviewer must hold MFA."

// Legal: binds distributes over `and`, so both names reach the third operand.
deny resource.primary_reviewer is some v
 and resource.secondary_reviewer is some w
 and v.id == w.id
  reason "The two approvers must be different people."

// AEG-4012: `or` binds nothing, because either side may be the side that held.
deny resource.reviewer is some r or r.role == "x"

// AEG-4012: the binding does not survive `not`.
deny not (resource.reviewer is some r) and r.role == "x"

// AEG-4012: an implication is a barrier; v does not escape it.
deny (resource.reviewer is some v implies v.role == "x") and v.id != ""

// AEG-4013: the same name introduced twice in one chain is ambiguity.
deny resource.primary_reviewer is some v
 and resource.secondary_reviewer is some v
 and v.id == ""

// Legal: absence needs no binding.
deny resource.reviewer is none
  reason "An unassigned reviewer cannot approve anything."
```

This is standard occurrence typing with the hard cases removed rather than solved. The removal is the point: what remains is decidable from the syntax tree, which is what an auditor reading the policy has to do too.

This is the headline safety feature of the type system and until this amendment it had no syntax at all. The predicates `is_some(o)` and `is_none(o)` in `std.core` remain available as ordinary Bool-valued calls; they do not narrow, which is why the `is` form exists.

Conformance cases for all three shapes exist now, not later: `conformance/valid/semantics/optional-binding-chain` and `conformance/invalid/semantics/optional-binding-{implication-barrier,duplicate-name}`.

This is the headline safety feature of the type system and until this amendment it had no syntax at all. The predicates `is_some(o)` and `is_none(o)` in `std.core` remain available as ordinary Bool-valued calls; they do not narrow, which is why the `is` form exists.

---

## 6. Evaluation semantics

### 6.1 Algorithm

1. Validate the request against declared schemas. A missing required attribute yields `Indeterminate` with `AEG-5001`. Never a crash - I4.
2. Select applicable policies by evaluating `applies_to`.
3. For each applicable policy, evaluate every rule condition. Each rule yields its effect, `NotApplicable`, or `Indeterminate`.
4. Combine rule results with the policy's combining algorithm.
5. If all rules are `NotApplicable`, apply the policy `default`.
6. Combine policy results at bundle level.
7. Collect obligations from contributing rules only; collect advice separately.
8. Build the minimal justification tree.
9. Emit the evidence record.

### 6.2 Combining algorithms

All seven MUST be total functions over multisets of results. All except `first_applicable` MUST be provably commutative and associative, verified by exhaustive test.

| Algorithm | Rule |
|---|---|
| `deny_overrides` | Any Deny wins; else any Permit; else NotApplicable |
| `permit_overrides` | Any Permit wins; else any Deny; else NotApplicable |
| `first_applicable` | First non-NotApplicable in source order (order-sensitive, always warns) |
| `only_one_applicable` | Exactly one applicable, else Indeterminate |
| `unanimous` | All applicable must agree, else Indeterminate |
| `deny_unless_permit` | Permit only on explicit Permit; everything else Deny |
| `permit_unless_deny` | Deny only on explicit Deny; everything else Permit |

### 6.3 Fail-closed

`Indeterminate` MUST resolve to `Deny` at the enforcement boundary under the default configuration. Signature failure, bundle version mismatch, undischargeable obligation, and PDP unavailability MUST all Deny - I7.

### 6.4 Justification

Every decision MUST carry a minimal justification tree naming: decisive rule identifiers, their source spans, the clause citations attached to them, and only the attribute bindings those rules referenced. Justification recording MUST NOT be optimised away - I8.

```json
{
  "decision": "deny",
  "policy": "acme.payments.eu_high_risk_payment_gate",
  "irDigest": "sha256:...",
  "decisiveRules": [
    { "id": "human_gate", "span": "payments.aegis:31:5-34:60",
      "reason": "Irreversible high-value action requires fresh human approval.",
      "cites": ["eu:article:14"],
      "bindings": { "action.capability": "transfer_funds", "human.approved": false } }
  ],
  "obligations": ["halt", "audit.emit", "notify(risk-oncall)"],
  "advice": [],
  "combining": "deny_overrides"
}
```

---

## 7. Static analysis (normative, 13 analyses)

1. Termination proof (no recursion, all quantifiers bounded) - I1
2. Resource bound computation and budget enforcement - I11
3. Unreachable rule detection with a witness
4. Rule subsumption detection
5. Contradiction detection (identical condition, opposing effect)
6. Coverage gap detection with a concrete example request
7. Enum exhaustiveness
8. Missing-default detection with an incomplete rule set
9. Fail-open configuration warning
10. Order-sensitive combining warning
11. Data-class flow analysis for redaction obligations
12. Undischargeable obligation detection
13. Determinism hazard detection (floats, clock reads, unordered iteration) - I2

Analysis results MUST be deterministic across runs. Advisory findings MAY be suppressed explicitly; every suppression MUST appear in the audit report.

---

## 8. Compilation targets

Both artifacts MUST derive from the same canonical IR - I5.

**Bytecode `.aegisc`:** magic `0x41 0x45 0x47 0x53` (`AEGS`), major and minor version, canonical constant pool, register-based instructions, SHA-256 integrity hash, optional detached Ed25519 signature. Loader MUST validate every jump target, register index, and constant index before execution. Bad magic is `AEG-6001`, unknown major version is `AEG-6002`, hash mismatch is `AEG-6003`.

**Signed bundle `.aegisb`:** a bundle carries compiled units, schemas, pinned clause versions, and test results. Signature verification failure is `AEG-6010` and a reference to an unknown signing key is `AEG-6011`. Both MUST fail closed: an unverifiable bundle is not loaded and the enforcement point denies - I7. Neither may be downgraded to a warning by configuration, because a bundle whose provenance cannot be established is indistinguishable from one an attacker supplied.

**Audit report:** Markdown, HTML, or PDF. Plain language, no code. Every rule rendered with its doc comment, its reason, and its clause citations. Fail-open configuration and every suppression MUST be highlighted. Byte-stable given a fixed generation timestamp.

---

## 9. Versioning

The language version, the toolchain version, the IR format version, the bytecode format version, and the clause library versions are all independent. A compilation unit declares the language version it targets. An unknown major version MUST be rejected, never guessed.

---

## 10. Conformance

An implementation conforms if and only if it passes the published conformance suite in full: `conformance/valid/` (source + request + expected decision and justification), `conformance/invalid/` (source + expected diagnostic codes), `conformance/canonical/` (byte-exact IR and bytecode fixtures). At least 1,200 cases at v1.0. Diagnostic codes are part of the conformance surface: a conforming implementation MUST emit the same code for the same defect.

---

## 11. Compilation modes

Three modes. Earlier drafts referred to "strict mode" and "release build" without defining either; both are now normative.

| Mode | Invocation | Behaviour |
|---|---|---|
| Default | `aegis build` | `2xxx` advisories are reported as warnings and do not fail the build. |
| Strict | `aegis build --strict` | Every `2xxx` advisory is escalated to an error. Nothing else changes. |
| Release | `aegis build --release` | Everything strict does, and additionally fails if any in-language `test` fails (`AEG-3060`). |

`--release` implies `--strict`. A bundle produced by `--release` is the only artifact permitted to carry a signature, because a signed bundle asserts that its own tests passed at the moment it was built.

Strict mode adds one requirement that default mode does not check at all: a doc comment is required on every `export`ed declaration and on every `policy` (`AEG-2090`). Those are the constructs the audit report renders, so those are the ones whose prose an auditor will read. Rules, tests, suites, and non-exported declarations are exempt, because requiring a comment on every rule trains authors to write filler.
