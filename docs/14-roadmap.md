# 14 - Roadmap

Thirteen phases plus a design freeze. Every phase ends with something demonstrable. Nothing is "in progress" across a phase boundary.

| Phase | Name | Weeks | Language | Exit criterion |
|---|---|---|---|---|
| **P0** | Design freeze and scaffolding | 1 | - | Spec frozen, repo scaffolded, Gate G0 passed |
| **P1** | Lexer | 1 | TS | Tokenises every example with exact spans; fuzz clean |
| **P2** | Parser | 2 | TS | Full grammar parsed; parse-print-parse idempotent |
| **P3** | Diagnostics engine | 1 | TS | Every catalogue entry rendered and golden-tested |
| **P4** | Type system and binding | 2 | TS | All nine type rules enforced; did-you-mean working |
| **P5** | Evaluator and **DESIGN FREEZE** | 2 | TS | Three keywords end to end, tests passing, spec frozen |
| **P6** | Go frontend and differential harness | 4 | Go | Go and TS agree on the entire corpus |
| **P7** | IR, bytecode, VM | 3 | Go | p99 under 1 ms; loader fuzz clean |
| **P8** | Evidence engine | 2 | Go | Chain verifies; independent verifier detects all tampering |
| **P9** | CLI and static binary | 2 | Go | Runs in a `scratch` container; reproducible build |
| **P10** | Audit report generator | 2 | Go | A compliance officer accepts it unmodified |
| **P11** | LSP and formatter | 3 | Go | Diagnostics, hover, go-to-definition, format on save |
| **P12** | WASM, C ABI, SDKs | 2 | Go | Embedded from Python, Node, and a browser |
| **P13** | Conformance and spec v1.0 | 3 | - | 1,200+ cases; a third party can implement AEGIS |

**Total: about 30 weeks of focused work.** Portfolio-grade at the end of P5. Deployable at P9. Credible as a standard at P13.

## Milestones that matter more than phases

1. **First deny.** A policy blocks a real action in AgentProof/Veydria. Everything before this is preparation.
2. **First accepted audit report.** A compliance-literate person accepts generated output unmodified.
3. **First verified evidence chain.** An independent verifier confirms a real chain and detects a planted mutation.
4. **First external contributor.** Someone who is not you writes a policy and reports a bug.
5. **First third-party implementation attempt.** The specification is proven independent.

## After v1.0

Clause library expansion and maintenance as a service. A policy registry with distribution and rollback. Evidence retention with off-site anchoring. Semantic diffing in CI as a merge gate. Possibly a mechanised proof of the core semantics in Lean. Never: loops, recursion, user-defined functions, dynamic attribute access, or self-hosting.
