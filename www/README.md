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
    cards.js              makeCard / makeSlot / makeBoard / cardText
    ranges.js             13x13 grid maths and poker-notation parsing
    hand.js               buildHand() — the model every component renders
    mount.js              mountAll() — reads the data out of the HTML
    main.js               wires the gallery
    example.js            catalog + scaffolding behind examples/
    components/           one module per component
```

## Using a component

Declare it in HTML and call `mountAll()`. The data is attributes; anything
too big for an attribute goes in an inline JSON block:

```html
<div data-pk="board"
     data-hero="Ah Kh"
     data-board="Ks 7d 2h 9c 4s"
     data-street="flop"></div>

<script type="module">
  import { mountAll } from './js/mount.js';
  mountAll();
</script>
```

Every `[data-pk]` element under the mount root shares one store, so a
replayer's seat and street chips drive every panel beside it. Give elements a
`data-store="name"` to run several independent hands on one page — and note
that config on *any* element in a group applies to the whole group, so a hand
is declared once and read by all nine panels.

`mountAll(root = document)` returns the stores by name, if a page wants to go
on driving them from JavaScript.

## Components

| # | `data-pk` | Module | Export |
|---|---|---|---|
| 01 | `replayer` | `components/replayer.js` | `createReplayer(store)` |
| 02 | `board` | `components/board.js` | `createBoard(store)` |
| 03 | `equity` | `components/equity.js` | `createEquity(store)` |
| 04 | `stack` | `components/stack.js` | `createStack(store)` |
| 05 | `timeline` | `components/timeline.js` | `createTimeline(store)` |
| 06 | `range-grid` | `components/range-grid.js` | `createRangeGrid(store)` |
| 07 | `strategy-mix` | `components/strategy-mix.js` | `createStrategyMix(store)` |
| 08 | `range-vs-range` | `components/range-vs-range.js` | `createRangeVsRange(store)` |
| 09 | `combos` | `components/combos.js` | `createCombos(store)` |

Each returns a detached `HTMLElement`, so the JS API is there when a page
needs it — `mountAll()` is a convenience over exactly this:

```js
import { createStore } from './js/store.js';
import { createRangeGrid } from './js/components/range-grid.js';

const store = createStore({ view: 'BTN', hand: { ranges: { BTN: '22+, A2s+, KTo+' } } });
document.querySelector('#somewhere').append(createRangeGrid(store));
store.set({ view: 'BB' });   // every subscribed component re-renders
```

## Configuring the hand

### Attributes

| Attribute | Example | Meaning |
|---|---|---|
| `data-hero` | `Ah Kh` | Hero's hole cards. Spaced, comma-separated or run together. |
| `data-villain` | `Kc Jc` | Villain's cards — face-down until showdown. |
| `data-board` | `Ks 7d 2h 9c 4s` | All five community cards. |
| `data-hero-hand` | `AKs` | The cell outlined in the range grid. |
| `data-hero-pos` | `BTN` | Which seat is the hero. |
| `data-players` | `2` – `6` | Seat count. |
| `data-street` | `flop` or `0` – `3` | Which street is showing. |
| `data-stack` | `100` | Starting stack, in big blinds. |
| `data-open` | `2.5` | Preflop raise size; the preflop pot follows from it. |
| `data-barrel` | `33 75 66` | Flop / turn / river bets as a share of the pot. |
| `data-equity` | `66.4 87.2 84.5 91.8` | Hero equity per street. |
| `data-game` | `NO LIMIT HOLD'EM` | The label on the felt. |
| `data-range-btn` | `22+, A2s+, KTo+` | BTN range, in poker notation. |
| `data-range-bb` | `22+, A2s+, K9s+` | BB range. |
| `data-range-equity` | `55.3 44.7` | BTN and BB preflop range equity. |
| `data-store` | `qq` | Which store this element joins. |

### JSON block

Anything that will not fit an attribute goes in a `<script
type="application/json">` inside the mount element — `actions`, `names`,
`evals`, `gtoRows`, `value`, `bluff`, `ranges`, `rangeEquity`, `streets`, and
the scalar keys above if you prefer them there. Attributes win over JSON on
the same element.

```html
<div data-pk="timeline" data-barrel="25 60 125">
  <script type="application/json">
    { "actions": {
        "flop": [["BB", "check"], ["BTN", "bet 1.6bb · 25%"], ["BB", "call"]] } }
  </script>
</div>
```

### Range notation

Ranges are ordinary poker notation, parsed by `js/ranges.js`:

- `AA`, `AKs`, `AKo`, `AK` (both suited and offsuit)
- `22+` climbs to aces; `A2s+` climbs to `AKs`; `KTo+` to `KQo`
- `77-TT`, `A2s-A5s` span a run
- `QJs:0.5` sets a weight — `0`–`1`, or `1`–`100` as a percentage

Percentages shown on screen (`BTN opens ~44%`) are computed from the range,
combos and weights included, so they cannot drift from what is drawn.

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
- Components read **only** the model `buildHand()` returns — never their own
  constants, so a page can replace any of it.
- No inline styles except genuinely computed geometry (bar widths, seat
  positions). Everything else is a class in `css/`.
- No framework, no bundler, no `node_modules`.

## The reference hand

`js/hand.js` exports `REFERENCE`: BTN vs BB, 100bb, `A♥K♥` on `K♠7♦2♥9♣4♠`,
a 2.5bb open and a 33 / 75 / 66 percent barrel line. It is the default, not a
fixture — `buildHand({ players, street, hand })` merges a page's spec over it
and derives positions, pot geometry, seats, actions, ranges and stats from
the result. Declare nothing and you get the reference hand; declare a board
and an open size and everything downstream follows.
