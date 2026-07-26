# Requirements - Audit and Evidence

**Spec ID:** `08-audit-evidence` | **Phase:** P8 | **Invariants:** I5, I6, I8

## Purpose

Emit a signed, hash-chained evidence record for every decision, and generate the human audit report from the same IR as the bytecode.

## Acceptance criteria (EARS format)

### 1. Evidence emission

**User story:** As a auditor, I need evidence emission to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN a decision is produced THEN an evidence record SHALL be emitted as an output of evaluation, not as a log line.
1.2. WHEN a record is emitted THEN it SHALL contain sequence, previous hash, timestamp, bundle digest, IR digest, request digest, decision, decisive rules with spans and citations, obligations with discharge status, advice, redactions, evaluation duration, key identifier, self hash, and signature.

### 2. Chaining

**User story:** As a auditor, I need chaining to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN a record is chained THEN self hash SHALL equal SHA-256 of previous hash concatenated with the canonical record bytes.
2.2. WHEN a record is inserted THEN verification SHALL fail on sequence or previous-hash continuity.
2.3. WHEN a record is deleted THEN verification SHALL fail on a chain gap.
2.4. WHEN any byte of a record is mutated THEN verification SHALL fail on self hash.

### 3. Independent verification

**User story:** As a auditor, I need independent verification to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN the verifier is built THEN it SHALL share no serialisation code with the writer.
3.2. WHEN verification runs THEN it SHALL check continuity, every self hash, and every signature against the key valid at that record's timestamp.

### 4. Data minimisation

**User story:** As a data protection officer, I need data minimisation to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN bindings are recorded THEN only those referenced by decisive rules SHALL appear.
4.2. WHEN a value belongs to a restricted data class THEN it SHALL be redacted before hashing and the redaction SHALL be listed with its reason.
4.3. WHEN a record is redacted THEN it SHALL remain verifiable.

### 5. Audit report

**User story:** As a compliance officer, I need audit report to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN the report is generated THEN it SHALL derive from the same IR as the bytecode.
5.2. WHEN the report is generated THEN it SHALL contain no code and SHALL render every rule in plain language with its reason and citations.
5.3. WHEN fail-open configuration or a suppressed advisory exists THEN it SHALL be highlighted prominently.
5.4. WHEN the report is generated twice with a fixed timestamp THEN the bytes SHALL be identical.

### 6. Honesty

**User story:** As a maintainer, I need honesty to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN evidence properties are documented THEN the term used SHALL be tamper-evident, never tamper-proof.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
