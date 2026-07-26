#!/usr/bin/env node
/**
 * check-corpus.mjs - consistency gates for the AEGIS specification corpus.
 *
 * Plain ESM, Node 20+, zero dependencies, cross-platform. Runs on Linux in CI
 * and on Windows locally; nothing here shells out to a shell or hand-rolls a
 * path separator.
 *
 * These checks exist because the P0 audit found an always-loaded steering file
 * asserting a keyword set the specification had retired. An unenforced check
 * rots inside a week, and the corpus is about to start growing.
 *
 * Exit 0 if every check passes, 1 otherwise. Every failure names a file and,
 * where one exists, a line.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const SPEC = "docs/02-language-specification.md";
const GRAMMAR = "docs/03-grammar.md";
const CATALOGUE = "docs/10-error-catalog.md";
const CANON = ".kiro/steering/language-canon.md";

/** Words the parser matches by text in a declaration-field position. Not keywords. */
const FIELD_LABELS = [
  "tool", "criticality", "reversible", "data_classes", "description",
  "role", "scope", "mfa", "jurisdiction", "retention", "action",
];

/** Duration units, lexed as part of a duration token. Not keywords. */
const DURATION_UNITS = ["ms", "s", "m", "h", "d", "w", "y"];

/** Range endpoints in the docs/10 range table; not real codes. */
const RANGE_ENDPOINTS = new Set([
  "AEG-0000", "AEG-0999", "AEG-1000", "AEG-1999", "AEG-2000", "AEG-2999",
  "AEG-3000", "AEG-3999", "AEG-4000", "AEG-4999", "AEG-5000", "AEG-5999",
  "AEG-6000", "AEG-6999",
]);

/**
 * Excluded from the retired-construct scan. `examples/draft/` holds programs
 * that are known-invalid by design and inventoried in its own README, and
 * `conformance/invalid/` holds programs whose whole purpose is to be wrong.
 */
const RETIRED_SCAN_EXCLUDE = [
  join("examples", "draft"),
  join("conformance", "invalid"),
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const lines = (rel) => read(rel).split(/\r?\n/);
const posix = (p) => p.split(sep).join("/");

/** Corpus text files, as repo-relative paths, deterministically ordered. */
function corpusFiles(exts = [".md", ".aegis", ".json"]) {
  const out = [];
  const skip = new Set([".git", "node_modules", "dist", "coverage"]);
  (function walk(dir) {
    for (const name of readdirSync(dir).sort()) {
      if (skip.has(name)) continue;
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) walk(abs);
      else if (exts.some((e) => name.endsWith(e))) out.push(abs);
    }
  })(ROOT);
  return out.map((abs) => relative(ROOT, abs));
}

/** Backticked lowercase words from the keyword group lines of a document. */
function keywordSet(rel) {
  const groups =
    /^\*\*(Structural|Declaration|Effect|Combining|Targeting|Logic|Temporal|Values|Binding and assertion) \((\d+)\):\*\*/;
  const words = [];
  const declared = [];
  for (const line of lines(rel)) {
    const m = line.match(groups);
    if (!m) continue;
    const found = [...line.matchAll(/`([a-z_]+)`/g)].map((x) => x[1]);
    declared.push({ group: m[1], claimed: Number(m[2]), actual: found.length });
    words.push(...found);
  }
  return { words, declared };
}

/** The reserved-forbidden list is the single line beginning with `macro`. */
function reservedSet(rel) {
  const line = lines(rel).find((l) => l.startsWith("`macro`"));
  return line ? [...line.matchAll(/`([a-z_]+)`/g)].map((x) => x[1]) : [];
}

function setsEqual(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  return {
    equal: A.size === B.size && [...A].every((x) => B.has(x)),
    onlyA: [...A].filter((x) => !B.has(x)),
    onlyB: [...B].filter((x) => !A.has(x)),
  };
}

function duplicates(list) {
  const seen = new Set();
  const dupes = new Set();
  for (const item of list) {
    if (seen.has(item)) dupes.add(item);
    else seen.add(item);
  }
  return [...dupes];
}

// ---------------------------------------------------------------------------
// 1 - keyword arithmetic, and steering must not drift from the specification
// ---------------------------------------------------------------------------

