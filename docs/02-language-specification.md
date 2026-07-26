# 02 - AEGIS Language Specification (NORMATIVE)

**Version 1.0-draft. This document is normative. Where implementation and this document disagree, this document is correct.**

Key words: MUST, MUST NOT, SHOULD, MAY carry their usual normative force.

---

## 1. Lexical structure

### 1.1 Source representation

Source text MUST be valid UTF-8 and MUST be normalised to NFC before lexing. Invalid UTF-8 is `AEG-1001`. Bidirectional override characters are `AEG-1002`. Confusable homoglyphs in identifiers are `AEG-1003`.

### 1.2 Hard limits

| Limit | Value | Diagnostic |
|---|---|---|
| Source size | 4 MiB | AEG-1010 |
| Line length | 4,096 bytes | AEG-1011 |
| Identifier length | 128 bytes | AEG-1012 |
| Quoted name length | 256 chars, matching `[A-Za-z0-9_./:-]{1,256}` | AEG-1013 |
| Decimal significant digits | 38 | AEG-1014 |
| String literal length | 64 KiB | AEG-1015 |
| Collection cardinality | 4,096 | AEG-1016 |
| Quantifier nesting depth | 3 | AEG-1017 |
| Import graph depth | 32 | AEG-1018 |
| Duration range | 1 ms to 100 y | AEG-1019 |

### 1.3 Line terminators and whitespace

LF, CRLF, and lone CR MUST all terminate a line. Whitespace is insignificant except as a token separator.

### 1.4 Comments

`//` line comment. `///` doc comment, which MUST attach to the immediately following declaration and MUST be carried into the audit report. Block comments do not exist.

### 1.5 Keywords

**Structural:** `specification` `package` `import` `as` `export`
**Declaration:** `policy` `rule` `capability` `principal` `resource_class` `obligation` `advice` `schema` `enum` `const` `set` `type` `test` `suite` `fixture`
**Effect:** `allow` `deny` `require` `permit` `oblige` `escalate` `redact` `throttle` `halt` `otherwise` `unless` `when` `where`
**Combining:** `combining` `deny_overrides` `permit_overrides` `first_applicable` `only_one_applicable` `unanimous` `deny_unless_permit` `permit_unless_deny`
**Targeting:** `applies_to` `scope` `target` `cites` `on` `violation` `default`
**Logic:** `and` `or` `not` `implies` `xor` `in` `contains` `matches` `between` `if` `then` `else` `forall` `exists` `count` `any` `all` `none`
**Temporal:** `within` `before` `after` `since` `until` `during` `always` `eventually` `at` `for` `ago` `now`
**Values:** `true` `false` `some` `none` `money` `duration` `percent`

**Reserved and forbidden** (using one is `AEG-1030`, with a message explaining which invariant forbids it): `macro` `template` `extends` `abstract` `async` `await` `yield` `spawn` `import_dynamic` `unsafe` `native` `loop` `while` `recurse` `mut` `ref` `ptr`

### 1.6 Identifiers

`[a-z][a-z0-9_]*` for declarations and attributes. `[A-Z][A-Z0-9_]*` for currency codes. ASCII only (`AEG-1004`). Non-ASCII is rejected to prevent homoglyph substitution in legally binding text.

### 1.7 Literals

| Kind | Form | Notes |
|---|---|---|
| Integer | `10_000` | Underscore separators permitted, never leading or trailing |
| Decimal | `0.85` | Arbitrary precision. No float conversion at any stage. |
| Percent | `85%` | Subtype of Decimal |
| Money | `money(10_000, EUR)` | Currency is part of the type |
| Duration | `5m` `30d` `1y` | `y` = exactly 365d, `w` = exactly 7d. No calendar arithmetic. |
| String | `"text"` | Escapes: `\"` `\\` `\n` `\t`. Unknown escape is `AEG-1040`. No interpolation. |
| Boolean | `true` `false` | |
| Set | `{ a, b, c }` | Canonically ordered by element encoding at IR time |

Unterminated string at end of line is `AEG-1041`. Unterminated string at end of file is `AEG-1042`. Number exceeding precision is `AEG-1014`. Unknown currency code is `AEG-1050`. Malformed duration is `AEG-1055`.

---

## 2. Program structure

A compilation unit MUST begin with `specification "<version>"`, then exactly one `package` declaration, then zero or more `import` declarations, then declarations in any order. Declaration order MUST NOT affect meaning; binding is two-pass. Missing `specification` is `AEG-3001`. Missing `package` is `AEG-3002`. Package name not matching directory path is `AEG-3003`. Circular import is `AEG-3010`, reported with the full cycle.

---

## 3. Declarations

### 3.1 capability

