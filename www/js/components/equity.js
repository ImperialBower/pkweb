// 03 · Equity vs the BB range — the current number, plus equity by street.
import { el, fill, on } from '../dom.js';
import { buildHand } from '../hand.js';

export function createEquity(store) {
  const value = el('div.eq-value');
  const fillBar = el('div.eq-fill');
  const bars = el('div.eq-bars');

  const root = el('section.panel', { 'data-component': 'equity' },
    el('div.panel-title', { text: '03 · EQUITY vs BB RANGE' }),
    value,
    el('div.eq-track', {}, fillBar),
    bars,
  );

  store.subscribe(state => {
    const hand = buildHand(state);

    fill(value, document.createTextNode(String(hand.cur.eq)), el('span.unit', { text: '%' }));
    fillBar.style.width = `${hand.cur.eq}%`;

    fill(bars, hand.streets.map((s, i) => {
      const col = el('button.eq-bar-col', { type: 'button',
        title: `${s.name} — ${s.eq}%`,
        onclick: () => store.set({ street: i }) },
        // The bar tops out at 62% of the track so the label always has room.
        el('div.eq-bar', { style: { height: `${s.eq * 0.62}%` } }),
        el('div.eq-bar-label', { text: s.name.slice(0, 3) }),
      );
      return on(col, 'is-on', i === hand.street);
    }));
  });

  return root;
}
