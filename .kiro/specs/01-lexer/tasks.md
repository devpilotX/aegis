# Tasks - Lexer

**Spec ID:** `01-lexer` | **Phase:** P1

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **1.1** Define the token kind enumeration and the Token struct with span
- [ ] **1.2** Implement the line index and lazy line/column derivation
- [ ] **1.3** Implement NFC normalisation and UTF-8 validation at the boundary (AEG-1001)
- [ ] **1.4** Implement the core scanner loop with maximal munch
- [ ] **1.5** Implement identifier and keyword recognition with the keyword table
- [ ] **1.6** Implement integer, decimal, and percent literals with precision limits
- [ ] **1.7** Implement money and duration literals with unit and currency validation
- [ ] **1.8** Implement string literals with the four escapes and both unterminated cases
- [ ] **1.9** Implement line and doc comments with doc attachment metadata
- [ ] **1.10** Implement all lexical limit checks (AEG-1010 to AEG-1019)
- [ ] **1.11** Implement security checks: bidi override, confusables, non-ASCII identifiers
- [ ] **1.12** Implement reserved-keyword rejection with invariant-citing messages (AEG-1030)
- [ ] **1.13** Write golden token-stream fixtures for every example in examples/
- [ ] **1.14** Write golden diagnostic fixtures for every AEG-1xxx code
- [ ] **1.15** Write the property test for lex-then-reprint round-trip fidelity
- [ ] **1.16** Write the fuzz target and run it to zero panics and zero hangs

## Turn protocol

Open every turn with `SPEC: 01-lexer | TASK: <n.n> | PHASE: P1`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
