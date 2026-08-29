// 05 · Action timeline — bet sizing street by street, and the pot it builds.
import { el, fill, on } from '../dom.js';
import { buildHand, actorClass } from '../hand.js';

export function createTimeline(store) {
  const grid = el('div.timeline');

  const root = el('section.panel', { 'data-component': 'action-timeline' },
    el('div.panel-title', { text: '05 · ACTION TIMELINE — BET SIZING BY STREET' }),
    grid,
  );

  store.subscribe(state => {
    const hand = buildHand(state);

    fill(grid, hand.streets.map((s, i) => {
      const col = el('button.tl-col', { type: 'button', onclick: () => store.set({ street: i }) },
        el('div.tl-head', {},
          el('span.tl-name', { text: s.name }),
          el('span.tl-cards', { text: s.cards }),
        ),
        el('div.tl-acts', {}, s.acts.map(a => el('div.tl-act', {},
          el('span.action-who', { text: a.who, class: actorClass(a.who) }),
          document.createTextNode(' ' + a.txt),
        ))),
        el('div.tl-foot', {},
          el('div.tl-track', {}, el('div.tl-bar', { style: { width: `${s.potEnd / hand.maxPot * 100}%` } })),
          el('span.tl-pot', { text: `${s.potEnd}bb` }),
        ),
      );
      return on(col, 'is-on', i === hand.street);
    }));
  });

  return root;
}
