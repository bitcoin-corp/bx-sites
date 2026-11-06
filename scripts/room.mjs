// "room" layout: a full b*X family landing page (hero with art, product mock of the room, how it works, what the
// room holds, sealing, who it's for, the stack, live/coming status, what we don't do, operators, final CTA).
// Used by any site whose config has a `room` object (es.room for the Spanish page). bpropertyx.com and bgalleryx.com
// are the worked examples. Art is original SVG (templates/art/<name>.svg), no stock or generated photos.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// *word* -> <em>word</em> (accent), after escaping
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
// **bold** lead-in for list items
const lead = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

const I = {
  doc: '<path d="M7 3h7l4 4v14H7z M14 3v4h4 M10 12h6 M10 16h6"/>',
  check: '<path d="M4 12.5l5 5L20 6.5"/>',
  pen: '<path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M10.5 18h3 M9.5 13c1-2 2-2 2.5-.5s1.5 1.5 2.5-.5"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7 M4 4v4h4 M12 8v4l3 2"/>',
  id: '<path d="M3 6h18v12H3z M8.5 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z M5.5 16c.6-1.4 1.6-2 3-2s2.4.6 3 2 M14 10h4 M14 13h3"/>',
  seal: '<path d="M12 3l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L12 21l-2.2-1.6-2.7.1-.9-2.6-2.2-1.6.8-2.6-.8-2.6 2.2-1.6.9-2.6 2.7.1z M8.8 12l2.2 2.2 4.2-4.4"/>',
  contract: '<path d="M6 3h12v18H6z M9 7h6 M9 10.5h6 M9 14h3 M13 18c1-1.6 2-1.6 2.6-.4"/>',
  frame: '<path d="M3 4h18v16H3z M6 7h12v10H6z M6 17l4-5 3 3 2-2 3 4"/>',
  lens: '<path d="M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z M15.2 15.2L21 21"/>',
  key: '<path d="M8 15a4 4 0 1 1 0-8 4 4 0 0 1 0 8z M12 11h9 M18 11v3 M15.5 11v2"/>',
  lock: '<path d="M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  arrow: '<path d="M5 12h14 M13 6l6 6-6 6"/>',
};
const icon = (n, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${I[n] || I.doc}</g></svg>`;
const B = '<path fill="currentColor" d="M45 12V72H27V30Z M27 72a33 33 0 1 1 66 0a33 33 0 1 1-66 0Z M45 72a15 15 0 1 0 30 0a15 15 0 1 0-30 0Z"/>';
const bmark = (cls) => `<svg class="${cls}" viewBox="23 8 74 100" aria-hidden="true" focusable="false">${B}</svg>`;

export function art(root, name) {
  return readFileSync(join(root, 'templates', 'art', name + '.svg'), 'utf8').trim();
}

const btn = ([label, url, kind]) => `<a class="btn ${kind === 'gold' ? 'btn-gold' : kind === 'acc' ? 'btn-acc' : 'btn-ghost'}" href="${esc(url)}">${esc(label)}</a>`;
const head = (x, id) => `<div class="hd"><p class="eye">${esc(x.kicker)}</p><h2${id ? ` id="${id}"` : ''}>${rich(x.title)}</h2>${x.lede ? `<p class="sub">${esc(x.lede)}</p>` : ''}</div>`;
const chip = (state, labels) => `<span class="st st-${esc(state)}">${state === 'sealed' ? icon('seal', 'ic-s') : ''}${esc(labels[state] || state)}</span>`;

export function renderRoom(root, s, v) {
  const r = s.room;
  const L = r.labels; // per-language small words
  const nav = r.nav.map(([l, u]) => `<a class="hide-s" href="${esc(u)}">${esc(l)}</a>`).join('');
  const m = r.mock;
  const mock = `<div class="dr" role="img" aria-label="${esc(m.alt)}">
  <div class="dr-top"><span class="dr-room">${icon('lock', 'ic-s')}${esc(m.room)}</span><span class="dr-mem">${m.members.map((x) => `<i>${esc(x)}</i>`).join('')}</span><span class="dr-priv">${esc(m.private)}</span></div>
  <div class="dr-grid">
    <div class="dr-col"><p class="dr-h">${esc(m.docsTitle)}</p><ul class="dr-docs">${m.docs.map(([n, meta, st]) => `<li>${icon(m.docIcon || 'doc', 'ic dr-di')}<span class="dr-dn"><b>${esc(n)}</b><small>${esc(meta)}</small></span>${chip(st, L)}</li>`).join('')}</ul></div>
    <div class="dr-col"><p class="dr-h">${esc(m.timelineTitle)}</p><ol class="dr-tl">${m.timeline.map(([who, what, when, k]) => `<li class="${k ? 'k-' + esc(k) : ''}"><span class="dr-dot"></span><span><b>${esc(who)}</b> ${esc(what)}</span><time>${esc(when)}</time></li>`).join('')}</ol></div>
    <div class="dr-col dr-sealc"><div class="dr-seal"><span class="dr-badge">${icon('seal', 'ic')}${esc(L.sealed)}</span><p class="dr-st">${esc(m.seal.title)}</p><dl>${m.seal.rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd${/^[0-9a-f…]+$/i.test(val.replace(/\s/g, '')) ? ' class="mono"' : ''}>${esc(val)}</dd></div>`).join('')}</dl><span class="dr-check">${icon('lens', 'ic-s')}${esc(m.seal.action)}</span></div><p class="dr-note">${esc(m.seal.note)}</p></div>
  </div>
</div>
<p class="cap">${esc(m.caption)}</p>`;

  const steps = r.how.steps.map(([h, p, st], i) => `<li><span class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${esc(h)}</h3><p>${esc(p)}</p>${st ? `<span class="tag">${esc(st)}</span>` : ''}</li>`).join('');
  const holds = r.holds.items.map(([ic, h, p]) => `<li>${icon(ic)}<h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const sealPts = r.seal.points.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const c = r.seal.cert;
  const cert = `<figure class="cert" aria-label="${esc(c.alt)}">
  <div class="cert-in">
    <div class="cert-top">${bmark('cert-b')}<span>${esc(c.issuer)}</span><span class="cert-no mono">${esc(c.no)}</span></div>
    <p class="cert-k">${esc(c.kicker)}</p>
    <p class="cert-t">${esc(c.title)}</p>
    <dl>${c.rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
    <div class="cert-fp"><span class="mono">${esc(c.fpLabel)}</span><code>${esc(c.fp)}</code></div>
    <div class="cert-ft"><span class="cert-sealmark">${icon('seal', 'ic')}</span><span>${esc(c.foot)}</span></div>
  </div>
  <figcaption class="cap">${esc(c.caption)}</figcaption>
</figure>`;
  const who = r.who.items.map(([h, p]) => `<li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const stack = r.stack.items.map(([nm, role, p, url]) => `<a class="stk" href="${esc(url)}"><span class="stk-n">${bmark('stk-b')}<span>${esc(nm.replace(/X$/, ''))}<i>X</i></span></span><span class="stk-r mono">${esc(role)}</span><span class="stk-p">${esc(p)}</span><span class="stk-go">${esc(new URL(url).host)} ${icon('arrow', 'ic-s')}</span></a>`).join('');
  const st = r.status;
  const status = `<div class="stat"><div><h3 class="mono"><i class="on"></i>${esc(st.liveTitle)}</h3><ul>${st.live.map((x) => `<li>${lead(x)}</li>`).join('')}</ul></div><div class="nx"><h3 class="mono"><i></i>${esc(st.nextTitle)}</h3><ul>${st.next.map((x) => `<li>${lead(x)}</li>`).join('')}</ul></div></div>`;
  const limits = r.limits.items.map((x) => `<li><span class="no" aria-hidden="true"></span><span>${lead(x)}</span></li>`).join('');
  const op = r.operators;
  const opCards = op.cards.map(([t, h, p]) => `<li><span class="mono tagl">${esc(t)}</span><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('');
  const f = r.final;

  const vals = {
    ...v,
    roomNav: nav,
    heroArt: art(root, r.art),
    detailArt: r.detailArt ? art(root, r.detailArt) : '',
    heroEyebrow: esc(r.eyebrow), heroStatement: rich(r.statement), heroLede: esc(r.lede),
    heroCtas: [r.cta, r.cta2].filter(Boolean).map(btn).join(''),
    ghost: esc(r.ghost), artCaption: esc(r.artCaption),
    mockHead: head(r.mockHead, 'room-h'), mock,
    howHead: head(r.how, 'how-h'), steps,
    holdsHead: head(r.holds, 'holds-h'), holds,
    sealHead: head(r.seal, 'seal-h'), sealPts, cert,
    whoHead: head(r.who, 'who-h'), who,
    stackHead: head(r.stack, 'stack-h'), stack,
    statusTitle: esc(st.title), status,
    limitsHead: head(r.limits, 'limits-h'), limits,
    opHead: head(op, 'op-h'), opCards, opCta: btn(op.cta),
    note: esc(r.note),
    finalTitle: rich(f.title), finalLede: esc(f.lede), finalCtas: [f.cta, f.cta2].filter(Boolean).map(btn).join(''),
    footNav: r.footer.map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join(''),
    bmark: bmark('xb'),
  };
  return readFileSync(join(root, 'templates', 'room.html'), 'utf8').replace(/\{\{(\w+)\}\}/g, (mm, k) => (k in vals ? vals[k] : mm));
}
