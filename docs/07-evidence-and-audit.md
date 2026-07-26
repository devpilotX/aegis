# 07 - Evidence and Audit

## Principle

Evidence is an **output of the evaluator**, not logging bolted on afterwards - I6. If evidence were logging, it could be disabled, sampled, or lost, and the system would be unable to answer the only question that matters after an incident: what was the rule, and what did it decide?

## Evidence record schema

```json
{
  "version": "AEGIS-EVIDENCE/1",
  "seq": 1042,
  "prevHash": "sha256:9f2c...",
  "timestamp": "2026-07-26T11:04:22.481Z",
  "bundleDigest": "sha256:71ab...",
  "irDigest": "sha256:c3d1...",
  "requestDigest": "sha256:44fe...",
  "decision": "deny",
  "policy": "acme.payments.eu_high_risk_payment_gate",
  "combining": "deny_overrides",
  "decisiveRules": [
    { "id": "human_gate",
      "span": "payments.aegis:31:5-34:60",
      "reason": "Irreversible high-value action requires fresh human approval.",
      "cites": ["eu:article:14@2024-07-12"],
      "bindings": { "action.capability": "transfer_funds",
                    "human.approved": false,
                    "resource.amount": "money:2500000:2:EUR" } }
  ],
  "obligations": [
    { "action": "notify", "args": { "target": "risk-oncall" }, "discharged": true }
  ],
  "advice": [],
  "redactions": [ { "path": "subject.email", "reason": "pii" } ],
  "evalDurationNs": 74210,
  "keyId": "aegis-signing-2026-q3",
  "selfHash": "sha256:8b71...",
  "signature": "ed25519:..."
}
```

## Hash chain

1. Canonically serialise the record with `selfHash` and `signature` omitted. Canonical means: fixed field order, sorted keys, no insignificant whitespace, decimals as sign plus scaled integer, timestamps as RFC 3339 UTC with fixed precision.
2. `selfHash = SHA-256(prevHash || canonicalBytes)`.
3. `signature = Ed25519(privateKey, selfHash)`, tagged with `keyId`.
4. Genesis record has `prevHash` equal to 32 zero bytes and `seq` 0.

This detects **insertion** (sequence and prevHash break), **deletion** (chain gap), and **mutation** (selfHash mismatch).

## Independent verification

`aegis verify-evidence <file>` is written so it shares **no code** with the writer - separate package, separate canonical serialiser, tested against fixtures produced by the writer. A verifier that reuses the writer's serialiser can only prove self-consistency, which is worth nothing.

Verification checks: chain continuity, every `selfHash`, every signature against the key registry for that `keyId`, monotonic sequence, and monotonic timestamps within clock-skew tolerance.

## Key management

Keys carry identifiers and validity windows. Rotation appends a new key; historical records MUST verify against the key valid at their timestamp. Private keys live in a KMS or HSM in production. The threat model is documented in `docs/13-security-model.md`.

## Honest language

The chain is **tamper-evident**, not tamper-proof. An attacker with the signing key and full write access to storage can rewrite history coherently. Mitigations are append-only or WORM storage, off-site anchoring of periodic chain heads, and optionally a transparency log or timestamping authority. Say this plainly in documentation. Overclaiming here destroys the credibility the entire project depends on.

## Data minimisation

Only bindings referenced by decisive rules are recorded. Sensitive values are redacted according to declared data classes, and the `redactions` array names what was removed and why. Redaction happens **before** hashing, so a redacted record remains verifiable. Retention and deletion policies are configurable, because GDPR obligations apply to audit content too.

## The audit report

Generated from the same IR as the bytecode - I5. Contents: policy purpose from doc comments, every rule in plain language with its reason and clause citations, the combining algorithm explained in prose, the default behaviour, every obligation, and a prominently highlighted section for fail-open configuration and every suppressed advisory. No code appears anywhere in it. Byte-stable given a fixed generation timestamp.

The test of success is simple and non-negotiable: a compliance officer accepts the generated document unmodified.