function checkKeywords(fail) {
  const spec = keywordSet(SPEC);
  const reserved = reservedSet(SPEC);

  if (spec.words.length === 0) {
    fail(SPEC, null, "no keyword group lines found; the parser in this script is out of date");
    return { keywords: new Set(), reserved: new Set() };
  }

  const dupes = duplicates(spec.words);
  if (dupes.length) {
    fail(SPEC, null, `keyword listed more than once: ${dupes.join(", ")}`);
  }

  for (const g of spec.declared) {
    if (g.claimed !== g.actual) {
      fail(SPEC, null,
        `keyword group "${g.group}" claims ${g.claimed} words but lists ${g.actual}`);
    }
  }

  const unique = new Set(spec.words);
  const overlap = [...unique].filter((w) => reserved.includes(w));
  if (overlap.length) {
    fail(SPEC, null, `word is both a keyword and reserved-forbidden: ${overlap.join(", ")}`);
  }

  const kw = setsEqual(unique, keywordSet(CANON).words);
  if (!kw.equal) {
    fail(CANON, null,
      `keyword set drifts from ${SPEC}` +
      (kw.onlyA.length ? `; missing from canon: ${kw.onlyA.join(", ")}` : "") +
      (kw.onlyB.length ? `; extra in canon: ${kw.onlyB.join(", ")}` : ""));
  }

  const rs = setsEqual(reserved, reservedSet(CANON));
  if (!rs.equal) {
    fail(CANON, null,
      `reserved-forbidden set drifts from ${SPEC}` +
      (rs.onlyA.length ? `; missing from canon: ${rs.onlyA.join(", ")}` : "") +
      (rs.onlyB.length ? `; extra in canon: ${rs.onlyB.join(", ")}` : ""));
  }

  return { keywords: unique, reserved: new Set(reserved) };
}

// ---------------------------------------------------------------------------
// 2 - every quoted lowercase terminal in the grammar is classified
// ---------------------------------------------------------------------------

