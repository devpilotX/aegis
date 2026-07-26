# Competitive Analysis

## Layer map, 2026

| Layer | Status | Leaders | Entry viable for a solo builder? |
|---|---|---|---|
| 1 Performance | Closed | Mojo, Triton, Julia, CUDA | No. Requires compiler-team scale and hardware access. |
| 2 Agent authoring | Contested, converging | BAML, DSPy, POML, LMQL | No. Funded incumbents with real traction. |
| 3 Orchestration | Contested, consolidating | LangGraph, MS Agent Framework, CrewAI | No. Platform vendors are absorbing this. |
| **4 Governance** | **Open** | **Nothing purpose-built** | **Yes. Narrow domain, specification-led, regulation-driven.** |

Mojo's trajectory is instructive: heavily funded, technically strong, and still under half a percent developer adoption by 2026. Layer 1 is not winnable by outsiders. Layer 4 is winnable precisely because it is unglamorous and requires regulatory literacy more than compiler scale.

## Nearest competitors, by threat

| Competitor | Threat | Why they might win | Why they might not |
|---|---|---|---|
| **OPA/Rego + custom tooling** | Highest | Mature, trusted, already deployed; someone could bolt on reporting | Rego's readability blocks compliance authorship; audit documents would be bolted on, not derived from one IR |
| **Cedar extended** | High | Formal rigour, AWS backing, provably terminating | Deliberately scoped to authorisation; obligations and compliance artifacts are out of charter |
| **A hyperscaler ships agent governance** | High | Distribution and trust | Would be platform-locked; a vendor-neutral specification is a different product |
| **Compliance platforms add enforcement** | Medium | Own the buyer relationship | No language expertise, no runtime in the request path |
| **Guardrail vendors move up** | Medium | Own the AI-safety narrative | Probabilistic model-based approach cannot produce deterministic evidence |
| **A standards body defines a format** | Medium | Legitimacy | Slow; and a reference implementation still has to exist |

## Where AEGIS is genuinely differentiated

1. **Dual compilation from one IR.** The enforcement artifact and the auditor's document cannot drift because they are generated together. No competitor does this.
2. **Clause citation as a language construct.** `cites eu.article(14)` is typed, versioned, and checked. Elsewhere this is a comment.
3. **Evidence as an evaluator output.** Not logging. Cannot be sampled, disabled, or lost.
4. **Statically provable properties.** Termination, reachability, subsumption, contradiction, coverage gaps, and a reported resource bound.
5. **Narrow by design.** The restriction is what makes the proofs possible. Generality is the competitor's weakness here, not their strength.

## Where AEGIS is weaker

No ecosystem. No brand. One maintainer. No formal verification at v1.0. Narrower applicability than a general policy language. These are real; state them in every honest comparison. The counter is that a specification plus a conformance suite plus a permissive licence lets a small project define a category that large vendors then implement.

## Strategy

Win the specification, not the feature list. Publish the conformance suite early. Make the audit report the demo, because that is what the buyer's blocker cares about. Prove it in AgentProof/Veydria before asking anyone else to trust it.
