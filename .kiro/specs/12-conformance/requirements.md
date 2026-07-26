# Requirements - Conformance and Specification v1.0

**Spec ID:** `12-conformance` | **Phase:** P13 | **Invariants:** I10, I2

## Purpose

Publish a specification and conformance suite sufficient for a stranger to implement AEGIS independently.

## Acceptance criteria (EARS format)

### 1. Suite completeness

**User story:** As a implementer, I need suite completeness to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN v1.0 ships THEN the suite SHALL contain at least 1,200 cases.
1.2. WHEN the coverage tracker runs THEN every grammar production SHALL map to at least one case.
1.3. WHEN the coverage tracker runs THEN every catalogue diagnostic code SHALL map to at least one case.
1.4. WHEN a production or code is unmapped THEN CI SHALL fail.

### 2. Case format

**User story:** As a implementer, I need case format to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN a valid case is defined THEN it SHALL include source, request, and expected decision with justification.
2.2. WHEN an invalid case is defined THEN it SHALL include source and the exact expected diagnostic codes.
2.3. WHEN a canonical case is defined THEN it SHALL include byte-exact IR and byte-exact bytecode.

### 3. Independence

**User story:** As a third-party implementer, I need independence to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN the runner is published THEN it SHALL be executable against any implementation without access to reference source.
3.2. WHEN results are published THEN they SHALL be machine-readable.

### 4. Specification quality

**User story:** As a third-party implementer, I need specification quality to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN the specification is read THEN every normative statement SHALL use MUST, MUST NOT, SHOULD, or MAY deliberately.
4.2. WHEN implementation and specification disagree THEN the specification SHALL be treated as correct and the implementation fixed.
4.3. WHEN a language change is proposed THEN it SHALL arrive as a numbered RFC stating which invariants are touched.

### 5. Formal assurance

**User story:** As a maintainer, I need formal assurance to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN v1.0 ships THEN a TLA+ model SHALL establish totality, determinism, combiner algebra, fail-closed behaviour, and justification completeness.
5.2. WHEN formal guarantees are described publicly THEN unproven assumptions SHALL be stated explicitly.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
