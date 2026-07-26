---
inclusion: always
---

# Product: What AEGIS Is

## One sentence

AEGIS is an independent, total, declarative programming language in which one source file simultaneously enforces a constraint on an AI agent, explains that constraint to a regulator in prose, and proves what it decided.

## The name

**AEGIS** = **A**gent **E**nforcement & **G**overnance **I**nstruction **S**pecification.

| Artifact | Value |
|---|---|
| Source extension | `.aegis` |
| Compiled bytecode | `.aegisc` |
| Signed bundle | `.aegisb` |
| CLI binary | `aegis` |
| Bytecode magic | `0x41 0x45 0x47 0x53` (`AEGS`) |
| Wire format | `AEGIS-IR/1` |
| Evidence format | `AEGIS-EVIDENCE/1` |

## The layer

Four layers exist in the AI stack. Three are closed.

| Layer | Question it answers | Occupied by |
|---|---|---|
| 1 - Kernel | How fast does the tensor multiply? | Mojo, Triton, CUDA. Closed. |
| 2 - Prompt/IO | Is the model call typed and reliable? | BAML, DSPy, POML, LMQL. Closed. |
| 3 - Orchestration | What runs next? | LangGraph, Microsoft Agent Framework, CrewAI. Closed. |
| **4 - Governance** | **What is this agent permitted to do, why, and can you prove it?** | **Nobody. This is AEGIS.** |

Layer 4 is currently implemented as scattered Python `if` statements, YAML config, and PDF policy documents that no machine reads. That is the gap.

## Who it is for

AEGIS is **not a language for humans to write general programs in**. It is a language for constraining machines, read by three audiences:

1. **The runtime** - which must get a decision in under a millisecond, always.
2. **The auditor** - who must read generated prose and accept it without seeing code.
3. **The engineer** - who must be unable to write an unsafe policy even by accident.

If a feature serves only the third audience, it is probably out of scope.

## What it is not

- Not general-purpose. There are no loops, no recursion, no user functions, no I/O.
- Not self-hosting. Totality forbids it. This is a feature, shared with SQL, Rego, HCL, Dhall, and CEL.
- Not a compliance guarantee. AEGIS never claims to make an organisation compliant. It produces enforcement and evidence; humans and auditors produce compliance.
- Not a replacement for Rego or Cedar at the infrastructure authorisation layer.

## First user

AgentProof / Veydria - the operator's own AI governance SaaS - is the captive first user. Every language feature must be justified by a real policy that AgentProof needs to express. This is the primary mitigation against the largest risk: that nobody adopts it.

## Positioning paragraph (use this wording)

Rego answers "is this allowed?" but produces no auditor-facing document and no signed evidence chain from the same source. BAML makes model calls typed and reliable but does not constrain what an agent may do at all. AEGIS is Layer 4: enforcement, explanation, and proof from one artifact.
