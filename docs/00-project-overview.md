# 00 - Project Overview

## A. Identity

**AEGIS** - Agent Enforcement & Governance Instruction Specification. An independent, total, declarative language for machine-enforceable AI agent governance. Extension `.aegis`, CLI `aegis`, bytecode `.aegisc` (magic `AEGS`), bundle `.aegisb`, wire format `AEGIS-IR/1`.

## B. The problem

AI agents take consequential actions. The rules constraining those actions live in PDFs, spreadsheets, and hand-maintained YAML. A PDF cannot stop an action, cannot be tested, and cannot prove after an incident what the rule was at the moment the action occurred. 71% of organisations deploy agents; ~11% reach production. The blocker is governance, not capability.

## C. Solution shape

One source file. One canonical IR. Three artifacts that cannot drift:

| Artifact | Consumer | Property |
|---|---|---|
| `.aegisc` bytecode | Policy Decision Point in the request path | Sub-millisecond, deterministic, total |
| Audit report | Compliance officers, auditors, regulators | Plain language, clause-cited, code-free |
| Evidence records | Incident investigators, certification bodies | Hash-chained, signed, tamper-evident |

## D. What it is not

Not general-purpose. Not Turing complete. Not an orchestrator. Not a prompt framework. Never calls a model. Never performs I/O during evaluation. Not self-hosting, deliberately.

## E. Object model

`capability` (a tool an agent may invoke, with criticality, reversibility, and data classes), `principal` (an actor or approver with role, scope, MFA), `resource_class` (data classification and jurisdiction), `schema` (the declared request surface), `policy` (a combining algorithm, a target, rules, a default, a violation handler), `rule` (condition, effect, reason, obligations), `obligation` (binding, must be discharged), `advice` (non-binding), `test` (in-language, part of the artifact).

## F. Decision model

Four-valued: `Permit`, `Deny`, `NotApplicable`, `Indeterminate`. Seven combining algorithms: `deny_overrides`, `permit_overrides`, `first_applicable`, `only_one_applicable`, `unanimous`, `deny_unless_permit`, `permit_unless_deny`. All but `first_applicable` are provably commutative and associative.

## G. Language character

Readable by a compliance-literate non-programmer. No loops. No recursion. No mutable state. No user-defined functions. No null. No floats. No string interpolation. ASCII identifiers only. Bounded quantification only.

## H. Canonical example

```aegis
specification "1.0"
package acme.payments
import std.eu_ai_act as eu

export capability transfer_funds {
  tool         "payments.transfer"
  criticality  high
  reversible   false
  data_classes { pii, financial }
}

export principal reviewer {
  role  "finance.approver"
  scope tenant
  mfa   required
}

policy eu_high_risk_payment_gate {
  combining  deny_overrides
  applies_to context.region in eu.member_states
             and action.capability == transfer_funds
  cites eu.article(6)
  cites eu.article(14)

  rule tier_bound {
    require model.risk_tier <= limited
    otherwise deny
      reason "Model risk tier exceeds the permitted band."
  }

  rule human_gate {
    deny action.capability == transfer_funds
    unless human.approved_by(reviewer) within 5m
      reason "Irreversible high-value action requires fresh human approval."
  }

  default deny

  on violation {
    halt
    audit.emit(severity: high, evidence: full_trace)
    notify("risk-oncall")
  }
}

test "blocks large EU transfer without approval" {
  given {
    context.region  = "EU"
    resource.amount = money(25_000, EUR)
    human.approved  = false
  }
  expect deny
  expect rule human_gate fired
  expect decision stable
}
```

## I. Architecture

```
source -> NFC normalise -> lex -> parse -> desugar -> bind -> typecheck
       -> analyse -> canonical IR -> { bytecode, audit report }
                                       |
                             request -> PDP -> decision + justification
                                       -> evidence record (signed, chained)
```

