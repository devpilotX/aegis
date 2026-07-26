# Tasks - WASM and Embedding

**Spec ID:** `11-wasm-embed` | **Phase:** P12

Work strictly top to bottom. One task per turn. Do not start a task until the previous one has passing tests.

- [ ] **11.1** Define and document the stable C ABI
- [ ] **11.2** Implement the c-shared export layer with status codes
- [ ] **11.3** Implement the wasip1 build with a minimal import surface
- [ ] **11.4** Verify no clock or filesystem import in the WASM module
- [ ] **11.5** Measure and reduce WASM module size to under 6 MB
- [ ] **11.6** Implement the Python SDK over the C ABI
- [ ] **11.7** Implement the Node.js SDK
- [ ] **11.8** Implement the browser WASM SDK
- [ ] **11.9** Implement the Java SDK
- [ ] **11.10** Implement HTTP and gRPC sidecar servers with health and graceful shutdown
- [ ] **11.11** Add wasip1 to the determinism harness targets
- [ ] **11.12** Run the conformance suite through three host languages

## Turn protocol

Open every turn with `SPEC: 11-wasm-embed | TASK: <n.n> | PHASE: P12`, then `INVARIANTS TOUCHED:`, then `PLAN:`. Close with `DONE:`, `TESTS:`, `RISK:`, `NEXT:`. Full protocol in `prompts/MASTER-PROMPT.md` section 6.
