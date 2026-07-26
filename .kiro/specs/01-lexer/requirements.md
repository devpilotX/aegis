# Requirements - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1 | **Invariants:** I1, I2, I11

## Purpose

Convert UTF-8 source text into a token stream with exact half-open raw-byte spans and retained trivia, enforcing every lexical limit in `docs/02` section 1.

Two things this component deliberately does **not** do, both settled by the P0 audit adjudication: it performs **no normalisation** of any kind (`docs/02` section 1.1), and it performs **no currency validation** (`AEG-4140` belongs to the checker).

## Acceptance criteria (EARS format)

### 1. Tokenisation

**User story:** As a policy author, I need tokenisation to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN the lexer receives valid source THEN it SHALL emit one token per lexeme with kind, text, and a half-open byte span.
1.2. WHEN a keyword is encountered THEN the lexer SHALL emit the keyword kind, not an identifier kind.
1.3. WHEN two token forms could match THEN the lexer SHALL apply maximal munch.
1.4. WHEN the source ends THEN the lexer SHALL emit exactly one EOF token with a zero-width span at the end offset.
1.5. WHEN the source is empty THEN the lexer SHALL emit exactly one EOF token with span `[0, 0)`.
1.6. WHEN lexing stops on a fatal error THEN the lexer SHALL still emit exactly one EOF token, zero-width, at the offset where it stopped.

### 2. Positions

**User story:** As a tool author, I need positions to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN any token is emitted THEN its span SHALL be a pair of 0-based raw file byte offsets from which line and column are derivable.
2.2. WHEN the source contains CRLF, LF, or lone CR THEN line counting SHALL treat each as a single terminator.
2.3. WHEN a position is rendered THEN line and column SHALL be 1-based and the column SHALL count Unicode scalar values, not bytes and not grapheme clusters.
2.4. WHEN a tab appears before a caret position THEN it SHALL count as one column and render as one space.
2.5. WHEN a token is constructed THEN it SHALL NOT store a line or column; positions SHALL be derived from a line index.

### 3. Limits

**User story:** As a security reviewer, I need limits to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN a value is exactly equal to a limit THEN the lexer SHALL accept it, and WHEN it exceeds the limit THEN the lexer SHALL emit the stated diagnostic.
3.2. WHEN source exceeds 4 MiB THEN the lexer SHALL emit AEG-1010 and SHALL stop lexing.
3.3. WHEN a line exceeds 4,096 bytes THEN the lexer SHALL emit AEG-1011.
3.4. WHEN an identifier of either class exceeds 128 bytes THEN the lexer SHALL emit AEG-1012.
3.5. WHEN a numeric literal exceeds 38 significant digits, counted as defined in `docs/02` section 1.2, THEN the lexer SHALL emit AEG-1014.
3.6. WHEN a duration literal is outside 1 ms to 100 y inclusive, evaluated in canonical milliseconds, THEN the lexer SHALL emit AEG-1019.
3.7. WHEN 200 diagnostics have been emitted for one compilation unit THEN the lexer SHALL emit AEG-1006 and SHALL stop lexing.

### 4. Security

**User story:** As a security reviewer, I need security to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN invalid UTF-8 appears THEN the lexer SHALL emit AEG-1001, SHALL NOT substitute replacement characters, and SHALL stop lexing.
4.2. WHEN a bidirectional override character appears anywhere in the source THEN the lexer SHALL emit AEG-1002.
4.3. WHEN a confusable character appears in a string literal THEN the lexer SHALL emit AEG-1003, and it SHALL NOT apply this check to identifiers, which are ASCII-only.
4.4. WHEN a non-ASCII byte appears in an identifier THEN the lexer SHALL emit AEG-1004.
4.5. WHEN the lexer receives source of any kind THEN it SHALL NOT normalise it, and spans SHALL address the raw bytes as authored.

### 5. Literals

