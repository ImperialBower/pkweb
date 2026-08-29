// Scaffolding for the per-component pages in examples/ — the header, the
// prev/next nav, the live-demo stage and the copy-paste usage snippet.
//
// This module is demo furniture, NOT part of the component library. Nothing
// in examples/ needs it to use a component; each page's usage block shows the
// four lines that actually matter.
import { el, on } from './dom.js';
import { initThemes, initDeckToggle } from './themes.js';
import { STREETS } from './hand.js';

// One entry per component. `usage` is the module body of the snippet each
// page prints; everything else is the prose around it.
export const EXAMPLES = [
  {
    n: '01', id: 'hand-replayer', file: '01-hand-replayer.html',
    title: 'Hand replayer', module: 'js/components/replayer.js',
    fn: 'createReplayer(store)', cards: true, data: 'hand.js · buildHand()',
    blurb: 'The felt: seats on an ellipse, the pot badge, the board and the action list for the selected street.',
    lede: 'The replayer is the only component that ships its own controls — the seat-count and street chips in its header write straight to the store, which is how one replayer drives every other panel on a page. Seats are laid out on an ellipse with the hero pinned to the bottom; folded seats dim, and the villain’s cards turn face-up at showdown.',
    state: [
      { k: 'players', v: '2 – 6', d: 'Seat count. Read and written by the component’s seat chips.' },
      { k: 'street', v: '0 – 3', d: 'PREFLOP / FLOP / TURN / RIVER. Read and written by the street chips and the ◀ ▶ steppers.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createReplayer } from './js/components/replayer.js';

const store = createStore({ players: 2, street: 0 });
document.querySelector('#hand-replayer').append(createReplayer(store));`,
  },
  {
    n: '02', id: 'board-cards', file: '02-board-cards.html',
    title: 'Board + hole cards', module: 'js/components/board.js',
    fn: 'createBoard(store)', cards: true, data: 'hand.js · buildHand(), BOARD',
    blurb: 'The hero’s holding at full size, a one-line evaluation, and the runout revealed as far as the street goes.',
    lede: 'Undealt board positions render as dashed slots labelled with the street they are waiting on, so the panel keeps its width from preflop to river. Card pip colour comes from the fixed --pip-* tokens rather than the theme — toggle 4-COLOR in the header and only the diamonds and clubs move.',
    state: [
      { k: 'street', v: '0 – 3', d: 'How much of the board is revealed (0 / 3 / 4 / 5 cards) and which evaluation line shows.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createBoard } from './js/components/board.js';

const store = createStore({ street: 1 });
document.querySelector('#board-cards').append(createBoard(store));`,
  },
  {
    n: '03', id: 'equity', file: '03-equity.html',
    title: 'Equity vs BB range', module: 'js/components/equity.js',
    fn: 'createEquity(store)', cards: false, data: 'hand.js · buildHand()',
    blurb: 'The hero’s equity for the current street as a big number and a bar, over a four-column history.',
    lede: 'The history columns are buttons: clicking one writes that street back to the store, so this panel both reads and drives the shared state. Bars top out at 62% of the track so the street label always has room underneath.',
    state: [
      { k: 'street', v: '0 – 3', d: 'Which street’s equity is featured. Written back when a history column is clicked.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createEquity } from './js/components/equity.js';

const store = createStore({ street: 0 });
document.querySelector('#equity').append(createEquity(store));`,
  },
  {
    n: '04', id: 'stack-pot', file: '04-stack-pot.html',
    title: 'Stack & pot', module: 'js/components/stack.js',
    fn: 'createStack(store)', cards: false, data: 'hand.js · buildHand().stats',
    blurb: 'The money read: effective stack behind, pot, SPR, hero invested and the bet-to-pot ratio.',
    lede: 'The thinnest component in the library — a labelled list of the five numbers buildHand() derives for the selected street. Pot geometry depends on the seat count too (heads-up opens build a 5bb pot, multiway 5.5bb), so both store keys move these figures.',
    state: [
      { k: 'players', v: '2 – 6', d: 'Seat count; shifts the preflop pot and therefore every downstream figure.' },
      { k: 'street', v: '0 – 3', d: 'Which street the pot, SPR and invested figures are measured at.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createStack } from './js/components/stack.js';

const store = createStore({ players: 2, street: 0 });
document.querySelector('#stack-pot').append(createStack(store));`,
  },
  {
    n: '05', id: 'action-timeline', file: '05-action-timeline.html',
    title: 'Action timeline', module: 'js/components/timeline.js',
    fn: 'createTimeline(store)', cards: false, data: 'hand.js · buildHand().streets',
    blurb: 'All four streets side by side — the action on each and the pot it builds, scaled against the final pot.',
    lede: 'A whole-hand view rather than a street view: every column is a button that selects its street, and the selected one lights up. The pot bars share one scale (the river pot), which is what makes the 33 / 75 / 66 percent barrel line legible as geometry rather than a list of numbers.',
    state: [
      { k: 'players', v: '2 – 6', d: 'Seat count; adds the folded positions to the preflop column and rescales the pots.' },
      { k: 'street', v: '0 – 3', d: 'Which column is highlighted. Written back when a column is clicked.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createTimeline } from './js/components/timeline.js';

const store = createStore({ players: 2, street: 0 });
document.querySelector('#action-timeline').append(createTimeline(store));`,
  },
  {
    n: '06', id: 'range-grid', file: '06-range-grid.html',
    title: 'Hand range grid', module: 'js/components/range-grid.js',
    fn: 'createRangeGrid(store)', cards: false, data: 'ranges.js · RANGES, eachCell()',
    blurb: 'The 13x13 grid with full / mixed / folded weights, a hover readout and a switch between the two reference ranges.',
    lede: 'Standard solver-grid convention: pairs on the diagonal, suited above it, offsuit below. Cells carry a weight class (w-full, w-half, w-none) and the CSS fills them, so a range is data plus three class names. Hovering a cell writes { name, w, combos } to the store — put a second panel on the same store and it can read the hover too.',
    state: [
      { k: 'view', v: "'BTN' | 'BB'", d: 'Which reference range is drawn. Written by the two chips in the panel header.' },
      { k: 'hov', v: '{ name, w, combos } | null', d: 'The hovered cell, written on mouseenter and shown in the readout. null falls back to the hero hand.' },
    ],
    usage: `import { createStore } from './js/store.js';
import { createRangeGrid } from './js/components/range-grid.js';

const store = createStore({ view: 'BTN', hov: null });
document.querySelector('#range-grid').append(createRangeGrid(store));`,
  },
  {
    n: '07', id: 'strategy-mix', file: '07-strategy-mix.html',
    title: 'GTO strategy mix', module: 'js/components/strategy-mix.js',
    fn: 'createStrategyMix()', cards: false, data: 'hand.js · GTO_ROWS',
    blurb: 'A solver c-bet split by hand class — bet 33%, bet 75% and check as one stacked bar per class.',
    lede: 'Static: it takes no store and never re-renders. Each row is a stacked bar whose first two segments are widths in percent and whose third takes the remainder, so the three numbers always sum to the row. Swap GTO_ROWS in js/hand.js for a real solver export and the panel follows.',
    state: [],
    usage: `import { createStrategyMix } from './js/components/strategy-mix.js';

document.querySelector('#strategy-mix').append(createStrategyMix());`,
  },
  {
    n: '08', id: 'range-vs-range', file: '08-range-vs-range.html',
    title: 'Range vs range', module: 'js/components/range-vs-range.js',
    fn: 'createRangeVsRange()', cards: false, data: 'ranges.js + hand.js · RANGE_EQUITY',
    blurb: 'Both reference ranges as mini heatmaps above a shared preflop equity bar.',
    lede: 'The same eachCell() walk as the full grid, drawn at thumbnail size with no labels and no hover — the shape of a range is the whole message. Below them the two range equities meet on one bar, tinted with the same BTN and BB accents as the heatmaps above.',
    state: [],
    usage: `import { createRangeVsRange } from './js/components/range-vs-range.js';

document.querySelector('#range-vs-range').append(createRangeVsRange());`,
  },
  {
    n: '09', id: 'combo-breakdown', file: '09-combo-breakdown.html',
    title: 'Combo breakdown', module: 'js/components/combos.js',
    fn: 'createCombos()', cards: false, data: 'hand.js · COMBOS',
    blurb: 'The value-to-bluff ratio of a river bet, with the GTO target marked on the bar and the combos listed underneath.',
    lede: 'One bar, one marker: the fill is the actual value share and the tick is where theory says it should sit for the bet size. When the fill falls short of the tick the range is over-bluffed, and the note underneath says by how much.',
    state: [],
    usage: `import { createCombos } from './js/components/combos.js';

document.querySelector('#combo-breakdown').append(createCombos());`,
  },
];

const FONTS = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap';

// The complete page a reader can paste into a file next to www/ and open.
function usageDoc(ex) {
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

  <div id="${ex.id}"></div>

  <script type="module">
${ex.usage.split('\n').map(l => (l ? '    ' + l : l)).join('\n')}
  <\/script>
</body>
</html>`;
}

// ── Code rendering ────────────────────────────────────────────────────
// Escape first, then colour: tags win over comments so the // in a URL
// inside an attribute is never mistaken for a JS comment.
const TOKENS = /(&lt;[!\/]?[a-zA-Z][^\n]*?&gt;)|(\/\/[^\n]*)|('[^'\n]*'|"[^"\n]*")|\b(import|export|from|const|let|new|return|function)\b/g;

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

// ── Demo-only store drivers ───────────────────────────────────────────
// The chips a component does not ship itself, so a single-component page
// can still be stepped through. Page furniture, not library API.
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

// Builds the page around one component and hands back the nodes to mount
// into: `demo` for the component, `controls` for any demo-only chips.
export function initExample(id) {
  const i = EXAMPLES.findIndex(e => e.id === id);
  if (i < 0) throw new Error(`unknown example: ${id}`);
  const ex = EXAMPLES[i];

  document.title = `${ex.n} · ${ex.title} — pkweb examples`;
  topbar('COMPONENT EXAMPLES', '../');

  const demo = el('div.ex-demo');
  const controls = el('div.ex-controls');

  const stateBlock = ex.state.length
    ? el('table.ex-table', {},
        el('thead', {}, el('tr', {},
          el('th', { text: 'KEY' }), el('th', { text: 'VALUE' }), el('th', { text: 'MEANING' }))),
        el('tbody', {}, ex.state.map(s => el('tr', {},
          el('td.k', { text: s.k }),
          el('td.v', { text: s.v }),
          el('td.d', { text: s.d }),
        ))),
      )
    : el('p.ex-static', { text: 'Static — this component takes no store and never re-renders. Call it with no arguments and mount what it returns.' });

  const main = el('main.ex', {},
    el('nav.ex-crumbs', {},
      el('a.chip.chip-sm', { href: 'index.html', text: '← ALL EXAMPLES' }),
      el('span.ex-count', { text: `${ex.n} / 09` }),
    ),

    el('div', {},
      el('h1.ex-title', { html: `<span class="n">${ex.n}</span> · ${ex.title}` }),
      el('p.ex-lede', { text: ex.lede }),
      el('dl.ex-meta', {},
        el('dt', { text: 'MODULE' }), el('dd', { text: ex.module }),
        el('dt', { text: 'EXPORT' }), el('dd', { text: ex.fn }),
        el('dt', { text: 'DATA' }), el('dd', { text: ex.data }),
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
      el('p.ex-hint', { text: 'Theme and deck chips live in the header; any controls beside LIVE DEMO are this page’s, not the component’s.' }),
    ),

    codeBlock('USAGE · COMPLETE HTML PAGE', usageDoc(ex)),

    el('section', {},
      el('div.ex-block-head', {}, el('div.panel-title', { text: 'STORE KEYS' })),
      stateBlock,
    ),

    navRow(EXAMPLES[i - 1], EXAMPLES[i + 1], i),
  );

  document.body.append(main);
  return { demo, controls, ex };
}

// examples/index.html — the card grid over the same catalog.
export function initExampleIndex() {
  topbar('COMPONENT EXAMPLES', '../');

  document.body.append(el('main.ex', {},
    el('div', {},
      el('h1.ex-title', { text: 'Component examples' }),
      el('p.ex-lede', { text: 'One page per component: a live demo you can theme and step through, the complete HTML needed to use it, and the store keys it reads. The gallery wires all nine together; these pages take them one at a time.' }),
    ),
    el('div.ex-index', {}, EXAMPLES.map(ex => el('a.ex-card', { href: ex.file },
      el('span.ex-card-n', { text: ex.n }),
      el('span.ex-card-title', { text: ex.title }),
      el('span.ex-card-blurb', { text: ex.blurb }),
      el('span.ex-card-mod', { text: ex.fn }),
    ))),
  ));
}
