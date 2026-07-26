# Requirements - Type System

**Spec ID:** `04-type-system` | **Phase:** P4 | **Invariants:** I2, I4, I10

## Purpose

Enforce all nine normative type rules with bidirectional checking and local inference only.

## Acceptance criteria (EARS format)

### 1. Core rules

**User story:** As a policy author, I need core rules to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN types differ THEN the checker SHALL NOT insert an implicit conversion under any circumstances.
1.2. WHEN Money values of different currencies are compared THEN the checker SHALL emit AEG-4101.
1.3. WHEN a floating-point value would be introduced THEN the checker SHALL reject it.
1.4. WHEN an Optional value is used without discharge THEN the checker SHALL emit AEG-4110.
1.5. WHEN a comparison operator is chained THEN the checker SHALL emit AEG-4120.
1.6. WHEN a non-Bool operand appears in a logical operator THEN the checker SHALL emit AEG-4121.
1.7. WHEN values of different enum types are compared THEN the checker SHALL emit AEG-4102.
1.8. WHEN a Percent is used where a Decimal is expected THEN the checker SHALL accept it by subsumption.
1.9. WHEN a construct would require type-level computation THEN the checker SHALL emit AEG-4130.

### 2. Schema checking

**User story:** As a policy author, I need schema checking to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN an attribute path is not declared in any schema THEN the checker SHALL emit AEG-4010 with a suggestion.
2.2. WHEN a test given value does not match its schema type THEN the checker SHALL emit AEG-4020.

### 3. Bidirectionality

**User story:** As a implementer, I need bidirectionality to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN a rule condition is checked THEN it SHALL be checked against Bool, not inferred and then compared.
3.2. WHEN a set literal has an expected element type THEN elements SHALL be checked against it.
3.3. WHEN no expectation exists THEN the checker SHALL synthesise the least upper bound or emit an error.

### 4. Narrowing

**User story:** As a policy author, I need narrowing to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN an Optional is tested with is_some THEN it SHALL narrow to T within that branch only.

### 5. Diagnostics

**User story:** As a policy author, I need diagnostics to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN a type error is reported THEN it SHALL name the expected type, the actual type, and the source of the expectation.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
