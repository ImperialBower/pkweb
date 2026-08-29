# pkweb component library

Poker hand-analysis and GTO components. Pure client-side: vanilla ES modules,
plain CSS, **no build step and no dependencies**. Serve `www/` statically and
it runs.

```
cd www && python3 -m http.server 8777    # then http://127.0.0.1:8777
```

Extracted from the `Poker_Component_Library` design canvas; the theme tokens
trace back to `ImperialBower/pkarena0-web` `www/css/tokens.css`, and this
library follows the same conventions (`body.theme-*`, `body.four-color`,
element-factory modules, `localStorage` persistence).

## Layout

```
www/
  index.html              the gallery — all nine components on one page
  examples/               one page per component, with copy-paste usage
  css/
    tokens.css            4 themes + the fixed card-pip colors
    base.css              page shell, header, the shared .chip control
    cards.css             playing cards at four sizes
    components.css        the nine components
    examples.css          chrome for examples/ — demo furniture only
  js/
    store.js              observable store (get / set / subscribe)
    dom.js                el() / fill() / on() element helpers
    themes.js             theme + 2-vs-4-color deck switching
    cards.js              makeCard / makeSlot / makeBoard
    ranges.js             13x13 grid maths and the two reference ranges
    hand.js               the reference hand — everything derives from this
    main.js               wires the gallery
    example.js            catalog + scaffolding behind examples/
    components/           one module per component
```

## Components

| # | Module | Export | Reacts to |
|---|---|---|---|
| 01 | `components/replayer.js` | `createReplayer(store)` | `players`, `street` |
| 02 | `components/board.js` | `createBoard(store)` | `street` |
| 03 | `components/equity.js` | `createEquity(store)` | `street` |
| 04 | `components/stack.js` | `createStack(store)` | `players`, `street` |
| 05 | `components/timeline.js` | `createTimeline(store)` | `players`, `street` |
| 06 | `components/range-grid.js` | `createRangeGrid(store)` | `view`, `hov` |
| 07 | `components/strategy-mix.js` | `createStrategyMix()` | — static |
| 08 | `components/range-vs-range.js` | `createRangeVsRange()` | — static |
| 09 | `components/combos.js` | `createCombos()` | — static |

## Examples

[`examples/`](examples/) has one page per component — a live demo you can
theme and step through, the complete HTML needed to use that component on its
own, and a table of the store keys it reads and writes. Start at
[`examples/index.html`](examples/index.html).

The pages share `js/example.js` (the catalog, the header, the prev/next nav
and the usage snippet) and `css/examples.css`. Both are demo furniture — no
component depends on them, and the usage block on each page is the whole
story.

## Mounting a component

Each returns a detached `HTMLElement` — mount it wherever you like:

```js
import { createStore } from './js/store.js';
import { createRangeGrid } from './js/components/range-grid.js';

const store = createStore({ players: 2, street: 0, view: 'BTN', hov: null });
document.querySelector('#somewhere').append(createRangeGrid(store));
store.set({ view: 'BB' });   // every subscribed component re-renders
```

## Themes

Four themes ship as `body` classes — `theme-midnight` (default),
`theme-terminal`, `theme-luxe`, `theme-organic`. Each defines the same 50
tokens, so a component that only reads `var(--*)` themes for free. Card pip
colors are deliberately **outside** the themes: `--pip-red` / `--pip-black`
are fixed, and `body.four-color` remaps diamonds to blue and clubs to green.

Adding a theme means adding one `body.theme-*` block to `tokens.css` with all
50 tokens, plus an entry in `THEMES` in `js/themes.js`. Nothing else changes.

## Rules

- Components read **only** tokens — never a raw hex, font name, or radius.
- No inline styles except genuinely computed geometry (bar widths, seat
  positions). Everything else is a class in `css/`.
- No framework, no bundler, no `node_modules`.

## The reference hand

`js/hand.js` models one hand — BTN vs BB, 100bb, `A♥K♥` on `K♠7♦2♥9♣4♠`, with
a 2.5bb open and a 33 / 75 / 66 percent barrel line. `buildHand({players,
street})` derives positions, pot geometry, seats, actions and stats, so the
seat and street chips drive all nine panels from a single source. Swap this
module for real data (a solver export, a hand history, a `pkcore` result) and
the components follow.
