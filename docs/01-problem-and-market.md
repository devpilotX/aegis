# 01 - Problem and Market

## The gap, quantified

| Signal | Value | Consequence |
|---|---|---|
| Organisations deploying AI agents | ~71% | The demand side is settled |
| Reaching production | ~11% | A 60-point gap, and governance is the dominant cause |
| Agents that are "just chatbots" | ~80% | Because consequential actions cannot be authorised safely |
| Average endpoints touched per business process | ~50 | Enforcement must be centralised, not per-integration |

The pilots that stall do not stall on model quality. They stall when someone asks: what stops it, who approved it, and can you prove it afterwards.

## Why now

1. **Regulation became enforceable.** The EU AI Act moved AI governance from aspiration to legal obligation with financial penalties. ISO/IEC 42001 made it certifiable.
2. **Agents gained real authority.** Tool calling plus MCP plus A2A means agents now transfer money and mutate production systems.
3. **The market rejected heavy abstraction.** 2026 sentiment moved away from thick orchestration frameworks toward protocols plus thin control points. A narrow, embeddable governance layer fits that shape; a framework does not.
4. **No incumbent occupies Layer 4.** Layers 1-3 are contested. Layer 4 has no purpose-built language.

## Buyer personas

| Persona | Cares about | Buys because |
|---|---|---|
| **Head of AI / platform lead** | Shipping agents past the pilot gate | Governance is the blocker between pilot and production |
| **CISO** | Blast radius, least privilege, fail-closed | Pre-execution interception of irreversible actions |
| **Compliance officer / DPO** | Article-cited controls, evidence, retention | The audit report is generated, not hand-written |
| **Auditor (external)** | Verifiable evidence, design and operating effectiveness | The evidence chain is independently verifiable |
| **Developer** | Not writing governance glue in every service | One PDP, one policy language, one SDK |

The buyer is usually the platform lead or CISO. The blocker is usually compliance. The user is the developer. All three must be satisfied, which is exactly why dual compilation is the product and not a nice-to-have.

## Bottom-up sizing sketch

Addressable: organisations that (a) run agents with write authority, and (b) face EU AI Act, ISO 42001, SOC 2, DORA, or sector equivalents. Priced as a platform per environment, with the language free. The language exists to create the category and the standard; revenue comes from registry, retention, and clause-library maintenance.

## Why a language wins over a product feature

A feature inside one vendor's platform governs only that platform. A language with a published specification, a conformance suite, and a permissive licence can become the way governance is expressed across platforms. That is the Terraform and Rego outcome. It is also the only path where a solo builder can matter: specifications scale where headcount does not.

## Honest risks

Adoption is the dominant risk, not construction. A technically perfect language with zero deployments is a failure. The mitigation is fixed and non-negotiable: ship AEGIS into AgentProof/Veydria and make the first real enforced decision the primary milestone.
