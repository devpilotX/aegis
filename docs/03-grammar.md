# 03 - Grammar (EBNF)

Complete EBNF for AEGIS 1.0. This document plus `02-language-specification.md` plus the conformance suite MUST be sufficient for a stranger to implement AEGIS with no access to the reference source. **This is the only normative home for the grammar.** There is no `spec/` directory and there will not be two homes for one artifact.

## 0. Lexical terminals

Earlier drafts used `int`, `decimal`, `string`, `ident`, `LOWER`, `UPPER`, and `DIGIT` without defining any of them, which defeated the specification-independence claim in the paragraph above. They are defined here. Patterns are RE2, anchored, matched with maximal munch.

### 0.1 Character classes

```
LOWER   = "a" … "z" ;
UPPER   = "A" … "Z" ;
DIGIT   = "0" … "9" ;
```

### 0.2 Identifier classes

```
ident      = /[a-z][a-z0-9_]*/            (* declarations, attributes, labels, enum members, quantifier vars *)
TypeIdent  = /[A-Z][A-Za-z0-9_]*/         (* type names *)
currency   = /[A-Z]{3}/                   (* lexed as TypeIdent; disambiguated by position *)
```

ASCII only. Non-ASCII is `AEG-1004`. Longer than 128 bytes is `AEG-1012`.

### 0.3 Numeric and duration terminals

```
int       = /[0-9](_?[0-9])*/
decimal   = /[0-9](_?[0-9])*\.[0-9](_?[0-9])*/
unit      = "ms" | "s" | "m" | "h" | "d" | "w" | "y" ;
duration  = int unit ;                    (* one token, no intervening whitespace *)
```

The underscore rule is expressed by the pattern itself: never leading, never trailing, never doubled, never adjacent to the decimal point. Violations are `AEG-1005`.

Three side conditions the pattern cannot express, all of which the scanner MUST enforce:

| Condition | Diagnostic | Example |
|---|---|---|
| The character after a duration unit is `[A-Za-z0-9_]` | `AEG-1055` | `30days` |
| A `decimal` is immediately followed by a unit | `AEG-1056` | `1.5h` |
| An `int` or `decimal` is immediately followed by `e` or `E` and a digit or sign | `AEG-1057` | `1e10` |

Without the first condition, maximal munch would split `30days` into a valid duration and a stray identifier, which is exactly the silent misreading the language exists to prevent.

### 0.4 String terminal

```
string  = /"([^"\\\n\r]|\\["\\nt])*"/
```

Four escapes only: `\"` `\\` `\n` `\t`. Any other escape is `AEG-1040`. A newline before the closing quote is `AEG-1041`. End of file before the closing quote is `AEG-1042`. There is no interpolation and no multi-line form.

A **quoted name** is lexically a `string`. The 256-character limit (`AEG-1013`) and the `[A-Za-z0-9_./:-]` character set (`AEG-3080`) are enforced by the parser, which is the first component that knows the string sits in a quoted-name position.

### 0.5 Boolean terminal

```
bool  = "true" | "false" ;
```

### 0.6 Trivia

```
line_comment  = /\/\/[^\n\r]*/
doc_comment   = /\/\/\/[^\n\r]*/
whitespace    = /[ \t]+/
newline       = "\n" | "\r\n" | "\r" ;
```

Trivia produces no syntactic token. It is retained as leading trivia on the following token so that tokens plus trivia reprint the source byte for byte. `doc_comment` wins over `line_comment` by maximal munch; `////` is one `line_comment`.

### 0.7 Delimiters and operators

```
{  }  (  )  [  ]  ,  .  :  =  ==  !=  <  <=  >  >=  +  -  *  /  %
```

That is the complete set. `;` is not in the language. Any other character outside a literal and outside trivia is `AEG-1005`.

### 0.8 A note on quoted terminals below

Some terminals written in quotes in the productions below are **keywords** and lex as such. Others are **contextual field labels** and lex as `ident`, matched by text against the declaration being parsed: `tool`, `criticality`, `reversible`, `data_classes`, `description`, `role`, `scope`, `mfa`, `jurisdiction`, `retention`, `action`. The admission rule that decides which is which is `docs/02` section 1.5.1.

