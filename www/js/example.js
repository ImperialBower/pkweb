// Scaffolding for the per-component pages in examples/ — the header, the
// prev/next nav, the live-demo stage and the usage snippet.
//
// Each page declares its demo in a <template id="demo">. This module clones
// that template into the stage, mounts it, and prints the very same markup as
// the page's usage block: the code shown is the code running.
//
// Demo furniture, NOT part of the component library.
import { el, on } from './dom.js';
import { initThemes, initDeckToggle } from './themes.js';
import { STREETS } from './hand.js';
import { mountAll } from './mount.js';

// One entry per component: the prose, plus the config it actually reads.
export const EXAMPLES = [
  {
    n: '01', id: 'hand-replayer', file: '01-hand-replayer.html', pk: 'replayer',
    title: 'Hand replayer', module: 'js/components/replayer.js',
    fn: 'createReplayer(store)', cards: true,
    blurb: 'The felt: seats on an ellipse, the pot badge, the board and the action list for the selected street.',
    lede: 'The replayer is the only component that ships its own controls — its seat-count and street chips write to the store, which is how one replayer drives every other panel on the page. Seats sit on an ellipse with the hero pinned to the bottom; folded seats dim, and the villain’s cards turn face-up at showdown.',
    attrs: [
      ['data-hero', 'Ah Kh', 'The hero’s hole cards.'],
      ['data-villain', 'Kc Jc', 'The villain’s cards, shown face-down until showdown.'],
      ['data-board', 'Ks 7d 2h 9c 4s', 'All five community cards; the street decides how many show.'],
      ['data-players', '2 – 6', 'Seat count. The seat chips write this back.'],
      ['data-street', 'preflop | flop | turn | river, or 0 – 3', 'Which street is showing. The street chips write this back.'],
      ['data-open', '2.5', 'Preflop raise size in big blinds; the pot geometry follows from it.'],
      ['data-barrel', '33 75 66', 'Flop / turn / river bet sizes as a share of the pot.'],
      ['data-stack', '100', 'Starting stack in big blinds.'],
      ['data-game', "NO LIMIT HOLD'EM", 'The label printed on the felt.'],
    ],
    json: [
      ['actions', '{ preflop: [[who, text], …], flop: …, turn: …, river: … }', 'Replaces the derived action list for any street you name.'],
      ['names', '{ BTN: "Hero", BB: "Villain", … }', 'Seat names by position.'],
      ['evals', '[4 strings]', 'The one-line read for each street.'],
    ],
  },
  {
    n: '02', id: 'board-cards', file: '02-board-cards.html', pk: 'board',
    title: 'Board + hole cards', module: 'js/components/board.js',
    fn: 'createBoard(store)', cards: true,
    blurb: 'The hero’s holding at full size, a one-line evaluation, and the runout revealed as far as the street goes.',
    lede: 'Undealt board positions render as dashed slots labelled with the street they are waiting on, so the panel keeps its width from preflop to river. Card pip colour comes from the fixed --pip-* tokens rather than the theme — toggle 4-COLOR in the header and only the diamonds and clubs move.',
    attrs: [
      ['data-hero', 'Ah Kh', 'The hole cards shown at full size.'],
      ['data-board', 'Ks 7d 2h 9c 4s', 'The runout. Write it spaced, comma-separated or run together.'],
      ['data-street', 'preflop | flop | turn | river', 'How much of the board is revealed: 0 / 3 / 4 / 5 cards.'],
    ],
    json: [['evals', '[4 strings]', 'The hand read printed beside the hole cards, one per street.']],
  },
  {
    n: '03', id: 'equity', file: '03-equity.html', pk: 'equity',
    title: 'Equity vs BB range', module: 'js/components/equity.js',
    fn: 'createEquity(store)', cards: false,
    blurb: 'The hero’s equity for the current street as a big number and a bar, over a four-column history.',
    lede: 'The history columns are buttons: clicking one writes that street back to the store, so this panel both reads and drives the shared state. Bars top out at 62% of the track so the street label always has room underneath.',
    attrs: [
      ['data-equity', '66.4 87.2 84.5 91.8', 'Equity per street, in order. This is the panel’s whole data set.'],
      ['data-street', 'preflop | flop | turn | river', 'Which street is featured. Written back on a column click.'],
    ],
    json: [],
  },
  {
    n: '04', id: 'stack-pot', file: '04-stack-pot.html', pk: 'stack',
    title: 'Stack & pot', module: 'js/components/stack.js',
    fn: 'createStack(store)', cards: false,
    blurb: 'The money read: effective stack behind, pot, SPR, hero invested and the bet-to-pot ratio.',
    lede: 'Every figure here is derived, not supplied: give it a stack, an open size and a barrel line and it works out the pot, what the hero has invested and the stack-to-pot ratio for the street. Seat count matters too, because a folded small blind leaves half a blind in the preflop pot.',
    attrs: [
      ['data-stack', '100', 'Starting stack in big blinds — everything else is measured against it.'],
      ['data-open', '2.5', 'Preflop raise size; sets the preflop pot.'],
      ['data-barrel', '33 75 66', 'Bet sizes as a share of the pot, flop through river.'],
      ['data-players', '2 – 6', 'Seat count; a folded SB adds half a blind to the pot.'],
      ['data-street', 'preflop | flop | turn | river', 'Which street the figures are measured at.'],
    ],
    json: [['streets', '[{ pot, inv, … }, …]', 'Per-street overrides when the derived geometry is not what you mean.']],
  },
  {
    n: '05', id: 'action-timeline', file: '05-action-timeline.html', pk: 'timeline',
    title: 'Action timeline', module: 'js/components/timeline.js',
    fn: 'createTimeline(store)', cards: false,
    blurb: 'All four streets side by side — the action on each and the pot it builds, scaled against the final pot.',
    lede: 'A whole-hand view rather than a street view: every column is a button that selects its street. The pot bars share one scale (the river pot), which is what makes a barrel line legible as geometry rather than a list of numbers. Supply your own actions and the columns print them verbatim.',
    attrs: [
      ['data-barrel', '33 75 66', 'Bet sizes as a share of the pot; drives the derived action text and the bars.'],
      ['data-open', '2.5', 'Preflop raise size.'],
      ['data-players', '2 – 6', 'Seat count; adds the folded positions to the preflop column.'],
      ['data-street', 'preflop | flop | turn | river', 'Which column is highlighted. Written back on a click.'],
    ],
    json: [['actions', '{ flop: [["BB","check"], ["BTN","bet 5bb"]], … }', 'The action list for any street, in place of the derived one.']],
  },
  {
    n: '06', id: 'range-grid', file: '06-range-grid.html', pk: 'range-grid',
    title: 'Hand range grid', module: 'js/components/range-grid.js',
    fn: 'createRangeGrid(store)', cards: false,
    blurb: 'The 13x13 grid with full / mixed / folded weights, a hover readout and a switch between two ranges.',
    lede: 'Ranges are written in ordinary poker notation — 22+, A2s+, KTo+, QJs:0.5 — parsed into the 13x13 weights the CSS fills from. A trailing + extends upward, a dash spans a run, and :w sets a weight (0–1, or a percentage). The percentage in the readout is computed from the range you gave, weights included, so it is always true of what is on screen.',
    attrs: [
      ['data-range-btn', '22+, A2s+, KTo+', 'The BTN range, in poker notation.'],
      ['data-range-bb', '22+, A2s+, K9s+, QJs:0.5', 'The BB range.'],
      ['data-hero-hand', 'AKs', 'The cell outlined as the hero’s hand.'],
      ['data-view', 'BTN | BB', 'Which range opens first. The chips in the panel write this back.'],
      ['data-open', '2.5', 'Quoted in the readout: “BTN opens ~44% · 2.5bb”.'],
    ],
    json: [['ranges', '{ BTN: "22+, A2s+", BB: "…" }', 'The same two ranges, if you would rather keep them with the other data.']],
  },
  {
    n: '07', id: 'strategy-mix', file: '07-strategy-mix.html', pk: 'strategy-mix',
    title: 'GTO strategy mix', module: 'js/components/strategy-mix.js',
    fn: 'createStrategyMix(store)', cards: false,
    blurb: 'A solver c-bet split by hand class — bet 33%, bet 75% and check as one stacked bar per class.',
    lede: 'Each row is a stacked bar: the two bet segments are widths in percent and the check segment takes the remainder, so a row always sums to 100. The rows are the panel’s entire data set — paste a solver export in and the panel is that solve. The flop in the subtitle is read from the board.',
    attrs: [['data-board', 'Ks 7d 2h 9c 4s', 'The first three cards name the flop in the subtitle.']],
    json: [['gtoRows', '[{ cls, combos, bet33, bet75 }, …]', 'One row per hand class. Anything left of 100 is the check share.']],
  },
  {
    n: '08', id: 'range-vs-range', file: '08-range-vs-range.html', pk: 'range-vs-range',
    title: 'Range vs range', module: 'js/components/range-vs-range.js',
    fn: 'createRangeVsRange(store)', cards: false,
    blurb: 'Both ranges as mini heatmaps above a shared preflop equity bar.',
    lede: 'The same grid walk as the full range panel, drawn at thumbnail size with no labels and no hover — the shape of a range is the whole message. Each heading’s percentage is computed from its range, so the two thumbnails and the two numbers can never drift apart.',
    attrs: [
      ['data-range-btn', '22+, A2s+, KTo+', 'The left heatmap, in poker notation.'],
      ['data-range-bb', '22+, A2s+, K9s+', 'The right heatmap.'],
      ['data-range-equity', '55.3 44.7', 'BTN and BB equity for the bar beneath them.'],
    ],
    json: [['rangeEquity', '{ btn: 55.3, bb: 44.7 }', 'The same two numbers in object form.']],
  },
  {
    n: '09', id: 'combo-breakdown', file: '09-combo-breakdown.html', pk: 'combos',
    title: 'Combo breakdown', module: 'js/components/combos.js',
    fn: 'createCombos(store)', cards: false,
    blurb: 'The value-to-bluff ratio of a river bet, with the GTO target marked on the bar and the combos listed.',
    lede: 'Give it two lists of combos and it does the rest: the counts, the split, the target for the bet size (s / (1 + 2s) of the betting range), and whether you are over- or under-bluffed and by how many combos. Change the river bet size and the target marker moves with it.',
    attrs: [['data-barrel', '33 75 66', 'The third number is the river bet, which sets the target ratio.']],
    json: [
      ['value', '[{ h: "AK (top pair)", n: 9 }, …]', 'Value combos. The counts are summed, not asserted.'],
      ['bluff', '[{ h: "QJs (missed)", n: 3 }, …]', 'Bluff combos.'],
    ],
  },
];

