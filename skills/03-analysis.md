# Skills - Domains 7-9: Semantic Analysis, Static Analysis, Formal Methods (138 skills)

## Domain 7 - Semantic Analysis and Binding (40)

277. Build a scoped symbol table with lexical nesting **[C] P4**
278. Implement two-pass binding so declaration order does not matter **[C] P4**
279. Resolve a name to its declaration and record the link in the AST **[C] P4**
280. Detect duplicate declarations in the same scope **[C] P4**
281. Detect references to undeclared names with a did-you-mean suggestion **[C] P4**
282. Detect and report circular declaration dependencies **[C] P4**
283. Implement module-level namespacing for packages **[C] P4**
284. Implement import alias resolution **[C] P4**
285. Enforce export visibility across package boundaries **[C] P4**
286. Detect and reject circular imports with the full cycle path **[C] P4**
287. Enforce maximum import graph depth **[I] P4**
288. Resolve registry package versions to exact pins **[I] P12**
289. Validate that a package name matches its directory path **[I] P4**
290. Bind quantifier variables in a child scope only **[C] P4**
291. Detect shadowing and warn where it harms readability **[C] P4**
292. Validate attribute paths against the declared request schema **[C] P4**
293. Reject attribute paths not present in any schema **[C] P4**
294. Validate that a capability tool name is unique across the unit **[C] P4**
295. Validate criticality and reversibility field combinations **[C] P4**
296. Warn when an irreversible high-criticality capability has no human gate **[C] P4**
297. Validate principal role and scope fields **[C] P4**
298. Validate resource class data-class and jurisdiction fields **[C] P4**
299. Validate that a policy declares a combining algorithm **[C] P4**
300. Validate that a policy declares an applies_to target **[C] P4**
301. Validate that a policy declares at least one rule **[C] P4**
302. Validate rule identifier uniqueness within a policy **[C] P4**
303. Enforce a mandatory reason on any denying or escalating rule **[C] P4**
304. Validate obligation on_failure is present and legal **[C] P4**
305. Resolve clause citations against the loaded clause bundle **[C] P4**
306. Detect citation of a superseded clause version **[I] P8**
307. Detect a rule citing a clause its policy contradicts **[N] P8**
308. Validate test given blocks against the request schema **[C] P4**
309. Validate test expect assertions for type consistency **[C] P4**
310. Detect unused capabilities, principals, and constants **[I] P4**
311. Detect declarations with no doc comment and warn in strict mode **[N] P4**
312. Produce a symbol index consumable by the LSP **[I] P11**
313. Produce a reference graph for go-to-definition and find-references **[I] P11**
314. Keep binding errors independent so one does not mask others **[C] P4**
315. Golden-test every binding diagnostic **[C] P4**
316. Explain why dynamic attribute access is forbidden **[C] P4**

## Domain 8 - Static Analysis and Verification (54)

317. Explain the difference between soundness and completeness in analysis **[C] P5**
318. Choose sound-but-incomplete over unsound-but-complete, and justify it **[C] P5**
319. Implement reachability analysis over rule conditions **[C] P5**
320. Encode a rule condition as an SMT formula **[I] P5**
321. Use an SMT solver to prove a condition unsatisfiable **[I] P5**
322. Report an unreachable rule with a concrete witness of why **[C] P5**
323. Implement subsumption detection between two rule conditions **[C] P5**
324. Report rule A subsumes rule B with the implication shown **[C] P5**
325. Detect two rules with identical conditions and opposing effects **[C] P5**
326. Detect coverage gaps in the input space **[C] P5**
327. Generate a concrete example request that falls in a coverage gap **[I] P5**
328. Implement exhaustiveness checking over enum domains **[C] P5**
329. Compute the cross-product bound of nested quantifiers **[C] P5**
330. Compute a static worst-case evaluation cost from the IR **[C] P7**
331. Fail compilation when a cost bound exceeds the configured budget **[C] P7**
332. Report the cost bound as normal compiler output **[C] P7**
333. Detect any construct that could permit non-termination **[C] P5**
334. Prove the absence of recursion in the call graph **[C] P5**
335. Prove every quantifier iterates a statically bounded collection **[C] P5**
336. Detect float usage anywhere in the pipeline **[C] P5**
337. Detect clock reads inside evaluation code paths **[C] P5**
338. Detect map iteration without canonical ordering **[C] P6**
339. Build a CI lint that fails on bare map range in Go **[C] P6**
340. Detect locale-sensitive string comparison **[C] P6**
341. Detect nondeterministic set or record ordering **[C] P6**
342. Detect any I/O call reachable from the evaluator **[C] P6**
343. Implement taint analysis for attribute provenance **[N] P8**
344. Implement data-class flow analysis for redaction obligations **[I] P8**
345. Detect a permit path that leaks a restricted data class **[I] P8**
346. Detect fail-open configuration and warn loudly **[C] P5**
347. Detect order-sensitive combining algorithm usage and warn **[C] P5**
348. Detect a policy with no default and an incomplete rule set **[C] P5**
349. Detect conflicting obligations attached to one decision **[I] P5**
350. Detect an obligation the enforcement point cannot discharge **[I] P8**
351. Implement policy diffing at the semantic level, not the text level **[I] P10**
352. Report a semantic diff between two policy versions **[I] P10**
353. Prove a policy change cannot loosen an existing restriction **[I] P10**
354. Implement regression detection between policy bundle versions **[I] P10**
355. Verify a combining algorithm is commutative by exhaustive testing **[C] P5**
356. Verify a combining algorithm is associative by exhaustive testing **[C] P5**
357. Verify decision monotonicity where the semantics require it **[I] P5**
358. Generate counterexample requests for a failed property **[I] P5**
359. Present a counterexample in human-readable form **[I] P5**
360. Keep analysis time within a bounded budget and degrade gracefully **[C] P5**
361. Make every analysis result deterministic across runs **[C] P5**
362. Cache analysis results keyed by IR digest **[I] P11**
363. Report analysis findings with severity, span, and remediation **[C] P5**
364. Distinguish a hard error from an advisory finding **[C] P5**
365. Allow explicit, documented suppression of an advisory finding **[I] P5**
366. Record every suppression in the audit report **[C] P5**
367. Explain why suppressions must be visible to auditors **[C] P5**
368. Read and understand the Cedar verification approach **[I] P13**
369. Read and understand how OPA performs partial evaluation **[N] P13**
370. Write an analysis pass with full golden test coverage **[C] P5**