Fields: `tool` (quoted name, MUST be unique in the unit), `criticality` (`low` | `medium` | `high` | `critical`), `reversible` (Bool), `data_classes` (set), `description` (optional string). Missing required field is `AEG-3020`. Duplicate tool name is `AEG-3021`. An irreversible `high` or `critical` capability with no human gate anywhere in the unit is warning `AEG-2010`.

### 3.2 principal

Fields: `role` (quoted name), `scope` (`workspace` | `tenant` | `global`), `mfa` (`required` | `optional`).

### 3.3 resource_class

Fields: `data_classes` (set), `jurisdiction` (set), `retention` (optional Duration).

### 3.4 enum

Ordered variants. Ordering is significant and defines the comparison relation. `enum risk_tier { minimal, limited, high, unacceptable }` makes `model.risk_tier <= limited` meaningful.

### 3.5 schema

Declares the request surface. Every attribute path used anywhere MUST be declared in some schema. Undeclared attribute access is `AEG-4010`, with a did-you-mean suggestion. There is no dynamic attribute access.

### 3.6 policy

MUST declare `combining` (there is no default - `AEG-3030`), `applies_to` (`AEG-3031`), at least one `rule` (`AEG-3032`). MAY declare `cites`, `default`, and `on violation`. `default permit` produces loud warning `AEG-2020` and MUST be highlighted in the audit report. `combining first_applicable` always produces warning `AEG-2021` because it is the only order-sensitive algorithm.

### 3.7 rule and desugaring

Three surface forms desugar to one core form. Desugaring MUST be total and span-preserving.

| Surface | Core condition | Core effect |
|---|---|---|
| `deny C unless G` | `C and not G` | Deny |
| `require C otherwise E` | `not C` | E |
| `allow C when G` | `C and G` | Permit |

Core form: `Rule(id, condition: Expr[Bool], effect, reason, obligations)`.

Rule identifiers MUST be unique within a policy (`AEG-3040`). A `reason` string is MANDATORY on any rule that can deny or escalate (`AEG-3041`) - I8.

### 3.8 obligation and advice

An `obligation` MUST declare `when`, `action`, and `on_failure` (`AEG-3050`). Obligations are binding: the PEP MUST discharge them, and failure to discharge MUST fail closed. `advice` is non-binding and MUST NOT affect the decision.

### 3.9 test

`given` blocks MUST validate against a declared schema (`AEG-4020`). `expect` assertions cover decision, rule firing, reason content, obligations, and `decision stable` (determinism). In release mode a unit with a failing test MUST NOT compile (`AEG-3060`).

---

## 4. Type system

Nine normative rules.

1. **No implicit conversion.** Ever, between any two types.
2. **Currency is part of the Money type.** `Money[EUR]` and `Money[USD]` are distinct and incomparable (`AEG-4101`).
3. **No floating point.** Decimal is arbitrary-precision, sign plus scaled integer.
4. **No null.** Absence is `Optional[T]` and MUST be explicitly discharged before use (`AEG-4110`).
5. **Comparison operators are non-associative.** `a < b < c` is `AEG-4120`, not a misparse.
6. **Logical operators accept only Bool.** No truthiness coercion (`AEG-4121`).
7. **Enums are ordered and nominal.** Cross-enum comparison is `AEG-4102`.
8. **`Percent` is a subtype of `Decimal`.** Subtyping is a partial order; subsumption applies at argument and comparison positions.
9. **Type checking is bidirectional with local inference only.** No global unification, no type-level computation (`AEG-4130` for any construct requiring it).

---

## 5. Expressions

### 5.1 Precedence, lowest to highest

| Level | Operators | Associativity |
|---|---|---|
| 1 | `implies` | right |
| 2 | `or` `xor` | left |
| 3 | `and` | left |
| 4 | `not` | prefix |
| 5 | `==` `!=` `<` `<=` `>` `>=` | **non-associative** |
| 6 | `in` `contains` `matches` `between` | non-associative |
| 7 | temporal: `within` `before` `after` `since` `until` `during` | non-associative |
| 8 | `+` `-` | left |
| 9 | `*` `/` | left |
| 10 | member access, call, index | postfix |

### 5.2 Quantifiers

`forall v in C : P(v)`, `exists v in C : P(v)`, `count v in C : P(v)`, plus `any`, `all`, `none`. The collection MUST have statically known maximum cardinality (4,096) and nesting depth MUST NOT exceed 3 (`AEG-1017`). This is the only form of iteration in the language - I1.

### 5.3 Temporal operators

Evaluated over the finite `trace` attribute and the injected logical `clock`. `within D`, `before T`, `after T`, `since T`, `until T`, `during W`, `always`, `eventually`, `at T`, `for D`, `D ago`. `now` resolves to `clock.now`, which is injected, never read from the host - I3.

### 5.4 Builtins