function checkGrammarTerminals(fail, keywords) {
  const block = read(GRAMMAR).match(/## 1\. Productions[\s\S]*?```ebnf([\s\S]*?)```/);
  if (!block) {
    fail(GRAMMAR, null, "could not locate the ebnf production block");
    return;
  }
  const terminals = new Set([...block[1].matchAll(/"([a-z_]+)"/g)].map((m) => m[1]));
  const unclassified = [...terminals].filter(
    (t) => !keywords.has(t) && !FIELD_LABELS.includes(t) && !DURATION_UNITS.includes(t),
  );
  if (unclassified.length) {
    fail(GRAMMAR, null,
      `terminal is neither a keyword, a declared field label, nor a duration unit: ${unclassified.join(", ")}\n` +
      `      classify it in ${SPEC} section 1.5.1, or add it to FIELD_LABELS here with a reason`);
  }
}

// ---------------------------------------------------------------------------
// catalogue parsing, shared by 3, 4 and 6
// ---------------------------------------------------------------------------

function catalogue() {
  const src = read(CATALOGUE);
  const codeRows = (text) =>
    new Set([...text.matchAll(/^\| (\d{4}) \|/gm)].map((m) => `AEG-${m[1]}`));
  const retired = codeRows(src.split("## Retired and relocated codes")[1] ?? "");
  const defined = new Set([...codeRows(src)].filter((c) => !retired.has(c)));
  return { defined, retired };
}

function codeReferences() {
  const refs = [];
  for (const rel of corpusFiles()) {
    read(rel).split(/\r?\n/).forEach((line, i) => {
      for (const m of line.matchAll(/AEG-\d{4}/g)) {
        refs.push({ code: m[0], file: posix(rel), line: i + 1 });
      }
    });
  }
  return refs;
}

// ---------------------------------------------------------------------------
// 3 - forward closure: every referenced code is defined
// ---------------------------------------------------------------------------

function checkForwardClosure(fail, cat, refs) {
  const firstUse = new Map();
  for (const r of refs) {
    if (RANGE_ENDPOINTS.has(r.code)) continue;
    if (cat.defined.has(r.code) || cat.retired.has(r.code)) continue;
    if (!firstUse.has(r.code)) firstUse.set(r.code, r);
  }
  for (const [code, r] of firstUse) {
    fail(r.file, r.line, `${code} is referenced but has no entry in ${CATALOGUE}`);
  }
}

// ---------------------------------------------------------------------------
// 4 - no retired code and no retired construct used as live syntax
// ---------------------------------------------------------------------------

/**
 * Two different questions, so two different scopes.
 *
 * A retired *code* must not be referenced anywhere, prose included, because a
 * requirement that cites a burned number is a defect wherever it sits. The only
 * way to exempt a mention is an explicit marker naming the specific code.
 *
 * A retired *construct* is a syntax question, so it is only a defect inside
 * AEGIS code: `.aegis` files and fenced aegis blocks in Markdown. Scanning
 * prose for the word "between" produced a heuristic that had to be taught about
 * forty English phrases, and a check that noisy gets silenced rather than fixed.
 */
const RETIRED_CODES = /AEG-(1013|1015|1016|1017|1018|1050)/g;

/**
 * Suppression marker. Must name the exact code, and the code must appear on the
 * marker's own line or the line immediately after it:
 *
 *     <!-- retired-ok: AEG-1013 -->
 *
 * A bare marker exempts nothing, and a marker naming a code that is not there is
 * itself a failure. Every accepted suppression is printed at the end of every
 * run, on success as well as on failure.
 *
 * This mirrors AEG-2100, where a suppressed advisory still appears in the audit
 * report. A governance toolchain whose own checker can be silenced invisibly is
 * not credible, and the checker is held to the standard the language sets.
 */
const SUPPRESSION = /<!--\s*retired-ok:\s*(AEG-\d{4})\s*-->/g;

const RETIRED_CONSTRUCTS = [
  { name: "NFC normalisation step", re: /\bNFC\b/ },
  { name: "`between` as an operator", re: /\bbetween\b/ },
  { name: "`D ago` temporal form", re: /\b\d+[a-z]+ ago\b/ },
  { name: "`when decision ==` obligation form", re: /\bwhen\s+decision\b/ },
  { name: "`schema request`", re: /\bschema\s+request\b/ },
  { name: "undelimited quantifier body", re: /\b(forall|exists|count|any|all|none)\s+[a-z][a-z0-9_]*\s+in\s/ },
  { name: "`;` statement separator", re: /;/ },
];

/**
 * Opening fence: three or more backticks or tildes, a lang tag of `aegis` in any
 * case, and an optional attribute string after it. The closing fence must use
 * the same character and be at least as long, per CommonMark.
 */
const FENCE_OPEN = /^\s*(`{3,}|~{3,})\s*aegis\b[^\n]*$/i;

/** Lines of AEGIS code in a file: the whole file, or just its aegis fences. */
function aegisCodeLines(rel) {
  const all = read(rel).split(/\r?\n/);
  if (rel.endsWith(".aegis")) return all.map((text, i) => ({ text, line: i + 1 }));
  if (!rel.endsWith(".md")) return [];

  const out = [];
  let fence = null; // { char, length }
  all.forEach((text, i) => {
    if (fence === null) {
      const open = text.match(FENCE_OPEN);
      if (open) fence = { char: open[1][0], length: open[1].length };
      return;
    }
    const close = text.match(/^\s*(`{3,}|~{3,})\s*$/);
    if (close && close[1][0] === fence.char && close[1].length >= fence.length) {
      fence = null;
      return;
    }
    out.push({ text, line: i + 1 });
  });
  return out;
}

/**
 * Collect every suppression marker, validate it against the lines it may cover,
 * and return both the accepted suppressions and the markers that cover nothing.
 */
function collectSuppressions(fail) {
  const accepted = [];
  for (const rel of corpusFiles()) {
    const file = posix(rel);
    const ls = read(rel).split(/\r?\n/);
    ls.forEach((text, i) => {
      for (const m of text.matchAll(SUPPRESSION)) {
        const code = m[1];
        const own = ls[i] ?? "";
        const next = ls[i + 1] ?? "";
        const onOwn = own.includes(code) && own.replace(m[0], "").includes(code);
        const onNext = next.includes(code);
        if (!onOwn && !onNext) {
          fail(file, i + 1,
            `suppression marker names ${code}, but ${code} does not appear on this line or the next\n` +
            "      a marker that covers nothing is either a typo or a stale exemption; delete it");
          continue;
        }
        accepted.push({ file, line: onOwn ? i + 1 : i + 2, code, markerLine: i + 1 });
      }
    });
  }
  return accepted;
}

