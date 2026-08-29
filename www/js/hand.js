// The hand model every component renders.
//
// Nothing here is fixed: a host page passes a spec — from HTML attributes, a
// solver export, a hand history — and buildHand() fills in whatever the spec
// leaves out from the reference hand below. Components never read this
// module's constants directly; they read the model buildHand() returns, so
// changing the spec changes every panel at once.

import { cardText } from './cards.js';
import { btnWeight, bbWeight, toRange, rangePercent } from './ranges.js';

export const STREETS = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];

// BTN vs BB, 100bb, A♥K♥ on K♠7♦2♥9♣4♠ — the hand the library shows when a
// page says nothing. Every key here is overridable.
export const REFERENCE = {
  players: 2,
  stack: 100,
  game: "NO LIMIT HOLD'EM",
  board: ['Ks', '7d', '2h', '9c', '4s'],
  hero: ['Ah', 'Kh'],
  villain: ['Kc', 'Jc'],
  heroHand: 'AKs',
  hero_pos: 'BTN',
  names: { BTN: 'Hero', BB: 'Villain', SB: 'Sam', UTG: 'Uri', HJ: 'Hana', CO: 'Cole' },
  open: 2.5,                        // preflop raise, in big blinds
  barrel: [0.33, 0.75, 0.66],       // flop / turn / river bets, as pot fractions
  equity: [66.4, 87.2, 84.5, 91.8],
  evals: [
    'A♥K♥ — suited broadway',
    'Top pair, top kicker',
    'Top pair — 9 adds draws',
    'Top pair, top kicker — value',
  ],
  ranges: { BTN: btnWeight, BB: bbWeight },
  rangeEquity: { btn: 55.3, bb: 44.7 },
  gtoRows: [
    { cls: 'Sets',            combos: 9,  bet33: 80, bet75: 15 },
    { cls: 'Top pair (Kx)',   combos: 36, bet33: 72, bet75: 8 },
    { cls: '2nd pair (7x)',   combos: 12, bet33: 38, bet75: 0 },
    { cls: 'Underpairs',      combos: 30, bet33: 45, bet75: 0 },
    { cls: 'Overcards',       combos: 32, bet33: 64, bet75: 6 },
    { cls: 'Backdoor draws',  combos: 40, bet33: 58, bet75: 4 },
    { cls: 'Air',             combos: 60, bet33: 30, bet75: 2 },
  ],
  value: [{ h: 'AK (top pair)', n: 9 }, { h: 'KQ (top pair)', n: 12 }, { h: '77 / 22 (sets)', n: 6 }],
  bluff: [{ h: 'QJs (missed)', n: 3 }, { h: 'JTs (missed)', n: 3 }, { h: 'T8s / 53s', n: 7 }],
  // Left null, these derive from `open`, `barrel` and the board:
  actions: null,                    // { preflop: [[who, text], …], flop: … }
  streets: null,                    // per-street { pot, eq, inv, acts, eval, cards }
};

const r1 = n => +n.toFixed(1);

// Which token an actor is drawn in — shared by the replayer and the timeline.
export function actorClass(who) {
  if (who === 'BTN') return 'actor-btn';
  if (who === 'BB') return 'actor-bb';
  if (who === 'SD') return 'actor-sd';
  return 'actor-none';
}

// Accepts [[who, text], …] or [{ who, txt }, …] — HTML config produces the
// first, hand-written JS tends to produce the second.
function toActs(list) {
  if (!Array.isArray(list)) return null;
  return list.map(a => Array.isArray(a) ? { who: a[0], txt: a[1] } : a);
}

// 'K♠7♦2♥' on the flop, then '+9♣' and '+4♠'.
function streetCards(board, reveal, prev) {
  if (!reveal) return '—';
  const shown = board.slice(prev, reveal).map(cardText).join('');
  return prev ? '+' + shown : shown;
}

// The bluff share theory wants at a given bet size, as a fraction of the
// betting range: s / (1 + 2s) for a bet of s times the pot.
export function bluffShare(potFraction) {
  return potFraction / (1 + 2 * potFraction);
}

