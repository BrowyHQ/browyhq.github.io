// Renders mock side-panel "screenshots" using the actual sidepanel.html
// stylesheet, by opening it in headless Chromium and injecting a fake
// conversation into #msgs. Output: src/assets/screenshots/*.png
//
// Run with: node scripts/render-screenshots.mjs
//
// Requires: playwright (devDep) + chromium installed (`npx playwright install chromium`)

import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SIDEPANEL = resolve(__dirname, '..', '..', 'Browy', 'extension', 'sidepanel.html');
const OUT_DIR = resolve(__dirname, '..', 'src', 'assets', 'screenshots');

if (!existsSync(SIDEPANEL)) {
  console.error('sidepanel.html not found at', SIDEPANEL);
  process.exit(1);
}
mkdirSync(OUT_DIR, { recursive: true });

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

const userBub = (text) => `<div class="bub u">${escapeHTML(text)}</div>`;

const asstBub = (bodyHTML, toolSteps = '') => `
<div class="bub a">
  ${toolSteps ? `<div class="tool-steps">${toolSteps}</div>` : ''}
  <div class="body">${bodyHTML}</div>
</div>`;

const toolStep = ({ name, args = '', preview, status = 'done', ms }) => `
<div class="tool-step ${status}">
  <div class="glyph"></div>
  <div class="head"><span class="name">${escapeHTML(name)}</span>${args ? `<span class="paren">(</span><span class="args">${escapeHTML(args)}</span><span class="paren">)</span>` : ''}</div>
  ${ms ? `<div class="ms">${ms}ms</div>` : ''}
  ${preview ? `<div class="out"><span class="arc"></span><span class="preview">${escapeHTML(preview)}</span></div>` : ''}
</div>`;

