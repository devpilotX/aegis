# 16 - WASM and Embedding

Host-language independence is one of the three independence targets. It is achieved with a WASM/WASI module plus a stable C ABI, not with per-language reimplementations.

## Stable C ABI

```c
// Opaque handles. All memory is owned by the caller unless documented otherwise.
typedef struct aegis_engine aegis_engine;

int  aegis_version(char* buf, size_t len);

// Load a signed bundle. Returns 0 on success, a negative AEG code on failure.
int  aegis_engine_new(const uint8_t* bundle, size_t bundle_len,
                      const uint8_t* pubkey, size_t pubkey_len,
                      aegis_engine** out);

// Evaluate. request_json in, decision_json out. Never panics, never blocks.
int  aegis_evaluate(aegis_engine* e,
                    const char* request_json, size_t request_len,
                    char* out_buf, size_t out_cap, size_t* out_len);

// Retrieve the evidence record for the last evaluation on this engine handle.
int  aegis_last_evidence(aegis_engine* e,
                         char* out_buf, size_t out_cap, size_t* out_len);

void aegis_engine_free(aegis_engine* e);
```

Rules: no callbacks into the host, no host allocation, no threads, no I/O, no global state. Every function returns an integer status; a negative value is a diagnostic code from the catalogue. `aegis_evaluate` returning a non-zero status MUST be treated by the host as Deny - I7.

## WASM module

Built with `GOOS=wasip1 GOARCH=wasm`. Target size under 6 MB, ceiling 12 MB. The module imports nothing beyond the minimum WASI surface, and specifically imports no clock and no filesystem: the logical clock arrives inside the request - I3.

Determinism across WASM and native is verified by the determinism harness, which treats `wasip1` as a first-class target. A WASM/native divergence is a Sev-1 defect.

## SDK shape (identical across languages)

```python
from aegis import Engine, Decision

engine = Engine.from_bundle(open("policies.aegisb", "rb").read(), pubkey=KEY)

result = engine.evaluate({
    "subject":  {"id": "agent-7", "role": "assistant"},
    "action":   {"capability": "transfer_funds"},
    "resource": {"amount": {"value": "25000", "currency": "EUR"}},
    "context":  {"region": "EU"},
    "model":    {"risk_tier": "high"},
    "human":    {"approved": False},
    "clock":    {"now": "2026-07-26T11:04:22Z"},
})

if result.decision is not Decision.PERMIT:
    raise Blocked(result.reason, result.justification)

for ob in result.obligations:
    discharge(ob)          # failure applies the declared on_failure effect
```

Every SDK MUST: fail closed on any error, expose the full justification, expose obligations as a list the host must discharge, and expose the evidence record. An SDK that swallows a justification is not conforming.

## Language bindings at v1.0

Go (native), Python (ctypes over the C ABI or wasmtime), Node.js (N-API or WASM), Java (Panama or wasmtime), Rust (direct FFI), browser (WASM). Sidecar HTTP and gRPC servers exist for languages without a comfortable FFI path.

## Testing

The conformance suite runs through at least three host languages before release. Identical decisions, identical justifications, identical evidence bodies. Anything else is a bug in the ABI boundary, not an acceptable platform difference.
