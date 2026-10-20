# b*X domain inventory (20 Oct 2026)

Source: `vercel domains inspect <d> --scope b0ase` + `curl -sL https://<d>/`. Connect = page HTML contains `bwalletx-connect` or `data-bwx`.

| Domain | Vercel project | HTTP | Has site? (title) | Connect bWalletX? |
|---|---|---|---|---|
| bwalletx.com | bwalletx | 200 | Yes: "bWalletX: the smart social super wallet" | No (it is the wallet) |
| bchatx.com | bit-sign | 200 | Yes: "Welcome · bChatX" | No |
| bfriendsx.com | bfriendsx | 200 | Yes: "bFriendsX · Bring your people with you" | Yes |
| bjobsx.com | bjobsx | 200 | Yes: "bJobsX · Work, paid in Bitcoin" | No |
| bvideox.com | bvideox | 200 | Yes: "bVideoX · Your channel, owned by you" | Yes |
| bmoviesx.com | none | 404 | No (Vercel NS, no project) | n/a |
| bmusicx.com | bitcoin-music | 200 | Yes: "bMusicX — Bitcoin Music Exchange" (older bitcoin-music app) | No |
| bdrivex.com | bdrivex | 200 | Yes: "bDriveX · Your files and recordings, kept on chain" | No |
| bwriterx.com | bwriterx | 200 | Yes: "bWriterX · Write it down. Keep it forever." | No |
| bmintx.com | bmintx | 200 | Yes: "bMintX · You made it. Prove it's yours." | No |
| bwebx.com | none | no response | No (registered 19 Oct, no project) | n/a |
| bmailx.com | bmailx | 200 | Yes: "bMailX · Email that pays" | No |
| bcalx.com | bcalx | 200 | Yes: "bCalX · What's on, live" | No |
| bphonex.com | none | no response | No (registered 18 Oct, no project) | n/a |
| bradiox.com | bradiox | 200 | Yes: "bRadioX · Radio you can join" | No |
| bnewsx.com | bnewsx | 200 | Yes: "bNewsX · News you can trust, paid fairly" | No |
| bgamesx.com | none | 404 | No (Vercel NS, no project) | n/a |
| bstorex.com | bstorex | 200 | Yes: "bStoreX · Sell digital things, paid in Bitcoin" (note: off-brief, owner says bStoreX = storage layer) | No |
| bsharesx.com | bsharesx | 200 | Yes: "bSharesX · Share registers, kept the modern way" | No |
| bvaultx.com | bvaultx | 200 | Yes: "bVaultX · The vault that pays for itself" | No |
| bsvex.com | bsvex | 200 | Yes: "BSV Exchange - Burn L1 Tokens for BSV" (off-brief vs "buy/swap into BSV") | No |
| b0-x.com | b0-x | 200 | Yes: "$402 b0x — Run Bitcoin's Application Layer" | No |

bwalletx.com nameservers are still livedns.co.uk (not Vercel) but it resolves and serves.
