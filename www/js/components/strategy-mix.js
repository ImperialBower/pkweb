// 07 · GTO strategy mix — the c-bet split by hand class.
import { el, fill } from '../dom.js';
import { buildHand } from '../hand.js';

export function createStrategyMix(store) {
  const sub = el('div.panel-sub');
  const rows = el('div.gto-rows');

  const root = el('section.panel', { 'data-component': 'strategy-mix' },
    el('div.panel-title', { text: '07 · GTO STRATEGY MIX' }),
    sub,
    el('div.gto-legend', {},
      el('span', {}, el('span.swatch.swatch-bet33'), document.createTextNode('BET 33%')),
      el('span', {}, el('span.swatch.swatch-bet75'), document.createTextNode('BET 75%')),
      el('span', {}, el('span.swatch.swatch-check'), document.createTextNode('CHECK')),
    ),
    rows,
  );

  store.subscribe(state => {
    const { gto } = buildHand(state);

    sub.textContent = `BTN c-bet strategy · flop ${gto.flop}`;
    fill(rows, gto.rows.map(g => el('div.gto-row', {},
      el('div.gto-row-head', {},
        el('span', { text: g.cls }),
        el('span.combos', { text: `${g.combos} combos` }),
      ),
      el('div.gto-bar', {},
        el('div.gto-seg-bet33', { style: { width: `${g.bet33}%` } }),
        el('div.gto-seg-bet75', { style: { width: `${g.bet75}%` } }),
        el('div.gto-seg-check'),
      ),
    )));
  });

  return root;
}
