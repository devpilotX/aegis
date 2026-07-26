# Tasks - IR and Compiler

**Spec ID:** `06-ir-compiler` | **Phase:** P7

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **6.1** Define the IR instruction set and value encodings
- [ ] **6.2** Implement AST-to-IR lowering for all declarations and expressions
- [ ] **6.3** Implement the deduplicated, canonically ordered constant pool
- [ ] **6.4** Implement canonical encodings for decimal, money, duration, and set
- [ ] **6.5** Implement linear-scan virtual register allocation
- [ ] **6.6** Implement short-circuit lowering by branching
- [ ] **6.7** Implement bounded quantifier lowering with the hard cap
- [ ] **6.8** Implement temporal operator lowering over trace and clock
- [ ] **6.9** Implement effect, obligation, advice, and combining lowering
- [ ] **6.10** Implement justification instruction emission marked non-removable
- [ ] **6.11** Implement the line table and clause table
- [ ] **6.12** Implement canonical IR serialisation and the IR digest
- [ ] **6.13** Implement the .aegisc writer with magic, versions, and integrity hash
- [ ] **6.14** Implement optional detached Ed25519 signing
- [ ] **6.15** Implement constant folding and dead-rule elimination behind a flag
- [ ] **6.16** Implement the no-optimisation build mode
- [ ] **6.17** Implement the disassembler and golden-test its output
- [ ] **6.18** Property-test byte-stability of IR and bytecode across runs
- [ ] **6.19** Differential-test optimised against unoptimised decisions

## Turn protocol

Open every turn with `SPEC: 06-ir-compiler | TASK: <n.n> | PHASE: P7`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
