# Tasks - Diagnostics Engine

**Spec ID:** `13-diagnostics` | **Phase:** P3

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

## The P1 / P3 boundary - hard

The lexer cannot emit a single `AEG-1xxx` without somewhere to put it, so the first three tasks are delivered during Phase 1 as a dependency of `01-lexer` task 1.4. P3 must not collapse into P1, so the boundary is explicit and narrow.

**Delivered in P1** - the `Diagnostic` value type, the sink interface, and the code registry. Roughly 150 lines. Nothing else.

**Stays in P3** - the renderer in its entirety: source excerpts, carets, gutters, secondary spans, `= note:`, `= help:`, `= spec:`, colour, `NO_COLOR`, and `--json` shaping.

In Phase 1 a diagnostic is a **structured value that is collected and counted, never a rendered string**. If a Phase 1 turn finds itself formatting a caret, it has crossed the boundary and must stop. Turn headers for the three P1 tasks read `SPEC: 13-diagnostics | TASK: 13.1 | PHASE: P1`.

- [x] **13.1** Define the Diagnostic value type with mandatory note and help, severity, code, primary span **[delivered in P1 as a dependency of 01-lexer task 1.4]**
- [x] **13.2** Implement the sink interface with content-only ordering and duplicate suppression **[delivered in P1 as a dependency of 01-lexer task 1.4]**
- [x] **13.3** Implement the code registry and the per-file cap (AEG-1006); the build cap (AEG-0001) is driver-side and stays in P9 **[delivered in P1 as a dependency of 01-lexer task 1.4]**
- [ ] **13.4** Implement the line index and 1-based scalar-value position derivation shared with the lexer
- [ ] **13.5** Implement the source excerpt renderer with caret alignment and tab handling
- [ ] **13.6** Implement secondary spans with labels, and the multi-span layout in the frozen standard
- [ ] **13.7** Implement note, help, and optional spec lines in the frozen order
- [ ] **13.8** Implement the JSON renderer with fixed field order and byte-stable output
- [ ] **13.9** Implement severity escalation for `--strict` and the release gate for `--release`
- [ ] **13.10** Implement suppression recording so every suppression reaches the audit report (AEG-2100)
- [ ] **13.11** Implement the tailored AEG-1030 help texts for all 29 reserved-forbidden words, and the AEG-3070 shapes
- [ ] **13.12** Implement the shared-note rule for cross-layer code pairs, starting with AEG-1019 and AEG-4141
- [ ] **13.13** Generate the machine-readable catalogue table from `docs/10-error-catalog.md`
- [ ] **13.14** Extend the existing corpus checks in `scripts/check-corpus.mjs` to the rendered-output golden set
- [ ] **13.15** Write golden fixtures for every catalogue entry, uncoloured and byte-exact
- [ ] **13.16** Write the property tests for rendering determinism and sink ordering
- [ ] **13.17** Write the fuzz target for the renderer against arbitrary source and arbitrary spans

## Turn protocol

Open every turn with `SPEC: 13-diagnostics | TASK: 13.<n> | PHASE: P3`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
