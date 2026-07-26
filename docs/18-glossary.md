# 18 - Glossary

| Term | Meaning |
|---|---|
| **Advice** | A non-binding recommendation attached to a decision. Never affects the outcome. |
| **AEGIS** | Agent Enforcement & Governance Instruction Specification. |
| **Applies_to** | A policy's target expression, deciding whether the policy is considered at all. |
| **Bundle (`.aegisb`)** | A signed archive of compiled units, schemas, pinned clause versions, and test results. |
| **Bytecode (`.aegisc`)** | The compiled enforcement artifact. Magic `AEGS`. |
| **Capability** | A tool or action an agent may invoke, with criticality, reversibility, and data classes. |
| **Clause library** | Versioned, citable regulatory clause data with provenance. Data, never hardcoded strings. |
| **Combining algorithm** | The total function that reduces multiple rule results into one decision. |
| **Conformance suite** | The published corpus that defines what a conforming implementation is. |
| **Decision** | One of Permit, Deny, NotApplicable, Indeterminate. |
| **Desugaring** | Rewriting the three surface rule forms into one core form. Total and span-preserving. |
| **Determinism** | Identical inputs produce byte-identical outputs on every platform, forever (I2). |
| **Differential testing** | Running the same corpus through v0 and v1 and diffing everything. |
| **Evidence record** | A signed, hash-chained account of one decision. An evaluator output, not a log (I6). |
| **Fail-closed** | Ambiguity, missing data, and errors all resolve to Deny (I7). |
| **First_applicable** | The one order-sensitive combining algorithm. Always warns. |
| **Indeterminate** | The decision when the request cannot be evaluated. Resolves to Deny at the boundary. |
| **Invariant (I1-I11)** | An absolute property of the language. Non-negotiable. |
| **IR** | The canonical intermediate representation. Both compilation targets derive from it (I5). |
| **Justification** | The minimal tree of decisive rules, spans, citations, and referenced bindings (I8). |
| **Layer 4** | The governance layer: machine-checkable constraints plus audit evidence. AEGIS's domain. |
| **Obligation** | A binding action the enforcement point must discharge, with a declared on_failure effect. |
| **PAP** | Policy Administration Point. Authors, signs, distributes bundles. |
| **PDP** | Policy Decision Point. The pure, total evaluator. |
| **PEP** | Policy Enforcement Point. Intercepts the action; fails closed. |
| **PIP** | Policy Information Point. The only component permitted to perform I/O. |
| **Policy** | A combining algorithm, a target, rules, a default, and a violation handler. |
| **Principal** | An actor or approver, with role, scope, and MFA requirement. |
| **Purity** | The evaluator performs no I/O of any kind (I3). |
| **Reason** | Mandatory human-readable text on any rule that can deny or escalate. |
| **Resource bound** | The statically computed worst-case evaluation cost, reported by the compiler (I11). |
| **Rule** | Condition, effect, reason, obligations. |
| **Schema** | The declared request surface. All attribute access is checked against it. |
| **Self-hosting** | Writing a language's compiler in itself. Deliberately rejected here. |
| **Soundness** | Never reporting a program safe when it is not. Preferred over completeness. |
| **Span** | A half-open source range, carried through every phase onto every diagnostic. |
| **Subsumption** | One rule's condition implying another's, making the second redundant. |
| **Tamper-evident** | Alteration is detectable. Not the same as tamper-proof. Say the accurate word. |
| **Totality** | Every program terminates, proven statically, never by timeout (I1). |
| **Trace** | The bounded, ordered event sequence supplied in the request, over which temporal operators evaluate. |
