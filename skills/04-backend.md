# Skills - Domains 10-12: Backend, Runtime, Determinism (130 skills)

## Domain 10 - Compiler Backend and Code Generation (47)

415. Explain the role of an intermediate representation between AST and bytecode **[C] P7**
416. Lower a typed AST to a linear IR **[C] P7**
417. Design a register-based instruction set **[C] P7**
418. Explain register-based versus stack-based bytecode trade-offs **[C] P7**
419. Choose a fixed-width instruction encoding and justify it **[C] P7**
420. Allocate virtual registers with a simple linear-scan strategy **[C] P7**
421. Build a deduplicated constant pool **[C] P7**
422. Order the constant pool canonically **[C] P7**
423. Encode arbitrary-precision decimals in the constant pool **[C] P7**
424. Encode money values as minor units plus exponent **[C] P7**
425. Encode durations as integer milliseconds **[C] P7**
426. Encode sets in canonical element order **[C] P7**
427. Emit short-circuit branching for and, or, implies **[C] P7**
428. Emit comparison instructions with type-specialised opcodes **[C] P7**
429. Emit bounded-loop instructions for quantifiers **[C] P7**
430. Emit temporal operator instructions over the trace **[C] P7**
431. Emit rule dispatch and effect instructions **[C] P7**
432. Emit combining algorithm instructions **[C] P7**
433. Emit obligation collection instructions **[C] P7**
434. Emit justification-recording instructions **[C] P7**
435. Ensure justification recording cannot be optimised away **[C] P7**
436. Perform constant folding at the IR level **[I] P7**
437. Perform dead-code and dead-rule elimination **[I] P7**
438. Perform common-subexpression elimination on conditions **[N] P7**
439. Reorder short-circuit operands by static cost estimate **[N] P7**
440. Prove every optimisation preserves decision semantics **[C] P7**
441. Provide a no-optimisation build mode for differential testing **[C] P7**
442. Maintain a source span for every emitted instruction **[C] P7**
443. Emit a line table mapping instructions to source positions **[C] P7**
444. Design a bytecode file format with magic, version, and hash **[C] P7**
445. Append a SHA-256 integrity hash to the bytecode **[C] P7**
446. Support an optional detached Ed25519 signature **[C] P8**
447. Reject bytecode with a bad magic value **[C] P7**
448. Reject bytecode with an unknown major version **[C] P7**
449. Reject bytecode with a failed integrity hash **[C] P7**
450. Validate all jump targets at load time **[C] P7**
451. Validate all register indices at load time **[C] P7**
452. Validate all constant pool indices at load time **[C] P7**
453. Reject bytecode that could read out of bounds **[C] P7**
454. Fuzz the bytecode loader to zero panics **[C] P7**
455. Design a bundle format packaging policies, schemas, and clauses **[C] P9**
456. Sign a bundle and verify it before load **[C] P9**
457. Support bundle rollback to a previous version **[I] P9**
458. Write a bytecode disassembler for debugging **[I] P7**
459. Golden-test the disassembler output **[C] P7**
460. Keep bytecode generation deterministic across builds **[C] P7**
461. Verify byte-identical bytecode from identical source on all platforms **[C] P7**

## Domain 11 - Virtual Machine and Runtime (49)

