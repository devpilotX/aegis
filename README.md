# AEGIS

**A**gent **E**nforcement & **G**overnance **I**nstruction **S**pecification

> An independent, self-contained programming language whose programs are written, read, and executed as machine-enforceable governance for AI agents.

---

## What this repository is

This is the **complete design and build package** for a new programming language called **AEGIS**. It is not a framework, not a library, and not a wrapper around an existing language. It is a language with its own grammar, its own type system, its own compiler, its own runtime, and its own single-binary distribution that depends on nothing installed on the target machine.

This repository contains **zero implementation code**. It contains everything required *before and during* implementation:

| Folder | Contains |
|---|---|
| `docs/` | The full A-to-Z project description: problem, market, language specification, grammar, type system, semantics, runtime architecture, security model, roadmap |
| `skills/` | The complete skills catalogue — **1,000+ atomic, individually verifiable skills** organised into 24 domains, with a learning path and self-assessment protocol |
| `prompts/` | The **Master Prompt** plus 14 phase-level execution prompts, review prompts, and adversarial audit prompts, engineered for a maximum-effort frontier coding model |
| `.kiro/steering/` | Kiro CLI steering documents — 10 always-loaded project context files that constrain every generation |
| `.kiro/specs/` | Kiro CLI feature specs — 13 features, each with `requirements.md`, `design.md`, `tasks.md` |
| `examples/` | Example AEGIS programs covering every language construct |
| `templates/` | Reusable policy templates mapped to EU AI Act, NIST AI RMF, ISO/IEC 42001 |
| `research/` | Competitive analysis, prior art, and the precise gap being addressed |

---

## The one-paragraph pitch

AI agents now take real actions — moving money, writing to production databases, emailing customers, calling other agents. The rules that govern what they may do live in PDFs, spreadsheets, and YAML: documents a computer cannot enforce and an auditor cannot verify. AEGIS makes those rules **executable**. You write a policy once, in a language designed for exactly this purpose, and the same source file compiles two ways: into a **runtime enforcement engine** that physically prevents violations at the moment of action, and into a **human-readable audit artifact** that a regulator can read without touching code. One source of truth. Machine-enforced. Human-auditable. Cryptographically evidenced.

---

## Why this is Layer 4

The phrase "a programming language for AI" hides four unrelated products. This project targets the fourth, and only the fourth.

| Layer | Problem | Incumbents | Status |
|---|---|---|---|
| 1 — Performance | Fast tensor/GPU kernels | Mojo, Julia, Triton, CUDA | **Closed.** Requires compiler-research teams and silicon partnerships. |
| 2 — Agent authoring | Typed LLM calls, structured output | BAML, DSPy, POML, LMQL | **Crowded and funded.** BAML already ships the exact pitch. |
| 3 — Orchestration | Multi-agent graphs, retries, state | LangGraph, MS Agent Framework, CrewAI | **Framework-shaped, not language-shaped.** The market is actively rejecting more abstraction here. |
| **4 — Governance** | **Declarative, machine-checkable constraints on agent behaviour, with audit-grade evidence** | **Effectively nothing purpose-built** | **✅ Open.** |

The closest prior art is Open Policy Agent's Rego, which is a general policy language for infrastructure and API authorisation. Rego has no concept of an AI model, a tool call, an evaluation score, a token budget, a hallucination risk tier, a human-in-the-loop escalation, a temporal obligation, or a regulatory clause reference. AEGIS is built around those primitives as first-class citizens.

Full competitive analysis: `research/prior-art.md`

---

## What "independent" means here, precisely

Three distinct properties are often confused. AEGIS targets two of them deliberately and rejects the third deliberately.

| Property | Definition | AEGIS | Reasoning |
|---|---|---|---|
| **Runtime independence** | Ships as a single native binary. No VM, no interpreter, no runtime, no `node_modules`, no Python, no JVM on the target machine. | ✅ **Required** | `aegis` is one static binary, 6–12 MB, for linux/darwin/windows × amd64/arm64. |
| **Specification independence** | The language is defined by a formal written standard, separate from any implementation, that a third party can implement from scratch. | ✅ **Required** | `docs/02-language-specification.md` + `docs/03-grammar.md` + the conformance suite are normative. |
| **Self-hosting** | The compiler is written in AEGIS itself. | ❌ **Deliberately rejected** | AEGIS is a *total* language: no unbounded recursion, no I/O, no dynamic allocation, no non-termination. Those restrictions are the product. A language that cannot loop forever cannot host its own compiler — and must not be able to. SQL, Rego, HCL, and Dhall are all non-self-hosting and all successful. |

**Do not treat non-self-hosting as a deficiency.** It is a soundness guarantee. It is what allows AEGIS policies to be statically decided, exhaustively analysed, and formally verified — properties no Turing-complete language can offer.

---

## Non-negotiable invariants

Every line of implementation must preserve all eleven. Any change that violates one is rejected regardless of benefit.

1. **Totality** — every AEGIS program terminates. No unbounded loops, no general recursion, no fixpoints. Enforced statically by the compiler, not by a runtime timeout.
2. **Determinism** — identical `(policy, request)` inputs produce byte-identical decisions on every platform, every build, forever. No map-iteration nondeterminism, no float arithmetic, no wall-clock reads during evaluation, no locale sensitivity.
3. **Purity** — the evaluator performs no I/O. No network, no filesystem, no clock, no randomness, no environment variables. All external facts enter as explicit, typed request attributes.
4. **Total decisions** — evaluation always returns a decision. There is no crash, no panic, no exception, no undefined behaviour. Errors become a first-class `Indeterminate` decision carrying structured diagnostics.
5. **Dual compilation** — every source file compiles to both an enforcement artifact and a human-readable audit artifact. Neither may drift from the other; they are generated from the same IR.
6. **Evidence by construction** — every decision emits a signed, hash-chained, tamper-evident evidence record. Evidence is not a logging feature bolted on; it is an output of the evaluator.
7. **Fail-closed** — ambiguity, missing attributes, internal errors, and version mismatches all resolve to `Deny` under the default combining algorithm. Fail-open must be explicitly, verbosely, auditable opted into per rule.
8. **Explainability** — every decision carries a complete, minimal, human-readable justification tracing the exact rules, clauses, and attribute values responsible. An unexplainable decision is a bug.
9. **Zero dependencies at runtime** — the shipped binary links no dynamic libraries beyond the platform libc, and ideally is fully static.
10. **Specification supremacy** — where implementation and specification disagree, the specification is correct and the implementation is broken. Fix the code, or amend the spec through the documented RFC process first.
11. **Bounded resources** — every evaluation has a statically computable upper bound on time and memory. The compiler reports this bound. Policies exceeding a configured budget fail to compile.

---

## Where to start

Read in this order. Do not skip.

1. `START-HERE.md` — orientation and the first 48 hours
2. `docs/00-project-overview.md` — the whole project in one document
3. `docs/01-problem-and-market.md` — why this exists and who pays
4. `docs/02-language-specification.md` — the normative language definition
5. `prompts/MASTER-PROMPT.md` — the prompt that drives implementation
6. `skills/SKILLS-INDEX.md` — everything you must be able to do
7. `.kiro/steering/` — load these into Kiro before writing any code

---

## Status

| Artifact | State |
|---|---|
| Language design | Complete, frozen for v0.1 |
| Formal grammar | Complete |
| Type system | Complete |
| Operational semantics | Complete |
| Implementation | Not started — this package is the input to implementation |

---

## Licence intent

Apache 2.0 for the language specification, conformance suite, and reference implementation. This is the Terraform/OPA playbook: the language is a commons, the platform is the business.
