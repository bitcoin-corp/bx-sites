// Builds dist/<domain>/ for every site in sites.config.json from templates/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = (p) => readFileSync(join(root, 'templates', p), 'utf8');
const { defaults, sites } = JSON.parse(readFileSync(join(root, 'sites.config.json'), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fill = (tpl, v) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in v ? v[k] : m));

export function build() {
  const dist = join(root, 'dist');
  rmSync(dist, { recursive: true, force: true });
  const strip = T('strip.html').trim();
  for (const s of sites) {
    const name = s.base + 'X';
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const holding = s.status === 'holding';
    const how = (s.how || defaults[holding ? 'holdingHow' : 'liveHow']).map(([h, p], i) => `<div class="card"><b class="n">${i + 1}</b><h3>${esc(fill(h, { name }))}</h3><p>${esc(fill(p, { name }))}</p></div>`).join('');
    const why = (s.why || defaults[holding ? 'holdingWhy' : 'liveWhy']).map(([t, h, p]) => `<div class="card"><span class="tag">${esc(t)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('');
    const flick = s.flickOff ? '<a class="hide-s" href="https://bmintx.com/flick-off">FLICK OFF</a>' : '';
    // headline: escape, then *word* -> outlined <em>; <br> is allowed through
    const headline = esc(s.headline).replace(/&lt;br&gt;/g, '<br>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    const v = {
      domain: s.domain, name, base: esc(s.base), slug, accent: s.accent, strip,
      tagline: esc(s.tagline), purpose: esc(s.purpose), eyebrow: esc(s.eyebrow), headline, lede: esc(s.lede),
      statusBadge: holding ? '<span class="status">Coming soon</span>' : '',
      navFlick: flick,
      ctaFlick: s.flickOff && s.flickOff !== 'home' ? '<a class="btn btn-ghost" href="https://bmintx.com/flick-off">About FLICK OFF</a>' : '',
      howTitle: holding ? 'Not open yet. Here is the plan.' : 'Connect. Sign. Own it.',
      how, why,
    };
    const out = join(dist, s.domain);
    mkdirSync(join(out, 'api', 'bwalletx'), { recursive: true });
    writeFileSync(join(out, 'index.html'), fill(T('index.html'), v));
    writeFileSync(join(out, 'bwx.js'), fill(T('bwx.js'), v));
    for (const f of ['_auth.js', 'challenge.js', 'verify.js', 'session.js']) writeFileSync(join(out, 'api', 'bwalletx', f), fill(T('api/' + f), v));
    copyFileSync(join(root, 'templates', 'logo.svg'), join(out, 'logo.svg'));
    copyFileSync(join(root, 'templates', 'favicon.svg'), join(out, 'favicon.svg'));
    writeFileSync(join(out, 'package.json'), JSON.stringify({ name: slug + '-site', private: true, type: 'module', dependencies: { '@bsv/sdk': '2.8.10', '@bwalletx/connect': '0.5.0' } }, null, 2) + '\n');
    // every site's /flick-off goes to its switch on bmintx.com (one home for the campaign), www -> apex
    const flickUrl = s.flickOffPath ? `https://bmintx.com/flick-off/${s.flickOffPath}` : 'https://bmintx.com/flick-off';
    const redirects = [{ source: '/:path*', has: [{ type: 'host', value: 'www.' + s.domain }], destination: `https://${s.domain}/:path*`, permanent: true }];
    if (s.domain !== 'bmintx.com') redirects.push({ source: '/flick-off', destination: flickUrl, permanent: false }, { source: '/flick-off/:path*', destination: 'https://bmintx.com/flick-off/:path*', permanent: false });
    writeFileSync(join(out, 'vercel.json'), JSON.stringify({ cleanUrls: true, redirects }, null, 2) + '\n');
    if (s.managedElsewhere) writeFileSync(join(out, 'DO-NOT-DEPLOY.txt'), `${s.domain} is managed elsewhere. This build is for reference only.\n`);
  }
  return sites;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(`built ${build().length} sites into dist/`);
