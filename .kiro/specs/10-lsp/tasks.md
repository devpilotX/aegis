# Tasks - Language Server and Formatter

**Spec ID:** `10-lsp` | **Phase:** P11

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **10.1** Implement the LSP server scaffold over stdio
- [ ] **10.2** Implement document synchronisation with incremental reparse
- [ ] **10.3** Map shared diagnostics to LSP diagnostics with identical wording
- [ ] **10.4** Implement hover with type, doc comment, and citation
- [ ] **10.5** Implement go-to-definition and find-references from the symbol index
- [ ] **10.6** Implement schema-aware attribute completion
- [ ] **10.7** Implement clause citation completion with versions
- [ ] **10.8** Implement code actions for unambiguous fixes
- [ ] **10.9** Implement document symbols and workspace symbols
- [ ] **10.10** Implement semantic tokens for highlighting
- [ ] **10.11** Implement the canonical formatter and prove idempotence
- [ ] **10.12** Implement analysis caching keyed by IR digest
- [ ] **10.13** Ship a minimal VS Code extension
- [ ] **10.14** Benchmark diagnostic latency on a 1,000-rule workspace

## Turn protocol

Open every turn with `SPEC: 10-lsp | TASK: <n.n> | PHASE: P11`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
