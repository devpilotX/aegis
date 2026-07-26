# Tasks - Conformance and Specification v1.0

**Spec ID:** `12-conformance` | **Phase:** P13

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **12.1** Define the three case formats and the directory layout
- [ ] **12.2** Build the conformance runner as a standalone binary
- [ ] **12.3** Generate cases from every specification example
- [ ] **12.4** Write invalid cases for every catalogue diagnostic code
- [ ] **12.5** Write canonical IR and bytecode fixtures
- [ ] **12.6** Build the coverage tracker and wire it into CI as a gate
- [ ] **12.7** Grow the suite to 1,200 cases
- [ ] **12.8** Write the TLA+ specification of the evaluation algorithm
- [ ] **12.9** Model-check totality and determinism with TLC
- [ ] **12.10** Model-check combiner commutativity and associativity
- [ ] **12.11** Model-check fail-closed behaviour and justification completeness
- [ ] **12.12** Document every unproven assumption explicitly
- [ ] **12.13** Freeze specification v1.0 and publish the RFC process
- [ ] **12.14** Invite and support a third-party implementation attempt

## Turn protocol

Open every turn with `SPEC: 12-conformance | TASK: <n.n> | PHASE: P13`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
