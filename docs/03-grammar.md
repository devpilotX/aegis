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

Every `TypeIdent` matching `^[A-Z]{3}$` is reserved as a currency code and may not name a type: `AEG-3023`. The reservation does not consult the currency table, so legality never depends on a data-file revision.

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

A **quoted name** is lexically a `string`. The 256-character limit (`AEG-3083`) and the `[A-Za-z0-9_./:-]` character set (`AEG-3080`) are enforced by the parser, which is the first component that knows the string sits in a quoted-name position. Adjacent-literal concatenation does not apply to a quoted name; see `string_lit` in section 1.

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

### 0.8 Parser synchronisation tokens (normative)

On `AEG-3070` the parser discards tokens until it reaches one of these, then resumes. The set is normative so that recovery behaviour, and therefore the number and order of reported diagnostics, is identical across implementations - diagnostic output is part of the conformance surface.

```
policy  rule  capability  principal  obligation  advice  schema  enum
const   test  suite       import     export      }
```

Owned by spec `02-parser`. Specified here so that Phase 2 does not have to invent it, and not implemented in Phase 1.

### 0.9 A note on quoted terminals below

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
violation     = "on" "violation" "{" { violation_action } "}" ;
violation_action = "halt" | action_call ;
action_call   = path [ "(" [ arg_list ] ")" ] ;

rule          = "rule" ident "{" rule_body [ reason ] "}" ;
rule_body     = deny_form | require_form | allow_form ;
deny_form     = "deny" expr [ "unless" expr ] ;
require_form  = "require" expr "otherwise" effect ;
allow_form    = "allow" expr [ "when" expr ] ;
reason        = "reason" string_lit ;
effect        = "permit" | "deny" | "escalate" "to" ident
              | "redact" "(" expr ")" | "throttle" "(" arg_list ")" | "halt" ;

obligation    = "obligation" ident "{" on_effect_block { on_effect_block }
                "on_failure" effect { cites } "}" ;
on_effect_block = "on" trigger [ "when" expr ] "{" { action_call } "}" ;
trigger       = "permit" | "deny" ;
advice        = "advice" ident "{" "when" expr "action" action_call "}" ;
arg_list      = arg { "," arg } ;
arg           = [ ident ":" ] expr ;

test_decl     = "test" string "{" given { expect } "}" ;
suite_decl    = "suite" string "{" { test_decl } "}" ;
given         = "given" "{" { assign } "}" ;
assign        = path "=" expr ;
expect        = "expect" expect_body ;
expect_body   = effect | "rule" ident "fired" | "reason" "contains" string_lit
              | "obligation" action_call | "decision" "stable" ;

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
quantifier    = quant "(" ident "in" expr ":" expr ")" ;           (* delimited *)
quant         = "forall" | "exists" | "count" | "any" | "all" | "none" ;
path          = ident { "." ident } ;

literal       = int | decimal | duration | string_lit | bool ;
string_lit    = string { string } ;    (* adjacent literals concatenate *)
set_lit        = "{" [ expr { "," expr } ] "}" ;
```

## Notes

- **`money` and `duration` are calls, not productions.** `money(10_000, EUR)` is `postfix` applied to the predeclared identifier `money`, and the `EUR` argument is a `TypeIdent` that the checker validates against ISO 4217 (`AEG-4140`). Earlier drafts gave `money` its own production, which forced the lexer to know it was inside a `money(...)` call in order to validate a currency - context a one-token-lookahead scanner does not have.
- **`85%` is two tokens.** `percent_lit` builds the Percent value in the parser.
- **`between` is gone**, reserved-forbidden. As a binary `rel_op` it parsed `x between (a and b)`, and `and` accepts only Bool, so every use was either a type error or a misparse. It is sugar for two comparisons.
- **`is` replaces it at the same precedence level** and carries Optional discharge, which previously had no syntax at all. See `docs/02` section 5.5.
- **Unary minus exists.** Negative money must be expressible; refunds and chargebacks are core cases.
- **Quantifier bodies are parenthesised.** `count(r in c : p)`. The delimiter removes the greediness that made the intended parse of `count … >= 2` underivable.
- **`violation_action`, not `action`.** The nonterminal was renamed so it can never be confused with the `action` request root, and it admits `halt`, which is a keyword and not a `path`. `action_call` is the plain dotted call form used by obligations, advice, and expectations.
- **Obligations attach to an effect**, `on permit [when guard] { … }`, not to a condition on a decision value. The `when decision == permit` form is deleted; see `docs/02` section 3.8.
- **`string_lit` concatenates adjacent literals** at parse time, so long prose fits inside the 4,096-byte line limit. Quoted names, the `specification` version, and `test`/`suite` names deliberately keep the atomic `string` terminal.
- **`type_expr` uses `TypeIdent`**, and `Record` has a real production. `Enum[E]` uses square brackets; angle brackets do not exist in the language.
- Comparison, relational, and temporal levels are deliberately **non-associative**. `a < b < c` MUST be a diagnostic, not a reinterpretation.
- The grammar deliberately contains no type rules and no governance semantics. Those live in the checker (`docs/04`, `docs/05`).
- Every production above maps one-to-one onto a parse function in the parser. A parser change without a corresponding grammar change is a specification violation (I10).
- The grammar MUST be machine-verified for ambiguity before v1.0.

## Open defects

None. The four defects recorded in the first P0 amendment - greedy quantifier bodies, `halt` inside `on violation`, `decision` in an obligation `when` clause, and unbound schema names - were all adjudicated and are closed by the productions above and by `docs/02` sections 3.5, 3.8, and 5.2. Any future defect is recorded here before the parser is asked to accommodate it.
