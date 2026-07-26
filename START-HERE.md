# START HERE

Read this before anything else. It takes four minutes and prevents the three failure modes that kill new programming languages.

---

## What you are building, in plain words

AI agents can now do real things: send money, delete records, email customers, call other agents, deploy code. Companies must control what those agents may do.

Today those controls live in **PDFs and spreadsheets**. A PDF cannot stop anything. A computer cannot read it. When an agent breaks a rule, nobody finds out until later — or never.

**AEGIS turns those rules into code.**

```aegis
deny  tool "payments.transfer"
unless human.approved within 5m
```

From that one file, two things are produced:

1. **An enforcement engine.** The agent physically cannot transfer money without approval. The rule is running code sitting in the request path.
2. **An audit document.** The same file renders as clean English prose that a compliance officer or a regulator reads without seeing a single line of code.

One source of truth. Machine-enforced. Human-auditable.

**Analogy:** today's AI rules are a notice board in a school — printed, ignorable, checked occasionally. AEGIS is the locked door and the ID card — breaking the rule is not possible, and every attempt is recorded automatically.

---

## The three failure modes, and how this package prevents each

### Failure 1 — Designing 40 keywords and finishing none

The overwhelming majority of hobby languages die here. The designer spends six months on syntax bikeshedding and never gets a program to run.

**Prevention:** Phase 1 ships **exactly three keywords** — `allow`, `deny`, `require` — end to end, from source text through to an enforced decision and a rendered audit page. Nothing else may be added until that vertical slice works, is tested, and is documented. This is enforced by `.kiro/steering/scope-discipline.md`, which the agent loads on every single turn.

### Failure 2 — Building a language nobody uses

A language without a first user is a hobby. It has no forcing function, no bug reports, no reason to be finished.

**Prevention:** AEGIS has a captive first user from day one — your own AI-governance product. The language is shipped as a *feature* of that product, not as a standalone artifact hoping for adoption. Independent adoption is upside, never the success criterion.

### Failure 3 — Learning Go and designing a language simultaneously

Two hard, unfamiliar things at once produces slow progress on both and a design distorted by implementation-language ignorance.

**Prevention:** A deliberate two-implementation strategy. **v0 in TypeScript** — fast, throwaway, exists only to iterate the design until it stops changing. **v1 in Go** — the real single-binary implementation, written only after the design is frozen. The v0 code is *expected* to be deleted. That is not waste; it is the cheapest possible way to buy design certainty.

---

## Your first 48 hours

Do these in order. Do not jump ahead.

| # | Task | Time | Done when |
|---|---|---|---|
| 1 | Read `docs/00-project-overview.md` | 30 min | You can explain Layer 4 to a non-technical person in 60 seconds |
| 2 | Read `docs/02-language-specification.md` sections 1–4 | 60 min | You can hand-write a valid AEGIS policy without looking |
| 3 | Read `research/prior-art.md` | 30 min | You can state, in one sentence, why this is not Rego and not BAML |
| 4 | Install the toolchain (`docs/15-implementation-guide.md` §1) | 30 min | `node -v`, `go version`, `git --version` all respond |
| 5 | Copy `.kiro/` into your project repository root | 5 min | Kiro CLI lists your steering docs |
| 6 | Load `prompts/MASTER-PROMPT.md` into your model | 10 min | The model can restate all eleven invariants unprompted |
| 7 | Run spec `01-lexer` tasks 1.1–1.4 | 4–6 hrs | `aegis lex hello.aegis` prints a correct token stream |
| 8 | Take the Gate 0 self-assessment in `skills/ASSESSMENT.md` | 45 min | You score ≥ 80% on Domains 1–3 |

---

## Tooling you actually need

You already have most of it from web development.

**Required now (v0, TypeScript):**

| Tool | Check | Purpose |
|---|---|---|
| Node.js ≥ 20 | `node -v` | Runs the v0 prototype |
| pnpm or npm | `pnpm -v` | Package management |
| TypeScript ≥ 5.4 | `npx tsc -v` | The v0 implementation language |
| Vitest | installed as dev dep | You will write 2,000+ tests |
| tsx | installed as dev dep | Run TS directly, no build step |
| Git | `git --version` | Version control |
| VS Code | — | Editor |
| Kiro CLI | `kiro --version` | Spec-driven agentic development |

