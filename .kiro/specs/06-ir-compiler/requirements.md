# Requirements - IR and Compiler

**Spec ID:** `06-ir-compiler` | **Phase:** P7 | **Invariants:** I2, I5, I11

## Purpose

Lower the checked AST to a canonical IR, then emit both compilation targets from that single IR.

## Acceptance criteria (EARS format)

### 1. Canonicality

**User story:** As a maintainer, I need canonicality to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN semantically equivalent sources are compiled THEN the canonical IR SHALL be byte-identical.
1.2. WHEN the IR is serialised THEN field order, set order, and record field order SHALL be canonical.
1.3. WHEN the IR is serialised twice THEN the bytes SHALL be identical.

### 2. Dual compilation

**User story:** As a compliance officer, I need dual compilation to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN bytecode and the audit report are generated THEN both SHALL derive from the same IR instance.
2.2. WHEN the IR changes THEN both artifacts SHALL change together; drift SHALL be impossible by construction.

### 3. Code generation

**User story:** As a implementer, I need code generation to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN a condition is lowered THEN short-circuit behaviour SHALL be implemented by branching, not by evaluating both operands.
3.2. WHEN a quantifier is lowered THEN a bounded iteration instruction sequence SHALL be emitted with a hard cap.
3.3. WHEN any instruction is emitted THEN a line table entry mapping it to a source span SHALL be emitted.
3.4. WHEN justification instructions are emitted THEN no optimisation SHALL remove them.

### 4. Bytecode format

**User story:** As a security reviewer, I need bytecode format to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN bytecode is written THEN it SHALL begin with the magic bytes AEGS and carry major and minor versions.
4.2. WHEN bytecode is written THEN a SHA-256 integrity hash over all preceding content SHALL be appended.
4.3. WHEN a signature is requested THEN a detached Ed25519 signature SHALL be produced.

### 5. Optimisation safety

**User story:** As a maintainer, I need optimisation safety to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN any optimisation is enabled THEN decisions and justifications SHALL be identical to the unoptimised build.
5.2. WHEN a no-optimisation build mode is requested THEN it SHALL be available for differential testing.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