Specs, one per component: `01-lexer`, `02-parser`, `03-semantics`, `04-type-system`, `05-static-analysis`, `06-ir-compiler`, `07-runtime-pdp`, `08-audit-evidence`, `09-cli-tooling`, `10-lsp`, `11-wasm-embed`, `12-conformance`.

## J. Why Go for v1

| Criterion | Go | Rust | TypeScript | Zig |
|---|---|---|---|---|
| Single static binary | Yes, trivially | Yes | No | Yes |
| Time to productive | Days | Months | Already there | Weeks |
| Compile speed | Excellent | Poor | Good | Good |
| Ecosystem maturity | High | High | High | Low |
| Deterministic by default | Needs discipline on maps | Yes | Needs discipline | Yes |
| WASM target | Good | Excellent | N/A | Excellent |

Go wins on time-to-binary and time-to-productive, which are the binding constraints. Rust would win on rigour and cost six months.

## K. Regulatory grounding

EU AI Act (Articles 5, 6, 9-15, 26, 27, 50, 51-55, Annex III), NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE), ISO/IEC 42001 (clauses 4-10, Annex A), ISO/IEC 23894, SOC 2, GDPR Article 22, DORA. Clauses are versioned, citable data - never hardcoded strings. See `docs/08-compliance-mapping.md`.

## L. Independence strategy

Runtime: one static binary, `CGO_ENABLED=0`, verified in `scratch`. Specification: implementable by a stranger from `docs/02` + `docs/03` + conformance. Host: WASM/WASI plus a C ABI. Self-hosting: rejected, because totality forbids it and that is a guarantee.

## M. Performance targets

Cold start <15 ms (ceiling 50). Bundle load 1k rules <20 ms (100). Decision p50 <100 us, p99 <1 ms (5). Throughput >50,000/s/core. Memory <25 MB (64). Binary <12 MB (25). WASM <6 MB (12). Evidence <50 us (200). Compile 1k rules <500 ms (2 s). All CI-gated.

## N. Quality bar

90% line / 85% branch coverage, 100% on the evaluator core. 1,200+ conformance cases. 75%+ mutation score on checker and evaluator. 24 h fuzz with zero panics and zero non-termination. Determinism: 10,000 iterations across 6 targets, byte-identical.

## O. Business model

Apache 2.0 language, open forever. Commercial platform above it: policy registry, distribution, evidence retention, dashboards, clause library maintenance. The Terraform and OPA playbook.

## P. Risk register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Nobody adopts it | Critical | Ship into AgentProof/Veydria as the captive first user |
| 2 | Scope explosion kills momentum | Critical | Three-keyword rule, enforced every turn |
| 3 | Regulation shifts under the design | High | Clauses are versioned data, not code |
| 4 | A large vendor ships the same thing | High | Move fast, own the spec and the conformance suite |
| 5 | Determinism bug reaches production | High | Determinism harness in CI, Sev-1 policy |
| 6 | Cryptographic mistake in the evidence chain | High | Standard library only, external review, Gate G4 |
| 7 | Learning curve on Go slows Phase 6 | Medium | v0 in TypeScript first; Phase 6 is translation |
| 8 | Diagnostics end up mediocre | Medium | Phase 3 is dedicated to them; golden tests |
| 9 | Fabricated legal citations damage credibility | High | CITATION-NEEDED marker fails CI |
| 10 | Burnout over a 9-month build | High | Ship something every week; portfolio-grade at Phase 5 |

## Q. Definition of done

See `prompts/MASTER-PROMPT.md` Section 8. Twenty items, no partial credit. Item 19 - deployed and enforcing in a real system - is the one that matters.

## R. Reading order

`START-HERE.md` -> this document -> `docs/02` (normative, line by line) -> `docs/03` grammar -> `skills/SKILLS-INDEX.md` -> `skills/LEARNING-PATH.md` -> `prompts/MASTER-PROMPT.md` -> `.kiro/specs/01-lexer/`.
