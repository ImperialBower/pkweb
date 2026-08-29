// Wires the component gallery. Every component reads the same store, so the
// street and seat chips in the replayer drive all nine panels at once.
import { createStore } from './store.js';
import { el, fill } from './dom.js';
import { initThemes, initDeckToggle } from './themes.js';

import { createReplayer } from './components/replayer.js';
import { createBoard } from './components/board.js';
import { createEquity } from './components/equity.js';
import { createStack } from './components/stack.js';
import { createTimeline } from './components/timeline.js';
import { createRangeGrid } from './components/range-grid.js';
import { createStrategyMix } from './components/strategy-mix.js';
import { createRangeVsRange } from './components/range-vs-range.js';
import { createCombos } from './components/combos.js';

const store = createStore({
  players: 2,
  street: 0,
  view: 'BTN',
  hov: null,
});

initThemes(document.getElementById('theme-chips'));
initDeckToggle(document.getElementById('deck-toggle'));

fill(document.getElementById('gallery'),
  createReplayer(store),
  el('div.row.row-3', {},
    createBoard(store),
    createEquity(store),
    createStack(store),
  ),
  createTimeline(store),
  el('div.row.row-2', {},
    createRangeGrid(store),
    createStrategyMix(),
  ),
  el('div.row.row-2', {},
    createRangeVsRange(),
    createCombos(),
  ),
);

// Exposed for console poking and for host pages that embed the library.
window.pkweb = { store };
