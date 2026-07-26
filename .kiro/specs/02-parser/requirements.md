# Requirements - Parser

**Spec ID:** `02-parser` | **Phase:** P2 | **Invariants:** I1, I8, I10

## Purpose

Convert the token stream into a typed AST that mirrors docs/03-grammar.md exactly, with deliberate error recovery and a span on every node.

## Acceptance criteria (EARS format)

### 1. Grammar coverage

**User story:** As a implementer, I need grammar coverage to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN a valid unit is parsed THEN every production in docs/03-grammar.md SHALL be exercised by at least one conformance case.
1.2. WHEN a declaration appears in any order THEN parsing SHALL succeed, because binding is two-pass.
1.3. WHEN an expression is parsed THEN operator precedence and associativity SHALL match the table in spec section 5.1.

### 2. Non-associativity

**User story:** As a policy author, I need non-associativity to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN a chained comparison such as a < b < c appears THEN the parser SHALL emit AEG-4120 and SHALL NOT reinterpret it.
2.2. WHEN a chained relational or temporal operator appears THEN the parser SHALL emit the equivalent non-associativity diagnostic.

### 3. Spans

**User story:** As a tool author, I need spans to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN any AST node is created THEN it SHALL carry a span covering exactly its source extent.
3.2. WHEN a node is synthesised during desugaring THEN it SHALL inherit the span of its origin.

### 4. Error recovery

**User story:** As a policy author, I need error recovery to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN a syntax error occurs THEN the parser SHALL synchronise on the next policy, rule, or closing brace token.
4.2. WHEN recovery occurs THEN subsequent independent errors SHALL still be reported.
4.3. WHEN one root cause would produce multiple errors THEN cascades SHALL be suppressed.

### 5. Round-trip

**User story:** As a maintainer, I need round-trip to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN a unit is parsed, printed, and reparsed THEN the second AST SHALL equal the first.

### 6. Robustness

**User story:** As a maintainer, I need robustness to behave exactly as specified, so that the artifact can be trusted.

6.1. WHEN the parser receives an arbitrary token stream THEN it SHALL NOT panic and SHALL terminate.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
