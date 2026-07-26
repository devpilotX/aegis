# 12 - Performance

## Normative budgets (CI-gated)

| Metric | Target | Hard ceiling |
|---|---|---|
| Cold start (binary to ready) | < 15 ms | 50 ms |
| Bundle load, 1,000 rules | < 20 ms | 100 ms |
| Decision latency p50 | < 100 us | - |
| Decision latency p99 | < 1 ms | 5 ms |
| Throughput per core | > 50,000 decisions/s | - |
| Resident memory, 1,000-rule bundle | < 25 MB | 64 MB |
| Binary size | < 12 MB | 25 MB |
| WASM module size | < 6 MB | 12 MB |
| Evidence record generation | < 50 us | 200 us |
| Compile 1,000 rules | < 500 ms | 2 s |

A merge that breaches a ceiling is blocked. A merge that regresses a target by more than 10% requires an explicit justification in the commit message.

## Methodology

Benchmarks use a representative corpus, not toys: a 1,000-rule bundle across 40 policies with realistic attribute counts, quantifiers over collections of 100-500 elements, and regex matching. Report p50, p95, p99, p999, allocations per operation, and bytes per operation. Never report means alone.

## Where the time actually goes

In a real deployment, attribute resolution in the PIP dominates end-to-end latency, often by an order of magnitude. That is why the PDP budget is separate and why the PIP is optimised independently. Publishing a 100-microsecond decision figure while the PIP takes 40 milliseconds would be dishonest.

## Permitted optimisations

Constant folding, dead-rule elimination, common-subexpression elimination on conditions, cost-ordered short-circuit operands, rule indexing by target attribute, compiled regex caching, context pooling, decision caching keyed by canonical request digest.

## Forbidden optimisations

Anything that changes a decision. Anything that removes or weakens justification recording. Anything that introduces nondeterminism, including parallel evaluation inside a single decision. Anything that makes the resource bound uncomputable. Each of these is a direct invariant breach, and the differential harness plus the determinism harness exist to catch attempts.

## Honest comparison

When comparing against OPA or Cedar, use semantically equivalent policies, publish the policies and the harness, report the same percentiles for both, and state clearly what AEGIS does that they do not. Faster is a weak claim. Provably terminating, deterministic, and evidence-generating is the real one.

## When to stop

When p99 is comfortably inside the ceiling on the representative corpus and the profile shows no single component above 25% of decision time. Past that point, spend the effort on diagnostics and conformance instead. Governance buyers do not choose on microseconds.