**User story:** As a policy author, I need literals to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN a numeric literal contains an underscore that is leading, trailing, doubled, or adjacent to the decimal point THEN the lexer SHALL emit AEG-1005.
5.2. WHEN digits are immediately followed by one of `ms` `s` `m` `h` `d` `w` `y` with no intervening whitespace THEN the lexer SHALL emit a single duration token.
5.3. WHEN a duration unit is immediately followed by a letter, digit, or underscore THEN the lexer SHALL emit AEG-1055.
5.4. WHEN a decimal magnitude is immediately followed by a duration unit THEN the lexer SHALL emit AEG-1056.
5.5. WHEN a numeric literal is immediately followed by `e` or `E` and a digit or sign THEN the lexer SHALL emit AEG-1057.
5.6. WHEN a string is unterminated at end of line THEN the lexer SHALL emit AEG-1041.
5.7. WHEN a string is unterminated at end of file THEN the lexer SHALL emit AEG-1042.
5.8. WHEN an escape other than `\"` `\\` `\n` `\t` appears in a string THEN the lexer SHALL emit AEG-1040.
5.9. WHEN a `%` follows a numeric literal THEN the lexer SHALL emit two tokens and SHALL NOT build a percent value.
5.10. WHEN a currency code appears THEN the lexer SHALL emit a TypeIdent token and SHALL NOT validate the code.

### 6. Trivia and comments

**User story:** As a policy author, I need comments to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN a line comment appears THEN it SHALL produce no syntactic token and SHALL be retained as leading trivia on the next token.
6.2. WHEN a doc comment appears THEN it SHALL be retained as trivia flagged `doc`, and attachment to a declaration SHALL be performed by the parser, not the lexer.
6.3. WHEN `////` appears THEN it SHALL be lexed as one line comment.
6.4. WHEN whitespace or a line terminator appears THEN it SHALL be retained as trivia.
6.5. WHEN the token stream and its trivia are reprinted THEN the output SHALL equal the input source byte for byte.

### 7. Reserved words

**User story:** As a maintainer, I need the closed vocabulary enforced, so that the design cannot drift.

7.1. WHEN one of the 29 reserved-forbidden words appears THEN the lexer SHALL emit AEG-1030 with a message naming the invariant or the scope rule that forbids it.
7.2. WHEN a word is not in the 77-word keyword set and not reserved-forbidden THEN the lexer SHALL emit an identifier token.

### 8. Robustness

**User story:** As a maintainer, I need robustness to behave exactly as specified, so that the artifact can be trusted.

8.1. WHEN the lexer receives arbitrary bytes THEN it SHALL NOT panic and SHALL terminate.
8.2. WHEN several diagnostics could apply to one lexeme THEN the lexer SHALL emit exactly one, chosen by the precedence order in `docs/02` section 1.9.
8.3. WHEN a non-fatal lexical error occurs THEN the lexer SHALL skip the offending lexeme and continue, so that one pass reports every lexical defect in the file.
8.4. WHEN a fatal error occurs, meaning AEG-1001 or AEG-1010 or AEG-1006, THEN the lexer SHALL stop and SHALL NOT report further defects.

## Phase 1 exit criterion

The former criterion - "every file in `examples/` tokenises" - is withdrawn. Those files were found in the P0 audit to be invalid AEGIS and are quarantined in `examples/draft/`. They are rebuilt one at a time as the frontend gains the capability to accept them, and they gate nothing.

The criterion is now:

> Every file in `conformance/valid/lexer/` tokenises with byte-exact expected spans and trivia, and every file in `conformance/invalid/lexer/` produces exactly the expected diagnostic code and no other. The corpus is built during Phase 1, one case per diagnostic and one case per token kind, and it is the artifact Phase 2 inherits.

Plus: every surviving `AEG-1xxx` code has a golden rendered fixture, and the fuzz target runs 60 seconds with zero panics and zero hangs.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.

Explicitly out of scope for this component, with the owner of each: currency validation (`AEG-4140`, checker), quoted-name length and character set (`AEG-1013` and `AEG-3080`, parser), quantifier nesting depth (`AEG-3081`, parser), import graph depth (`AEG-3082`, loader), collection cardinality (`AEG-4160`, checker), doc comment attachment and `AEG-2091` (parser), any form of normalisation (nobody - it does not happen).
