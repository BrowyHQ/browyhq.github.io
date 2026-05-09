---
title: Install
description: Install Browy on your machine.
---

import { Tabs, TabItem, Steps, Aside } from '@astrojs/starlight/components';

Browy is two pieces:

1. **The native host** — a small Node.js helper that runs on your
   machine and talks to GitHub Copilot.
2. **The browser extension** — a Chrome side panel that talks to the
   native host.

The installer below sets up both.

<Aside type="caution">
Browy is in early access. Today the only supported channel is the
GitHub release. The Chrome Web Store listing is in review.
</Aside>

## Requirements

- Windows 10/11 (macOS and Linux coming soon — see [Roadmap](/docs/roadmap/))
- A Chromium browser: Chrome, Edge, or Brave
- A [GitHub Copilot](https://github.com/features/copilot) subscription

## Install the native host

<Tabs>
<TabItem label="Windows" icon="seti:windows">

Open PowerShell and run:

```powershell
irm https://github.com/BrowyHQ/browy/releases/latest/download/install.ps1 | iex
```

The installer will:

- Download the latest Browy release (~130 MB)
- Install the native host to `%LOCALAPPDATA%\Browy\app\`
- Register `com.browy.host` with Chrome / Edge / Brave
- Copy the unpacked extension to `%USERPROFILE%\Downloads\Browy-Extension\`
- Open the extension folder in Explorer when it's done

</TabItem>
<TabItem label="macOS / Linux" icon="seti:apple">

Coming soon. Track [the cross-platform issue](https://github.com/BrowyHQ/browy/issues)
on GitHub.

</TabItem>
</Tabs>

## Load the extension

<Steps>
1. Open `chrome://extensions/` (or `edge://extensions/`, `brave://extensions/`)
2. Toggle **Developer mode** on (top-right)
3. Click **Load unpacked**
4. Select `~/Downloads/Browy-Extension/`
5. Pin the Browy icon to your toolbar
</Steps>

## Sign in to Copilot

Click the Browy icon to open the side panel. The first time you use it,
Browy will prompt you to sign in. A terminal window opens with the
GitHub Copilot device-flow link — paste the code into the URL it shows,
authorize Browy in your browser, and the terminal closes itself.

You're done. Try [your first chat](/docs/first-chat/).

## Updating

Re-run the installer:

```powershell
irm https://github.com/BrowyHQ/browy/releases/latest/download/install.ps1 | iex
```

Then reload the extension in `chrome://extensions/` (click the circular
↻ icon on the Browy card).

## Uninstall

1. Remove the extension from `chrome://extensions/`
2. Delete `%LOCALAPPDATA%\Browy\` and `%USERPROFILE%\.browy\`
3. Delete the Native Messaging Host registration:
   `%LOCALAPPDATA%\Google\Chrome\User Data\NativeMessagingHosts\com.browy.host.json`
   (and the equivalent under Edge / Brave folders)

A scripted uninstaller is on [the roadmap](/docs/roadmap/).
