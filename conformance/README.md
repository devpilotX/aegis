# Conformance Suite

An implementation conforms if and only if it passes this suite in full. 1,200+ cases required at v1.0.

```
valid/      <case>.aegis  <case>.request.json  <case>.expected.json
invalid/    <case>.aegis  <case>.expected-diagnostics.json
canonical/  <case>.aegis  <case>.ir.json  <case>.aegisc
```

- `valid/` - compiles, evaluates, and produces the expected decision and justification.
- `invalid/` - MUST produce exactly the listed diagnostic codes. Codes are part of the conformance surface.
- `canonical/` - byte-exact IR and bytecode. Enforces determinism (I2) and canonicality.

## Coverage tracker requirement

Every grammar production in `docs/03-grammar.md` and every entry in `docs/10-error-catalog.md` MUST map to at least one case. CI fails on an unmapped production or an unmapped diagnostic code.

## Runner

```bash
aegis conformance run ./conformance --report results.json
```

The runner is a standalone binary. A third party MUST be able to execute it against their own implementation without access to the reference source.
