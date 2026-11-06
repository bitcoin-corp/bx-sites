// Renders og/<slug>-v<N>.png (1200x630 share card) for one site from templates/og.html with headless Chrome.
// Usage: node scripts/og.mjs <domain> [version] [es]. Prints the file name; set it as the site's `ogImage` (or es.ogImage).
// Sites with a `room` layout use templates/og-room.html: the hero art framed on the right with a Sealed chip.
// Card copy: eyebrow (must be true today), headline (`*word*` = accent), ogLine (one short line; falls back to tagline),
// ogAction (one verb pill, true today; default "Get bWalletX"). No prices on cards (share-card rules).
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function renderOg(domain, version = 1, lang = 'en') {
  const { sites } = JSON.parse(readFileSync(join(root, 'sites.config.json'), 'utf8'));
  const site = sites.find((x) => x.domain === domain);
  if (!site) throw new Error(`${domain} is not in sites.config.json`);
  if (lang !== 'en' && !site[lang]) throw new Error(`${domain} has no ${lang} page`);
  const s = lang === 'en' ? site : { ...site, ...site[lang] };
  const slug = (s.base + 'X').toLowerCase().replace(/[^a-z0-9]/g, '');
  const file = `og-${slug}${lang === 'en' ? '' : '-' + lang}-v${version}.png`;
  const headline = esc(s.ogHeadline || s.headline).replace(/&lt;br&gt;/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const html = readFileSync(join(root, 'templates', s.room ? 'og-room.html' : 'og.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (m, k) => ({
    accent: s.accent, base: esc(s.base), mbase: esc(s.base.replace(/^b(?=[A-Z])/, '')), domain: s.domain, eyebrow: esc(s.eyebrow).toUpperCase().replace(/\bB(?=[A-Z]+X\b)/g, 'b'),
    headline, line: esc(s.ogLine || s.tagline), action: esc(s.ogAction || 'Get bWalletX'),
    seal: esc(((s.room && s.room.labels && s.room.labels.sealed) || 'Sealed').toUpperCase()), urlPath: lang === 'en' ? '' : '/' + lang,
  })[k] ?? m);
  const tmp = mkdtempSync(join(tmpdir(), 'bx-og-'));
  try {
    writeFileSync(join(tmp, 'og.html'), html);
    if (s.room) copyFileSync(join(root, 'templates', 'art', s.room.art + '.svg'), join(tmp, 'art.svg'));
    const png = join(root, 'og', file);
    execFileSync(CHROME, ['--headless=new', `--user-data-dir=${join(tmp, 'p')}`, '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1200,630', '--virtual-time-budget=8000', `--screenshot=${png}`, 'file://' + join(tmp, 'og.html')], { stdio: 'ignore', timeout: 60000 });
    if (!existsSync(png)) throw new Error('Chrome did not write ' + png);
    return file;
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [domain, v, lang] = process.argv.slice(2);
  if (!domain) { console.error('usage: node scripts/og.mjs <domain> [version]'); process.exit(2); }
  console.log(renderOg(domain, +(v || 1), lang || 'en'));
}
