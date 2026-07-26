# Requirements - CLI and Tooling

**Spec ID:** `09-cli-tooling` | **Phase:** P9 | **Invariants:** I9, I2, I7

## Purpose

Ship a single static binary that compiles, checks, tests, evaluates, explains, reports, verifies, and packages.

## Acceptance criteria (EARS format)

### 1. Commands

**User story:** As a developer, I need commands to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN `aegis check <path>` runs THEN it SHALL report all diagnostics and exit non-zero if any error exists.
1.2. WHEN `aegis build <path>` runs THEN it SHALL emit .aegisc and report the static resource bound.
1.3. WHEN `aegis test <path>` runs THEN it SHALL run all in-language tests and exit non-zero on failure.
1.4. WHEN `aegis eval <bundle> <request.json>` runs THEN it SHALL print the decision and justification.
1.5. WHEN `aegis explain <bundle> <request.json>` runs THEN it SHALL print a plain-language explanation.
1.6. WHEN `aegis report <path>` runs THEN it SHALL generate the audit report.
1.7. WHEN `aegis verify-evidence <file>` runs THEN it SHALL verify the chain and report any tampering precisely.
1.8. WHEN `aegis bundle <path>` runs THEN it SHALL produce a signed .aegisb including pinned clause versions and test results.
1.9. WHEN `aegis fmt <path>` runs THEN it SHALL format canonically and idempotently.
1.10. WHEN `aegis conformance run <dir>` runs THEN it SHALL execute the suite and emit machine-readable results.

### 2. Independence

**User story:** As a platform engineer, I need independence to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN the binary is built with CGO_ENABLED=0 THEN it SHALL run in a scratch container with no other files present.
2.2. WHEN the build is repeated on a second machine THEN the output SHALL be byte-identical.

### 3. Output

**User story:** As a developer, I need output to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN --json is passed THEN output SHALL be machine-readable and stable.
3.2. WHEN NO_COLOR is set or the output is not a terminal THEN colour SHALL be omitted.
3.3. WHEN a release build encounters a failing policy test THEN it SHALL refuse to produce a bundle (AEG-3060).

### 4. Exit codes

**User story:** As a platform engineer, I need exit codes to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN the command succeeds THEN the exit code SHALL be 0; on diagnostics 1; on internal error 2; on usage error 64.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
