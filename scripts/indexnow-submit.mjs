// scripts/indexnow-submit.mjs
// Submit URLs from the live sitemap to IndexNow.
// Hits api.indexnow.org once, which fans out to Bing, Yandex, Seznam, Naver,
// and any other future IndexNow participants. Google is NOT a participant.
//
// Usage:
//   node scripts/indexnow-submit.mjs                # submit all sitemap URLs
//   node scripts/indexnow-submit.mjs <url> [<url>]  # submit specific URLs
//
// CI mode: triggered by .github/workflows/indexnow.yml on every push to main
// that touches src/content/.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITE = 'https://browyhq.github.io';
const KEY = '7399afbfb102ee7600c82332c40cdb26';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

async function fetchSitemapURLs() {
  const res = await fetch(`${SITE}/sitemap-0.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls;
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function submit(urls) {
  if (urls.length === 0) {
    console.log('no urls to submit');
    return { ok: 0, soft: 0 };
  }

  let ok = 0;
  let soft = 0;

  // IndexNow caps a single POST at 10,000 URLs. We're well under that, but be defensive.
  for (const batch of chunk(urls, 1000)) {
    const body = {
      host: new URL(SITE).host,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log(`POST ${ENDPOINT}  ${res.status} ${res.statusText}  (${batch.length} URL${batch.length === 1 ? '' : 's'})`);
    if (text.trim()) console.log(`  response: ${text.slice(0, 300)}`);

    // 200 OK   = accepted
    // 202      = received but key still validating (young domain)
    // 403 UserForbiddedToAccessSite = hub has a sticky "unverified" flag after a
    //            previous verification race. Bingbot itself can fetch our key file
    //            fine (verified by fetching with bingbot UA). The hub clears the
    //            flag automatically on the next re-check, usually within hours.
    //            Treating this as a soft-fail so CI stays green; real bad-payload
    //            errors (400/422/429) still fail.
    if (res.status === 200 || res.status === 202) {
      ok += batch.length;
    } else if (res.status === 403 && text.includes('UserForbiddedToAccessSite')) {
      console.warn('  soft-fail: hub is re-verifying our key. Will retry on next push.');
      soft += batch.length;
    } else {
      throw new Error(`IndexNow returned ${res.status}`);
    }
  }

  return { ok, soft };
}

async function main() {
  const args = process.argv.slice(2);
  let urls = args.length > 0 ? args : await fetchSitemapURLs();

  // De-dupe and keep only URLs on our host.
  const host = new URL(SITE).host;
  urls = [...new Set(urls)].filter((u) => {
    try {
      return new URL(u).host === host;
    } catch {
      return false;
    }
  });

  console.log(`submitting ${urls.length} URL${urls.length === 1 ? '' : 's'} to IndexNow`);
  const { ok, soft } = await submit(urls);
  console.log(`done. accepted=${ok} soft-fail=${soft}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
