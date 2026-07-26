# Requirements - Desugaring and Binding

**Spec ID:** `03-semantics` | **Phase:** P4 | **Invariants:** I1, I8, I10

## Purpose

Desugar the three rule surface forms into one core form, then resolve every name to its declaration in two passes.

## Acceptance criteria (EARS format)

### 1. Desugaring

**User story:** As a implementer, I need desugaring to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN `deny C unless G` is desugared THEN the core condition SHALL be `C and not G` with effect Deny.
1.2. WHEN `require C otherwise E` is desugared THEN the core condition SHALL be `not C` with effect E.
1.3. WHEN `allow C when G` is desugared THEN the core condition SHALL be `C and G` with effect Permit.
1.4. WHEN desugaring produces a node THEN that node SHALL carry the span of its origin.
1.5. WHEN any rule is desugared THEN desugaring SHALL be total: no rule form SHALL be left unhandled.

### 2. Binding

**User story:** As a policy author, I need binding to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN a name is used before its declaration appears THEN binding SHALL still succeed, because pass one collects declarations.
2.2. WHEN a name cannot be resolved THEN binding SHALL emit an error with a did-you-mean suggestion.
2.3. WHEN two declarations share a name in one scope THEN binding SHALL emit a duplicate declaration error naming both spans.
2.4. WHEN a quantifier variable is bound THEN it SHALL be visible only within the quantifier body.
2.5. WHEN shadowing harms readability THEN binding SHALL warn.

### 3. Modules

**User story:** As a platform engineer, I need modules to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN an import alias is used THEN it SHALL resolve to the imported package.
3.2. WHEN a non-exported symbol is referenced across packages THEN binding SHALL emit an error.
3.3. WHEN imports form a cycle THEN binding SHALL emit AEG-3010 with the full cycle path.
3.4. WHEN the import graph exceeds depth 32 THEN binding SHALL emit AEG-3082.

### 4. Determinism

**User story:** As a maintainer, I need determinism to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN binding runs twice on identical input THEN diagnostics SHALL be identical in content and order.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
