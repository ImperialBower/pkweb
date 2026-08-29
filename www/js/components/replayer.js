// 01 · Hand replayer — the felt, the seats, the pot and the street stepper.
import { el, fill, on } from '../dom.js';
import { makeCard, makeBoard } from '../cards.js';
import { buildHand, actorClass, STREETS, BOARD } from '../hand.js';

export function createReplayer(store) {
  const seatChips = [2, 3, 4, 5, 6].map(n =>
    el('button.chip.chip-square', { type: 'button', text: String(n),
      onclick: () => store.set({ players: n }) }));

  const streetChips = STREETS.map((name, i) =>
    el('button.chip', { type: 'button', text: name,
      onclick: () => store.set({ street: i }) }));

  const stepBack = el('button.chip.chip-step', { type: 'button', text: '◀', 'aria-label': 'Previous street',
    onclick: () => store.set({ street: Math.max(0, store.get().street - 1) }) });
  const stepFwd = el('button.chip.chip-step', { type: 'button', text: '▶', 'aria-label': 'Next street',
    onclick: () => store.set({ street: Math.min(3, store.get().street + 1) }) });

  const felt = el('div.felt-wrap', {},
    el('div.felt'),
    el('div.felt-ring'),
  );
  const potBadge = el('div.pot-badge');
  const feltBoard = el('div.felt-board');
  felt.append(potBadge, feltBoard, el('div.felt-label', { text: "NO LIMIT HOLD'EM" }));

  const actionTitle = el('div.label-mono');
  const actionList = el('div.action-panel', {}, actionTitle);

  const root = el('section.panel', { 'data-component': 'hand-replayer' },
    el('div.panel-head', {},
      el('div.panel-title', { text: '01 · HAND REPLAYER' }),
      el('div.topbar-controls', {},
        el('span.label-mono.replayer-seats-label', { text: 'SEATS' }),
        ...seatChips,
        el('span.topbar-divider'),
        stepBack, ...streetChips, stepFwd,
      ),
    ),
    el('div.replayer-body', {}, felt, actionList),
  );

  store.subscribe(state => {
    const hand = buildHand(state);

    seatChips.forEach((c, i) => on(c, 'is-on', i + 2 === hand.players));
    streetChips.forEach((c, i) => on(c, 'is-on', i === hand.street));
    stepBack.disabled = hand.street === 0;
    stepFwd.disabled = hand.street === 3;

    // Seats — rebuilt because the count and the positions both change.
    felt.querySelectorAll('.seat').forEach(n => n.remove());
    for (const s of hand.seats) {
      const seat = el('div.seat', {
        class: [s.above ? 'is-above' : '', s.folded ? 'is-folded' : '', s.isHero ? 'is-hero' : ''].filter(Boolean).join(' '),
        style: { left: `${s.x.toFixed(1)}%`, top: `${s.y.toFixed(1)}%` },
      },
        el('div.seat-cards', {}, s.cards.map(c => makeCard(c.code, 'mini', !c.up))),
        el('div.seat-plate', {},
          el('span.seat-pos', { text: s.pos, class: s.folded ? 'actor-none' : actorClass(s.pos) }),
          el('span', { text: s.name }),
          el('span.seat-stack', { text: s.stack }),
          s.isHero ? el('span.seat-button', { title: 'Dealer button' }) : null,
        ),
      );
      felt.append(seat);
    }

    potBadge.textContent = `POT ${hand.cur.potEnd}bb`;
    fill(feltBoard, makeBoard(BOARD, hand.cur.reveal));

    actionTitle.textContent = `ACTION — ${hand.cur.name}`;
    fill(actionList, actionTitle,
      hand.cur.acts.map(a => el(`div.action-row.${actorClass(a.who)}`, {},
        el('span.action-who', { text: a.who }),
        el('span', { text: a.txt }),
      )),
      el('div.action-hint', { text: 'Step through streets with the chips above — every panel below tracks the selected street.' }),
    );
  });

  return root;
}

