---
title: Privacy & Data
description: What Browy collects, where it goes, and what we never see.
---

**Last updated: 2026-05-09**

Browy is a desktop application: a Chromium browser extension plus a
small native messaging host that runs on your machine. **Browy itself
operates no servers.** The Browy organization (BrowyHQ) does not
receive, store, log, or analyze any data about your usage.

This page is the privacy policy referenced in the Browy Chrome Web
Store and Microsoft Edge Add-ons listings.

## What Browy sends, and to whom

| Data | Sent to | Why |
|---|---|---|
| Page content the agent inspects (DOM snapshots, screenshots, console/network logs, JS evaluation results) | **GitHub Copilot**, via the locally-installed [GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli) | The LLM needs to see what's on screen to act. Same data path as if you ran `gh copilot` in a terminal. |
| Your chat messages | **GitHub Copilot**, via the local CLI | This is the prompt to the model. |
| Tool-call results (e.g. "navigated to X", "clicked element 7") | **GitHub Copilot**, via the local CLI | The model needs feedback to plan the next step. |
| Telemetry, analytics, error reports | **No one.** | Browy does not collect telemetry. There is no analytics SDK in the extension or the host. |

GitHub's handling of Copilot data is governed by the
[GitHub Copilot Privacy Statement](https://github.com/customer-terms/github-copilot-product-specific-terms)
and your Copilot subscription terms. Browy does not modify, intercept,
or proxy these requests.

## What Browy stores locally

| Data | Where | Lifetime |
|---|---|---|
| Chat history | `chrome.storage.local` (the extension's per-profile storage) | Until you clear it from the side panel or uninstall the extension |
| Settings (model, reasoning effort, theme, last tab) | `chrome.storage.local` | Same |
| Native host log | `~/.browy/host/host.log` (a single rotating 5 MB file) | Overwritten on rotation; deleted on uninstall |
| Agent scratch disk + key-value memory | `~/.browy/data/files/` and `~/.browy/data/notes.json` | Until you delete them; survives across chats |
| GitHub Copilot session state | `~/.copilot/` (managed by the Copilot CLI, not by Browy) | Per Copilot CLI's behavior |

Nothing in this list leaves your machine unless you initiate it (e.g.
asking the agent to "open this in a new tab" causes a navigation, or
asking it to "save this to my Downloads" calls `chrome.downloads`).

## Secret redaction

Page content the agent sees is filtered for common secret shapes
**at the moment of capture** — before it ever reaches the LLM, the log
file, or the conversation history. The current redaction list:

- JSON Web Tokens (`eyJ…`)
- GitHub tokens (`ghp_`, `ghs_`, `gho_`, `ghu_`, `ghr_`, `github_pat_`)
- OpenAI / Anthropic / Stripe keys (`sk-…`, `sk_live_…`, `pk_live_…`)
- AWS access keys (`AKIA…`)
- HTTP `Authorization`, `Cookie`, `Set-Cookie`, `x-api-key` headers
- `Bearer …` token values
- OAuth-style query and fragment params: `token`, `access_token`,
  `refresh_token`, `id_token`, `api_key`, `password`, `secret`,
  `client_secret`, `jwt`, `signature`, `code`

Redaction is best-effort and not a substitute for not pasting secrets
into the browser. If you'd like additional patterns covered,
[open an issue](https://github.com/BrowyHQ/browy/issues).

## What Browy never does

- ❌ Send any data to a Browy-operated server (there is none).
- ❌ Run continuously in the background. The agent acts only when you
  send a message in the side panel.
- ❌ Crawl, prefetch, or scrape pages you haven't asked it to operate on.
- ❌ Expose the GitHub Copilot CLI's built-in file-system or shell tools
  to the LLM — the SDK is locked to a strict allowlist of browser-only
  tools. (See `src/agent/loop.ts` in the source — search for `availableTools`.)
- ❌ Phone home for updates. Updates ship via Chrome Web Store / Edge
  Add-ons (extension) or the GitHub Releases page (native host CLI).

## Permissions

The extension requests a handful of Chrome permissions —
each one is documented and justified on the
[Permissions page](/docs/permissions/).

## Children

Browy is not directed to children under 13 and we do not knowingly
collect any data from anyone, including children.

## Changes to this policy

When this policy changes, the "Last updated" date at the top of this
page changes. Material changes will also be called out in the
[changelog](/docs/changelog/).

## Contact

- **Security issues:** Report privately via
  [GitHub Security Advisories](https://github.com/BrowyHQ/browy/security/advisories/new).
- **Privacy questions or general issues:**
  [Open a public issue](https://github.com/BrowyHQ/browy/issues).