**Required at Phase 6 (v1, Go):**

| Tool | Check | Purpose |
|---|---|---|
| Go ≥ 1.22 | `go version` | The real implementation language |
| golangci-lint | `golangci-lint --version` | Static analysis |
| goreleaser | `goreleaser -v` | Cross-platform single-binary releases |

**Explicitly NOT needed — do not install, do not research:**

- ❌ LLVM — AEGIS emits its own bytecode, never machine code
- ❌ ANTLR, Bison, Flex, Yacc — the parser is hand-written recursive descent + Pratt, and that is a hard requirement, not a preference (see `docs/15-implementation-guide.md` §3 for why)
- ❌ C, C++, Rust — not for v0 or v1
- ❌ Python — no role in this project
- ❌ Docker — deployment concern only, Phase 12+
- ❌ A GPU — AEGIS performs no numerical computation whatsoever

Total setup time: under fifteen minutes.

---

## The mental model of the compiler

Five pieces. Each one is independently testable, and each has its own Kiro spec.

**1. Lexer** — cuts flat text into tagged tokens.

```
input   deny tool "payments.transfer"
output  [KW_DENY] [KW_TOOL] [STRING "payments.transfer"] [EOF]
```

**2. Parser** — arranges tokens into a tree the machine understands structurally.

```
RuleDecl
  effect: Deny
  target: ToolRef("payments.transfer")
  guard:  Unless(Temporal(Within, Attr(human.approved), Duration(5m)))
```

**3. Checker** — catches every mistake before the policy ever runs.

```
AEG-3021  error  line 4, col 12
  unknown tool "payments.transferr"
  did you mean "payments.transfer"?
```

**4. Runtime (the PDP)** — the part that actually blocks the agent.

```
agent requests  payments.transfer(amount: 5000, currency: EUR)
PDP evaluates   rule eu_payment_gate → human.approved = false
decision        DENY
obligation      escalate → human_reviewer
```

**5. Reporter** — renders the identical policy as an auditor-facing document, with clause citations to EU AI Act, NIST AI RMF, and ISO/IEC 42001.

Pieces 1–3 are the *compiler*. Piece 4 is the *runtime*. Piece 5 is the *differentiator* — no competitor compiles one source into both enforcement and evidence.

---

## Phase map at a glance

| Phase | Deliverable | Language | Weeks |
|---|---|---|---|
| 0 | Design freeze, spec review, repo scaffolding | — | 1 |
| 1 | Lexer + tests | TypeScript | 1 |
| 2 | Parser → AST, Pratt expressions | TypeScript | 2 |
| 3 | Diagnostics engine, error catalogue, source spans | TypeScript | 1 |
| 4 | Type system + semantic checker | TypeScript | 2 |
| 5 | Evaluator, combining algorithms, obligations | TypeScript | 2 |
| — | **Design freeze gate. v0 is now throwaway.** | — | — |
| 6 | Go rewrite: lexer, parser, checker | Go | 4 |
| 7 | Go: IR, bytecode compiler, VM | Go | 3 |
| 8 | Evidence engine, hash chain, signing | Go | 2 |
| 9 | CLI, `aegis` single binary, cross-compilation | Go | 2 |
| 10 | Audit report generator (MD/HTML/PDF) | Go | 2 |
| 11 | LSP server, VS Code extension, syntax highlighting | Go/TS | 3 |
| 12 | WASM build, embedding SDKs | Go | 2 |
| 13 | Conformance suite, formal spec publication v1.0 | — | 3 |

Realistic total to a credible v1.0: **seven to nine months** at four to six focused hours per day.

Realistic total to a *demoable, portfolio-grade* artifact: **five to six weeks** (through Phase 5).

---

## One rule above all others

> **Get three keywords working end to end before adding a fourth.**

A language that does one small thing completely — lexed, parsed, checked, evaluated, explained, evidenced, documented, and tested — is infinitely more valuable than a language that does forty things halfway.

Everything in this package is engineered to hold you to that.
