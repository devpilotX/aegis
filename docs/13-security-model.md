# 13 - Security Model

## Assets

Policy source and bundles, signing keys, evidence chains, the decision path itself, and the clause library.

## Adversaries

| Adversary | Capability | Goal |
|---|---|---|
| Malicious policy author | Can commit source | Insert a fail-open path that survives review |
| Compromised agent | Controls the request payload | Get a Permit it should not have |
| Malicious bundle supplier | Can serve bundles | Ship an unsigned or altered bundle |
| Storage attacker | Can write evidence storage | Rewrite history |
| Insider with signing key | Full signing capability | Coherent history rewrite |
| Network attacker | Sits between PEP and PDP | Force fail-open by making the PDP unreachable |

## Controls

| Threat | Control |
|---|---|
| Fail-open policy slipped past review | `default permit` warns loudly, is highlighted in the audit report, and static analysis flags fail-open configuration |
| Hostile request payload | Schema validation before evaluation; missing or mistyped attributes yield Indeterminate, resolved to Deny |
| Malformed bytecode | Full loader validation of magic, version, hash, jump targets, register and constant indices; fuzzed to zero panics |
| Unsigned or altered bundle | Signature verified before load; the PDP never degrades to unsigned |
| Resource exhaustion | Static totality plus static resource bounds plus a hard instruction budget as defence in depth |
| Evidence tampering | Hash chain plus signatures plus an independent verifier plus append-only or WORM storage |
| Key compromise | KMS or HSM custody, key identifiers with validity windows, rotation, off-site anchoring of chain heads |
| PDP unreachable | The PEP fails closed. This is the default and MUST NOT be configurable to fail open without an explicit, audited setting |
| Homoglyph attack in legally binding text | ASCII-only identifiers, confusable detection, bidi override rejection |
| Regex denial of service | RE2 only; backreferences and lookaround rejected at compile time |

## Cryptography discipline

SHA-256 for content addressing and chaining. Ed25519 for signing. Standard library implementations only. **Never write custom cryptography, never invent a construction, never roll a bespoke canonical form without review.** Canonical serialisation is security-critical: two different byte encodings of the same logical record would break the chain's meaning.

## Supply chain

Minimal dependencies with pinned versions and checksums. Reproducible builds verified on two independent machines. Signed releases with published checksums. An SBOM per release. Dependency review on every addition, with a bias toward the standard library.

## Explicit non-goals

AEGIS does not defend against a fully compromised host, does not prevent an operator with signing keys and storage write access from rewriting history coherently, does not sandbox the agent's own code, and does not make model outputs trustworthy. Say all of this plainly. The value is enforcement plus tamper-evident evidence, not omnipotence.
