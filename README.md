# bx-sites

**Licence: [Open BSV License version 4](LICENSE)**, © The Bitcoin Corporation Ltd. (GitHub labels it "Other" because it is not on GitHub's standard licence list.)

Shared static-site template for the b*X product family (bWalletX, BSV).

```
pnpm build   # sites.config.json + templates/ -> dist/<domain>/
pnpm test    # builds everything and checks each site
pnpm new-domain <domain> --base bFoo --accent '#hex' --tagline '...' --purpose '...'   # the new-domain package (PACKAGE.md)
pnpm og <domain> [version]   # re-render one site's share card
```

**New domain?** Follow [PACKAGE.md](PACKAGE.md). Going live needs RB's OK in the COO chat.

Each `dist/<domain>/` is a complete Vercel static site: `index.html`, `bwx.js` (Connect bWalletX),
`api/bwalletx/{_auth,challenge,verify,session}.js`, `package.json` (@bwalletx/connect 0.5.0, @bsv/sdk 2.8.10),
`vercel.json` (cleanUrls + www -> apex 308). Connect needs env `BWALLETX_SESSION_SECRET` (32+ chars) on the Vercel
project; without it the buttons render and the API returns 503 "not switched on yet". Never commit that secret.

Config per site: `domain`, `base` (wordmark without the gold X), `accent`, `status` (`live` | `holding`),
`managedElsewhere`, `flickOff`, `tagline`, `purpose`, `eyebrow`, `headline` (`*word*` = outlined, `<br>` allowed), `lede`,
optional `how` / `why` (otherwise defaults by status).

## Do NOT deploy managed sites from here

Every site with `"managedElsewhere": true` already has its own real site and Vercel project (see INVENTORY.md).
They are built into dist for reference only (each gets a `DO-NOT-DEPLOY.txt`). Do not deploy them from this repo.

Sites that could be deployed from here (owner sign-off needed for project + domain):
bmarketingx.com (no project yet), bwebx.com (today served by the old `bx-holding` project), bphonex.com, bgamesx.com, bmoviesx.com.