462. Implement a bytecode interpreter dispatch loop **[C] P7**
463. Use a jump table or switch dispatch and measure the difference **[I] P7**
464. Implement a register file with bounds-checked access **[C] P7**
465. Represent runtime values as a compact tagged union **[C] P7**
466. Avoid heap allocation in the evaluation hot path **[I] P7**
467. Pool and reuse evaluation contexts across requests **[I] P7**
468. Implement arbitrary-precision decimal arithmetic at runtime **[C] P7**
469. Implement money arithmetic with currency tag checks **[C] P7**
470. Implement duration and timestamp arithmetic **[C] P7**
471. Implement canonical set operations **[C] P7**
472. Implement bounded quantifier execution with a hard iteration cap **[C] P7**
473. Implement temporal operator evaluation over a finite trace **[C] P7**
474. Implement RE2 matching with a compiled pattern cache **[C] P7**
475. Reject regex constructs outside RE2 at compile time **[C] P4**
476. Implement request schema validation before evaluation **[C] P7**
477. Return Indeterminate for a missing required attribute **[C] P7**
478. Return Indeterminate for a type mismatch in the request **[C] P7**
479. Never panic on a malformed request **[C] P7**
480. Implement all seven combining algorithms as total functions **[C] P7**
481. Implement policy-level and bundle-level combination **[C] P7**
482. Apply the policy default when all rules are NotApplicable **[C] P7**
483. Collect obligations only from contributing rules **[C] P7**
484. Collect advice separately from obligations **[C] P7**
485. Build a minimal justification tree **[C] P7**
486. Prove justification minimality by test **[C] P7**
487. Record attribute bindings referenced by decisive rules only **[C] P7**
488. Attach clause citations to the justification **[C] P7**
489. Attach source spans to the justification **[C] P7**
490. Emit an evaluation duration measurement without affecting the decision **[C] P7**
491. Guarantee the evaluator is single-threaded and reentrant-safe **[C] P7**
492. Guarantee no global mutable state in the evaluator **[C] P7**
493. Implement a hard instruction budget as a defence in depth **[C] P7**
494. Explain why an instruction budget is defence in depth, not the totality mechanism **[C] P7**
495. Implement policy hot-reload without dropping in-flight requests **[I] P9**
496. Implement atomic bundle swap **[I] P9**
497. Implement a PEP SDK that fails closed on PDP unavailability **[C] P9**
498. Implement obligation discharge with failure handling **[C] P9**
499. Fail closed when an obligation cannot be discharged **[C] P9**
500. Implement a PIP interface that resolves attributes before evaluation **[C] P9**
501. Keep all I/O inside the PIP, never the evaluator **[C] P9**
502. Implement attribute resolution caching with explicit staleness bounds **[I] P9**
503. Implement a decision cache keyed by canonical request digest **[I] P12**
504. Prove a decision cache cannot change semantics **[C] P12**
505. Implement a sidecar HTTP and gRPC server around the PDP **[I] P12**
506. Implement graceful shutdown and health endpoints **[I] P12**
507. Benchmark decision latency at p50, p95, p99, p999 **[C] P15**
508. Benchmark throughput per core **[C] P15**
509. Measure resident memory for a large bundle **[C] P15**
510. Profile and eliminate the top three allocation sources **[I] P15**

## Domain 12 - Determinism Engineering (36)

511. Enumerate every source of nondeterminism in a program **[C] P6**
512. Explain why determinism matters for audit and replay **[C] P0**
513. Eliminate all floating-point arithmetic from the codebase **[C] P6**
514. Prove absence of floats with a CI grep or lint rule **[C] P6**
515. Replace every map iteration with a canonically sorted traversal **[C] P6**
516. Add a lint that fails CI on bare map range in Go **[C] P6**
517. Define a canonical byte encoding for every value type **[C] P6**
518. Define a total order over every value type **[C] P6**
519. Sort sets and record fields by canonical encoding **[C] P6**
520. Eliminate locale-sensitive comparison and case folding **[C] P6**
521. Validate UTF-8 at the boundary and carry raw bytes unchanged thereafter; never normalise **[C] P6**
522. Inject the clock as an explicit parameter everywhere **[C] P6**
523. Forbid direct clock access in the evaluator by construction **[C] P6**
524. Inject randomness as an explicit seed, or eliminate it entirely **[C] P6**
525. Eliminate environment variable reads from evaluation paths **[C] P6**
526. Eliminate goroutine-order dependence **[C] P6**
527. Make error message text deterministic including any ordering **[C] P6**
528. Make diagnostic emission order deterministic **[C] P6**
529. Make IR serialisation byte-stable **[C] P6**
530. Make bytecode emission byte-stable **[C] P6**
531. Make audit report generation byte-stable given a fixed timestamp **[C] P10**
532. Separate the generation timestamp from all other report content **[C] P10**
533. Build a reproducible-build pipeline **[C] P9**
534. Verify a reproducible build across two independent machines **[C] P9**
535. Build a determinism harness that runs N iterations and diffs bytes **[C] P6**
536. Run the determinism harness across six platform targets in CI **[C] P9**
537. Treat any determinism failure as a Sev-1 defect **[C] P6**
538. Bisect a determinism regression **[I] P6**
539. Explain why timeouts are not a substitute for totality **[C] P7**
540. Explain why retry logic must not change a decision **[C] P9**
541. Design an idempotent decision API **[I] P9**
542. Compute a canonical request digest **[C] P8**
543. Use the request digest as a replay and cache key **[C] P12**
544. Replay a historical decision from evidence and confirm identity **[C] P8**
545. Detect a policy version mismatch during replay and fail closed **[C] P8**
546. Document the determinism guarantee precisely for users **[C] P13**