export function buildHand({ players, street = 0, hand = {} } = {}) {
  const spec = { ...REFERENCE, ...hand };
  const P = Math.max(2, Math.min(6, players ?? spec.players));
  const st = Math.max(0, Math.min(3, street));
  const board = spec.board;

  const positions = P === 2 ? ['BTN', 'BB'] : ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'].slice(0, P);

  // Pot geometry: blinds, then the open and the barrel line the spec names.
  const [b1, b2, b3] = spec.barrel;
  const pf = r1(2 * spec.open + (P === 2 ? 0 : 0.5));
  const fBet = r1(pf * b1),     fEnd = r1(pf + 2 * fBet);
  const tBet = r1(fEnd * b2),   tEnd = r1(fEnd + 2 * tBet);
  const rBet = r1(tEnd * b3),   rEnd = r1(tEnd + 2 * rBet);

  const preActs = [];
  for (const p of ['UTG', 'HJ', 'CO']) {
    if (positions.includes(p)) preActs.push({ who: p, txt: 'fold' });
  }
  preActs.push({ who: 'BTN', txt: `raise ${spec.open}bb` });
  if (positions.includes('SB')) preActs.push({ who: 'SB', txt: 'fold' });
  preActs.push({ who: 'BB', txt: `call ${spec.open}bb` });

  const pct = f => `${Math.round(f * 100)}%`;
  const barrelActs = (bet, f) => [
    { who: 'BB', txt: 'check' },
    { who: 'BTN', txt: `bet ${bet}bb · ${pct(f)}` },
    { who: 'BB', txt: 'call' },
  ];

  const acts = spec.actions ?? {};
  const streets = [
    { name: 'PREFLOP', reveal: 0, potStart: 1.5, potEnd: pf,   inv: spec.open,
      acts: toActs(acts.preflop) ?? preActs },
    { name: 'FLOP',    reveal: 3, potStart: pf,  potEnd: fEnd, inv: fBet,
      acts: toActs(acts.flop) ?? barrelActs(fBet, b1) },
    { name: 'TURN',    reveal: 4, potStart: fEnd, potEnd: tEnd, inv: tBet,
      acts: toActs(acts.turn) ?? barrelActs(tBet, b2) },
    { name: 'RIVER',   reveal: 5, potStart: tEnd, potEnd: rEnd, inv: rBet,
      acts: (toActs(acts.river) ?? barrelActs(rBet, b3))
        .concat({ who: 'SD', txt: `${spec.hero_pos} wins ${rEnd}bb` }) },
  ].map((s, i, all) => ({
    ...s,
    eq: spec.equity[i],
    eval: spec.evals[i],
    cards: streetCards(board, s.reveal, i ? all[i - 1].reveal : 0),
    ...(spec.streets?.[i] ?? {}),     // the spec's own overrides win
  }));

  const cur = streets[st];
  const invested = r1(streets.slice(0, st + 1).reduce((a, s) => a + s.inv, 0));
  const behind = r1(spec.stack - invested);
  const showdown = st === 3;

  // Seats sit on an ellipse; the hero is pinned at the bottom (90 degrees).
  const seats = positions.map((pos, k) => {
    const ang = (90 + k * 360 / P) * Math.PI / 180;
    const yRaw = 50 + 40 * Math.sin(ang);
    const x = 50 + 36 * Math.cos(ang);
    // A seat landing on the horizontal midline would collide with the board.
    const y = Math.abs(yRaw - 50) < 10 ? 30 : yRaw;
    const folded = pos !== spec.hero_pos && pos !== 'BB';
    const isHero = pos === spec.hero_pos;

    let cards = [];
    if (isHero) cards = spec.hero.map(c => ({ code: c, up: true }));
    else if (pos === 'BB') cards = spec.villain.map(c => ({ code: c, up: showdown }));

    return {
      pos, name: spec.names[pos] ?? pos, isHero, folded, cards,
      x, y, above: y < 50,
      stack: !folded ? `${behind}bb` : pos === 'SB' ? `${r1(spec.stack - 0.5)}bb` : `${spec.stack}bb`,
    };
  });

  const stats = [
    { k: 'Effective behind', v: `${behind}bb` },
    { k: 'Pot', v: `${cur.potEnd}bb`, cls: 'is-pot' },
    { k: 'SPR', v: ((spec.stack - (invested - cur.inv)) / cur.potStart).toFixed(1), cls: 'is-spr' },
    { k: 'Hero invested', v: `${invested.toFixed(1)}bb` },
    { k: 'Bet / pot', v: `${(cur.inv / cur.potStart * 100).toFixed(0)}%` },
  ];

  // Ranges arrive as weight functions or as notation ('22+, A2s+, KTo+').
  const ranges = {
    BTN: toRange(spec.ranges?.BTN, REFERENCE.ranges.BTN),
    BB: toRange(spec.ranges?.BB, REFERENCE.ranges.BB),
  };
  const rangePct = { BTN: rangePercent(ranges.BTN), BB: rangePercent(ranges.BB) };

  // The river bet's value:bluff mix, measured against what theory wants.
  const sum = rows => rows.reduce((a, r) => a + Number(r.n), 0);
  const valueCombos = sum(spec.value), bluffCombos = sum(spec.bluff);
  const total = valueCombos + bluffCombos || 1;
  const riverFraction = spec.barrel[2];
  const targetBluff = bluffShare(riverFraction);
  const combos = {
    value: spec.value, bluff: spec.bluff,
    valueCombos, bluffCombos, total,
    valuePct: valueCombos / total * 100,
    bluffPct: bluffCombos / total * 100,
    targetPct: (1 - targetBluff) * 100,
    betPct: Math.round(riverFraction * 100),
    targetBluffPct: targetBluff * 100,
    over: Math.round(bluffCombos - total * targetBluff),
  };

  return {
    spec, players: P, street: st, positions, streets, cur, seats, stats,
    invested, behind, showdown, maxPot: streets[3].potEnd,
    board, heroCards: spec.hero, heroHand: spec.heroHand, game: spec.game,
    ranges, rangePct, rangeEquity: spec.rangeEquity,
    gto: { rows: spec.gtoRows, flop: board.slice(0, 3).map(cardText).join('') },
    combos,
  };
}
