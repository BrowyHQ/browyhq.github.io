// scripts/indexnow-submit.mjs
// Submit URLs from the live sitemap to IndexNow.
// Per the IndexNow protocol, submitting to ANY one participant fans the
// submission out to every other participant (Bing, Yandex, Seznam, Naver,
// DuckDuckGo, etc). Google is NOT a participant.
//
// We submit to Seznam's endpoint as the primary because Bing's hub
// (api.indexnow.org and www.bing.com/indexnow) currently returns
// `UserForbiddedToAccessSite` (403) for our young domain on POST
// requests. Seznam accepts the same payload with 200 OK, and per protocol
// Bing will receive the URLs anyway via cross-participant share.
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

// Ordered list of IndexNow endpoints. We POST to the first that accepts the
// submission. Per protocol, a single accepted submission is shared with all
// participants. The Bing hub (api.indexnow.org) is last because it currently
// 403s our host.
const ENDPOINTS = [
  'https://search.seznam.cz/indexnow',
  'https://api.indexnow.org/IndexNow',
];

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

async function submitBatch(endpoint, batch) {
  const body = {
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: batch,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return { status: res.status, statusText: res.statusText, text };
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
    let accepted = false;
    let lastErr = null;

    for (const endpoint of ENDPOINTS) {
      try {
        const r = await submitBatch(endpoint, batch);
        console.log(`POST ${endpoint}  ${r.status} ${r.statusText}  (${batch.length} URL${batch.length === 1 ? '' : 's'})`);
        if (r.text.trim()) console.log(`  response: ${r.text.slice(0, 300)}`);

        // 200 OK = accepted. 202 = received, key validation pending. Both are wins.
        if (r.status === 200 || r.status === 202) {
          ok += batch.length;
          accepted = true;
          break;
        }
        // 403 UserForbiddedToAccessSite from Bing-hosted hubs: hub thinks our key
        // file is unverifiable. Try the next endpoint.
        if (r.status === 403 && r.text.includes('UserForbiddedToAccessSite')) {
          console.warn('  endpoint declined our host. trying next endpoint.');
          lastErr = `403 from ${endpoint}`;
          continue;
        }
        // Anything else (400/422/429) is a real error.
        throw new Error(`IndexNow returned ${r.status}: ${r.text.slice(0, 200)}`);
      } catch (e) {
        // Network-level failures (DNS, timeout). Try the next endpoint.
        if (e.message?.startsWith('IndexNow returned')) throw e;
        console.warn(`  ${endpoint} unreachable: ${e.message}. trying next.`);
        lastErr = e.message;
      }
    }

    if (!accepted) {
      console.warn(`  all endpoints declined batch (last error: ${lastErr}). counting as soft-fail.`);
      soft += batch.length;
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
