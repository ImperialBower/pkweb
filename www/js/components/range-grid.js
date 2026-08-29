// 06 · Hand range grid — the 13x13 with a hover readout, per range view.
import { el, fill, on } from '../dom.js';
import { RANKS, eachCell, combosOf, weightClass } from '../ranges.js';
import { buildHand } from '../hand.js';

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
    const hand = buildHand(state);
    const view = state.view === 'BB' ? 'BB' : 'BTN';
    const weightOf = hand.ranges[view];
    const heroHand = hand.heroHand;

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
      return on(cell, 'is-hero', name === heroHand);
    }));

    const hov = state.hov ?? { name: heroHand, w: weightOf(...cellOf(heroHand)), combos: combosOfName(heroHand) };
    outHand.textContent = hov.name;
    outCombos.textContent = `${hov.combos} combos`;
    outWeight.querySelector('strong').textContent = `${Math.round(hov.w * 100)}%`;
    outSummary.textContent = view === 'BTN'
      ? `BTN opens ~${Math.round(hand.rangePct.BTN)}% · ${hand.spec.open}bb`
      : `BB defends ~${Math.round(hand.rangePct.BB)}% vs ${hand.spec.open}bb`;
  });

  return root;
}

// 'AKs' -> the grid coordinates and the combo count, for the default readout.
function cellOf(name) {
  const hi = RANKS.indexOf(name[0]), lo = RANKS.indexOf(name[1]);
  if (hi === lo) return [hi, hi];
  const [a, b] = hi <= lo ? [hi, lo] : [lo, hi];
  return name.endsWith('o') ? [b, a] : [a, b];
}

function combosOfName(name) {
  return combosOf(...cellOf(name));
}
