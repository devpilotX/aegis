# Requirements - Language Server and Formatter

**Spec ID:** `10-lsp` | **Phase:** P11 | **Invariants:** I8, I2

## Purpose

Provide an editor experience good enough that a compliance-literate author can write policy confidently.

## Acceptance criteria (EARS format)

### 1. Diagnostics

**User story:** As a policy author, I need diagnostics to behave exactly as specified, so that the artifact can be trusted.

1.1. WHEN a document changes THEN diagnostics SHALL be published within 200 milliseconds for a 1,000-rule workspace.
1.2. WHEN a diagnostic has a suggested fix THEN a code action SHALL be offered where the fix is unambiguous.

### 2. Navigation

**User story:** As a policy author, I need navigation to behave exactly as specified, so that the artifact can be trusted.

2.1. WHEN go-to-definition is invoked on a name THEN the server SHALL jump to its declaration.
2.2. WHEN find-references is invoked THEN all use sites SHALL be listed.
2.3. WHEN hover is invoked THEN the type, the doc comment, and any clause citation SHALL be shown.

### 3. Completion

**User story:** As a policy author, I need completion to behave exactly as specified, so that the artifact can be trusted.

3.1. WHEN completion is requested in an attribute position THEN only schema-declared paths SHALL be offered.
3.2. WHEN completion is requested in a citation position THEN clause identifiers with titles and versions SHALL be offered.
3.3. WHEN completion results are produced THEN their order SHALL be deterministic.

### 4. Formatting

**User story:** As a maintainer, I need formatting to behave exactly as specified, so that the artifact can be trusted.

4.1. WHEN a document is formatted THEN the result SHALL be canonical and formatting SHALL be idempotent.
4.2. WHEN a formatted document is parsed THEN the AST SHALL be unchanged.

### 5. Robustness

**User story:** As a maintainer, I need robustness to behave exactly as specified, so that the artifact can be trusted.

5.1. WHEN the document is syntactically invalid THEN the server SHALL still provide navigation from the last good parse.
5.2. WHEN the server encounters an internal error THEN it SHALL log and continue, never crash the editor session.

## Out of scope

Anything not listed above. If a capability seems necessary but is not written here, stop and amend this document first (I10). Do not implement ahead of the specification.
