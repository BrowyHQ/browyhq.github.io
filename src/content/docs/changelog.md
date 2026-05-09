---
title: Changelog
description: Notable changes by version.
---

For full commit history see the
[GitHub releases](https://github.com/BrowyHQ/browy/releases).

## v0.1.1

- **Side panel:** "New chat" and "Past chats" buttons stay enabled even
  when the host is offline.
- **Side panel:** Inline "Sign in to GitHub Copilot" button appears on
  auth errors — opens a terminal with the device-flow link.
- **Side panel:** Reconnect banner shows transient host failures with
  exponential backoff (5 attempts) before surfacing a "Reinstall host"
  CTA.
- **Docs:** Public docs site (this site) launched at `browyhq.github.io/docs`.
- **Build:** Restored CI release workflow for the new zip layout.

## v0.1.0

First public-ish release.

- Chrome side-panel UI with chat history, model picker, and reasoning-effort selector.
- Native messaging host wrapping the GitHub Copilot CLI.
- Tool allowlist: 30+ browser tools (snapshot, click, type, navigate,
  tabs, evaluate_js, run_script, network/console logs, sandboxed disk
  + persistent memory, await_user).
- Multi-browser support: Chrome, Edge, Brave.
- One-line PowerShell installer for Windows.
