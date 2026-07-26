# Tasks - Static Analysis

**Spec ID:** `05-static-analysis` | **Phase:** P5

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **5.1** Define the finding type with severity, spans, witness, and remediation
- [ ] **5.2** Implement the recursion-freedom proof over the reference graph
- [ ] **5.3** Implement quantifier bound extraction and the static cost model
- [ ] **5.4** Implement budget enforcement and the near-budget advisory
- [ ] **5.5** Implement condition-to-SMT encoding for the decidable fragment
- [ ] **5.6** Implement solver integration with timeouts and conservative degradation
- [ ] **5.7** Implement unreachable rule detection with witness generation
- [ ] **5.8** Implement subsumption detection with implication reporting
- [ ] **5.9** Implement contradiction detection
- [ ] **5.10** Implement coverage gap detection with concrete example generation
- [ ] **5.11** Implement enum exhaustiveness and missing-default detection
- [ ] **5.12** Implement fail-open and order-sensitive combining warnings
- [ ] **5.13** Implement human-gate detection for irreversible capabilities
- [ ] **5.14** Implement data-class flow analysis and redaction obligation checking
- [ ] **5.15** Implement undischargeable obligation detection
- [ ] **5.16** Implement determinism hazard detection
- [ ] **5.17** Implement explicit suppression with audit-report recording
- [ ] **5.18** Golden-test every AEG-2xxx finding
- [ ] **5.19** Property-test analysis determinism across runs

## Turn protocol

Open every turn with `SPEC: 05-static-analysis | TASK: <n.n> | PHASE: P5`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
