# Tasks - Type System

**Spec ID:** `04-type-system` | **Phase:** P4

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **4.1** Define the type representation with currency-parameterised Money
- [ ] **4.2** Implement the subtyping relation and the least-upper-bound function
- [ ] **4.3** Implement infer for literals, paths, and constants
- [ ] **4.4** Implement check with expectation propagation
- [ ] **4.5** Implement schema-based attribute path checking with suggestions
- [ ] **4.6** Implement Money currency checking on comparison and arithmetic
- [ ] **4.7** Implement explicit convert() typing with a rate attribute
- [ ] **4.8** Implement Optional discharge and branch narrowing
- [ ] **4.9** Implement enum nominal typing, ordering, and exhaustiveness
- [ ] **4.10** Implement quantifier typing with bounded collection requirements
- [ ] **4.11** Implement temporal operator typing over trace and clock
- [ ] **4.12** Implement builtin signatures including RE2-only regex rejection
- [ ] **4.13** Implement test block type checking
- [ ] **4.14** Write the expected/actual/source-of-expectation diagnostic renderer
- [ ] **4.15** Golden-test every AEG-4xxx diagnostic
- [ ] **4.16** Property-test that well-typed programs never produce a runtime type error

## Turn protocol

Open every turn with `SPEC: 04-type-system | TASK: <n.n> | PHASE: P4`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
