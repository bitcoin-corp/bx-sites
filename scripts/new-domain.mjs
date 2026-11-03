// The new-domain package (PACKAGE.md). Run when RB buys a b*X domain:
//   pnpm new-domain <domain> --base bFoo --accent '#hex' --tagline '...' --purpose '...'
//        [--status holding|live] [--eyebrow '...'] [--headline '...'] [--lede '...'] [--og-line '...'] [--og | --no-og]
// 1) adds/updates the site in sites.config.json  2) builds + tests every site  3) renders its share card
// 4) prints the remaining steps (Vercel needs RB's OK in the COO chat; roster, service map, domain register, b0-x).
// Richer pages (ctas, navLinks, sections, how/why) are edited in sites.config.json, then re-run with just the domain.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOg } from './og.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEAM = 'team_f6WL5ayoFvm0ETORle6gP39J';
const args = process.argv.slice(2);
const domain = args[0];
if (!domain || domain.startsWith('--') || !/^[a-z0-9-]+\.[a-z.]+$/.test(domain)) {
  console.error("usage: pnpm new-domain <domain> --base bFoo --accent '#hex' --tagline '...' --purpose '...' [--status holding|live] [--eyebrow ..] [--headline ..] [--lede ..] [--og-line ..] [--no-og]");
  process.exit(2);
}
const opt = {};
for (let i = 1; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  if (k === 'noOg' || k === 'og') { opt[k] = true; continue; }
  opt[k] = args[++i];
}

const cfgPath = join(root, 'sites.config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
let s = cfg.sites.find((x) => x.domain === domain);
const isNew = !s;
if (isNew) {
  for (const k of ['base', 'accent', 'tagline', 'purpose']) if (!opt[k]) { console.error(`new site: --${k} is required`); process.exit(2); }
  s = { domain, base: '', accent: '', status: 'holding', managedElsewhere: false, flickOff: null, tagline: '', purpose: '', eyebrow: '', headline: '', lede: '' };
  cfg.sites.push(s);
}
for (const k of ['base', 'accent', 'status', 'tagline', 'purpose', 'eyebrow', 'headline', 'lede']) if (opt[k] !== undefined) s[k] = opt[k];
if (opt.ogLine !== undefined) s.ogLine = opt.ogLine;
if (!/^#[0-9a-fA-F]{6}$/.test(s.accent)) { console.error('--accent must be #rrggbb'); process.exit(2); }
if (!['holding', 'live'].includes(s.status)) { console.error('--status must be holding or live'); process.exit(2); }
const name = s.base + 'X';
s.eyebrow ||= `${s.tagline} · ${s.status === 'holding' ? 'coming soon' : 'live'}`;
s.headline ||= s.tagline;
s.lede ||= s.status === 'holding' ? `${name} is coming. ${s.purpose} It is not open yet.` : s.purpose;
const clash = cfg.sites.find((x) => x !== s && x.accent.toLowerCase() === s.accent.toLowerCase());
if (clash) console.warn(`warning: accent ${s.accent} is also used by ${clash.domain}; check bwalletx.com/b-family`);
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`${isNew ? 'added' : 'updated'} ${domain} in sites.config.json`);

if (!opt.noOg && (!s.ogImage || opt.og)) {   // re-render an existing card only with --og (bumps the version)
  const v = s.ogImage ? +(/-v(\d+)\.png$/.exec(s.ogImage)?.[1] || 0) + 1 : 1;
  s.ogImage = renderOg(domain, v);
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  console.log(`share card: og/${s.ogImage} (check it with the share-card-designer skill before going live)`);
}

execFileSync('node', [join(root, 'scripts', 'test.mjs')], { stdio: 'inherit' });

let reg = '(run: vercel domains inspect ' + domain + ' --scope b0ase)';
try {
  const r = spawnSync('vercel', ['domains', 'inspect', domain, '--scope', 'b0ase'], { encoding: 'utf8' });
  const out = (r.stdout || '') + (r.stderr || '');
  const g = (re) => (re.exec(out)?.[1] || '?').trim();
  reg = `| ${domain} | ${g(/Registrar\s+(.+)/)} | created ${g(/Created At\s+(.+?)\s*\[/)} | renews ${g(/Expiration Date\s+(.+?)\s*\[/)} | ${g(/Renewal Price\s+(.+)/)} |`;
} catch {}
const proj = (s.base + 'x').toLowerCase().replace(/[^a-z0-9]/g, '');
const dir = `dist/${domain}`;
console.log(`
==== Next steps for ${name} (${domain}) ====

1. LOOK: open ${dir}/index.html (serve dist/${domain} locally) at 1440 and 390 wide; check og/${s.ogImage || '(none)'}.

2. GO LIVE: needs RB's OK in the COO chat. Static deploy of the built folder (bx-sites is one repo for many sites,
   so a per-site git link would rebuild every site on every push; a CLI deploy of dist/<domain> is the simplest fit):
     cd ${dir}
     vercel link --yes --project ${proj} --scope b0ase          # creates the project on first run
     vercel api "/v9/projects/${proj}?teamId=${TEAM}" --method PATCH --input <(echo '{"previewDeploymentsDisabled":true,"gitProviderOptions":{"createDeployments":"disabled"},"resourceConfig":{"buildMachineType":"standard"}}')
     vercel deploy --prod --yes --scope b0ase
     vercel domains add ${domain} ${proj} --scope b0ase
     vercel domains add www.${domain} ${proj} --scope b0ase        # vercel.json already 308s www -> apex
   Then: curl -sI https://${domain}/ (200), https://www.${domain}/ (308), and the og:image URL on production.
   Connect bWalletX needs env BWALLETX_SESSION_SECRET (32+ chars) set on the project by RB/CTO; without it the API answers 503.

3. CTO (bwalletx.com/b-family roster): add ${name} · ${domain} · ${s.accent} · "${s.tagline}" · status ${s.status}.

4. CEO (docs/BX-SERVICE-MAP.md row):
   | ${name} | ${domain} | ${s.purpose} | ${s.status} | site: bx-sites |

5. CFO (domain register row):
   ${reg}

6. b0-x.com gallery (b0x-site sites.json, then node gen.mjs + a screenshot to img/sites/${domain.replace(/\.com$/, '')}.webp):
   { "domain": "${domain}", "name": "${name}", "color": "${s.accent}", "line": "${s.tagline}", "stage": "${s.status === 'live' ? 'live' : 'soon'}" }
`);
