# Tasks - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

<!-- retired-ok: AEG-1013 -->
This list was rewritten after the P0 audit adjudication. Three tasks that instructed work the requirements did not authorise are gone: NFC normalisation (no normalisation happens at all), currency validation (`AEG-4140`, checker), and the non-lexical limits formerly numbered `AEG-1013`, `1016`, `1017`, `1018`, now `AEG-3083`, `4160`, `3081`, `3082` and owned by the parser, checker, and loader. Two tasks are new: trivia retention and the lexer conformance corpus.

- [x] **1.1** Define the token kind enumeration and the Token type with span
- [x] **1.2** Implement the line index and lazy 1-based line/column derivation over scalar values
- [ ] **1.3** Implement UTF-8 validation at the boundary as a fatal check (AEG-1001)
- [ ] **1.4** Implement the core scanner loop with maximal munch, the delimiter set, and AEG-1005
- [ ] **1.5** Implement ident and TypeIdent recognition, the 77-word keyword table, and the 29 reserved-forbidden words (AEG-1030)
- [ ] **1.6** Implement integer and decimal literals with underscore placement rules and the 38-digit limit (AEG-1005, AEG-1014, AEG-1057)
- [ ] **1.7** Implement duration literals as single tokens with unit fusion and range in canonical milliseconds (AEG-1019, AEG-1055, AEG-1056)
- [ ] **1.8** Implement string literals with the four escapes and both unterminated cases (AEG-1040, AEG-1041, AEG-1042)
- [ ] **1.9** Implement trivia retention for whitespace, line terminators, line comments, and doc comments with the `doc` flag
- [ ] **1.10** Implement the surviving lexical limit checks: AEG-1010 fatal, AEG-1011, AEG-1012
- [ ] **1.11** Implement security checks: bidi override (AEG-1002), confusables in string literals only (AEG-1003), non-ASCII identifiers (AEG-1004)
- [ ] **1.12** Implement the diagnostic sink: one diagnostic per lexeme in precedence order, skip-and-continue recovery, the 200 cap (AEG-1006), and the EOF guarantee on every path
- [ ] **1.13** Build the lexer conformance corpus: `conformance/valid/lexer/` one case per token kind, `conformance/invalid/lexer/` one case per diagnostic code
- [ ] **1.14** Write golden token-plus-trivia fixtures for every case in `conformance/valid/lexer/`
- [ ] **1.15** Write golden rendered-diagnostic fixtures for every surviving AEG-1xxx code
- [ ] **1.16** Write the property test for byte-exact round-trip of tokens plus trivia
- [ ] **1.17** Write the fuzz target and run it 60 seconds to zero panics and zero hangs

## Turn protocol

Open every turn with `SPEC: 01-lexer | TASK: <n.n> | PHASE: P1`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
