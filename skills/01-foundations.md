# Skills — Domains 1–3: Foundations (130 skills)

Tags: **[C]** Critical · **[I]** Important · **[N]** Nice. Phase markers `P0`–`P13`.

---

## Domain 1 — Programming Language Theory Foundations (48)

1. Define what a programming language formally is: syntax, semantics, pragmatics **[C] P0**
2. Distinguish syntax from semantics with concrete examples **[C] P0**
3. Distinguish static semantics from dynamic semantics **[C] P0**
4. Explain the Chomsky hierarchy and locate CFGs within it **[I] P0**
5. Explain why regular languages cannot express nesting **[C] P0**
6. Explain the pumping lemma informally **[N] P1**
7. Explain Turing completeness and enumerate its costs **[C] P0**
8. Explain the halting problem and its consequence for static analysis **[C] P0**
9. Explain Rice's theorem and what it forbids **[I] P1**
10. Define a total function and contrast it with a partial function **[C] P0**
11. Explain why totality enables decidable analysis **[C] P0**
12. Enumerate the restrictions required to make a language total **[C] P0**
13. Explain structural recursion and why it terminates **[C] P0**
14. Explain primitive recursion and its relation to totality **[I] P1**
15. Explain bounded quantification as a total iteration mechanism **[C] P2**
16. Explain referential transparency **[C] P0**
17. Explain purity and enumerate what it forbids **[C] P0**
18. Explain determinism and distinguish it from purity **[C] P0**
19. Explain idempotence and where it matters in policy evaluation **[I] P5**
20. Explain confluence and why order-independent rules need it **[I] P5**
21. Explain the difference between declarative and imperative paradigms **[C] P0**
22. Explain rule-based / logic programming at a working level **[C] P1**
23. Explain the difference between open-world and closed-world assumptions **[C] P4**
24. Explain negation-as-failure and why AEGIS forbids it **[C] P4**
25. Explain stratified negation **[I] P4**
26. Explain three-valued and four-valued logic **[C] P5**
27. Explain Kleene logic and its truth tables **[I] P5**
28. Explain lattice-based combination of decisions **[I] P5**
29. Explain monotonicity of a logical system **[I] P5**
30. Explain why non-monotonic reasoning complicates audit **[I] P5**
31. Explain first-order logic syntax and semantics **[I] P2**
32. Explain linear temporal logic operators **[C] P5**
33. Explain metric temporal logic and bounded intervals **[C] P5**
34. Explain past-time versus future-time temporal operators **[C] P5**
35. Explain why AEGIS uses only past-time operators over a finite trace **[C] P5**
36. Explain what a domain-specific language is and when to build one **[C] P0**
37. Distinguish internal from external DSLs **[C] P0**
38. Enumerate the costs of building an external DSL honestly **[C] P0**
39. Explain why SQL, Rego, HCL, and Dhall are not self-hosting **[C] P0**
40. Explain the difference between a language and a framework **[C] P0**
41. Explain what a language specification is and what makes it normative **[C] P0**
42. Explain the role of RFC 2119 conformance keywords **[C] P0**
43. Explain what a conformance suite proves and what it does not **[C] P13**
44. Explain the concept of specification supremacy **[C] P0**
45. Explain language versioning and backward-compatibility obligations **[C] P9**
46. Explain semantic drift and why it is catastrophic in governance **[C] P0**
47. Explain the design tension between expressiveness and analysability **[C] P0**
48. Articulate AEGIS's position on that tension and defend it **[C] P0**

---

## Domain 2 — Formal Grammars and Language Definition (42)