## Domain 9 - Formal Methods (44)

371. State the operational semantics of a language as inference rules **[I] P5**
372. Write a small-step semantics for an expression language **[I] P5**
373. Write a big-step semantics and relate it to small-step **[N] P5**
374. State a progress theorem **[I] P13**
375. State a preservation theorem **[I] P13**
376. Sketch a type soundness proof for a core calculus **[I] P13**
377. Identify which language features would break soundness **[C] P4**
378. Define a denotational semantics for the decision lattice **[N] P13**
379. Prove a function total by structural induction **[I] P13**
380. Prove termination via a decreasing measure **[I] P13**
381. Define and use a well-founded ordering **[N] P13**
382. Model a combining algorithm as a monoid **[I] P5**
383. Prove the monoid laws for an order-independent combiner **[I] P5**
384. Explain why first_applicable is not a monoid **[C] P5**
385. Write a TLA+ specification of the evaluation algorithm **[I] P13**
386. Model-check a TLA+ specification with TLC **[I] P13**
387. Express a safety property in TLA+ **[I] P13**
388. Express an invariant in TLA+ and verify it **[I] P13**
389. Explain the limits of model checking versus proof **[I] P13**
390. Encode a policy question as an SMT problem **[I] P5**
391. Use Z3 or CVC5 from a Go or TypeScript program **[I] P5**
392. Handle SMT solver timeouts soundly **[C] P5**
393. Interpret an SMT unsat core **[I] P5**
394. Convert an SMT model into a concrete counterexample request **[I] P5**
395. Explain the difference between validity and satisfiability **[I] P5**
396. Explain decidability of the theory fragment you are using **[I] P5**
397. Restrict the language so that its analysis fragment stays decidable **[C] P4**
398. Write a property-based test that encodes a formal property **[C] P5**
399. Use shrinking to minimise a property counterexample **[I] P5**
400. Write a generator for well-typed random policies **[I] P5**
401. Write a generator for random valid requests **[I] P5**
402. Use metamorphic testing to check semantic equivalences **[I] P5**
403. Verify refactoring equivalence by differential evaluation **[C] P7**
404. Verify optimisation correctness by differential evaluation **[C] P7**
405. Explain what a formal specification does and does not guarantee **[C] P13**
406. Explain the trusted computing base of the AEGIS toolchain **[I] P13**
407. Minimise the trusted computing base deliberately **[I] P13**
408. Document every unproven assumption explicitly **[C] P13**
409. Write a machine-checkable definition of conformance **[C] P13**
410. Explain the value of Lean or Coq formalisation and its cost **[N] P13**
411. Decide rationally whether full mechanised proof is worth it here **[I] P13**
412. Read a formal semantics paper and extract the usable part **[I] P13**
413. Communicate a formal guarantee to a non-technical auditor **[C] P13**
414. Avoid overclaiming formal guarantees in marketing material **[C] P13**
