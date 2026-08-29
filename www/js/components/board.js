// 02 · Board + hole cards — the hero's holding and the runout so far.
import { el, fill } from '../dom.js';
import { makeCard, makeBoard } from '../cards.js';
import { buildHand, BOARD } from '../hand.js';

export function createBoard(store) {
  const heroRow = el('div.hero-row');
  const strip = el('div.board-strip');

  const root = el('section.panel', { 'data-component': 'board-cards' },
    el('div.panel-title', { text: '02 · BOARD + HOLE CARDS' }),
    el('div.board-stack', {}, heroRow, strip),
  );

  store.subscribe(state => {
    const hand = buildHand(state);
    fill(heroRow,
      hand.heroCards.map(c => makeCard(c, 'big')),
      el('div.hero-eval', { html: `HERO<br><strong></strong>` }),
    );
    heroRow.querySelector('strong').textContent = hand.cur.eval;
    fill(strip, makeBoard(BOARD, hand.cur.reveal, 'small'));
  });

  return root;
}