`money(n, CUR)`, `convert(m, to:, rate:)`, `eval(name)` (returns `.score` and `.age`), `human.approved_by(p)`, `audit.emit(severity:, evidence:)`, `notify(target)`, `disclose(text:)`, `redact(field)`, `throttle(rate:)`. Regex via `matches` is RE2 only; backreferences and lookaround are `AEG-4103` - I11.

---

## 6. Evaluation semantics

### 6.1 Algorithm

1. Validate the request against declared schemas. A missing required attribute yields `Indeterminate` with `AEG-5001`. Never a crash - I4.
2. Select applicable policies by evaluating `applies_to`.
3. For each applicable policy, evaluate every rule condition. Each rule yields its effect, `NotApplicable`, or `Indeterminate`.
4. Combine rule results with the policy's combining algorithm.
5. If all rules are `NotApplicable`, apply the policy `default`.
6. Combine policy results at bundle level.
7. Collect obligations from contributing rules only; collect advice separately.
8. Build the minimal justification tree.
9. Emit the evidence record.

### 6.2 Combining algorithms

All seven MUST be total functions over multisets of results. All except `first_applicable` MUST be provably commutative and associative, verified by exhaustive test.

| Algorithm | Rule |
|---|---|
| `deny_overrides` | Any Deny wins; else any Permit; else NotApplicable |
| `permit_overrides` | Any Permit wins; else any Deny; else NotApplicable |
| `first_applicable` | First non-NotApplicable in source order (order-sensitive, always warns) |
| `only_one_applicable` | Exactly one applicable, else Indeterminate |
| `unanimous` | All applicable must agree, else Indeterminate |
| `deny_unless_permit` | Permit only on explicit Permit; everything else Deny |
| `permit_unless_deny` | Deny only on explicit Deny; everything else Permit |

### 6.3 Fail-closed

`Indeterminate` MUST resolve to `Deny` at the enforcement boundary under the default configuration. Signature failure, bundle version mismatch, undischargeable obligation, and PDP unavailability MUST all Deny - I7.

### 6.4 Justification

Every decision MUST carry a minimal justification tree naming: decisive rule identifiers, their source spans, the clause citations attached to them, and only the attribute bindings those rules referenced. Justification recording MUST NOT be optimised away - I8.

```json
{
  "decision": "deny",
  "policy": "acme.payments.eu_high_risk_payment_gate",
  "irDigest": "sha256:...",
  "decisiveRules": [
    { "id": "human_gate", "span": "payments.aegis:31:5-34:60",
      "reason": "Irreversible high-value action requires fresh human approval.",
      "cites": ["eu:article:14"],
      "bindings": { "action.capability": "transfer_funds", "human.approved": false } }
  ],
  "obligations": ["halt", "audit.emit", "notify(risk-oncall)"],
  "advice": [],
  "combining": "deny_overrides"
}
```

---

## 7. Static analysis (normative, 13 analyses)

1. Termination proof (no recursion, all quantifiers bounded) - I1
2. Resource bound computation and budget enforcement - I11
3. Unreachable rule detection with a witness
4. Rule subsumption detection
5. Contradiction detection (identical condition, opposing effect)
6. Coverage gap detection with a concrete example request
7. Enum exhaustiveness
8. Missing-default detection with an incomplete rule set
9. Fail-open configuration warning
10. Order-sensitive combining warning
11. Data-class flow analysis for redaction obligations
12. Undischargeable obligation detection
13. Determinism hazard detection (floats, clock reads, unordered iteration) - I2

Analysis results MUST be deterministic across runs. Advisory findings MAY be suppressed explicitly; every suppression MUST appear in the audit report.

---

## 8. Compilation targets

Both artifacts MUST derive from the same canonical IR - I5.

**Bytecode `.aegisc`:** magic `0x41 0x45 0x47 0x53` (`AEGS`), major and minor version, canonical constant pool, register-based instructions, SHA-256 integrity hash, optional detached Ed25519 signature. Loader MUST validate every jump target, register index, and constant index before execution. Bad magic is `AEG-6001`, unknown major version is `AEG-6002`, hash mismatch is `AEG-6003`.

**Audit report:** Markdown, HTML, or PDF. Plain language, no code. Every rule rendered with its doc comment, its reason, and its clause citations. Fail-open configuration and every suppression MUST be highlighted. Byte-stable given a fixed generation timestamp.

---

## 9. Versioning

The language version, the toolchain version, the IR format version, the bytecode format version, and the clause library versions are all independent. A compilation unit declares the language version it targets. An unknown major version MUST be rejected, never guessed.

---

## 10. Conformance

An implementation conforms if and only if it passes the published conformance suite in full: `conformance/valid/` (source + request + expected decision and justification), `conformance/invalid/` (source + expected diagnostic codes), `conformance/canonical/` (byte-exact IR and bytecode fixtures). At least 1,200 cases at v1.0. Diagnostic codes are part of the conformance surface: a conforming implementation MUST emit the same code for the same defect.
