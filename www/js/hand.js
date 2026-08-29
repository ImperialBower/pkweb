// The reference hand the library renders: BTN vs BB, 100bb, NLHE.
// Everything downstream is derived from { players, street } so the seat count
// and street chips drive all nine components from one model.

export const STREETS = ['PREFLOP', 'FLOP', 'TURN', 'RIVER'];
export const BOARD = ['Ks', '7d', '2h', '9c', '4s'];

const SEAT_NAMES = { BTN: 'Hero', BB: 'Villain', SB: 'Sam', UTG: 'Uri', HJ: 'Hana', CO: 'Cole' };
const HERO_CARDS = ['Ah', 'Kh'];
const VILLAIN_CARDS = ['Kc', 'Jc'];

const r1 = n => +n.toFixed(1);

// Which token an actor is drawn in — shared by the replayer and the timeline.
export function actorClass(who) {
  if (who === 'BTN') return 'actor-btn';
  if (who === 'BB') return 'actor-bb';
  if (who === 'SD') return 'actor-sd';
  return 'actor-none';
}

export function buildHand({ players = 2, street = 0 } = {}) {
  const P = Math.max(2, Math.min(6, players));
  const st = Math.max(0, Math.min(3, street));

  const positions = P === 2 ? ['BTN', 'BB'] : ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'].slice(0, P);

  // Pot geometry: an open to 2.5bb, then a 33 / 75 / 66 percent barrel line.
  const pf = P === 2 ? 5.0 : 5.5;
  const fBet = r1(pf * 0.33),   fEnd = r1(pf + 2 * fBet);
  const tBet = r1(fEnd * 0.75), tEnd = r1(fEnd + 2 * tBet);
  const rBet = r1(tEnd * 0.66), rEnd = r1(tEnd + 2 * rBet);

  const preActs = [];
  for (const p of ['UTG', 'HJ', 'CO']) {
    if (positions.includes(p)) preActs.push({ who: p, txt: 'fold' });
  }
  preActs.push({ who: 'BTN', txt: 'raise 2.5bb' });
  if (positions.includes('SB')) preActs.push({ who: 'SB', txt: 'fold' });
  preActs.push({ who: 'BB', txt: 'call 2.5bb' });

  const streets = [
    { name: 'PREFLOP', reveal: 0, potStart: 1.5, potEnd: pf, eq: 66.4, inv: 2.5,
      cards: '—', eval: 'A♥K♥ — suited broadway', acts: preActs },
    { name: 'FLOP', reveal: 3, potStart: pf, potEnd: fEnd, eq: 87.2, inv: fBet,
      cards: 'K♠7♦2♥', eval: 'Top pair, top kicker',
      acts: [{ who: 'BB', txt: 'check' }, { who: 'BTN', txt: `bet ${fBet}bb · 33%` }, { who: 'BB', txt: 'call' }] },
    { name: 'TURN', reveal: 4, potStart: fEnd, potEnd: tEnd, eq: 84.5, inv: tBet,
      cards: '+9♣', eval: 'Top pair — 9 adds draws',
      acts: [{ who: 'BB', txt: 'check' }, { who: 'BTN', txt: `bet ${tBet}bb · 75%` }, { who: 'BB', txt: 'call' }] },
    { name: 'RIVER', reveal: 5, potStart: tEnd, potEnd: rEnd, eq: 91.8, inv: rBet,
      cards: '+4♠', eval: 'Top pair, top kicker — value',
      acts: [{ who: 'BB', txt: 'check' }, { who: 'BTN', txt: `bet ${rBet}bb · 66%` }, { who: 'BB', txt: 'call' },
             { who: 'SD', txt: `BTN wins ${rEnd}bb` }] },
  ];

  const cur = streets[st];
  const invested = r1(streets.slice(0, st + 1).reduce((a, s) => a + s.inv, 0));
  const behind = r1(100 - invested);
  const showdown = st === 3;

  // Seats sit on an ellipse; the hero is pinned at the bottom (90 degrees).
  const seats = positions.map((pos, k) => {
    const ang = (90 + k * 360 / P) * Math.PI / 180;
    const yRaw = 50 + 40 * Math.sin(ang);
    const x = 50 + 36 * Math.cos(ang);
    // A seat landing on the horizontal midline would collide with the board.
    const y = Math.abs(yRaw - 50) < 10 ? 30 : yRaw;
    const folded = pos !== 'BTN' && pos !== 'BB';
    const isHero = pos === 'BTN';

    let cards = [];
    if (isHero) cards = HERO_CARDS.map(c => ({ code: c, up: true }));
    else if (pos === 'BB') cards = VILLAIN_CARDS.map(c => ({ code: c, up: showdown }));

    return {
      pos, name: SEAT_NAMES[pos], isHero, folded, cards,
      x, y, above: y < 50,
      stack: !folded ? `${behind}bb` : pos === 'SB' ? '99.5bb' : '100bb',
    };
  });

  const stats = [
    { k: 'Effective behind', v: `${behind}bb` },
    { k: 'Pot', v: `${cur.potEnd}bb`, cls: 'is-pot' },
    { k: 'SPR', v: ((100 - (invested - cur.inv)) / cur.potStart).toFixed(1), cls: 'is-spr' },
    { k: 'Hero invested', v: `${invested.toFixed(1)}bb` },
    { k: 'Bet / pot', v: `${(cur.inv / cur.potStart * 100).toFixed(0)}%` },
  ];

  return { players: P, street: st, positions, streets, cur, seats, stats,
           invested, behind, showdown, maxPot: rEnd, heroCards: HERO_CARDS };
}

// Static reference data for the solver-output panels.
export const GTO_ROWS = [
  { cls: 'Sets',            combos: 9,  bet33: 80, bet75: 15 },
  { cls: 'Top pair (Kx)',   combos: 36, bet33: 72, bet75: 8 },
  { cls: '2nd pair (7x)',   combos: 12, bet33: 38, bet75: 0 },
  { cls: 'Underpairs',      combos: 30, bet33: 45, bet75: 0 },
  { cls: 'Overcards',       combos: 32, bet33: 64, bet75: 6 },
  { cls: 'Backdoor draws',  combos: 40, bet33: 58, bet75: 4 },
  { cls: 'Air',             combos: 60, bet33: 30, bet75: 2 },
];

export const COMBOS = {
  value: [{ h: 'AK (top pair)', n: '9' }, { h: 'KQ (top pair)', n: '12' }, { h: '77 / 22 (sets)', n: '6' }],
  bluff: [{ h: 'QJs (missed)', n: '3' }, { h: 'JTs (missed)', n: '3' }, { h: 'T8s / 53s', n: '7' }],
};

export const RANGE_EQUITY = { btn: 55.3, bb: 44.7 };
