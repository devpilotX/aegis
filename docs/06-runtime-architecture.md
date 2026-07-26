# 06 - Runtime Architecture

## The XACML quartet, modernised

| Component | Role | AEGIS form |
|---|---|---|
| **PEP** Policy Enforcement Point | Intercepts the action before it happens | SDK wrapper around tool invocation; fails closed |
| **PDP** Policy Decision Point | Evaluates the bundle against the request | The register VM in `internal/vm` |
| **PIP** Policy Information Point | Resolves external facts into attributes | The only component permitted to perform I/O |
| **PAP** Policy Administration Point | Authors, signs, and distributes bundles | `aegis` CLI plus the commercial registry |

AEGIS inherits this architecture from XACML deliberately, and rejects XACML's XML ergonomics entirely.

**Critical boundary:** all I/O lives in the PIP. Attribute resolution completes *before* evaluation begins. The evaluator receives a fully materialised request and touches nothing outside it - I3.

## Request path

```
agent wants to call payments.transfer
  -> PEP intercepts
  -> PIP resolves attributes (identity, eval scores, approval trace, fx rate)
  -> PDP.evaluate(bundle, request)         [pure, total, single-threaded]
  -> (decision, justification, obligations)
  -> PEP discharges obligations; on failure applies on_failure
  -> evidence record appended to the chain
  -> action proceeds or is blocked
```

Budget: PIP resolution dominates. The PDP itself must stay under 1 ms at p99, which is why the evaluator is a bytecode VM and not a tree walker.

## Register VM

Register-based, not stack-based: fewer instructions per expression, better locality, and simpler cost accounting for the static resource bound (I11).

| Opcode group | Examples |
|---|---|
| Load / move | `LOADK`, `LOADATTR`, `MOVE` |
| Compare | `EQ`, `NE`, `LT`, `LE`, `GT`, `GE` (type-specialised) |
| Logic | `NOT`, `JMPIF`, `JMPIFNOT` (short-circuit by branching) |
| Arithmetic | `ADDD`, `SUBD`, `MULD`, `DIVD` (decimal), `ADDM`, `SUBM` (money, currency-checked) |
| Collections | `IN`, `CONTAINS`, `MATCHRE`, `CARD` |
| Quantifiers | `QITER`, `QNEXT`, `QEND` (bounded, with a hard cap) |
| Temporal | `WITHIN`, `BEFORE`, `AFTER`, `SINCE`, `UNTIL`, `DURING` |
| Decision | `EFFECT`, `OBLIGE`, `ADVISE`, `COMBINE`, `DEFAULT` |
| Justification | `RECORD`, `CITE`, `BIND` (never optimised away) |

No `CALL`, no `RET`, no `JMPBACK`. The absence of a backward jump is how totality is visible in the instruction set itself.

## Value representation

A compact tagged union: tag byte plus payload. Decimals are sign plus scaled integer, referencing the constant pool for large values. Money carries a currency tag checked at every arithmetic and comparison opcode. Sets are canonically ordered slices. No interface dispatch in the innermost loop.

## `.aegisc` bytecode format

```
offset  content
0       magic       "AEGS" (0x41 0x45 0x47 0x53)
4       major u16, minor u16
8       flags u32           (signed, optimised, debug-info present)
12      irDigest [32]byte   SHA-256 over the canonical IR
44      constant pool       count, then canonically ordered entries
...     instruction section count, then fixed-width instructions
...     line table          instruction index -> source span
...     clause table        rule id -> clause citations
end-32  integrity hash      SHA-256 over everything above
(optional) detached Ed25519 signature in a sidecar file
```

The loader validates magic, major version, integrity hash, then every jump target, register index, and constant index, before executing a single instruction. Fuzzed to zero panics.

## `.aegisb` bundle format

A signed archive containing: one or more `.aegisc` units, the schema set, the pinned clause library versions, the test results, and a manifest with the bundle digest. The PDP verifies the bundle signature before load and refuses to load on failure - it never degrades to unsigned - I7.

## Hot reload

Atomic pointer swap of an immutable bundle. In-flight requests complete against the bundle they started with. Every evidence record names the bundle digest that decided it, which is what makes historical replay meaningful.

## Concurrency

The evaluator is single-threaded, reentrant-safe, and holds no global mutable state. Throughput scales by running independent evaluations in parallel at the request level, outside the evaluator. This is a determinism requirement, not a limitation - I2.
