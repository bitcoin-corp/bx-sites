// Builds dist/<domain>/ for every site in sites.config.json from templates/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, existsSync } from 'node:fs';
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
    const href = (u) => esc(u);
    const btn = ([label, url, kind]) => `<a class="btn ${kind === 'primary' ? 'btn-acc' : 'btn-ghost'}" href="${href(url)}">${esc(label)}</a>`;
    const ctaFlick = s.flickOff && s.flickOff !== 'home' ? '<a class="btn btn-ghost" href="https://bmintx.com/flick-off">About FLICK OFF</a>' : '';
    const heroCtas = s.ctas ? s.ctas.map(btn).join('') : '<span data-bwx></span><a class="btn btn-ghost" href="https://bwalletx.com/get">Get bWalletX</a>' + ctaFlick;
    const navExtra = (s.navLinks || []).map(([label, url]) => `<a class="hide-s" href="${href(url)}">${esc(label)}</a>`).join('');
    // optional extra sections: { id, kicker, title, lede, cards: [[tag, h, p]], prices: [[name, detail, amount]], links: [[label, url, kind]], note }
    // optional register-interest form in a section: { live, endpoint, source, title, consent, privacy, specialisms: [] }
    // Posts JSON to the endpoint (CORS must allow this domain). Renders only when live is true.
    const interestForm = (f) => `<form class="interest" data-endpoint="${esc(f.endpoint)}" data-source="${esc(f.source)}" novalidate>
      <h3>${esc(f.title || 'Register your interest')}</h3>
      <label>Your name<input name="name" autocomplete="name" required></label>
      <label>Email<input name="email" type="email" autocomplete="email" required></label>
      ${f.specialisms ? `<fieldset><legend>What do you do?</legend>${f.specialisms.map((t) => `<label class="chk"><input type="checkbox" name="specialisms" value="${esc(t)}"> ${esc(t)}</label>`).join('')}</fieldset>` : ''}
      <label class="hp" aria-hidden="true">Leave empty<input name="hp" tabindex="-1" autocomplete="off"></label>
      <label class="chk consent"><input type="checkbox" name="consent" required> ${esc(f.consent)} <a href="${esc(f.privacy)}">Privacy</a></label>
      <button class="btn btn-primary" type="submit">${esc(f.button || 'Keep me posted')}</button>
      <p class="form-msg" aria-live="polite"></p>
    </form>`;
    const sections = (s.sections || []).map((x) => `<section${x.id ? ` id="${esc(x.id)}"` : ''}>
  <div class="wrap">
    <p class="kicker">${esc(x.kicker)}</p>
    <h2>${esc(x.title)}</h2>${x.lede ? `<p class="sec-lede">${esc(x.lede)}</p>` : ''}
    ${x.cards ? `<div class="four">${x.cards.map(([t, h, p]) => `<div class="card">${t ? `<span class="tag">${esc(t)}</span>` : ''}<h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>` : ''}
    ${x.prices ? `<div class="prices">${x.prices.map(([n, d, a]) => `<div><b>${esc(n)}</b><span class="amt">${esc(a)}</span><span>${esc(d)}</span></div>`).join('')}</div>` : ''}
    ${x.links ? `<div class="links">${x.links.map(btn).join('')}</div>` : ''}
    ${x.note ? `<p class="note">${esc(x.note)}</p>` : ''}
    ${x.form && x.form.live ? interestForm(x.form) : ''}
  </div>
</section>`).join('\n');
    const og = s.ogImage && existsSync(join(root, 'og', s.ogImage)) ? s.ogImage : null;
    const ogMeta = og
      ? `<meta property="og:image" content="https://${s.domain}/${og}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(name + ': ' + s.tagline)}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="https://${s.domain}/${og}">`
      : '<meta name="twitter:card" content="summary">';
    const v = {
      domain: s.domain, name, base: esc(s.base), slug, accent: s.accent, strip, heroCtas, navExtra, sections, ogMeta,
      howLede: s.howLede ? `<p class="sec-lede">${esc(s.howLede)}</p>` : '',
      whyKicker: esc(s.whyKicker || 'Why ' + name), whyTitle: esc(s.whyTitle || s.purpose),
      footerLinks: (s.footerLinks || []).map(([label, url]) => `<a href="${href(url)}">${esc(label)}</a> · `).join(''),
      legal: esc(s.legal || defaults.legal || ''),
      tagline: esc(s.tagline), purpose: esc(s.purpose), eyebrow: esc(s.eyebrow), headline, lede: esc(s.lede),
      statusBadge: holding ? '<span class="status">Coming soon</span>' : '',
      navFlick: flick,
      howTitle: esc(s.howTitle || (holding ? 'Not open yet. Here is the plan.' : 'Connect. Sign. Own it.')),
      how, why,
    };
    const out = join(dist, s.domain);
    mkdirSync(join(out, 'api', 'bwalletx'), { recursive: true });
    writeFileSync(join(out, 'index.html'), fill(T('index.html'), v));
    writeFileSync(join(out, 'bwx.js'), fill(T('bwx.js'), v));
    for (const f of ['_auth.js', 'challenge.js', 'verify.js', 'session.js']) writeFileSync(join(out, 'api', 'bwalletx', f), fill(T('api/' + f), v));
    copyFileSync(join(root, 'templates', 'logo.svg'), join(out, 'logo.svg'));
    copyFileSync(join(root, 'templates', 'favicon.svg'), join(out, 'favicon.svg'));
    if (og) copyFileSync(join(root, 'og', og), join(out, og));
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
