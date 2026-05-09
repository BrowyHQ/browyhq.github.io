---
title: Tools the agent has
description: The full list of tools Browy exposes to the LLM, and what each one does.
---

Browy locks the GitHub Copilot SDK to a strict allowlist of
**browser-only tools**. The SDK's built-in file-system and shell tools
(`read_file`, `write_file`, `bash`) are blocked — see
[Privacy & Data](/docs/privacy/) for why.

Below is a categorized reference. The authoritative list lives in
[`src/agent/tools/browser.ts`](https://github.com/BrowyHQ/browy/blob/main/src/agent/tools/browser.ts) —
search for `register({` to see every tool.

## Vision

| Tool | What it does |
|---|---|
| `snapshot` | Take an indexed accessibility-tree snapshot of the active tab. The agent uses these `[N]` indexes to click/type without brittle CSS. |
| `screenshot` | Capture a PNG of the visible viewport (or full page). |
| `read_visible` | Return the visible text of the page. |

## Click / type / navigate

| Tool | What it does |
|---|---|
| `click(index)` | Click an element by its snapshot index. |
| `type(index, text)` | Focus an input by index and type into it. |
| `key(key)` | Press a keyboard key (`Enter`, `Escape`, `Tab`, ...). |
| `scroll(direction, px?)` | Scroll the page or a scroll container. |
| `navigate(url)` | Open a URL (in a new tab by default). |

## Tabs

| Tool | What it does |
|---|---|
| `list_tabs` | List all open tabs (title, URL, id). |
| `switch_tab(id)` | Bring a tab to the foreground. |
| `new_tab(url?)` | Open a new tab. |
| `close_tab(id)` | Close a tab. |

## Power tools

| Tool | What it does |
|---|---|
| `evaluate_js(code)` | Run arbitrary JavaScript in the page (top-level await OK). For shadow-DOM walks, custom waits, structured extraction, framework-specific APIs. |
| `run_script(code)` | Run a Node.js script on **your** machine for file I/O / shell. Sandboxed and asks before running. |
| `query_dom(selector)` | CSS selector fallback when the indexed tools can't express what you need. |

## Network & console

| Tool | What it does |
|---|---|
| `network_log` | Recent network requests (URL, method, status, timing) — secrets redacted. |
| `console_log` | Recent console messages and exceptions — secrets redacted. |

## Persistent disk + memory

Sandboxed at `~/.browy/data/`:

| Tool | What it does |
|---|---|
| `save_file(filename, content)`, `read_file`, `list_files`, `delete_file` | Scratch disk for cached scrapes, intermediate work. Paths are relative to the data root; you can't escape it. |
| `note_set(key, value, category?)`, `note_get`, `note_list`, `note_delete` | Persistent key-value memory that survives across **different chats** (user preferences, long-lived facts). |

## Human-in-the-loop

| Tool | What it does |
|---|---|
| `await_user(message)` | Pause and ask you to do something yourself (e.g. solve a CAPTCHA, click a confirmation, choose between two options). |

## What the agent can't do

The Copilot SDK ships with built-in `read_file` / `write_file` / `bash` /
`grep` / `glob` / `web_fetch` tools that operate on your host filesystem
and arbitrary URLs. **Browy blocks all of these** — the only `read_file` /
`write_file` tools the agent has are the sandboxed ones above, scoped
to `~/.browy/data/`. See `src/agent/loop.ts` (search for `availableTools`)
for the lock-down.
