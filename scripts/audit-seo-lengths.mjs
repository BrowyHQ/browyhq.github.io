import fs from 'node:fs';
import path from 'node:path';

const root = 'src/content/docs';

function walk(d) {
  const out = [];
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) out.push(...walk(p));
    else if (n.endsWith('.mdx') || n.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = walk(root);
const rows = [];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const fmMatch = c.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) continue;
  const fm = fmMatch[1];

  let title = '';
  let desc = '';

  const tLine = fm.match(/^title:\s*(.+?)\s*$/m);
  if (tLine) title = tLine[1].replace(/^["']|["']$/g, '');

  const dLine = fm.match(/^description:\s*(.+?)\s*$/m);
  if (dLine) desc = dLine[1].replace(/^["']|["']$/g, '');

  rows.push({
    file: f.replace(/^src[/\\]content[/\\]docs[/\\]/, '').replace(/\\/g, '/'),
    titleLen: title.length,
    descLen: desc.length,
    title: title.slice(0, 70),
  });
}

rows.sort((a, b) => a.titleLen - b.titleLen);

console.log('file'.padEnd(55), 'tLen   dLen   title');
console.log('-'.repeat(140));
for (const r of rows) {
  const tFlag = r.titleLen < 30 ? '!!' : r.titleLen < 50 ? ' !' : '  ';
  const dFlag = r.descLen < 70 ? '!!' : r.descLen < 120 ? ' !' : '  ';
  console.log(r.file.padEnd(55), String(r.titleLen).padStart(3) + tFlag, ' ', String(r.descLen).padStart(3) + dFlag, ' ', r.title);
}

console.log('\nLegend: !! needs fixing (title<30 or desc<70), ! could be longer (title<50 or desc<120)');
console.log('Targets: title 50-60 chars, description 120-160 chars');
