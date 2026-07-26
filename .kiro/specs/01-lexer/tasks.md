# Tasks - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

<!-- retired-ok: AEG-1013 -->
This list was rewritten after the P0 audit adjudication. Three tasks that instructed work the requirements did not authorise are gone: NFC normalisation (no normalisation happens at all), currency validation (`AEG-4140`, checker), and the non-lexical limits formerly numbered `AEG-1013`, `1016`, `1017`, `1018`, now `AEG-3083`, `4160`, `3081`, `3082` and owned by the parser, checker, and loader. Two tasks are new: trivia retention and the lexer conformance corpus.

- [x] **1.1** Define the token kind enumeration and the Token type with span
- [x] **1.2** Implement the line index and lazy 1-based line/column derivation over scalar values
- [x] **1.3** Implement UTF-8 validation at the boundary as a fatal check (AEG-1001)
- [ ] **1.4** Implement the core scanner loop with maximal munch, the delimiter set, and AEG-1005
- [ ] **1.5** Implement ident and TypeIdent recognition, the 77-word keyword table, and the 29 reserved-forbidden words (AEG-1030)
- [ ] **1.6** Implement integer and decimal literals with underscore placement rules and the 38-digit limit (AEG-1005, AEG-1014, AEG-1057)
- [ ] **1.7** Implement duration literals as single tokens with unit fusion and range in canonical milliseconds (AEG-1019, AEG-1055, AEG-1056)
- [ ] **1.8** Implement string literals with the four escapes and both unterminated cases (AEG-1040, AEG-1041, AEG-1042)
- [ ] **1.9** Implement trivia retention for whitespace, line terminators, line comments, and doc comments with the `doc` flag
- [ ] **1.10** Implement the surviving lexical limit checks: AEG-1011, AEG-1012
- [ ] **1.11** Implement security checks: bidi override (AEG-1002), confusables in string literals only (AEG-1003), non-ASCII identifiers (AEG-1004)
- [ ] **1.12** Implement the diagnostic sink wiring: one diagnostic per lexeme in precedence order, skip-and-continue recovery, the 200 cap (AEG-1006), the two-part end-of-file rule, and an empty detection ledger
- [ ] **1.13** Build the lexer conformance corpus: `conformance/valid/lexer/` one case per token kind, `conformance/invalid/lexer/` one case per diagnostic code
- [ ] **1.14** Write golden token-plus-trivia fixtures for every case in `conformance/valid/lexer/`
- [ ] **1.15** Write golden rendered-diagnostic fixtures for every surviving AEG-1xxx code
- [ ] **1.16** Write the property test for byte-exact round-trip of tokens plus trivia
- [ ] **1.17** Write the fuzz target and run it 60 seconds to zero panics and zero hangs

## Acceptance criteria - 1.4

The scanner loop is the first task that produces a token stream rather than a table or an index. Everything before it was infrastructure. Its job is deliberately narrow: recognise punctuation, skip and retain trivia, reject unknown bytes, and stop. It recognises **no** identifiers, **no** keywords, and **no** literals - those are tasks 1.5 through 1.8, and reaching for them here is the scope failure this list exists to prevent.

### What it consumes and what it produces

Input is an admitted source from task 1.3 and the line index from task 1.2. Admission has already happened, so the loop may assume valid UTF-8, no byte-order mark, no null bytes, and a size within the limit. It must not re-check any of them.

Output is the token sequence and the diagnostics raised while producing it. The loop owns neither collection's storage; it appends.

### The delimiter table

Twenty-one punctuation kinds, exactly as the specification lists them, and not one more. Seventeen are single-byte. Four are two-byte: equality, inequality, less-or-equal, greater-or-equal.

The table is data, not control flow. A single-byte dispatch that maps a byte to a kind, and a two-byte check that runs first. Twenty-one branches of a switch statement is the wrong shape and will be rejected in review even though it passes.

### Maximal munch

At every position, attempt the two-byte operators before the one-byte ones. This is the whole of maximal munch at this stage, because no other multi-byte punctuation exists.

The four cases that must be asserted, because each is a place an implementation goes wrong:

