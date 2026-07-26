# Requirements - Runtime and PDP

**Spec ID:** `07-runtime-pdp` | **Phase:** P7 | **Invariants:** I2, I3, I4, I7, I8, I11

## Purpose

Execute bytecode against a materialised request, producing a decision, a minimal justification, and obligations - purely, totally, and deterministically.

## Acceptance criteria (EARS format)

### 1. Loader safety

**User story:** As a security reviewer, I need loader safety to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN bytecode has bad magic THEN the loader SHALL emit AEG-6001 and refuse to load.
1.2. WHEN the major version is unsupported THEN the loader SHALL emit AEG-6002 and refuse to load.
1.3. WHEN the integrity hash mismatches THEN the loader SHALL emit AEG-6003 and refuse to load.
1.4. WHEN any jump target, register index, or constant index is out of range THEN the loader SHALL refuse to load.
1.5. WHEN the loader receives arbitrary bytes THEN it SHALL NOT panic.
1.6. WHEN a bundle signature fails verification THEN the PDP SHALL refuse to load and SHALL NOT degrade to unsigned.

### 2. Purity

**User story:** As a security reviewer, I need purity to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN evaluation runs THEN the evaluator SHALL perform no file, network, clock, environment, or random access.
2.2. WHEN the current time is needed THEN it SHALL be read from the injected request clock only.

### 3. Totality

**User story:** As a platform engineer, I need totality to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN evaluation is invoked THEN it SHALL always return a decision and SHALL never panic.
3.2. WHEN a required attribute is missing THEN evaluation SHALL return Indeterminate with AEG-5001.
3.3. WHEN a request attribute has the wrong type THEN evaluation SHALL return Indeterminate with AEG-5002.
3.4. WHEN the quantifier iteration cap is reached THEN evaluation SHALL return Indeterminate with AEG-5010.

### 4. Combining

**User story:** As a implementer, I need combining to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN rule results are combined THEN the declared algorithm SHALL be applied as a total function.
4.2. WHEN all rules are NotApplicable THEN the policy default SHALL apply.
4.3. WHEN the six order-independent combiners are tested THEN commutativity and associativity SHALL hold exhaustively for multisets up to size four.

### 5. Fail-closed

**User story:** As a security reviewer, I need fail-closed to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN the result is Indeterminate THEN the enforcement boundary SHALL resolve it to Deny by default.
5.2. WHEN an obligation cannot be discharged THEN its declared on_failure effect SHALL apply.

### 6. Justification

**User story:** As a compliance officer, I need justification to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN a decision is produced THEN it SHALL carry decisive rule identifiers, spans, citations, and only the bindings those rules referenced.
6.2. WHEN the justification is compared against a minimal reference THEN it SHALL contain no extraneous entries.

### 7. Performance

**User story:** As a platform engineer, I need performance to behave exactly as specified, so that the artifact can be trusted.

7.1. WHEN a 1,000-rule bundle is evaluated THEN p50 latency SHALL be under 100 microseconds and p99 under 1 millisecond.
7.2. WHEN evaluated on one core THEN throughput SHALL exceed 50,000 decisions per second.

### 8. Concurrency

**User story:** As a maintainer, I need concurrency to behave exactly as specified, so that the artifact can be trusted.

8.1. WHEN evaluation runs THEN it SHALL hold no global mutable state and SHALL be safe to run concurrently on distinct contexts.
8.2. WHEN a bundle is hot-reloaded THEN in-flight requests SHALL complete against the bundle they started with.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