49. Write a context-free grammar in BNF **[C] P0**
50. Write a context-free grammar in EBNF **[C] P0**
51. Use EBNF repetition, option, and grouping operators correctly **[C] P0**
52. Write a grammar for arithmetic with correct precedence **[C] P0**
53. Write a grammar for arithmetic with correct associativity **[C] P0**
54. Identify ambiguity in a grammar **[C] P1**
55. Resolve ambiguity by grammar restructuring **[C] P1**
56. Resolve ambiguity by precedence declaration **[C] P1**
57. Explain and resolve the dangling-else problem **[C] P2**
58. Compute FIRST sets **[I] P2**
59. Compute FOLLOW sets **[I] P2**
60. Determine whether a grammar is LL(1) **[I] P2**
61. Eliminate left recursion **[C] P2**
62. Perform left factoring **[C] P2**
63. Explain LL versus LR parsing power **[I] P2**
64. Explain LALR and its practical role **[N] P2**
65. Explain PEG and ordered choice **[I] P2**
66. Explain why PEG cannot be ambiguous and what that hides **[I] P2**
67. Write a grammar that is unambiguous by construction **[C] P2**
68. Machine-verify a grammar for ambiguity with a tool **[I] P13**
69. Write a grammar covering every AEGIS construct **[C] P0**
70. Keep the grammar and the parser provably synchronised **[C] P2**
71. Generate a railroad diagram from EBNF **[N] P13**
72. Write grammar productions with meaningful, stable nonterminal names **[C] P0**
73. Specify lexical structure separately from syntactic structure **[C] P1**
74. Specify whitespace and comment handling in a grammar **[C] P1**
75. Specify keyword reservation and its interaction with identifiers **[C] P1**
76. Specify literal syntax exhaustively **[C] P1**
77. Specify operator precedence as a normative table **[C] P2**
78. Specify non-associative operators and justify the choice **[C] P2**
79. Design a grammar that yields good error recovery points **[C] P3**
80. Design a grammar that is readable by non-programmers **[C] P0**
81. Design a grammar that avoids punctuation soup **[I] P0**
82. Evaluate a grammar for auditor readability **[C] P0**
83. Version a grammar across specification releases **[C] P9**
84. Write conformance examples directly from grammar productions **[C] P13**
85. Explain the trade-off between a grammar generator and a hand-written parser **[C] P2**
86. Justify hand-written recursive descent for AEGIS **[C] P2**
87. Document every grammar production with prose and an example **[C] P0**
88. Review a grammar for constructs that permit unbounded computation **[C] P0**
89. Detect grammar constructs that would break canonical IR hashing **[C] P6**
90. Maintain a grammar changelog with rationale per change **[I] P9**

---

## Domain 3 — Lexical Analysis (40)

91. Implement a hand-written lexer over a byte slice **[C] P1**
92. Implement single-character lookahead **[C] P1**
93. Implement arbitrary lookahead with backtracking safety **[I] P1**
94. Track line and column positions accurately **[C] P1**
95. Track byte offsets alongside line/column **[C] P1**
96. Build a line-index table for O(1) offset-to-position mapping **[C] P1**
97. Represent a source span as a half-open byte range **[C] P1**
98. Attach a span to every emitted token **[C] P1**
99. Handle LF, CRLF, and CR uniformly **[C] P1**
100. Strip a UTF-8 BOM correctly and reject a mid-file BOM **[C] P1**
101. Decode UTF-8 with explicit validation and error positions **[C] P1**
102. Reject invalid UTF-8 with a precise diagnostic **[C] P1**
103. Apply Unicode NFC normalisation to source text **[C] P1**
104. Explain why NFC normalisation is required for hash stability **[C] P1**
105. Detect and reject homoglyph confusables in identifiers **[C] P1**
106. Reject non-ASCII identifiers with a clear rationale message **[C] P1**
107. Detect and reject invisible and bidirectional control characters **[C] P1**
108. Lex line comments **[C] P1**
109. Lex correctly nesting block comments **[C] P1**
110. Lex doc comments and attach them to the following declaration **[C] P1**
111. Report unterminated block comments with the opening position **[C] P1**
112. Lex integer literals with underscore separators **[C] P1**
113. Reject malformed underscore placement **[C] P1**
114. Lex hexadecimal, octal, and binary integer literals **[I] P1**
115. Detect integer overflow at lex time **[C] P1**
116. Lex arbitrary-precision decimal literals without float conversion **[C] P1**
117. Reject scientific notation with an explanatory diagnostic **[C] P1**
118. Lex duration literals including compound forms **[C] P1**
119. Validate duration unit ordering **[C] P1**
120. Lex percent literals **[C] P1**
121. Lex money literals and validate ISO 4217 currency codes **[C] P1**
122. Lex RFC 3339 timestamp literals and reject non-UTC offsets **[C] P1**
123. Lex single-line strings with the full escape set **[C] P1**
124. Lex triple-quoted strings with indentation stripping **[C] P1**
125. Validate `\u{...}` escapes and reject surrogates **[C] P1**
126. Distinguish keywords from identifiers via a perfect-hash lookup **[C] P1**
127. Reject use of reserved-for-future keywords **[C] P1**
128. Emit a synthetic EOF token with a correct span **[C] P1**
129. Implement lexer error recovery that continues after a bad token **[C] P3**
130. Write a property test proving lexer round-trip fidelity **[C] P1**
