# Kiro CLI Permissions - Skipping Prompts

The AEGIS build runs 200+ tasks across 12 specs. Answering a permission prompt on every file write will make that unbearable. Here are the options, least dangerous first.

---

## Option A - Use the bundled agent (recommended, persistent)

This repository ships `.kiro/agents/aegis.json`, which auto-approves the tools the build actually needs and explicitly denies secret files.

```bash
cd aegis-lang
kiro-cli chat --agent aegis
```

To make it the default so you never pass the flag:

```bash
kiro-cli agent set-default aegis
```

Auto-approved: `read`, `write`, `execute_bash`, `fs_read`, `fs_write`, `knowledge`.
Denied outright: `.env`, `.env.*`, `*.pem`, `*.key`, and writes into `.git/`.

**Known issue:** on some Kiro CLI versions (1.28.x was reported) `allowedTools` in a custom agent is ignored and the agent loads with zero tools. If `/tools` shows nothing after starting with `--agent aegis`, fall back to Option B for that session and check `kiro-cli --version`.

---

## Option B - Trust specific tools per session

```bash
kiro-cli chat --trust-tools read,write,execute_bash
```

Or mid-session:

```
/tools trust write
/tools trust execute_bash
```

This is what Kiro's own headless documentation recommends over trusting everything - least privilege, and it still removes essentially every prompt you would hit during the AEGIS build.

---

## Option C - Trust everything (fastest, most dangerous)

```bash
kiro-cli chat --trust-all-tools
```

Or mid-session:

```
/tools trust-all
```

On recent versions `--trust-all-tools` still shows an interactive confirmation prompt before the session starts, which breaks shell aliases and non-interactive use. That is an open upstream issue, not a mistake on your side. There is currently no `--yes` or `--no-confirm` flag.

---

## Useful session commands

| Command | Effect |
|---|---|
| `/tools` | Show every tool and whether it is trusted or per-request |
| `/tools trust <tool>` | Trust one tool for this session |
| `/tools untrust <tool>` | Return one tool to per-request confirmation |
| `/tools trust-all` | Trust everything for this session |
| `/tools reset` | Reset all tools to default permission levels |
| `/agent schema` | Validate the shape of an agent config |
| `/agent list` | Confirm the `aegis` agent loaded |

---

## A note worth taking seriously

You are building a governance language whose first invariant set includes **I7 Fail-closed**. Running your own toolchain fully open while writing a system that refuses ambiguity is a contradiction you should at least notice.

Practical middle ground: use Option A or B for the whole build, and keep `git` clean enough that any unwanted change is one `git diff` away from being spotted. Commit at the end of every task, as the master prompt already requires. That gives you speed without giving up the ability to see what happened.
