# Tasks - Parser

**Spec ID:** `02-parser` | **Phase:** P2

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **2.1** Define the AST node set with spans, mirroring the grammar one-to-one
- [ ] **2.2** Implement the parser scaffold with peek/check/match/expect
- [ ] **2.3** Implement unit, specification, package, and import parsing
- [ ] **2.4** Implement capability, principal, and resource_class parsing
- [ ] **2.5** Implement enum, schema, and const parsing
- [ ] **2.6** Implement policy parsing with combining, applies_to, cites, default, on violation
- [ ] **2.7** Implement the three rule surface forms
- [ ] **2.8** Implement obligation and advice parsing
- [ ] **2.9** Implement test and suite parsing
- [ ] **2.10** Implement the Pratt expression parser with the full binding-power table
- [ ] **2.11** Implement explicit non-associativity diagnostics at three levels
- [ ] **2.12** Implement quantifier parsing with child-scope variable binding
- [ ] **2.13** Implement panic-mode recovery with chosen synchronisation tokens
- [ ] **2.14** Implement cascade suppression
- [ ] **2.15** Implement the pretty printer and verify parse-print-parse idempotence
- [ ] **2.16** Write golden AST fixtures for every example
- [ ] **2.17** Write the fuzz target and run it to zero panics

## Turn protocol

Open every turn with `SPEC: 02-parser | TASK: <n.n> | PHASE: P2`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