`"Record"` in `record_type` is a `TypeIdent` matched by text, not a keyword, for the same reason: a type name is a name.

---

## 1. Productions

```ebnf
unit          = spec_decl package_decl { import_decl } { declaration } ;
spec_decl     = "specification" string ;
package_decl  = "package" dotted_name ;
import_decl   = "import" dotted_name [ "as" ident ] ;
dotted_name   = ident { "." ident } ;

declaration   = [ "export" ] ( capability | principal | resource_class | enum_decl
                             | schema_decl | const_decl | policy | obligation
                             | advice | test_decl | suite_decl ) ;

capability    = "capability" ident "{" { cap_field } "}" ;
cap_field     = "tool" string | "criticality" ident | "reversible" bool
              | "data_classes" set_lit | "description" string ;

principal     = "principal" ident "{" { prin_field } "}" ;
prin_field    = "role" string | "scope" ident | "mfa" ident ;

resource_class= "resource_class" ident "{" { rc_field } "}" ;
rc_field      = "data_classes" set_lit | "jurisdiction" set_lit | "retention" duration ;

enum_decl     = "enum" ident "{" ident { "," ident } "}" ;
schema_decl   = "schema" ident "{" { field_decl } "}" ;
field_decl    = ident ":" type_expr ;
type_expr     = TypeIdent [ "[" type_expr { "," type_expr } "]" ]
              | record_type ;
record_type   = "Record" "{" field_decl { "," field_decl } "}" ;
const_decl    = "const" ident "=" expr ;

policy        = "policy" ident "{" combining applies { cites } { rule }
                [ default_cl ] [ violation ] "}" ;
combining     = "combining" comb_alg ;
comb_alg      = "deny_overrides" | "permit_overrides" | "first_applicable"
              | "only_one_applicable" | "unanimous" | "deny_unless_permit"
              | "permit_unless_deny" ;
applies       = "applies_to" expr ;
cites         = "cites" expr ;
default_cl    = "default" effect ;
violation     = "on" "violation" "{" { action } "}" ;

rule          = "rule" ident "{" rule_body [ reason ] "}" ;
rule_body     = deny_form | require_form | allow_form ;
deny_form     = "deny" expr [ "unless" expr ] ;
require_form  = "require" expr "otherwise" effect ;
allow_form    = "allow" expr [ "when" expr ] ;
reason        = "reason" string ;
effect        = "permit" | "deny" | "escalate" "to" ident
              | "redact" "(" expr ")" | "throttle" "(" arg_list ")" | "halt" ;

obligation    = "obligation" ident "{" "when" expr "action" action
                "on_failure" effect { cites } "}" ;
advice        = "advice" ident "{" "when" expr "action" action "}" ;
action        = path [ "(" [ arg_list ] ")" ] ;
arg_list      = arg { "," arg } ;
arg           = [ ident ":" ] expr ;

test_decl     = "test" string "{" given { expect } "}" ;
suite_decl    = "suite" string "{" { test_decl } "}" ;
given         = "given" "{" { assign } "}" ;
assign        = path "=" expr ;
expect        = "expect" expect_body ;
expect_body   = effect | "rule" ident "fired" | "reason" "contains" string
              | "obligation" action | "decision" "stable" ;

(* expressions, lowest precedence first *)
expr          = implies_expr ;
implies_expr  = or_expr [ "implies" implies_expr ] ;               (* right assoc *)
or_expr       = and_expr { ( "or" | "xor" ) and_expr } ;
and_expr      = not_expr { "and" not_expr } ;
not_expr      = [ "not" ] cmp_expr ;
cmp_expr      = rel_expr [ cmp_op rel_expr ] ;                     (* NON-assoc *)
cmp_op        = "==" | "!=" | "<" | "<=" | ">" | ">=" ;
rel_expr      = temporal_expr [ rel_tail ] ;                       (* NON-assoc *)
rel_tail      = rel_op temporal_expr | "is" opt_pattern ;
rel_op        = "in" | "contains" | "matches" ;
opt_pattern   = "none" | "some" ident ;
temporal_expr = add_expr [ temp_op add_expr ] ;                    (* NON-assoc *)
temp_op       = "within" | "before" | "after" | "since" | "until" | "during" ;
add_expr      = mul_expr { ( "+" | "-" ) mul_expr } ;
mul_expr      = neg_expr { ( "*" | "/" ) neg_expr } ;
neg_expr      = [ "-" ] postfix ;                                  (* unary minus *)
postfix       = primary { "." ident | "(" [ arg_list ] ")" | "[" expr "]" } ;
primary       = percent_lit | literal | path | quantifier | set_lit
              | "(" expr ")" | if_expr ;
percent_lit   = ( int | decimal ) "%" ;
if_expr       = "if" expr "then" expr "else" expr ;
quantifier    = quant ident "in" expr ":" expr ;
quant         = "forall" | "exists" | "count" | "any" | "all" | "none" ;
path          = ident { "." ident } ;

literal       = int | decimal | duration | string | bool ;
set_lit       = "{" [ expr { "," expr } ] "}" ;
```

