// 06 · Hand range grid — the 13x13 with a hover readout, per range view.
import { el, fill, on } from '../dom.js';
import { RANGES, eachCell, weightClass } from '../ranges.js';

const HERO_HAND = 'AKs';

export function createRangeGrid(store) {
  const grid = el('div.range-grid');
  const viewBtn = el('button.chip', { type: 'button', text: 'BTN OPEN', onclick: () => store.set({ view: 'BTN' }) });
  const viewBb = el('button.chip', { type: 'button', text: 'BB DEFEND', onclick: () => store.set({ view: 'BB' }) });

  const outHand = el('span.hand');
  const outCombos = el('span.meta');
  const outWeight = el('span.meta', { html: 'weight <strong></strong>' });
  const outSummary = el('span.summary');

  const root = el('section.panel', { 'data-component': 'range-grid' },
    el('div.panel-head', {},
      el('div.panel-title', { text: '06 · HAND RANGE GRID' }),
      el('div.theme-chips', {}, viewBtn, viewBb),
    ),
    grid,
    el('div.range-readout', {}, outHand, outCombos, outWeight, outSummary),
  );

  store.subscribe(state => {
    const view = state.view;
    const weightOf = RANGES[view];

    on(viewBtn, 'is-on', view === 'BTN');
    on(viewBb, 'is-on', view === 'BB');
    grid.classList.toggle('view-btn', view === 'BTN');
    grid.classList.toggle('view-bb', view === 'BB');

    fill(grid, eachCell((i, j, name, combos) => {
      const w = weightOf(i, j);
      const cell = el(`div.range-cell.${weightClass(w)}`, {
        text: name,
        onmouseenter: () => store.set({ hov: { name, w, combos } }),
      });
      return on(cell, 'is-hero', name === HERO_HAND);
    }));

    const hov = state.hov ?? { name: HERO_HAND, w: 1, combos: 4 };
    outHand.textContent = hov.name;
    outCombos.textContent = `${hov.combos} combos`;
    outWeight.querySelector('strong').textContent =
      hov.w === 1 ? '100%' : hov.w === 0.5 ? '50%' : '0%';
    outSummary.textContent = view === 'BTN'
      ? 'BTN opens ~43% · 2.5bb'
      : 'BB defends ~38% vs 2.5bb';
  });

  return root;
}
