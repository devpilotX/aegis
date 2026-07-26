# Prior Art

## The one-sentence answer you must be able to give

> **AEGIS is not Rego and not BAML: Rego is a general-purpose authorisation language that answers "is this allowed?" without producing an auditor-facing document or a signed evidence chain from the same source, and BAML is a Layer 2 language that makes LLM calls typed and reliable without constraining what an agent is permitted to do at all - AEGIS is Layer 4, where one source file simultaneously enforces a constraint, explains it to a regulator in prose, and proves what it decided.**

If you cannot say that from memory, you are not ready to start Phase 1.

## Policy and authorisation languages

| System | Domain | What it does well | What it does not do |
|---|---|---|---|
| **Rego / OPA** | General policy | Mature, embeddable, huge ecosystem, partial evaluation | Turing-adjacent evaluation model, notoriously hard to read for non-engineers, no clause citation construct, no generated audit document, no evidence chain |
| **Cedar** | Authorisation | Formally verified, provably terminating, excellent analysis tooling | Deliberately narrow authorisation semantics; no obligations, no temporal operators, no compliance artifacts |
| **XACML** | Access control | The combining-algorithm model AEGIS inherits; PEP/PDP/PIP/PAP architecture | XML, verbose, effectively abandoned as an authoring surface |
| **Sentinel (HashiCorp)** | Policy as code | Good integration story inside one vendor's products | Proprietary, imperative, single-vendor |
| **Datalog / Soufflé** | Deductive queries | Provably terminating, elegant | Not a governance surface; no effects, no obligations |
| **Dhall** | Configuration | Total, non-Turing-complete, strongly typed - a direct design precedent | Configuration, not enforcement |
| **CEL** | Expression evaluation | Total, fast, widely embedded (Kubernetes) | An expression language, not a policy language; no decision model |

**What AEGIS takes:** the combining-algebra and PEP/PDP/PIP/PAP architecture from XACML; totality and non-Turing-completeness from Dhall and CEL; formal-verification ambition from Cedar; embeddability and the bundle model from OPA.

**What AEGIS adds that none of them have:** clause citation as a first-class construct, dual compilation to an enforcement artifact and a human audit document from one IR, and signed hash-chained evidence as an evaluator output rather than as logging.

## AI-specific languages and frameworks

| System | Layer | Purpose |
|---|---|---|
| **BAML** | 2 | Typed LLM function calls with reliable structured output |
| **DSPy** | 2 | Programmatic prompt optimisation |
| **POML** | 2 | Prompt markup and templating |
| **LMQL** | 2 | Constrained decoding as a query language |
| **Guidance** | 2 | Constrained generation |
| **LangGraph** | 3 | Stateful multi-agent graphs |
| **Microsoft Agent Framework** | 3 | Enterprise agent orchestration |
| **CrewAI** | 3 | Role-based multi-agent teams |
| **MCP / A2A** | protocol | Tool and agent interoperability |

None of these constrain what an agent is permitted to do, and none produce audit evidence. They are complementary, not competitive. AEGIS sits at the tool-invocation boundary that all of them cross.

## Guardrail libraries

NeMo Guardrails, Guardrails AI, Llama Guard, and similar systems filter content and detect prompt injection. They are probabilistic, model-based, and operate on text. AEGIS is deterministic, static, and operates on authorisation of actions. A model cannot be its own policy enforcer - that is the core argument, and it belongs in every conversation about this project.

## Compliance platforms

Vanta, Drata, and their peers automate evidence collection for existing frameworks. They observe; they do not enforce, and they have no policy language. AEGIS produces the enforcement and the primary evidence that such platforms would consume.

## Honest conclusion

Every individual mechanism in AEGIS exists somewhere. The combination - totality plus determinism plus clause citation plus dual compilation plus evidence by construction, aimed specifically at AI agent governance - does not. That is the entire claim, and it is defensible precisely because it is narrow.