## Notes

- **`money` and `duration` are calls, not productions.** `money(10_000, EUR)` is `postfix` applied to the predeclared identifier `money`, and the `EUR` argument is a `TypeIdent` that the checker validates against ISO 4217 (`AEG-4140`). Earlier drafts gave `money` its own production, which forced the lexer to know it was inside a `money(...)` call in order to validate a currency - context a one-token-lookahead scanner does not have.
- **`85%` is two tokens.** `percent_lit` builds the Percent value in the parser.
- **`between` is gone**, reserved-forbidden. As a binary `rel_op` it parsed `x between (a and b)`, and `and` accepts only Bool, so every use was either a type error or a misparse. It is sugar for two comparisons.
- **`is` replaces it at the same precedence level** and carries Optional discharge, which previously had no syntax at all. See `docs/02` section 5.5.
- **Unary minus exists.** Negative money must be expressible; refunds and chargebacks are core cases.
- **`action = path [...]`**, not `ident [...]`, because the standard library's obligation actions are dotted: `audit.emit(...)`.
- **`type_expr` uses `TypeIdent`**, and `Record` has a real production. `Enum[E]` uses square brackets; angle brackets do not exist in the language.
- Comparison, relational, and temporal levels are deliberately **non-associative**. `a < b < c` MUST be a diagnostic, not a reinterpretation.
- The grammar deliberately contains no type rules and no governance semantics. Those live in the checker (`docs/04`, `docs/05`).
- Every production above maps one-to-one onto a parse function in the parser. A parser change without a corresponding grammar change is a specification violation (I10).
- The grammar MUST be machine-verified for ambiguity before v1.0.

## Open defects - adjudication required before Phase 2

These were found in the P0 audit, are **not** closed by the current amendment, and MUST be decided before the parser is written. They are recorded here rather than left implicit.

**OPEN-1 - quantifier body greediness.** `quantifier = quant ident "in" expr ":" expr` lets the body swallow everything to its right, so `count r in c : r.role == "x" >= 2` parses the body as `r.role == "x" >= 2`, a non-associative comparison chain (`AEG-4120`). The intended `(count …) >= 2` is not derivable. Either the body needs a delimiter, or `count` needs a different shape from the Bool-valued quantifiers.

**OPEN-2 - effects inside `on violation`.** `violation = "on" "violation" "{" { action } "}"` admits only actions, but the canonical example uses `halt`, which is an `effect` keyword and not a `path`. Either the violation block admits `effect` as well as `action`, or `halt` gains an action spelling.

**OPEN-3 - what an obligation's `when` clause may name.** The canonical example writes `when decision == permit`, but `decision` is not one of the nine request roots and no scope is specified in which it is bound. Either obligations evaluate in an extended scope that binds the pending decision, or the clause needs a different spelling.

**OPEN-4 - schema name to request root binding.** `docs/02` section 3.5 requires every attribute path to be declared in some schema but never says how a schema's name relates to a request root. `schema request { reviewers: ... }` and a use of `resource.reviewers` cannot both be right.
