// build-og-images.mjs
// Generates a per-post 1200x630 OG card under public/og/<slug>.png
// for every entry in `posts` below. Idempotent.
//
// To add a new post:
//   1. Append a new entry to the `posts` array
//   2. node scripts/build-og-images.mjs
//   3. Update the post's frontmatter to point at /og/<slug>.png
//
// The card layout: pixel-art mascot on the left third, post title on
// the right, with a small "BROWY BLOG" label and the site URL. Accent
// stripe at the top matches the post's storyboard accent for the
// matching video.

import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MASCOT_DIR = path.resolve(ROOT, '..', 'Browy-Internal', 'content', 'assets', 'mascot');
const OUT_DIR = path.resolve(ROOT, 'public', 'og');

const WIDTH = 1200;
const HEIGHT = 630;

const posts = [
  {
    slug: 'ai-slop-killed-the-bug-bounty',
    title: 'AI slop killed the open-source bug bounty',
    subtitle: 'Turso retired its $1,000-per-bug program.',
    accent: '#fda4af',
    mascot: 'smug.png',
  },
  {
    slug: 'mullvad-vpn-fingerprint',
    title: 'Mullvad gave you 8 trillion exit IPs.\n9 servers found you.',
    subtitle: 'A WireGuard pubkey leaks identity across servers.',
    accent: '#60a5fa',
    mascot: 'shocked.png',
  },
  {
    slug: 'ai-subscription-bomb',
    title: 'Every $20 AI subscription\ncosts $100 to serve.',
    subtitle: 'The bill is coming.',
    accent: '#fbbf24',
    mascot: 'sweat.png',
  },
  {
    slug: 'vscode-extension-breach',
    title: 'GitHub got pwned through\none VSCode extension.',
    subtitle: '3,800 internal repos exfiltrated.',
    accent: '#f87171',
    mascot: 'shocked.png',
  },
  {
    slug: 'google-vs-the-web',
    title: 'Google quietly declared\nwar on the open web.',
    subtitle: 'AI Overviews is the default answer now.',
    accent: '#a78bfa',
    mascot: 'thinking.png',
  },
];

function wrapText(text, maxCharsPerLine = 22) {
  const lines = [];
  for (const paragraph of text.split('\n')) {
    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? current + ' ' + word : word;
      if (candidate.length > maxCharsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines.slice(0, 4);
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildSvg({ title, subtitle, accent }) {
  const titleLines = wrapText(title, 22);
  const lineHeight = 58;
  const titleStartY = 230;

  // Use a generic monospace stack since librsvg falls back to mono anyway,
  // and the pixel-art mascot pairs well with a monospace title.
  const fontStack = '"DejaVu Sans Mono","Courier New",monospace';

  const titleSvg = titleLines
    .map((line, i) => {
      const y = titleStartY + i * lineHeight;
      return `<text x="430" y="${y}" font-family='${fontStack}' font-size="48" font-weight="700" fill="#f0fdf4">${escapeXml(line)}</text>`;
    })
    .join('\n  ');

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050908"/>
      <stop offset="55%" stop-color="#0c1a14"/>
      <stop offset="100%" stop-color="#03060a"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="${accent}"/>
  <text x="430" y="140" font-family='${fontStack}' font-size="22" font-weight="700" letter-spacing="6" fill="${accent}">BROWY BLOG</text>
  ${titleSvg}
  <text x="430" y="${titleStartY + titleLines.length * lineHeight + 32}" font-family='${fontStack}' font-size="24" font-weight="400" fill="#9ca3af">${escapeXml(subtitle)}</text>
  <text x="430" y="${HEIGHT - 60}" font-family='${fontStack}' font-size="22" font-weight="500" fill="#6b7280">browyhq.github.io</text>
</svg>`;
}

async function buildOne(post) {
  const mascotPath = path.join(MASCOT_DIR, post.mascot);
  const mascot = await sharp(mascotPath)
    .resize({ width: 320, kernel: sharp.kernel.nearest })
    .toBuffer();

  const svg = buildSvg(post);

  const out = path.join(OUT_DIR, `${post.slug}.png`);
  await sharp(Buffer.from(svg))
    .composite([
      { input: mascot, top: 155, left: 65 },
    ])
    .png()
    .toFile(out);

  return out;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const post of posts) {
    const out = await buildOne(post);
    const size = (await fs.stat(out)).size;
    console.log(`  ${path.relative(ROOT, out)}  (${(size / 1024).toFixed(1)} KB)`);
  }
  console.log(`built ${posts.length} OG image(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
