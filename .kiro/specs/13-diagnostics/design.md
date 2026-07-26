# Design - Diagnostics Engine

**Spec ID:** `13-diagnostics` | **Phase:** P3 | **Invariants:** I2, I8, I10

## Location

`v0/src/diag/` in Phases 1-5, `internal/diag/` from Phase 6. `diag` may be imported by anything in the pipeline and imports nothing from it except `token`, which is what lets the lexer report before a parser exists.

The component is delivered in two parts across two phases, and the split is a hard boundary recorded in `tasks.md`: the value type, the sink interface, and the code registry land in Phase 1 because the lexer cannot emit a diagnostic without them; the renderer lands in Phase 3. In Phase 1 a diagnostic is a structured value that is collected and counted, never a rendered string.

## Approach

**The type makes an incomplete diagnostic unrepresentable.** `note` and `help` are required constructor arguments, not optional fields. This is deliberate: a required field cannot be forgotten under deadline pressure, and every reviewed corpus of compiler diagnostics degrades at exactly the point where the fix line became optional.

**Rendering is a pure function** of `(diagnostic, source bytes, terminal width)` and nothing else. No clock, no locale, no environment, no colour detection inside the renderer - colour is applied by a separate wrapper in `cmd/`, so the golden fixtures test uncoloured bytes and the colour path cannot break them.

**Positions are derived, never stored.** The renderer takes raw source bytes and a line index and computes the 1-based line, the scalar-value column, and the excerpt on demand. A tab is one column and prints as one space, which keeps carets aligned without needing to know the reader's tab width.

**The sink preserves emission order and never sorts.** Emission order is source order, because the frontend is a single forward pass, so a sort could only ever change the output when something upstream is already wrong - and it would hide exactly that. Order also carries stage information across a multi-stage build: lexical findings before syntactic before semantic is how an author reads a failure, whereas sorting by position interleaves the three and buries the one that caused the others. A test asserts that re-sorting the sink's output would change it, so the no-sort guarantee is load-bearing rather than incidental (I2).

**Two caps, two layers.** 200 per file in the sink, 2,000 per build in the driver. The second exists because the first is not sufficient for a multi-file bundle. The sink owns its cap: it emits `AEG-1006` once and signals stop, and no caller is expected to count.

**Severity is `error` or `warning`; fatality is a separate boolean.** A fatal is an error that stops the pipeline, not a third severity, and `--strict` escalates severity without touching fatality.

## The catalogue is data, not prose

`docs/10-error-catalog.md` is the human artifact, and a generated table derived from it is the machine artifact. CI checks three closures:

1. every code emitted by any component appears in the catalogue
2. every catalogue entry has at least one `conformance/invalid/` case asserting its code and one golden fixture asserting its rendered bytes
3. no component emits a code listed as retired or relocated

A fourth check greps the whole tree for `CITATION-NEEDED` and fails if it appears, which is what makes that token a safe thing to write when a regulatory reference is uncertain.

## Why this component is not merely infrastructure

Under I8 a decision that cannot be explained is a bug, and under the product's own positioning the diagnostic surface is what an engineer experiences of AEGIS before they ever reach a decision. The rendering standard was frozen during the P0 amendment precisely because golden tests assert exact bytes: three competing standards meant no standard, and every fixture written before the freeze would have encoded whichever document its author happened to read last.

## Testing plan

| Layer | Applies here |
|---|---|
| Unit | Every constructor, every severity, every rendering branch, every cap boundary |
| Golden | Every catalogue entry, rendered uncoloured, byte-exact |
| Property | Rendering is deterministic and total for any span within any source; the sink preserves emission order and a re-sort would change it |
| Fuzz | Renderer against arbitrary source bytes and arbitrary spans, including spans at and beyond end of file |
| Conformance | Every catalogue entry has an `invalid/` case asserting the exact code |

## Definition of done

Every catalogue entry has a golden fixture and a conformance case. The four CI closures pass. Rendering is byte-identical across all six determinism targets. Coverage meets 90% line and 85% branch for `diag`.
