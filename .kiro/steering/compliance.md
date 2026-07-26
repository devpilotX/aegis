---
inclusion: always
---

# Regulatory Grounding and Honesty Rules

## The standing honesty rule

AEGIS never makes an organisation compliant. It enforces constraints, explains them, and proves what it decided. Compliance is a judgement made by humans and auditors about an organisation as a whole. Any wording that implies otherwise is a defect in the product, not a marketing choice.

Use: "AEGIS enforces this constraint and produces evidence that it was enforced."
Never: "AEGIS makes you EU AI Act compliant."

## Citation integrity - the hardest rule in the project

Never invent an article number, clause identifier, subcategory ID, or control reference. If you are not certain, write `CITATION-NEEDED` and let CI fail the build.

A compliance tool that cites a nonexistent article destroys its own credibility permanently, and may cause a real organisation to make a real mistake. This risk is rated High in the register precisely because the failure is silent and confident.

## Clauses are versioned data, not code

Regulations change. Clause references are therefore versioned values, not string literals baked into rule bodies:

```
eu:article:14@2024-07-12
```

When a clause version is superseded, referencing it produces warning `AEG-2030`. This is what allows the language to survive regulatory amendment without a breaking release.

## Frameworks in scope

| Framework | Anchors used |
|---|---|
| **EU AI Act** | Articles 5, 6 + Annex III, 9, 10, 11, 12, 13, 14, 15, 26, 27, 50, 51-55 |
| **NIST AI RMF 1.0** | GOVERN, MAP, MEASURE, MANAGE functions; `MEASURE-2.3`, `MANAGE-4.1` used in templates |
| **ISO/IEC 42001** | Clauses 4-6, 7, 8, 9, 10, plus Annex A; `A.6.2` used in a template |
| **ISO/IEC 23894** | Risk management guidance |
| **SOC 2** | `CC8.1` used in a template |
| **GDPR** | Articles 22, 5, 30 |
| **DORA** | Operational resilience, financial sector |
| **HIPAA** | Health data classes |
| **PCI-DSS** | Payment data classes |

## The three obligations that shaped the language

1. **Article 14 - human oversight.** Requires that a human can intervene meaningfully. This produced the `human` request root, the `unless human.approved_by(...) within <duration>` form, and the freshness requirement on approvals. An approval with no time bound is not oversight.

2. **Article 12 - record keeping.** Requires automatic logging of events over the system lifetime. This produced I6, evidence by construction. Optional logging cannot satisfy a record-keeping obligation, which is why evidence cannot be disabled.

3. **Article 50 - transparency.** Requires that people are told they are interacting with AI. This produced the `obligation` and `advice` constructs and the requirement that obligations be dischargeable and tracked (`AEG-2070`).

## Standard library clause packages

`std.eu_ai_act` - `article(n)`, `annex(n)`, `member_states`, `transparency_notice()`
`std.nist_ai_rmf` - `subcategory(id)`
`std.iso42001` - `clause(id)`, `annex_a(id)`
`std.gdpr` - `article(n)`
`std.soc2` - `criterion(id)`

## The audit report is a first-class deliverable

Under I5, the compliance document is not documentation - it is a compiler output with the same status as bytecode. Its acceptance test is behavioural, not technical:

> A compliance officer who has never seen AEGIS reads the generated report cold, without a walkthrough, and accepts it as evidence of control.

Until that has happened with a real person, the report generator is not done. This is one of the five milestones that matter more than phases.

## Reading duty before Phase 13

Do not write clause-mapping logic from memory. The primary texts to have actually read: EU AI Act Articles 5, 6, 9-15, 26, 50; NIST AI RMF 1.0 plus the Generative AI Profile; ISO/IEC 42001 clause structure and Annex A. Gate G5 requires 90% on the regulatory domains before conformance work begins.
