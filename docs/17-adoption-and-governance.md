# 17 - Adoption and Project Governance

## Adoption is the dominant risk

A technically perfect language with zero deployments is a failure. Construction risk is manageable; adoption risk is not, and it is not solved by better engineering.

## The sequence

| Stage | Action | Success signal |
|---|---|---|
| 0 | Ship AEGIS inside AgentProof/Veydria as the captive first user | One real enforced deny in production |
| 1 | Publish the specification, the conformance suite, and the binary | Someone outside the project writes a policy |
| 2 | Publish the templates mapped to EU AI Act, NIST, ISO 42001 | A compliance officer uses a generated report unmodified |
| 3 | Write the comparison honestly against Rego and Cedar | An informed reader can say precisely when to choose AEGIS |
| 4 | Get one external production deployment | A bug report from a stranger's production system |
| 5 | Invite a third-party implementation | The spec is proven independent |

Do not invert this order. Publishing before stage 0 means defending a language you have never operated.

## Positioning, in one paragraph

Rego and Cedar are excellent general authorisation languages. Neither generates an auditor-facing document from the same source as the enforcement artifact, neither treats regulatory clause citation as a first-class construct, and neither emits a signed hash-chained evidence record as an evaluator output. AEGIS narrows the domain to AI agent governance in order to make those three things structural rather than optional. If you need general-purpose authorisation, use Cedar or OPA. If you need to prove to a regulator what constrained an agent and what it decided, use AEGIS.

## Licence and trademark

Apache 2.0 for the language, the specification, the conformance suite, and the SDKs - permanently, with no relicensing. The name and logo are trademarked so that "AEGIS-conformant" means something. Commercial value sits above the language: registry, distribution, evidence retention, dashboards, and clause-library maintenance. This is the Terraform and OPA pattern, and the boundary must never be blurred by crippling the open language.

## Specification governance

The specification is supreme (I10). Changes go through a numbered RFC: motivation, precise specification delta, conformance case additions, migration impact, and an explicit statement of which invariants are touched. A change that weakens an invariant requires renumbering the invariant list and a major version bump. Implementation-first changes are rejected on principle, however convenient.

## Versioning

Semantic versioning on the language, independently on the toolchain, the IR format, the bytecode format, and each clause library. Deprecation runs for two minor versions with a compiler warning naming the replacement. Unknown major versions are rejected, never guessed.

## Community

Contribution requires: a conformance case for every behaviour change, a catalogue entry for every new diagnostic, a specification delta for every language change, and a passing differential and determinism run. High bar, stated plainly and applied consistently. A governance tool with a lax contribution process is a contradiction.
