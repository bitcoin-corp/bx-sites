import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const sites = build();
let fail = 0;
const ok = (c, msg) => { if (!c) { fail++; console.error('FAIL ' + msg); } };
for (const s of sites) {
  const d = join(dist, s.domain);
  const files = ['index.html', 'bwx.js', 'package.json', 'vercel.json', 'logo.svg', 'favicon.svg', ...['_auth.js', 'challenge.js', 'verify.js', 'session.js'].map((f) => 'api/bwalletx/' + f)];
  for (const f of files) ok(existsSync(join(d, f)), `${s.domain}: missing ${f}`);
  const html = readFileSync(join(d, 'index.html'), 'utf8');
  ok(html.includes('<!-- Part of bWalletX strip') && html.includes('<!-- /Part of bWalletX strip -->'), `${s.domain}: strip`);
  ok(html.includes('data-bwx'), `${s.domain}: data-bwx`);
  ok(!/undefined|\{\{/.test(html), `${s.domain}: undefined or {{ left in HTML`);
  // room-layout sites (B2B landing) carry the family footer without the FLICK OFF campaign link
  ok((s.room || html.includes('https://bmintx.com/flick-off')) && html.includes('https://bwalletx.com/get'), `${s.domain}: footer links`);
  if (s.es) {
    const es = readFileSync(join(d, 'es.html'), 'utf8');
    ok(!/undefined|\{\{/.test(es), `${s.domain}: undefined or {{ left in es.html`);
    ok(es.includes('data-bwx') && es.includes('lang="es"'), `${s.domain}: es page`);
  }
  if (s.disclaimer) ok(html.includes(s.disclaimer), `${s.domain}: disclaimer line`);
  // example-room carousel: every photo is self-hosted (no hotlinking) and the page carries the credits list
  for (const [room, file] of [[s.room, 'index.html'], [s.es?.room, 'es.html']]) {
    if (!room?.examples) continue;
    const page = readFileSync(join(d, file), 'utf8');
    for (const c of room.examples.cards) ok(existsSync(join(d, 'photos', c.img)) && page.includes(`/photos/${c.img}`), `${s.domain}/${file}: photo ${c.img}`);
    ok(page.includes('id="photo-credits"') && page.includes('href="#photo-credits"'), `${s.domain}/${file}: photo credits`);
    ok(!/images\.unsplash\.com/.test(page), `${s.domain}/${file}: hotlinked photo`);
  }
  const auth = readFileSync(join(d, 'api/bwalletx/_auth.js'), 'utf8');
  ok(auth.includes(`|| 'https://${s.domain}'`), `${s.domain}: ORIGIN`);
  ok(!((s.domain !== 'bvideox.com' && /bvideox/.test(auth)) || /\{\{/.test(auth + readFileSync(join(d, 'bwx.js'), 'utf8'))), `${s.domain}: leftover bvideox/{{ in js`);
  ok(auth.includes("www.' + a"), `${s.domain}: originOk www`);
  let vj; try { vj = JSON.parse(readFileSync(join(d, 'vercel.json'), 'utf8')); } catch { vj = null; }
  ok(vj && vj.cleanUrls === true && vj.redirects?.[0]?.has?.[0]?.value === 'www.' + s.domain && vj.redirects[0].permanent === true, `${s.domain}: vercel.json`);
  if (s.status === 'holding') ok(/coming soon/i.test(html), `${s.domain}: holding copy`);
}
console.log(fail ? `${fail} failures` : `all ${sites.length} sites passed`);
process.exit(fail ? 1 : 0);
