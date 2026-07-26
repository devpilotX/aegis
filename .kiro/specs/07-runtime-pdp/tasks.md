# Tasks - Runtime and PDP

**Spec ID:** `07-runtime-pdp` | **Phase:** P7

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **7.1** Implement the bytecode loader with full validation before execution
- [ ] **7.2** Implement bundle signature verification with refusal on failure
- [ ] **7.3** Implement the tagged value representation
- [ ] **7.4** Implement the bounds-checked register file and context pooling
- [ ] **7.5** Implement the dispatch loop
- [ ] **7.6** Implement decimal, money, and duration arithmetic opcodes with currency checks
- [ ] **7.7** Implement comparison, membership, and RE2 matching opcodes with pattern caching
- [ ] **7.8** Implement bounded quantifier opcodes with the iteration cap
- [ ] **7.9** Implement temporal opcodes over the request trace and injected clock
- [ ] **7.10** Implement request schema validation returning Indeterminate on failure
- [ ] **7.11** Implement all seven combining algorithms as total functions
- [ ] **7.12** Implement policy default application and bundle-level combination
- [ ] **7.13** Implement obligation and advice collection from contributing rules only
- [ ] **7.14** Implement minimal justification tree construction
- [ ] **7.15** Implement fail-closed resolution at the enforcement boundary
- [ ] **7.16** Implement atomic bundle hot-reload
- [ ] **7.17** Write the loader fuzz target and run to zero panics
- [ ] **7.18** Exhaustively test combiner commutativity and associativity
- [ ] **7.19** Benchmark latency percentiles and throughput against the budgets
- [ ] **7.20** Achieve 100 percent line and branch coverage on the evaluator core

## Turn protocol

Open every turn with `SPEC: 07-runtime-pdp | TASK: <n.n> | PHASE: P7`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
