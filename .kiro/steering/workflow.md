---
inclusion: always
---

# Turn Protocol and Working Rhythm

## Every turn opens with this

```
SPEC: <spec-id> | TASK: <n.n> | PHASE: P<n>
INVARIANTS TOUCHED: <I-ids, or none>
PLAN: <2-4 lines - what you will change and why>
```

## Every turn closes with this

```
DONE: <what now works, in behavioural terms>
TESTS: <what was added, and the result>
RISK: <what might be wrong, or what you noticed but did not fix>
NEXT: <the single next task id>
```

The `RISK:` line is mandatory and must not be "none" unless the change is genuinely trivial. It is the mechanism by which problems surface early instead of in week twenty.

## Refusal format

When a request conflicts with an invariant or with scope discipline:

```
**Invariant violation - refusing.**
```

Then: the invariant ID, the conflict in two sentences, and the nearest design that preserves it. Do not comply and then note the concern afterwards.

## Order of work - never deviate

1. Read the spec section named by the task.
2. Write the failing test first.
3. Write the smallest code that passes it.
4. Run `make test lint`.
5. Update `docs/` if behaviour or diagnostics changed.
6. Tick the checkbox in `tasks.md`.
7. Commit, one task per commit.
8. Report using the closing format.

## The thirteen phases

| Phase | Work | Weeks | Impl | Exit criterion |
|---|---|---|---|---|
| P0 | Design freeze, scaffolding | 1 | - | Spec frozen, repo scaffolded, Gate G0 passed |
| P1 | Lexer | 1 | TS | `conformance/*/lexer/` passes, exact codes, fuzz clean |
| P2 | Parser | 2 | TS | Full grammar, parse-print-parse idempotent |
| P3 | Diagnostics | 1 | TS | Every catalogue entry golden-tested |
| P4 | Type system and binding | 2 | TS | Nine type rules enforced, did-you-mean working |
| P5 | Evaluator - **DESIGN FREEZE** | 2 | TS | Three keywords end to end |
| P6 | Go frontend + differential | 4 | Go | Go and TS agree on the whole corpus |
| P7 | IR, bytecode, register VM | 3 | Go | p99 under 1 ms, loader fuzz clean |
| P8 | Evidence engine | 2 | Go | Chain verifies, verifier detects all tampering |
| P9 | CLI and static binary | 2 | Go | Scratch container runs, build reproducible |
| P10 | Audit report generator | 2 | Go | A compliance officer accepts it unmodified |
| P11 | LSP and formatter | 3 | Go | Editor experience is genuinely good |
| P12 | WASM, C ABI, SDKs | 2 | Go | Python, Node, and browser all work |
| P13 | Conformance and spec v1.0 | 3 | Go | 1,200+ cases, a third party could implement it |

Roughly 30 weeks. **The design freezes at the end of Phase 5.** After that point, syntax changes require a written amendment to `docs/` and a migration note.

## Five milestones that matter more than phases

1. First deny in production, in a real system, stopping a real action.
2. First audit report accepted by a real compliance officer.
3. First verified evidence chain, verified by someone who did not write it.
4. First external contributor.
5. First third-party implementation attempt - the moment it becomes a language rather than a program.

## Daily rhythm

- One task, one commit, every working session. Even a small one.
- Read the steering files again at the start of any session where you feel lost.
- If you are stuck for more than an hour, the task is too big. Split it and say so.
- Ship weekly. Something must work at the end of every week, or the 30 weeks will become 90.

## Sequencing rule

Do not begin a phase until the previous phase's exit criterion is objectively met and its assessment gate has passed. The gates are in `skills/ASSESSMENT.md`: G0 before P1, G1 before P4, G2 before P6, G3 before P7, G4 before P8, G5 before P13.
