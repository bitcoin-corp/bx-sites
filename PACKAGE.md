# The new-domain package

RB buys a b*X domain and tells the COO "new domain bfoox.com: <one line on what it's for>". The COO runs this.
It's the engine behind bWebX. Owner of the package: COO. CEO brief: bitcoin-corp `docs/BX-MARKETING-WEB-STRUCTURE-2026-11-03.md`.

## Before the domain is bought

Send the CFO the domain-register row first (`finance/DOMAIN-REGISTER.md`): domain, owner company, purpose, who approved it, and the yearly renewal. Every domain is a cost we pay every year. If RB has already bought it, send the row the same day.

## One command

```
pnpm new-domain bfoox.com --base bFoo --accent '#rrggbb' --tagline 'Short promise' --purpose 'One sentence on what it does.'
                [--status holding|live] [--eyebrow '...'] [--headline 'Line one.<br>*Word* two.'] [--lede '...']
                [--og-line '...'] [--og | --no-og]
```

It does this:
1. Adds or updates the site in `sites.config.json`. `holding` is the default. The eyebrow, headline and lede are filled from the tagline and purpose if you leave them out. It warns if the accent is already used by another site.
2. Renders the share card `og/og-<slug>-v<N>.png` (1200×630, `templates/og.html` via headless Chrome) and sets `ogImage`.
   - An existing card is only re-rendered with `--og`, which bumps the version so X and LinkedIn caches refresh.
3. Builds and tests every site (`pnpm build && pnpm test`).
4. Prints the rest of the checklist with copy-paste text: the go-live commands, roster, service map, domain register and b0-x gallery entry.

For a richer page, edit the site's entry in `sites.config.json`, then run `pnpm new-domain <domain>` again. Optional fields:
- `ctas` (`[label, url, "primary"|"ghost"]`);
- `navLinks`;
- `howTitle`, `how`;
- `whyKicker`, `whyTitle`, `why`;
- `sections`, each with `{ id, kicker, title, lede, cards, prices, links, note }`;
- `footerLinks`, `legal`;
- `ogLine`, `ogAction`, `ogHeadline`.

bmarketingx.com and bwebx.com are worked examples.

## Gates and owners

| Step | Who | Gate |
|---|---|---|
| Config, build, test, share card | COO | `pnpm test` passes; page looked at at 1440 and 390; card checked with the share-card-designer skill (true eyebrow, one action, no prices, no token-value wording) |
| Copy | COO, with the CEO for anything legal | Says only what's true. "Coming" is fine; no feature claimed until it works. No investment, "earn", "first" or "pioneers" wording |
| **Vercel project + domain + www** | COO | **RB's OK in the COO chat**, every time. Static deploy of `dist/<domain>`, previews off, Basic (standard) build machine, never Turbo. Check 200 / www 308 / og:image on production |
| bwalletx.com/b-family roster | CTO | Name, domain, accent, tagline, status |
| `docs/BX-SERVICE-MAP.md` row | CEO | |
| Domain register (renewal date, price) | CFO | Row printed from `vercel domains inspect` |
| b0-x.com gallery tile | COO | b0x-site `sites.json`, `node gen.mjs`, screenshot to `img/sites/` |

## Why a static deploy, not a git link

bx-sites builds every site from one repo. A git-linked Vercel project would rebuild on every push to any site. Each
site is deployed from its own built folder (`vercel deploy --prod` in `dist/<domain>`), so only the site you mean
to ship changes. Re-run the deploy after config changes. `managedElsewhere` sites are never deployed from here.
