// 04 · Stack & pot — the money read for the selected street.
import { el, fill } from '../dom.js';
import { buildHand } from '../hand.js';

export function createStack(store) {
  const list = el('div.stat-list');

  const root = el('section.panel', { 'data-component': 'stack-pot' },
    el('div.panel-title', { text: '04 · STACK & POT' }),
    list,
  );

  store.subscribe(state => {
    const hand = buildHand(state);
    fill(list, hand.stats.map(s => el('div.stat-row', {},
      el('span.stat-key', { text: s.k }),
      el('span.stat-val', { text: s.v, class: s.cls }),
    )));
  });

  return root;
}