- Equality is one token, not two assignment tokens.
- An assignment followed by a space and another assignment is two tokens, because munch does not cross trivia.
- Less-or-equal is one token; less-than followed by assignment where no such operator exists must still resolve as the two-byte operator, since it is the same bytes.
- A greater-than at the final byte of the file must not read past the end looking for a second byte. This is the read-past-end bug, and it is the reason the two-byte attempt checks remaining length before it checks content.

### Trivia

Whitespace and line terminators are retained as trivia, not discarded. Line comments and doc comments are recognised here as well, because the comment introducer is punctuation and separating it would mean scanning the same bytes twice.

Adjacent whitespace of the same kind coalesces into one trivia run. A line terminator is its own trivia token and never joins a whitespace run, because the round-trip property needs the terminator recoverable as a terminator.

Trivia attachment - which token owns which run - belongs to task 1.9. Task 1.4 produces the trivia; it does not decide ownership.

### AEG-1005

Any byte that begins no punctuation, no trivia, and nothing the later tasks will claim raises `AEG-1005`. It is an error, not a fatal, and the loop continues.

Three rules on its shape:

- **One diagnostic per offending character, not per run.** Three unknown characters in a row are three diagnostics. Coalescing them loses the position of the second and third, and positions are conformance surface.
- **The span covers exactly the offending character**, which may be more than one byte. A span of one byte over a multi-byte character would split a scalar value and violate the span contract from task 1.1.
- **When the character is reserved punctuation, the diagnostic carries the help text for that character.** The thirteen-row reserved-semantics table gives, for each, what the character means in languages that have it and what to write instead. A bare unexpected-character message for a semicolon is a worse diagnostic than the language deserves.

After raising, advance by one whole character. Advancing by one byte would produce a second diagnostic inside the same character.

### The end-of-file rule

One end-of-file token, zero width, at the offset equal to the source length, on every path that this task can reach. Task 1.4 cannot reach a pre-scan fatal, because admission already succeeded before the loop is entered - so within this task the guarantee is unconditional, and the two-part rule matters only to the caller.

The empty file is the case to assert: zero bytes in, exactly one end-of-file token out, no diagnostics.

### AEG-1007

A stray carriage return - one not followed by a line feed - raises `AEG-1007` here. Task 1.2 detects the condition and records it in the line index; task 1.4 is where it becomes a diagnostic. On completion, strike it from the detection ledger below.

### Required assertions

Ten token-sequence assertions, each stated as input bytes and expected kinds:

1. Empty input, one end-of-file token.
2. Whitespace only, one trivia run and one end-of-file token.
3. Each of the seventeen single-byte delimiters, alone.
4. Each of the four two-byte operators, alone.
5. Equality against two adjacent assignments separated by a space.
6. A two-byte operator's first byte as the final byte of the file.
7. An unknown single-byte character, one diagnostic, span length one.
8. An unknown multi-byte character, one diagnostic, span covering all its bytes.
9. Three unknown characters adjacent, three diagnostics at three distinct positions.
10. A reserved punctuation character, one diagnostic carrying the matching help row.

Coverage is 100 percent of lines and branches, as for every file in this component. Budget is roughly two hundred logic lines; the delimiter table does not count against it.

### Out of scope, stated so it stays out

No identifier scanning. No keyword lookup. No numbers, no durations, no strings. No trivia attachment. No sink cap - the cap is task 1.12, and the loop appends without counting.

## Detection ledger

A code emitted by an earlier task than the one that owns it is recorded here. Task 1.12 does not close while this table has rows, because a code detected in one place and specified in another is a code with two definitions.

| Code | Emitted by | Owned by | Struck |
|---|---|---|---|
| AEG-1007 | 1.4 | 1.12 | no |
| AEG-1002 | 1.11 | 1.12 | no |

Strike a row in the commit that makes the owning task agree with the emitting one. Do not delete rows; mark them struck, so the ledger stays a record rather than a to-do list.

## Turn protocol

Open every turn with `SPEC: 01-lexer | TASK: <n.n> | PHASE: P1`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
