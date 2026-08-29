// 08 · Range vs range — both ranges as mini heatmaps over a shared equity bar.
import { el } from '../dom.js';
import { btnWeight, bbWeight, eachCell, weightClass } from '../ranges.js';
import { RANGE_EQUITY } from '../hand.js';

function miniGrid(weightOf, side) {
  return el('div.mini-grid', {}, eachCell((i, j) =>
    el(`div.mini-cell.mini-${side}.${weightClass(weightOf(i, j))}`)));
}

export function createRangeVsRange() {
  return el('section.panel', { 'data-component': 'range-vs-range' },
    el('div.panel-title', { text: '08 · RANGE vs RANGE' }),
    el('div.rvr-grids', {},
      el('div.rvr-col', {},
        el('div.rvr-title.is-btn', { text: 'BTN OPEN · 43% of hands' }),
        miniGrid(btnWeight, 'btn'),
      ),
      el('div.rvr-col', {},
        el('div.rvr-title.is-bb', { text: 'BB DEFEND · 38% of hands' }),
        miniGrid(bbWeight, 'bb'),
      ),
    ),
    el('div.rvr-equity', {},
      el('div.rvr-equity-head', {},
        el('span.side.is-btn', { text: `BTN ${RANGE_EQUITY.btn}%` }),
        el('span.caption', { text: 'preflop range equity' }),
        el('span.side.is-bb', { text: `BB ${RANGE_EQUITY.bb}%` }),
      ),
      el('div.rvr-bar', {},
        el('div.fill-btn', { style: { width: `${RANGE_EQUITY.btn}%` } }),
        el('div.fill-bb'),
      ),
    ),
  );
}