function checkRetiredCodes(fail, suppressions) {
  const exempt = new Set(suppressions.map((s) => `${s.file}:${s.line}:${s.code}`));
  for (const rel of corpusFiles()) {
    const file = posix(rel);
    read(rel).split(/\r?\n/).forEach((raw, i) => {
      // A marker names a code by design, so its own text is not a reference.
      const text = raw.replace(SUPPRESSION, "");
      for (const m of text.matchAll(RETIRED_CODES)) {
        if (exempt.has(`${file}:${i + 1}:${m[0]}`)) continue;
        fail(file, i + 1,
          `retired code ${m[0]} referenced; see the retired table in ${CATALOGUE}\n` +
          `      if the mention is deliberate, mark it: <!-- retired-ok: ${m[0]} -->`);
      }
    });
  }
}

function checkRetiredConstructs(fail) {
  for (const rel of corpusFiles([".md", ".aegis"])) {
    if (RETIRED_SCAN_EXCLUDE.some((ex) => rel.startsWith(ex))) continue;
    for (const { text, line } of aegisCodeLines(rel)) {
      if (/^\s*\/\//.test(text)) continue; // a comment inside a fence is prose
      for (const c of RETIRED_CONSTRUCTS) {
        if (c.re.test(text)) fail(posix(rel), line, `${c.name} used as live syntax`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 6 - commit trailers: HEAD must name its task, and numeric ids must exist
// ---------------------------------------------------------------------------

/**
 * Two rules, the second of which activates itself.
 *
 * 1. The HEAD commit MUST carry a `Task:` trailer. This asserts something on
 *    every run from now on, in any trailer format.
 * 2. Once `v0/` exists in the tree, HEAD's trailer MUST be a numeric id that
 *    exists in the tasks.md of the spec its `Spec:` trailer names. A prose
 *    trailer such as "pre-1.1 P0 amendment" is accepted only while there is no
 *    implementation, which is exactly the window in which prose is honest.
 *
 * Every numeric trailer in reachable history is checked as well. Skipped rather
 * than failed when git is unavailable: a checkout without history is not a
 * corpus defect, and the workflow requests enough depth to avoid it.
 */
function checkTaskTrailers(fail, note) {
  let log;
  let headBody;
  let headSha;
  try {
    const git = (args) =>
      execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    log = git(["log", "--format=%h%n%B%n--END--"]);
    headBody = git(["log", "-1", "--format=%B"]);
    headSha = git(["log", "-1", "--format=%h"]).trim();
  } catch {
    note("check 6 skipped: git history unavailable");
    return;
  }

  const specTasks = new Map();
  for (const rel of corpusFiles([".md"])) {
    const m = posix(rel).match(/^\.kiro\/specs\/([^/]+)\/tasks\.md$/);
    if (!m) continue;
    specTasks.set(m[1], new Set(
      [...read(rel).matchAll(/^- \[[ x]\] \*\*(\d+(?:\.\d+)*)\*\*/gm)].map((x) => x[1]),
    ));
  }
  if (specTasks.size === 0) {
    fail("scripts/check-corpus.mjs", null,
      "no .kiro/specs/*/tasks.md found; the task-trailer check cannot assert anything");
    return;
  }

  const implementationExists = existsSync(join(ROOT, "v0"));
  const headTask = headBody.match(/^Task:\s*(.+)$/m);
  const headSpec = headBody.match(/^Spec:\s*(.+)$/m);

  if (!headTask) {
    fail(`commit ${headSha} (HEAD)`, null,
      "commit message has no `Task:` trailer; every commit must name the task it completes\n" +
      "      see the trailer format in .kiro/steering/conventions.md");
  } else if (implementationExists) {
    const id = headTask[1].trim();
    if (!/^\d+(\.\d+)*$/.test(id)) {
      fail(`commit ${headSha} (HEAD)`, null,
        `Task: ${id} is prose, but v0/ exists, so the trailer must be a numeric task id\n` +
        "      prose trailers are accepted only before there is an implementation");
    } else if (!headSpec) {
      fail(`commit ${headSha} (HEAD)`, null,
        `Task: ${id} is numeric but there is no \`Spec:\` trailer naming which tasks.md it belongs to`);
    } else {
      const named = headSpec[1].split(",").map((s) => s.trim()).filter((s) => specTasks.has(s));
      if (named.length === 0) {
        fail(`commit ${headSha} (HEAD)`, null,
          `\`Spec: ${headSpec[1].trim()}\` names no known spec id; expected one of ${[...specTasks.keys()].join(", ")}`);
      } else if (!named.some((s) => specTasks.get(s).has(id))) {
        fail(`commit ${headSha} (HEAD)`, null,
          `Task: ${id} does not exist in ${named.map((c) => `.kiro/specs/${c}/tasks.md`).join(" or ")}`);
      }
    }
  } else {
    note(`check 6: v0/ absent, so HEAD's prose trailer "${headTask[1].trim()}" is accepted`);
  }

  let examined = 0;
  for (const chunk of log.split("--END--")) {
    const body = chunk.trim();
    if (!body) continue;
    const sha = body.split("\n")[0].trim();
    const task = body.match(/^Task:\s*(.+)$/m);
    const spec = body.match(/^Spec:\s*(.+)$/m);
    if (!task || !spec) continue;

    const id = task[1].trim();
    if (!/^\d+(\.\d+)*$/.test(id)) continue;

    const named = spec[1].split(",").map((s) => s.trim()).filter((s) => specTasks.has(s));
    if (named.length === 0) continue;

    examined += 1;
    if (!named.some((s) => specTasks.get(s).has(id))) {
      fail(`commit ${sha}`, null,
        `Task: ${id} does not exist in ${named.map((c) => `.kiro/specs/${c}/tasks.md`).join(" or ")}`);
    }
  }
  note(`check 6: ${examined} historical commit(s) carry a numeric task id`);
}

// ---------------------------------------------------------------------------
// 6 - reverse closure: every defined code is referenced somewhere
// ---------------------------------------------------------------------------

/**
 * A code with a catalogue entry but no requirement, task, or spec section that
 * calls for it is an orphan: either dead weight or a forgotten obligation. The
 * opposite failure from check 3.
 */
function checkReverseClosure(fail, cat, refs) {
  const cited = new Set(refs.filter((r) => r.file !== CATALOGUE).map((r) => r.code));
  const orphans = [...cat.defined].filter((c) => !cited.has(c)).sort();
  if (orphans.length) {
    fail(CATALOGUE, null,
      `${orphans.length} code(s) defined but never referenced outside the catalogue:\n      ` +
      orphans.join(", ") +
      `\n      cite each one where it is required, or remove it`);
  }
}

// ---------------------------------------------------------------------------
// runner
// ---------------------------------------------------------------------------

const failures = [];
const notes = [];
const fail = (file, line, message) => failures.push({ file, line, message });
const note = (message) => notes.push(message);

const ctx = { cat: catalogue(), refs: codeReferences() };

const CHECKS = [
  ["keyword arithmetic and steering drift", () => { ctx.kw = checkKeywords(fail); }],
  ["grammar terminal classification", () => checkGrammarTerminals(fail, ctx.kw.keywords)],
  ["forward catalogue closure", () => checkForwardClosure(fail, ctx.cat, ctx.refs)],
  ["suppression markers name a real mention", () => { ctx.sup = collectSuppressions(fail); }],
  ["retired codes, anywhere in the corpus", () => checkRetiredCodes(fail, ctx.sup)],
  ["retired constructs, in aegis code only", () => checkRetiredConstructs(fail)],
  ["commit task-id trailers", () => checkTaskTrailers(fail, note)],
  ["reverse catalogue closure", () => checkReverseClosure(fail, ctx.cat, ctx.refs)],
];

console.log("AEGIS corpus checks\n");

CHECKS.forEach(([name, run], i) => {
  const before = failures.length;
  try {
    run();
  } catch (err) {
    fail("scripts/check-corpus.mjs", null, `check "${name}" threw: ${err.message}`);
  }
  const added = failures.length - before;
  console.log(`  ${added === 0 ? "ok  " : "FAIL"} ${i + 1}. ${name}${added ? ` (${added})` : ""}`);
});

if (notes.length) {
  console.log("");
  for (const n of notes) console.log(`  note: ${n}`);
}

// Printed on success as well as on failure. A suppression nobody sees is a
// suppression nobody reviews - the same reason AEG-2100 puts suppressed
// advisories in the audit report.
const suppressions = ctx.sup ?? [];
console.log(`\nactive suppressions: ${suppressions.length}`);
for (const s of suppressions.slice().sort((a, b) =>
  a.file.localeCompare(b.file) || a.line - b.line || a.code.localeCompare(b.code))) {
  console.log(`  ${s.file}:${s.line}  ${s.code}  (marker on line ${s.markerLine})`);
}

if (failures.length) {
  console.log(`\n${failures.length} problem(s):\n`);
  for (const f of failures) {
    console.log(`  ${f.line === null ? f.file : `${f.file}:${f.line}`}\n      ${f.message}`);
  }
  console.log("");
  process.exit(1);
}

console.log("\nall checks passed\n");
