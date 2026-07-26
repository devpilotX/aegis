# Requirements - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1 | **Invariants:** I1, I2, I11

## Purpose

Convert NFC-normalised UTF-8 source text into a token stream with exact half-open spans, enforcing every lexical limit in spec section 1.

## Acceptance criteria (EARS format)

### 1. Tokenisation

**User story:** As a policy author, I need tokenisation to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN the lexer receives valid source THEN it SHALL emit one token per lexeme with kind, text, and a half-open byte span.
1.2. WHEN a keyword is encountered THEN the lexer SHALL emit the keyword kind, not an identifier kind.
1.3. WHEN two tokens could match THEN the lexer SHALL apply maximal munch.
1.4. WHEN the source ends THEN the lexer SHALL emit exactly one EOF token with a zero-width span at the end offset.

### 2. Positions

**User story:** As a tool author, I need positions to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN any token is emitted THEN its span SHALL be a byte offset pair from which line and column are derivable.
2.2. WHEN the source contains CRLF, LF, or lone CR THEN line counting SHALL treat each as a single terminator.
2.3. WHEN the source contains multi-byte UTF-8 THEN column derivation SHALL count characters, not bytes.

### 3. Limits

**User story:** As a security reviewer, I need limits to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN source exceeds 4 MiB THEN the lexer SHALL emit AEG-1010 and stop.
3.2. WHEN a line exceeds 4,096 bytes THEN the lexer SHALL emit AEG-1011.
3.3. WHEN an identifier exceeds 128 bytes THEN the lexer SHALL emit AEG-1012.
3.4. WHEN a numeric literal exceeds 38 significant digits THEN the lexer SHALL emit AEG-1014.
3.5. WHEN a string literal exceeds 64 KiB THEN the lexer SHALL emit AEG-1015.

### 4. Security

**User story:** As a security reviewer, I need security to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN invalid UTF-8 appears THEN the lexer SHALL emit AEG-1001 and SHALL NOT substitute replacement characters.
4.2. WHEN a bidirectional override character appears THEN the lexer SHALL emit AEG-1002.
4.3. WHEN a confusable character appears in an identifier THEN the lexer SHALL emit AEG-1003.
4.4. WHEN a non-ASCII identifier appears THEN the lexer SHALL emit AEG-1004.

### 5. Literals

**User story:** As a policy author, I need literals to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN a duration literal uses an unknown unit THEN the lexer SHALL emit AEG-1055.
5.2. WHEN a currency code is not a known three-letter code THEN the lexer SHALL emit AEG-1050.
5.3. WHEN a string is unterminated at end of line THEN the lexer SHALL emit AEG-1041.
5.4. WHEN a string is unterminated at end of file THEN the lexer SHALL emit AEG-1042.
5.5. WHEN an unknown escape sequence appears THEN the lexer SHALL emit AEG-1040.

### 6. Comments

**User story:** As a policy author, I need comments to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN a line comment appears THEN it SHALL be skipped and SHALL NOT produce a token.
6.2. WHEN a doc comment appears THEN it SHALL be attached to the immediately following declaration and preserved for the audit report.

### 7. Robustness

**User story:** As a maintainer, I need robustness to behave exactly as specified, so that the artifact can be trusted.

7.1. WHEN the lexer receives arbitrary bytes THEN it SHALL NOT panic and SHALL terminate.
7.2. WHEN the lexer encounters an error THEN it SHALL continue and report all lexical errors in one pass.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