// ── The usage snippet ─────────────────────────────────────────────────
const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap';

// Strip the indentation a block carried inside its <template>.
function dedent(src) {
  const lines = src.replace(/^\n+|\s+$/g, '').split('\n');
  const pad = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(pad)).join('\n');
}

// innerHTML would flatten every attribute onto one line, so the snippet is
// serialised by hand: one attribute per line, values aligned under the first.
function serialize(node, pad = '') {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent.trim();
    return text ? pad + text : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.localName;
  const align = ' '.repeat(pad.length + tag.length + 2);
  const attrs = [...node.attributes].map(a => {
    // Keep a wrapped value wrapped, re-aligned under where it starts.
    const value = a.value.split(/\n\s*/).join('\n' + align + ' '.repeat(a.name.length + 2));
    return `${a.name}="${value}"`;
  });

  const open = attrs.length > 1
    ? `${pad}<${tag} ${attrs.join('\n' + align)}>`
    : `${pad}<${tag}${attrs.length ? ' ' + attrs[0] : ''}>`;

  const children = [...node.childNodes]
    .map(c => c.nodeType === Node.TEXT_NODE && !c.textContent.trim()
      ? '' : serializeChild(c, pad + '  '))
    .filter(Boolean);

  return children.length
    ? `${open}\n${children.join('\n')}\n${pad}</${tag}>`
    : `${open}</${tag}>`;
}

