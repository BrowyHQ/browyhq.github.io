---
title: Security
description: How to report a vulnerability and what we do about it.
---

## Reporting a vulnerability

**Please do not open a public GitHub issue for security issues.**

Report privately via
[GitHub Security Advisories](https://github.com/BrowyHQ/browy/security/advisories/new).
This sends a private message to the maintainers and lets us coordinate
a fix and disclosure.

Acknowledgement target: 7 days. Patch target: depends on severity.

## In scope

Anything that lets an attacker:

- Read or exfiltrate data outside the agent's sandbox (`~/.browy/data/`)
- Execute arbitrary code on the user's machine via prompt injection
- Bypass the tool allowlist to call SDK builtins (`bash`, host
  `read_file`, etc.)
- Defeat the secret-redaction filter for log files or chat history
- Persist state on the user's machine that survives uninstall
- Connect to a host other than the locally-registered native messaging
  host

## Out of scope

- The fact that any prompt-injection attack on a visited page can
  affect the agent's behavior — that's an inherent property of all
  page-driving agents, and the threat model assumes it. The mitigation
  is the strict tool allowlist (no host shell, no host file system, no
  arbitrary network egress).
- Issues in third-party software Browy depends on (Playwright, Chrome,
  the GitHub Copilot CLI) — please report those upstream.

## What we do

- Patch in a security release
- Add a regression test if the issue is reproducible
- Credit the reporter in the
  [changelog](/docs/changelog/) (with permission)
- Backport to the previous minor version if the issue is severe and
  the previous version is still in wide use

## Defense-in-depth notes

For users:

- Don't paste secrets into the agent's chat. The redaction filter is
  best-effort and aimed at *page content*; the chat is sent verbatim.
- Don't ask the agent to run `run_script` with code from an untrusted
  source.
- Run the agent against tabs you trust. The CDP banner ("Browy started
  debugging…") is your reminder that a session is live.
