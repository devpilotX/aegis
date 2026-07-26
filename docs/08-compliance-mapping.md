# 08 - Compliance Mapping

> **Not legal advice.** This document maps regulatory obligations to AEGIS mechanisms so engineers know what to build. Every citation MUST be verified against the actual instrument. An unverified citation MUST carry a `CITATION-NEEDED` marker, which fails CI.

## Clauses are data, not code

Clause libraries are versioned, citable data with provenance. `eu.article(14)` resolves to a clause record with an identifier, a version, an effective date, a short title, and a pointer to the authoritative text. Regulation changes therefore become data updates, not code changes, and every evidence record names the clause version in force at decision time.

## EU AI Act

| Provision | Obligation in substance | AEGIS mechanism |
|---|---|---|
| Article 5 | Prohibited practices | Deny rules with `default deny`; prohibited-practice template |
| Article 6 + Annex III | High-risk classification | `resource_class` jurisdiction and `applies_to` targeting |
| Article 9 | Risk management system | Policy bundle as the documented, versioned control set |
| Article 10 | Data and data governance | `data_classes`, data-class flow analysis, redaction obligations |
| Article 11 | Technical documentation | Generated audit report, bundle manifest |
| Article 12 | Record-keeping and logging | Hash-chained evidence records, retention configuration |
| Article 13 | Transparency to deployers | Audit report plus published justification schema |
| Article 14 | Human oversight | `escalate to <principal>`, approval freshness via `within` |
| Article 15 | Accuracy, robustness, cybersecurity | Eval score and freshness gates; signed bundles; fail-closed |
| Article 26 | Deployer obligations | Deployment-time policy templates |
| Article 27 | Fundamental rights impact assessment | Clause-cited policy set as supporting evidence |
| Article 50 | Transparency and disclosure | `obligation` with `disclose(...)` |
| Articles 51-55 | GPAI model obligations | Model attribute schema, tier gates |

## NIST AI RMF 1.0

| Function | AEGIS contribution |
|---|---|
| **GOVERN** | Policy as code, versioned, signed, reviewed; roles as `principal` declarations |
| **MAP** | `capability` criticality and reversibility; `resource_class` jurisdiction |
| **MEASURE** | `eval(...)` score and age gates; static analysis findings; test results in the bundle |
| **MANAGE** | Obligations, escalation, throttling, halting; incident replay from evidence |

## ISO/IEC 42001

| Area | AEGIS contribution |
|---|---|
| Clauses 4-6 (context, leadership, planning) | Policy bundle expresses stated objectives as enforceable rules |
| Clause 7 (support) | Generated documentation, doc comments as the record |
| Clause 8 (operation) | The PDP is the operational control |
| Clause 9 (performance evaluation) | Evidence records provide operating-effectiveness proof |
| Clause 10 (improvement) | Semantic policy diffing shows what changed and whether it loosened |
| Annex A controls | Mapped in the clause library with per-control policy templates |

## Other instruments

| Instrument | Relevant demand | AEGIS mechanism |
|---|---|---|
| ISO/IEC 23894 | AI risk guidance | Risk-tier enums, criticality gates |
| SOC 2 | Design and operating effectiveness of controls | Tests prove design; evidence proves operation |
| GDPR Article 22 | Automated decision-making safeguards | Human oversight rules, explainable justification |
| GDPR Articles 5, 30 | Minimisation, records of processing | Minimal bindings, redaction, retention config |
| DORA | Operational resilience, third-party risk | Fail-closed enforcement, signed bundles, replay |
| HIPAA | Minimum necessary, audit controls | Data-class flow analysis, evidence chain |
| PCI-DSS | Access control and logging | Capability gating, tamper-evident records |

## Discipline

Never state that using AEGIS makes an organisation compliant. AEGIS produces enforceable controls and audit-grade evidence. Compliance is a determination made by the organisation and its auditors. Any marketing copy that blurs this is a defect.
