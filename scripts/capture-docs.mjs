// Capture full-page screenshots of every docs page (live + local) for
// aesthetic review. Output: scripts/_capture/<page>-<viewport>.png

import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '_capture');
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BROWY_DOCS_BASE || 'https://browyhq.github.io';

const PAGES = [
  ['index',       '/'],
  ['install',     '/install/'],
  ['first-chat',  '/first-chat/'],
  ['permissions', '/permissions/'],
  ['privacy',     '/privacy/'],
  ['tools',       '/tools/'],
  ['security',    '/security/'],
  ['changelog',   '/changelog/'],
  ['roadmap',     '/roadmap/'],
];

const VIEWPORTS = [
  ['desktop', { width: 1280, height: 900 }],
  // ['mobile',  { width: 390,  height: 800 }],
];

const browser = await chromium.launch();
for (const [vname, vp] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const [name, path] of PAGES) {
    const url = BASE + path;
    process.stdout.write(`-> ${vname} ${name} (${url})… `);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      // Scroll through full height so lazy-loaded images load before snapshot
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let y = 0;
          const step = () => {
            y += 400;
            window.scrollTo(0, y);
            if (y < document.body.scrollHeight) setTimeout(step, 80);
            else { window.scrollTo(0, 0); setTimeout(resolve, 200); }
          };
          step();
        });
      });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);
      await page.screenshot({
        path: join(OUT, `${name}-${vname}.png`),
        fullPage: true,
      });
      console.log('ok');
    } catch (e) {
      console.log('FAIL', e.message);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`\nWrote captures to ${OUT}`);
