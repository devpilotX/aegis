# Tasks - Audit and Evidence

**Spec ID:** `08-audit-evidence` | **Phase:** P8

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **8.1** Define the evidence record schema and its canonical serialisation
- [ ] **8.2** Implement canonical serialisation with fixed ordering and fixed timestamp precision
- [ ] **8.3** Implement the SHA-256 chain including genesis handling
- [ ] **8.4** Implement Ed25519 signing with key identifiers and validity windows
- [ ] **8.5** Implement the request digest used for replay and caching
- [ ] **8.6** Implement decisive-binding-only recording
- [ ] **8.7** Implement redaction before hashing with recorded reasons
- [ ] **8.8** Implement the independent verifier with its own serialiser
- [ ] **8.9** Test detection of insertion, deletion, and single-byte mutation
- [ ] **8.10** Test signature verification against rotated historical keys
- [ ] **8.11** Implement replay from evidence and confirm decision identity
- [ ] **8.12** Implement fail-closed on bundle version mismatch during replay
- [ ] **8.13** Implement the audit report generator from IR
- [ ] **8.14** Implement fail-open and suppression highlighting in the report
- [ ] **8.15** Implement Markdown, HTML, and PDF output
- [ ] **8.16** Golden-test report byte-stability with a fixed timestamp
- [ ] **8.17** Have a compliance-literate reader review a generated report cold

## Turn protocol

Open every turn with `SPEC: 08-audit-evidence | TASK: <n.n> | PHASE: P8`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
