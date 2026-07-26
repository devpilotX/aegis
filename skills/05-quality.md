# Skills - Domains 13-15: Diagnostics, Testing, Performance (140 skills)

## Domain 13 - Diagnostics and Error Engineering (42)

545. Design a stable, namespaced diagnostic code scheme **[C] P3**
546. Assign a permanent code to every diagnostic and never reuse it **[C] P3**
547. Maintain a diagnostic catalogue with cause, example, and fix **[C] P3**
548. Generate the catalogue from code so it cannot drift **[I] P3**
549. Fail CI when a diagnostic lacks a catalogue entry **[C] P3**
550. Model a diagnostic as structured data, not a string **[C] P3**
551. Attach a primary span to every diagnostic **[C] P3**
552. Attach secondary and related spans where they aid understanding **[I] P3**
553. Render a source snippet with caret underlining **[C] P3**
554. Render multi-line spans correctly **[C] P3**
555. Render spans correctly with tabs and wide characters **[I] P3**
556. Render spans correctly for multi-byte UTF-8 **[C] P3**
557. Include expected and actual state in every type diagnostic **[C] P3**
558. Include a suggested fix in every diagnostic **[C] P3**
559. Generate machine-applicable fix-its where unambiguous **[I] P11**
560. Implement did-you-mean suggestions with bounded edit distance **[I] P3**
561. Rank suggestions deterministically **[C] P3**
562. Cite the governing specification section in each diagnostic **[I] P3**
563. Explain the underlying reason, not just the violated rule **[C] P3**
564. Write diagnostics readable by a non-programmer policy author **[C] P3**
565. Avoid compiler jargon in user-facing text **[C] P3**
566. Choose severity correctly: error, warning, advisory, note **[C] P3**
567. Never warn about something the user cannot act on **[C] P3**
568. Suppress cascading diagnostics from a single root cause **[C] P3**
569. Deduplicate identical diagnostics **[C] P3**
570. Order diagnostics deterministically by position **[C] P3**
571. Cap total diagnostic output with a clear truncation notice **[I] P3**
572. Emit diagnostics as JSON for tooling consumption **[C] P11**
573. Emit diagnostics in LSP format **[C] P11**
574. Emit diagnostics in SARIF for CI integration **[I] P11**
575. Colourise terminal output and respect NO_COLOR **[I] P9**
576. Detect terminal capability and degrade gracefully **[I] P9**
577. Golden-test the exact rendered text of every diagnostic **[C] P3**
578. Review every diagnostic message for tone and clarity **[C] P3**
579. Write a diagnostic style guide and enforce it in review **[C] P3**
580. Localise diagnostics without breaking golden tests **[N] P13**
581. Implement error recovery so multiple real errors surface at once **[C] P3**
582. Distinguish recoverable from fatal errors **[C] P3**
583. Continue later compiler phases after a recoverable error **[C] P3**
584. Measure and improve time-to-fix as a product metric **[I] P13**
585. Compare your diagnostics against Rust and Elm as the bar **[C] P3**
586. Explain why diagnostics are the primary product surface of a language **[C] P3**

## Domain 14 - Testing and Correctness (58)