// A JSON config block keeps its own formatting, re-indented under its parent.
function serializeChild(node, pad) {
  if (node.nodeType === Node.ELEMENT_NODE && node.localName === 'script') {
    const body = dedent(node.textContent).split('\n').map(l => pad + '  ' + l).join('\n');
    return `${pad}<script type="${node.type}">\n${body}\n${pad}</script>`;
  }
  return serialize(node, pad);
}

// The template's children, serialised as the page's usage markup.
function markupOf(template) {
  return [...template.content.children].map(n => serialize(n)).join('\n\n');
}

const indent = (src, n) =>
  src.split('\n').map(l => (l ? ' '.repeat(n) + l : l)).join('\n');

// The page a reader can paste into a file next to www/ and open.
function usageDoc(ex, markup) {
  const sheets = ['tokens', 'base', ex.cards ? 'cards' : null, 'components']
    .filter(Boolean)
    .map(n => `  <link rel="stylesheet" href="css/${n}.css">`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ex.title}</title>

  <!-- The fonts the midnight theme names; the tokens fall back without them. -->
  <link href="${FONTS}" rel="stylesheet">

${sheets}
</head>
<body class="theme-midnight four-color">

${indent(markup, 2)}

  <script type="module">
    import { mountAll } from './js/mount.js';
    mountAll();
  ${'<\/script>'}
</body>
</html>`;
}

// ── Code rendering ────────────────────────────────────────────────────
// Escape first, then colour: tags win over comments so the // in a URL
// inside an attribute is never mistaken for a JS comment.
const TOKENS = /(&lt;[!\/]?[a-zA-Z](?:(?!&lt;)[\s\S])*?&gt;)|(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*")|\b(import|export|from|const|let|new|return|function)\b/g;

function highlight(src) {
  const esc = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(TOKENS, (m, tag, com, str) =>
    `<span class="${tag ? 'c-tag' : com ? 'c-com' : str ? 'c-str' : 'c-kw'}">${m}</span>`);
}

function codeBlock(label, src) {
  const btn = el('button.chip.chip-sm', { type: 'button', text: 'COPY' });
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(src);
      btn.textContent = 'COPIED';
    } catch {
      btn.textContent = 'SELECT + COPY';   // no clipboard on file://
    }
    setTimeout(() => { btn.textContent = 'COPY'; }, 1600);
  });

  return el('section', {},
    el('div.ex-block-head', {}, el('div.panel-title', { text: label }), btn),
    el('pre.ex-code', { html: highlight(src) }),
  );
}

function configTable(head, rows) {
  if (!rows.length) return null;
  return el('section', {},
    el('div.ex-block-head', {}, el('div.panel-title', { text: head })),
    el('table.ex-table', {},
      el('thead', {}, el('tr', {},
        el('th', { text: 'KEY' }), el('th', { text: 'VALUE' }), el('th', { text: 'MEANING' }))),
      el('tbody', {}, rows.map(([k, v, d]) => el('tr', {},
        el('td.k', { text: k }),
        el('td.v', { text: v }),
        el('td.d', { text: d }),
      ))),
    ),
  );
}

// ── Demo-only store drivers ───────────────────────────────────────────
// The chips a component does not ship itself, so a single-component page can
// still be stepped through. Page furniture, not library API.
export function streetChips(store) {
  const chips = STREETS.map((name, i) => el('button.chip.chip-sm', {
    type: 'button', text: name, onclick: () => store.set({ street: i }),
  }));
  store.subscribe(s => chips.forEach((c, i) => on(c, 'is-on', i === (s.street ?? 0))));
  return [el('span.label-mono', { text: 'STREET' }), ...chips];
}

export function seatChips(store) {
  const chips = [2, 3, 4, 5, 6].map(n => el('button.chip.chip-square', {
    type: 'button', text: String(n), onclick: () => store.set({ players: n }),
  }));
  store.subscribe(s => chips.forEach((c, i) => on(c, 'is-on', i + 2 === (s.players ?? 2))));
  return [el('span.label-mono', { text: 'SEATS' }), ...chips];
}

// ── Page chrome ───────────────────────────────────────────────────────
function topbar(subtitle, depth = '') {
  const chips = el('div.theme-chips');
  const deck = el('button.chip.chip-toggle', {
    type: 'button', title: 'Toggle 2/4-color deck',
    html: '4-COLOR<span class="dot"></span>',
  });

  const header = el('header', { id: 'topbar' },
    el('div.brand-group', {},
      el('div.brand', { html: 'PK<span class="brand-accent">COMPONENTS</span>' }),
      el('div.tagline', { text: subtitle }),
    ),
    el('div.topbar-controls', {},
      el('a.chip.chip-sm', { href: depth + 'index.html', text: '← GALLERY' }),
      el('span.topbar-divider'),
      chips,
      deck,
    ),
  );

  document.body.append(header);
  initThemes(chips);
  initDeckToggle(deck);
  return header;
}

function navRow(prev, next, i) {
  const link = (ex, text) => ex
    ? el('a.chip', { href: ex.file, text })
    : el('span.chip.is-off', { text });

  return el('nav.ex-foot', {},
    link(prev, prev ? `← ${prev.n} ${prev.title.toUpperCase()}` : '← START'),
    el('span.ex-count', { text: `${i + 1} / ${EXAMPLES.length}` }),
    link(next, next ? `${next.n} ${next.title.toUpperCase()} →` : 'END →'),
  );
}

// Builds the page around the <template id="demo"> markup: clones it into the
// stage, mounts it, and prints it. Returns the store the demo is running on.
export function initExample(id) {
  const i = EXAMPLES.findIndex(e => e.id === id);
  if (i < 0) throw new Error(`unknown example: ${id}`);
  const ex = EXAMPLES[i];

  document.title = `${ex.n} · ${ex.title} — pkweb examples`;
  topbar('COMPONENT EXAMPLES', '../');

  const template = document.getElementById('demo');
  const markup = markupOf(template);

  const demo = el('div.ex-demo');
  const controls = el('div.ex-controls');

  const main = el('main.ex', {},
    el('nav.ex-crumbs', {},
      el('a.chip.chip-sm', { href: 'index.html', text: '← ALL EXAMPLES' }),
      el('span.ex-count', { text: `${ex.n} / 09` }),
    ),

    el('div', {},
      el('h1.ex-title', { html: `<span class="n">${ex.n}</span> · ${ex.title}` }),
      el('p.ex-lede', { text: ex.lede }),
      el('dl.ex-meta', {},
        el('dt', { text: 'MOUNT' }), el('dd', { text: `data-pk="${ex.pk}"` }),
        el('dt', { text: 'MODULE' }), el('dd', { text: ex.module }),
        el('dt', { text: 'EXPORT' }), el('dd', { text: ex.fn }),
        el('dt', { text: 'STYLES' }), el('dd', {
          text: ['tokens.css', 'base.css', ex.cards ? 'cards.css' : null, 'components.css'].filter(Boolean).join(' + ') }),
      ),
    ),

    el('section', {},
      el('div.ex-stage-head', {},
        el('div.panel-title', { text: 'LIVE DEMO' }),
        controls,
      ),
      demo,
      el('p.ex-hint', { text: 'This demo is the markup below, mounted. Theme and deck chips live in the header; any controls beside LIVE DEMO are this page’s, not the component’s.' }),
    ),

    codeBlock('USAGE · COMPLETE HTML PAGE', usageDoc(ex, markup)),
    configTable('HTML ATTRIBUTES', ex.attrs),
    configTable('JSON CONFIG · <script type="application/json"> inside the element', ex.json),

    navRow(EXAMPLES[i - 1], EXAMPLES[i + 1], i),
  );

  document.body.append(main);

  // Mount the page's own markup — the demo and the snippet are one source.
  demo.append(template.content.cloneNode(true));
  const stores = mountAll(demo);

  return { demo, controls, stores, store: stores.get('default'), ex };
}

// examples/index.html — the card grid over the same catalog.
export function initExampleIndex() {
  topbar('COMPONENT EXAMPLES', '../');

  document.body.append(el('main.ex', {},
    el('div', {},
      el('h1.ex-title', { text: 'Component examples' }),
      el('p.ex-lede', { text: 'One page per component: a live demo, the complete HTML that produces it, and every data-* attribute and JSON key that component reads. Each demo is its own snippet, mounted — edit the markup and the panel changes. Panels that share a data-store name share a store, which is how one replayer drives a whole page.' }),
    ),
    el('div.ex-index', {},
      EXAMPLES.map(ex => el('a.ex-card', { href: ex.file },
        el('span.ex-card-n', { text: ex.n }),
        el('span.ex-card-title', { text: ex.title }),
        el('span.ex-card-blurb', { text: ex.blurb }),
        el('span.ex-card-mod', { text: `data-pk="${ex.pk}"` }),
      )),
      el('a.ex-card', { href: 'custom-hand.html' },
        el('span.ex-card-n', { text: 'ALL NINE' }),
        el('span.ex-card-title', { text: 'A different hand' }),
        el('span.ex-card-blurb', { text: 'Every panel on one page describing a different hand — QQ three-handed, 200bb deep, an overbet river — with no JavaScript describing any of it.' }),
        el('span.ex-card-mod', { text: 'data-store="qq"' }),
      ),
    ),
  ));
}
