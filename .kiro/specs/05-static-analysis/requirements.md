# Requirements - Static Analysis

**Spec ID:** `05-static-analysis` | **Phase:** P5 | **Invariants:** I1, I2, I7, I11

## Purpose

Implement the thirteen normative analyses from spec section 7, soundly, deterministically, and within a bounded budget.

## Acceptance criteria (EARS format)

### 1. Totality and bounds

**User story:** As a security reviewer, I need totality and bounds to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN a unit is analysed THEN the analyser SHALL prove absence of recursion in the reference graph.
1.2. WHEN a quantifier is analysed THEN the analyser SHALL prove its collection has a statically known cardinality bound.
1.3. WHEN analysis completes THEN the analyser SHALL report a static worst-case evaluation cost.
1.4. WHEN the cost bound exceeds the configured budget THEN compilation SHALL fail.
1.5. WHEN the cost bound is within 10 percent of the budget THEN the analyser SHALL emit AEG-2106.

### 2. Rule quality

**User story:** As a policy author, I need rule quality to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN a rule can never fire THEN the analyser SHALL emit AEG-2040 with a witness explaining why.
2.2. WHEN one rule subsumes another THEN the analyser SHALL emit AEG-2041 showing the implication.
2.3. WHEN two rules have identical conditions and opposing effects THEN the analyser SHALL emit AEG-2042 with both spans.
2.4. WHEN an input region matches no rule THEN the analyser SHALL emit AEG-2050 with a concrete example request.

### 3. Governance hazards

**User story:** As a compliance officer, I need governance hazards to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN a policy declares default permit THEN the analyser SHALL emit AEG-2020 and mark it for the audit report.
3.2. WHEN first_applicable is used THEN the analyser SHALL emit AEG-2021.
3.3. WHEN an irreversible high-criticality capability has no human gate THEN the analyser SHALL emit AEG-2010.
3.4. WHEN an obligation cannot be discharged by any known enforcement point THEN the analyser SHALL emit AEG-2070.
3.5. WHEN a restricted data class can reach a permit path without a redaction obligation THEN the analyser SHALL emit AEG-2080.

### 4. Determinism hazards

**User story:** As a maintainer, I need determinism hazards to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN a determinism hazard is detectable statically THEN the analyser SHALL report it as an error, not a warning.

### 5. Soundness and budget

**User story:** As a maintainer, I need soundness and budget to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN the analyser cannot decide a question THEN it SHALL report conservatively and SHALL NOT claim safety.
5.2. WHEN the solver times out THEN the analyser SHALL degrade to a conservative result and say so.
5.3. WHEN analysis runs twice on identical input THEN findings SHALL be identical in content and order.

### 6. Suppression

**User story:** As a compliance officer, I need suppression to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN an advisory is suppressed THEN the suppression SHALL be recorded and SHALL appear in the audit report.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
