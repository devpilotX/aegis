# 03 - Grammar (EBNF)

Complete EBNF for AEGIS 1.0. This document plus `02-language-specification.md` plus the conformance suite MUST be sufficient for a stranger to implement AEGIS with no access to the reference source.

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
cap_field     = "tool" string | "criticality" crit | "reversible" bool
              | "data_classes" set_lit | "description" string ;
crit          = "low" | "medium" | "high" | "critical" ;

principal     = "principal" ident "{" { prin_field } "}" ;
prin_field    = "role" string | "scope" scope | "mfa" ( "required" | "optional" ) ;
scope         = "workspace" | "tenant" | "global" ;

resource_class= "resource_class" ident "{" { rc_field } "}" ;
rc_field      = "data_classes" set_lit | "jurisdiction" set_lit | "retention" duration ;

enum_decl     = "enum" ident "{" ident { "," ident } "}" ;
schema_decl   = "schema" ident "{" { field_decl } "}" ;
field_decl    = ident ":" type_expr ;
type_expr     = ident [ "[" type_expr { "," type_expr } "]" ] ;
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
action        = ident [ "(" [ arg_list ] ")" ] ;
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
rel_expr      = temporal_expr [ rel_op temporal_expr ] ;           (* NON-assoc *)
rel_op        = "in" | "contains" | "matches" | "between" ;
temporal_expr = add_expr [ temp_op add_expr ] ;                     (* NON-assoc *)
temp_op       = "within" | "before" | "after" | "since" | "until" | "during" ;
add_expr      = mul_expr { ( "+" | "-" ) mul_expr } ;
mul_expr      = postfix { ( "*" | "/" ) postfix } ;
postfix       = primary { "." ident | "(" [ arg_list ] ")" } ;
primary       = literal | path | quantifier | "(" expr ")" | if_expr ;
if_expr       = "if" expr "then" expr "else" expr ;
quantifier    = quant ident "in" expr ":" expr ;
quant         = "forall" | "exists" | "count" | "any" | "all" | "none" ;
path          = ident { "." ident } ;

literal       = int | decimal | percent | money | duration | string | bool | set_lit ;
money         = "money" "(" ( int | decimal ) "," CURRENCY ")" ;
duration      = int ( "ms" | "s" | "m" | "h" | "d" | "w" | "y" ) ;
percent       = ( int | decimal ) "%" ;
set_lit       = "{" [ expr { "," expr } ] "}" ;
bool          = "true" | "false" ;
ident         = LOWER { LOWER | DIGIT | "_" } ;
CURRENCY      = UPPER UPPER UPPER ;
```

## Notes

- Comparison, relational, and temporal levels are deliberately **non-associative**. `a < b < c` MUST be a diagnostic, not a reinterpretation.
- The grammar deliberately contains no type rules and no governance semantics. Those live in the checker (`docs/04`, `docs/05`).
- Every production above maps one-to-one onto a parse function in `internal/parser`. A parser change without a corresponding grammar change is a specification violation (I10).
- The grammar MUST be machine-verified for ambiguity before v1.0.
