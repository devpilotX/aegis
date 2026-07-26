# Tasks - Desugaring and Binding

**Spec ID:** `03-semantics` | **Phase:** P4

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **3.1** Define the core rule form and the desugaring interface
- [ ] **3.2** Implement desugaring for all three surface forms with span inheritance
- [ ] **3.3** Prove desugaring totality by exhaustive test over the rule form enumeration
- [ ] **3.4** Implement the scope tree and symbol table
- [ ] **3.5** Implement pass one: declaration collection
- [ ] **3.6** Implement pass two: reference resolution with use-to-declaration links
- [ ] **3.7** Implement duplicate declaration detection with both spans
- [ ] **3.8** Implement bounded-distance did-you-mean with deterministic ranking
- [ ] **3.9** Implement quantifier variable scoping
- [ ] **3.10** Implement shadowing warnings
- [ ] **3.11** Implement package namespacing, import aliases, and export visibility
- [ ] **3.12** Implement import cycle detection with full path reporting
- [ ] **3.13** Implement unused declaration detection (AEG-2060)
- [ ] **3.14** Emit the symbol index for LSP consumption
- [ ] **3.15** Golden-test every binding diagnostic

## Turn protocol

Open every turn with `SPEC: 03-semantics | TASK: <n.n> | PHASE: P4`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