587. Write a unit test that tests behaviour, not implementation **[C] P1**
588. Write a table-driven test **[C] P1**
589. Achieve full branch coverage on a function deliberately **[C] P1**
590. Test every error path explicitly **[C] P1**
591. Test empty, minimal, maximal, and malformed inputs **[C] P1**
592. Test boundary values on every numeric limit **[C] P1**
593. Test Unicode edge cases including combining characters **[C] P1**
594. Test deeply nested input up to the declared limit **[C] P2**
595. Test input one past every declared limit **[C] P2**
596. Write a golden file test with a regeneration flag **[C] P1**
597. Review a golden diff carefully rather than blindly regenerating **[C] P1**
598. Keep golden files small and human-readable **[I] P1**
599. Write a property-based test with a good generator **[C] P1**
600. Write a shrinking-friendly generator **[I] P1**
601. Property-test lexer round-trip fidelity **[C] P1**
602. Property-test parse-print-parse idempotence **[C] P2**
603. Property-test IR canonicality under semantic-preserving edits **[C] P6**
604. Property-test decision determinism **[C] P5**
605. Property-test combining algorithm commutativity **[C] P5**
606. Property-test combining algorithm associativity **[C] P5**
607. Property-test that well-typed programs never produce type errors at runtime **[C] P5**
608. Write a fuzz target for the lexer **[C] P1**
609. Write a fuzz target for the parser **[C] P2**
610. Write a fuzz target for the IR decoder **[C] P6**
611. Write a fuzz target for the bytecode loader **[C] P7**
612. Maintain and grow a fuzzing seed corpus **[C] P2**
613. Minimise a fuzz crash input **[I] P2**
614. Run fuzzing continuously in CI with a time budget **[C] P2**
615. Treat any fuzz-found panic as a release blocker **[C] P2**
616. Detect non-termination during fuzzing **[C] P2**
617. Build a differential test harness across two implementations **[C] P6**
618. Diagnose a differential mismatch to its root cause **[C] P6**
619. Design a conformance case format: source, request, expectation **[C] P13**
620. Generate conformance cases from specification examples **[C] P13**
621. Organise conformance cases by feature and by diagnostic code **[C] P13**
622. Track conformance coverage against the grammar and the error catalogue **[C] P13**
623. Write a conformance runner usable by third-party implementations **[C] P13**
624. Publish conformance results in a machine-readable form **[I] P13**
625. Run mutation testing and interpret the score honestly **[I] P5**
626. Kill surviving mutants with targeted tests **[I] P5**
627. Write a benchmark that is stable across runs **[C] P15**
628. Detect a performance regression automatically in CI **[C] P15**
629. Write a determinism harness across platforms **[C] P6**
630. Write an integration test for the full CLI surface **[C] P9**
631. Test the binary inside a scratch container with no dependencies **[C] P9**
632. Test the WASM module under three host languages **[C] P12**
633. Test evidence chain verification including tamper detection **[C] P8**
634. Test signature verification failure paths **[C] P8**
635. Test policy hot-reload under load **[I] P9**
636. Test fail-closed behaviour when the PDP is unavailable **[C] P9**
637. Test obligation discharge failure handling **[C] P9**
638. Write a test that would have caught each historical bug **[C] P1**
639. Keep the whole test suite under five minutes locally **[I] P1**
640. Parallelise tests without introducing order dependence **[I] P1**
641. Make every test deterministic and independent **[C] P1**
642. Delete a test that no longer tests anything **[I] P1**
643. Explain the difference between coverage and confidence **[C] P1**
644. Set and defend coverage floors per package **[C] P1**

## Domain 15 - Performance Engineering (40)

645. Write a microbenchmark that measures the right thing **[C] P15**
646. Avoid common benchmarking mistakes such as dead-code elimination **[C] P15**
647. Control for warm-up and JIT or cache effects **[I] P15**
648. Report percentiles rather than means **[C] P15**
649. Measure allocation count and bytes per operation **[C] P15**
650. Profile CPU with pprof and read a flame graph **[C] P15**
651. Profile allocations and identify the top sources **[C] P15**
652. Profile with a realistic policy bundle, not a toy one **[C] P15**
653. Build a representative benchmark corpus **[C] P15**
654. Set explicit performance budgets per component **[C] P15**
655. Gate merges on performance regression **[C] P15**
656. Optimise only after measuring **[C] P15**
657. Reduce allocations by reusing buffers safely **[I] P15**
658. Use value types instead of pointers where it helps locality **[I] P15**
659. Improve cache locality with a flat data layout **[I] P15**
660. Choose an efficient tagged value representation **[C] P7**
661. Precompile and cache regex patterns **[C] P7**
662. Precompute rule condition cost estimates **[I] P7**
663. Order short-circuit evaluation by cost **[N] P7**
664. Index rules by target attribute to skip inapplicable policies **[I] P7**
665. Build a decision cache and prove it is semantics-preserving **[I] P12**
666. Measure cold start precisely **[C] P15**
667. Reduce binary size with build flags and symbol stripping **[I] P9**
668. Measure and reduce WASM module size **[I] P12**
669. Trade compile time against evaluation time deliberately **[I] P7**
670. Explain why the evaluator must stay single-threaded **[C] P7**
671. Scale throughput by request-level parallelism outside the evaluator **[C] P12**
672. Measure tail latency under concurrent load **[C] P15**
673. Detect and eliminate lock contention in the hot path **[I] P15**
674. Avoid interface dispatch in the innermost loop **[I] P15**
675. Verify an optimisation did not change any decision **[C] P7**
676. Reject an optimisation that harms explainability **[C] P7**
677. Reject an optimisation that harms determinism **[C] P7**
678. Document the performance characteristics for users **[I] P13**
679. Publish reproducible benchmark methodology **[I] P13**
680. Compare honestly against OPA and Cedar on equivalent policies **[I] P13**
681. Avoid misleading benchmark claims **[C] P13**
682. Identify when the bottleneck is attribute resolution, not evaluation **[C] P15**
683. Optimise the PIP layer separately from the PDP **[I] P15**
684. Know when performance is good enough and stop **[C] P15**