const SCENARIOS = [
  {
    file: 'panel-empty.png',
    desc: 'Fresh side panel, no chat yet',
    infobar: { browser: 'Chrome', tabs: '7 tabs', title: 'New Tab', host: 'live' },
    msgsHTML: '',
    keepEmpty: true,
  },
  {
    file: 'panel-summarize.png',
    desc: 'Summarize Wikipedia article',
    infobar: { browser: 'Chrome', tabs: '7 tabs', title: 'Photosynthesis — Wikipedia', host: 'live' },
    msgsHTML:
      userBub('Summarize this page in 5 bullets.') +
      asstBub(
        `<p>Here's the page in 5 bullets:</p>
<ul>
  <li>Photosynthesis converts light energy into chemical energy stored as glucose, mostly in plants, algae, and some bacteria.</li>
  <li>It happens in chloroplasts, using <strong>chlorophyll</strong> to capture photons in the visible spectrum.</li>
  <li>The light-dependent reactions split water and produce ATP and NADPH, releasing O₂ as a byproduct.</li>
  <li>The Calvin cycle uses that ATP/NADPH to fix CO₂ into sugar via the enzyme <em>RuBisCO</em>.</li>
  <li>Net equation: <code>6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</code>.</li>
</ul>`,
        toolStep({ name: 'snapshot', preview: '4,127 elements, 38 headings', status: 'done', ms: 142 })
      ),
  },
  {
    file: 'panel-fillform.png',
    desc: 'Fill out a form',
    infobar: { browser: 'Chrome', tabs: '4 tabs', title: 'Sign up — Linear', host: 'live' },
    msgsHTML:
      userBub("My name is Alex Doe, my email is alex@example.com. Fill out this form with that info — leave the password field for me. Don't submit.") +
      asstBub(
        `<p>Done — filled name and email, left password blank. The Sign up button is at index <code>[12]</code> when you're ready.</p>`,
        toolStep({ name: 'snapshot', preview: '63 elements, 3 inputs found', status: 'done', ms: 98 }) +
        toolStep({ name: 'type', args: '[3], "Alex Doe"', preview: 'Filled name field', status: 'done', ms: 41 }) +
        toolStep({ name: 'type', args: '[7], "alex@example.com"', preview: 'Filled email field', status: 'done', ms: 38 })
      ),
  },
  {
    file: 'panel-network.png',
    desc: 'Inspect network log',
    infobar: { browser: 'Edge', tabs: '12 tabs', title: 'Dashboard — Linear', host: 'live' },
    msgsHTML:
      userBub("What's the slowest API call on this page when I refresh? Show me URL, status, and time.") +
      asstBub(
        `<p>The slowest call is:</p>
<pre><code>GET https://api.linear.app/graphql
status 200 — 1,847 ms</code></pre>
<p>It's a GraphQL query for the dashboard widgets. The next slowest are <code>/me</code> (412ms) and <code>/notifications</code> (288ms).</p>`,
        toolStep({ name: 'navigate', args: 'reload', preview: 'Page reloaded', status: 'done', ms: 1923 }) +
        toolStep({ name: 'network_log', preview: '47 requests, 3 over 200ms', status: 'done', ms: 12 })
      ),
  },
  {
    file: 'panel-evaluate.png',
    desc: 'evaluate_js to find missing aria-labels',
    infobar: { browser: 'Brave', tabs: '9 tabs', title: 'GitHub · Where the world builds…', host: 'live' },
    msgsHTML:
      userBub('Find every `<button>` on this page that has no aria-label and tell me what it says.') +
      asstBub(
        `<p>Found <strong>4 buttons</strong> without an <code>aria-label</code>:</p>
<ol>
  <li><code>"+"</code> — top nav, "create new" menu</li>
  <li><code>"⋯"</code> — repo header overflow menu</li>
  <li><code>"Code ▾"</code> — clone-options dropdown</li>
  <li><code>""</code> — empty button at the bottom of the sidebar (icon-only "settings", probably needs a label)</li>
</ol>
<p>Want me to <a href="#">file an issue</a> for the empty one?</p>`,
        toolStep({ name: 'evaluate_js', args: '[...document.querySelectorAll("button")]…', preview: 'Returned 4 entries', status: 'done', ms: 67 })
      ),
  },
  {
    file: 'panel-signin.png',
    desc: 'Sign-in CTA on auth error',
    infobar: { browser: 'Chrome', tabs: '7 tabs', title: 'New Tab', host: 'err' },
    msgsHTML:
      userBub('what can you see on this page?') +
      `<div class="bub a err">⚠ GitHub Copilot needs sign-in to chat.
        <div style="margin-top:10px;">
          <button style="background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.5);padding:6px 12px;font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;">Sign in to GitHub Copilot</button>
        </div>
       </div>`,
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 400, height: 720 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// Read sidepanel.html and strip ALL scripts so nothing tries to ws://localhost
import { readFileSync } from 'node:fs';
let html = readFileSync(SIDEPANEL, 'utf8');
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

for (const s of SCENARIOS) {
  console.log(`-> ${s.file} (${s.desc})`);
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(120);

  await page.evaluate(({ msgsHTML, infobar, keepEmpty }) => {
    document.body.classList.add('focused');
    document.body.classList.remove('minimized');

    const dot = document.querySelector('.tb-dot');
    if (dot) {
      dot.classList.remove('busy', 'err');
      dot.classList.add(infobar.host === 'err' ? 'err' : 'live');
    }

    const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    set('brand', infobar.browser);
    set('tabs', infobar.tabs);
    set('ttl', infobar.title);
    set('host', '');
    const bcCount = document.getElementById('browsersCount');
    const bcTotal = document.getElementById('browsersTotal');
    if (bcCount) bcCount.textContent = '1';
    if (bcTotal) bcTotal.textContent = '1';

    const cb = document.getElementById('connBanner');
    if (cb) cb.style.display = 'none';

    const msgs = document.getElementById('msgs');
    if (msgs && !keepEmpty) msgs.innerHTML = msgsHTML;

    const inp = document.getElementById('inp');
    if (inp) { inp.blur(); inp.placeholder = 'ask browy…'; }
  }, s);

  await page.waitForTimeout(120);

  await page.screenshot({
    path: join(OUT_DIR, s.file),
    fullPage: false,
    omitBackground: false,
  });
}

await browser.close();
console.log(`\nWrote ${SCENARIOS.length} screenshots to ${OUT_DIR}`);
