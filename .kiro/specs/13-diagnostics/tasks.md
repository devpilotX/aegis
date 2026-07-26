# Tasks - Diagnostics Engine

**Spec ID:** `13-diagnostics` | **Phase:** P3

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

Phase 1 needs a minimal diagnostic type and sink in order to report `AEG-1xxx` at all; tasks 13.1 to 13.3 are therefore built during Phase 1 as a dependency of `01-lexer`, and the rest is Phase 3. That dependency is stated here so it is not discovered mid-phase.

- [ ] **13.1** Define the Diagnostic type with mandatory note and help, severity, code, primary span
- [ ] **13.2** Implement the sink with content-only ordering and duplicate suppression
- [ ] **13.3** Implement the per-file cap (AEG-1006) and the build cap (AEG-0001)
- [ ] **13.4** Implement the line index and 1-based scalar-value position derivation shared with the lexer
- [ ] **13.5** Implement the source excerpt renderer with caret alignment and tab handling
- [ ] **13.6** Implement secondary spans with labels, and the multi-span layout in the frozen standard
- [ ] **13.7** Implement note, help, and optional spec lines in the frozen order
- [ ] **13.8** Implement the JSON renderer with fixed field order and byte-stable output
- [ ] **13.9** Implement severity escalation for `--strict` and the release gate for `--release`
- [ ] **13.10** Implement suppression recording so every suppression reaches the audit report (AEG-2100)
- [ ] **13.11** Implement the tailored AEG-1030 help texts for all 29 reserved-forbidden words
- [ ] **13.12** Implement the shared-note rule for cross-layer code pairs, starting with AEG-1019 and AEG-4141
- [ ] **13.13** Generate the machine-readable catalogue table from `docs/10-error-catalog.md`
- [ ] **13.14** Write the CI closure checks: emitted-code coverage, fixture coverage, retired-code use, CITATION-NEEDED
- [ ] **13.15** Write golden fixtures for every catalogue entry, uncoloured and byte-exact
- [ ] **13.16** Write the property tests for rendering determinism and sink ordering
- [ ] **13.17** Write the fuzz target for the renderer against arbitrary source and arbitrary spans

## Turn protocol

Open every turn with `SPEC: 13-diagnostics | TASK: 13.<n> | PHASE: P3`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
