---
title: Your first chat
description: A two-minute walkthrough of what Browy can do.
---

Once Browy is [installed](/docs/install/) and signed in, open the
side panel and try one of these:

## "Summarize this page"

Open a long article or doc page. In the Browy side panel:

> Summarize this page in 5 bullets.

Browy takes a snapshot of the page's accessibility tree, sends it to
Copilot, and writes the summary back into the chat. No copy-paste.

## "Fill out this form for me"

Open a form (e.g. a sign-up page, a survey, a settings page). Tell Browy
what you want filled in:

> My name is Alex Doe, my email is alex@example.com. Fill out this form
> with that info — leave the password field for me. Don't submit.

Browy clicks fields by their accessibility index — no brittle CSS selectors —
and types the values. It'll stop and show you what it did before submitting.

## "Find the cheapest flight"

Open google.com:

> Search for flights from SFO to JFK on the 15th, sort by price, and
> tell me the cheapest one.

Browy will navigate, type the query, click through, read the results,
and report back. Multi-step automation in plain English.

## "Inspect the network"

Open any web app:

> What's the slowest API call on this page when I refresh? Show me the
> URL, status code, and time.

Browy reads the network log via CDP and answers from data you don't
even have to open DevTools to see.

## "Run this in the page"

For deeper inspection, the agent can evaluate arbitrary JavaScript:

> Find every `<button>` on the page that has no `aria-label` and tell me
> what it says.

The `evaluate_js` tool runs your request as JS in the page context and
returns the result.

---

## What's next?

- Slash commands: type `/` in the chat to see them all (`/login`,
  `/clear`, `/chats`, `/help`).
- See the full [tools reference](/docs/tools/) for everything the agent
  can do.
- See the [permissions reference](/docs/permissions/) for what the
  extension can and cannot access.
