# Requirements - WASM and Embedding

**Spec ID:** `11-wasm-embed` | **Phase:** P12 | **Invariants:** I2, I3, I9

## Purpose

Make AEGIS embeddable from any host language through a stable C ABI and a WASM/WASI module.

## Acceptance criteria (EARS format)

### 1. ABI stability

**User story:** As a platform engineer, I need abi stability to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN the C ABI is published THEN every function SHALL return an integer status where negative values are catalogue diagnostic codes.
1.2. WHEN the ABI is used THEN there SHALL be no callbacks into the host, no host allocation, no threads, and no I/O.
1.3. WHEN aegis_evaluate returns non-zero THEN the host SHALL treat the outcome as Deny.

### 2. WASM

**User story:** As a platform engineer, I need wasm to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN built for wasip1 THEN the module SHALL import no clock and no filesystem capability.
2.2. WHEN the module is measured THEN its size SHALL be under 6 MB.
2.3. WHEN the same bundle and request are evaluated natively and in WASM THEN the decision, justification, and evidence body SHALL be identical.

### 3. SDKs

**User story:** As a developer, I need sdks to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN any SDK encounters an error THEN it SHALL fail closed.
3.2. WHEN any SDK returns a result THEN it SHALL expose the full justification, the obligation list, and the evidence record.
3.3. WHEN obligations are returned THEN the SDK SHALL require the host to discharge them explicitly.

### 4. Testing

**User story:** As a maintainer, I need testing to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN a release is prepared THEN the conformance suite SHALL run through at least three host languages with identical results.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
