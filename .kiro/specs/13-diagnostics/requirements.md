# Requirements - Diagnostics Engine

**Spec ID:** `13-diagnostics` | **Phase:** P3 | **Invariants:** I2, I8, I10

## Purpose

Own the diagnostic type, the sink, the renderer, and the error catalogue. Every other component reports through this one, so the quality of this component is the quality of the product's most visible surface.

This spec did not exist before the P0 audit. Phase 3 is the diagnostics phase and had no spec to work from, which is how three mutually incompatible rendering standards came to be written in three different documents.

## Acceptance criteria (EARS format)

### 1. The diagnostic type

1.1. WHEN a diagnostic is constructed THEN it SHALL carry a code, a severity, a fatality flag, a one-line summary, a location, at least one note, and at least one help.
1.2. WHEN a diagnostic has no actionable fix THEN construction SHALL fail at compile time, not at run time; a diagnostic without a help line is not representable.
1.3. WHEN a second source location is relevant THEN the diagnostic MAY carry one or more secondary spans with their own labels, and WHEN no second location exists THEN it SHALL carry none.
1.4. WHEN a diagnostic cites a specification section THEN it SHALL render as `= spec:`, which is optional.
1.5. WHEN a diagnostic is constructed THEN `= why:` SHALL NOT exist as a field; that content belongs in `= note:`.
1.6. WHEN a severity is expressed THEN it SHALL be `error` or `warning` and nothing else; `advisory` is a warning and `note` is a line inside a diagnostic, not a severity.
1.7. WHEN fatality is expressed THEN it SHALL be a boolean separate from severity, because a fatal is an error that stops the pipeline rather than a third severity.
1.8. WHEN a diagnostic has no derivable line and column, as AEG-1001 does not, THEN its location SHALL be a distinct variant of the location type rather than an absent or nullable field, so that a consumer cannot fail to handle it.

### 2. Rendering

2.1. WHEN a diagnostic is rendered THEN the output SHALL match the frozen standard in `docs/10-error-catalog.md` exactly, byte for byte, including gutter width and caret alignment.
2.2. WHEN a position is rendered THEN line and column SHALL be 1-based and the column SHALL count Unicode scalar values.
2.3. WHEN the source line contains a tab THEN the tab SHALL occupy one column and render as one space in both the excerpt and the caret line.
2.4. WHEN the same diagnostic is rendered twice THEN the output SHALL be byte-identical, and WHEN rendered on a different platform THEN it SHALL still be byte-identical (I2).
2.5. WHEN a diagnostic is rendered as JSON THEN the field order SHALL be fixed and the output SHALL be byte-stable.
2.6. WHEN a summary is written THEN it SHALL NOT consist of the words "invalid", "unexpected", or "malformed" alone.

### 3. The sink

3.1. WHEN diagnostics are collected THEN the sink SHALL preserve emission order, which is source order, and SHALL NEVER reorder them - not by code, not by severity, not by position.
3.2. WHEN 200 diagnostics have been collected for one file THEN the sink SHALL emit AEG-1006 and signal stop, and the caller SHALL NOT be required to count.
3.3. WHEN 2,000 diagnostics have been collected for one build THEN the driver SHALL emit AEG-0001 and stop the build.
3.4. WHEN a duplicate diagnostic with identical code and identical location is added THEN the sink SHALL retain exactly one.
3.5. WHEN the cap is reached THEN AEG-1006 SHALL be emitted exactly once however many further diagnostics are offered.

### 4. Catalogue integrity

4.1. WHEN a diagnostic code is emitted anywhere in the toolchain THEN it SHALL have an entry in `docs/10-error-catalog.md`.
4.2. WHEN a code appears in the retired-and-relocated table THEN no component SHALL emit it.
4.3. WHEN one author mistake is detectable at two layers THEN both codes SHALL carry an identical note line, as the AEG-1019 and AEG-4141 pair do.
4.4. WHEN a reserved-forbidden word is reported as AEG-1030 THEN the help line SHALL be the tailored text in the catalogue for that word, not a generic message.
4.5. WHEN CI runs THEN it SHALL fail on any emitted code without a catalogue entry, any catalogue entry without a golden fixture, and any occurrence of the token `CITATION-NEEDED`.

### 5. Severity and modes

5.1. WHEN the build is default mode THEN a 2xxx advisory SHALL render as a warning and SHALL NOT fail the build.
5.2. WHEN `--strict` is set THEN every 2xxx advisory SHALL be escalated to an error.
5.3. WHEN `--release` is set THEN strict behaviour SHALL apply and a failing in-language test SHALL additionally fail the build with AEG-3060.
5.4. WHEN an advisory is explicitly suppressed THEN the suppression SHALL be recorded and SHALL appear in the audit report (AEG-2100).
5.5. WHEN severity is escalated by `--strict` THEN fatality SHALL NOT change, because whether the pipeline can continue is a property of the defect and not of the build configuration.

## Out of scope

Detection logic for any specific defect: that belongs to the component that detects it. This spec owns the type, the sink, the renderer, and the catalogue's integrity, and nothing else.
