// 08 · Range vs range — both ranges as mini heatmaps over a shared equity bar.
import { el, fill } from '../dom.js';
import { eachCell, weightClass } from '../ranges.js';
import { buildHand } from '../hand.js';

function miniGrid(weightOf, side) {
  return el('div.mini-grid', {}, eachCell((i, j) =>
    el(`div.mini-cell.mini-${side}.${weightClass(weightOf(i, j))}`)));
}

export function createRangeVsRange(store) {
  const btnCol = el('div.rvr-col');
  const bbCol = el('div.rvr-col');
  const btnSide = el('span.side.is-btn');
  const bbSide = el('span.side.is-bb');
  const bar = el('div.rvr-bar');

  const root = el('section.panel', { 'data-component': 'range-vs-range' },
    el('div.panel-title', { text: '08 · RANGE vs RANGE' }),
    el('div.rvr-grids', {}, btnCol, bbCol),
    el('div.rvr-equity', {},
      el('div.rvr-equity-head', {}, btnSide,
        el('span.caption', { text: 'preflop range equity' }), bbSide),
      bar,
    ),
  );

  store.subscribe(state => {
    const { ranges, rangePct, rangeEquity } = buildHand(state);

    fill(btnCol,
      el('div.rvr-title.is-btn', { text: `BTN OPEN · ${Math.round(rangePct.BTN)}% of hands` }),
      miniGrid(ranges.BTN, 'btn'));
    fill(bbCol,
      el('div.rvr-title.is-bb', { text: `BB DEFEND · ${Math.round(rangePct.BB)}% of hands` }),
      miniGrid(ranges.BB, 'bb'));

    btnSide.textContent = `BTN ${rangeEquity.btn}%`;
    bbSide.textContent = `BB ${rangeEquity.bb}%`;
    fill(bar,
      el('div.fill-btn', { style: { width: `${rangeEquity.btn}%` } }),
      el('div.fill-bb'));
  });

  return root;
}
