// The 13x13 hand grid: naming, combo counts, and the two reference ranges.
// Weights are 1 (always), 0.5 (mixed) or 0 (never). Grid convention matches
// every solver UI: i is the row rank, j the column rank, i<j is suited,
// i>j is offsuit, i===j is a pocket pair.
export const RANKS = 'AKQJT98765432';

export function handName(i, j) {
  if (i === j) return RANKS[i] + RANKS[j];
  return i < j ? RANKS[i] + RANKS[j] + 's' : RANKS[j] + RANKS[i] + 'o';
}

export function combosOf(i, j) {
  if (i === j) return 6;      // pocket pair
  return i < j ? 4 : 12;      // suited : offsuit
}

// BTN opening range, ~43% of hands.
export function btnWeight(i, j) {
  if (i === j) return 1;
  if (i < j) {
    const hi = i, lo = j;
    if (hi === 0 || lo - hi === 1) return 1;
    if (hi === 1) return 1;
    if (hi === 2) return lo <= 10 ? 1 : 0.5;
    if (hi === 3 || hi === 4 || hi === 5) return lo <= 8 ? 1 : (lo === 9 ? 0.5 : 0);
    if (hi === 6) return lo <= 9 ? 1 : 0;
    if (hi === 7 || hi === 8) return lo <= 10 ? 1 : 0;
    if (hi === 9) return lo === 10 ? 1 : (lo === 11 ? 0.5 : 0);
    if (hi === 10) return lo === 11 ? 0.5 : 0;
    return 0;
  }
  const hi = j, lo = i;
  if (hi === 0) return lo <= 10 ? 1 : 0.5;
  if (hi === 1) return lo <= 6 ? 1 : (lo === 7 ? 0.5 : 0);
  if (hi === 2) return lo <= 5 ? 1 : (lo === 6 ? 0.5 : 0);
  if (hi === 3) return lo <= 5 ? 1 : 0;
  if (hi === 4) return lo === 5 ? 1 : 0;
  if (hi === 5) return lo === 6 ? 0.5 : 0;
  return 0;
}

// BB defending range vs a 2.5bb open, ~38% of hands.
export function bbWeight(i, j) {
  if (i === j) return i >= 3 ? 1 : 0.5;
  if (i < j) {
    const hi = i, lo = j;
    if (hi === 0) return lo >= 5 ? 1 : 0.5;
    if (lo - hi <= 3 || hi <= 2) return 1;
    if (hi <= 6) return 1;
    return lo <= 11 ? 0.5 : 0;
  }
  const hi = j, lo = i;
  if (hi === 0) return lo <= 6 ? 1 : 0.5;
  if (hi === 1) return lo <= 6 ? 1 : (lo <= 8 ? 0.5 : 0);
  if (hi === 2) return lo <= 6 ? 1 : 0;
  if (hi === 3) return lo <= 5 ? 1 : 0;
  if (hi === 4) return lo === 5 ? 1 : 0;
  if (lo - hi === 1 && hi <= 7) return 0.5;
  return 0;
}

// ── Range notation ────────────────────────────────────────────────────
// parseRange('22+, A2s+, KTo+, QJs:0.5') -> (i, j) => weight, so a host page
// can hand a range in from HTML instead of shipping a function. Tokens are
// separated by commas or spaces; `:w` sets a weight (0-1, or 1-100 as a
// percentage); `+` extends upward and `-` spans a pair or kicker range.
const idx = r => RANKS.indexOf(r.toUpperCase());

function weightOf(token) {
  const [hand, w] = token.split(':');
  if (w === undefined) return [hand, 1];
  const n = parseFloat(w);
  return [hand, Number.isNaN(n) ? 1 : n > 1 ? n / 100 : n];
}

// A single hand: 'AA', 'AKs', 'AKo', or 'AK' meaning both.
function set(grid, hand, w) {
  const hi = idx(hand[0]), lo = idx(hand[1]);
  if (hi < 0 || lo < 0) return;
  const [a, b] = hi <= lo ? [hi, lo] : [lo, hi];
  const suit = hand[2]?.toLowerCase();

  if (a === b) grid[a][a] = w;                        // pocket pair
  else if (suit === 's') grid[a][b] = w;              // i < j is suited
  else if (suit === 'o') grid[b][a] = w;              // i > j is offsuit
  else { grid[a][b] = w; grid[b][a] = w; }            // no suffix: both
}

function span(grid, hand, from, to, w) {
  const step = from <= to ? 1 : -1;
  for (let k = from; k !== to + step; k += step) {
    set(grid, hand[0] === hand[1] ? RANKS[k] + RANKS[k] : hand[0] + RANKS[k] + (hand[2] ?? ''), w);
  }
}

export function parseRange(spec) {
  const grid = Array.from({ length: 13 }, () => new Array(13).fill(0));

  for (const raw of String(spec).split(/[,\s]+/).filter(Boolean)) {
    const [token, w] = weightOf(raw);

    if (token.includes('-')) {                        // 77-TT, A2s-A5s
      const [lhs, rhs] = token.split('-');
      const pair = lhs[0] === lhs[1];
      span(grid, lhs, idx(pair ? lhs[0] : lhs[1]), idx(pair ? rhs[0] : rhs[1]), w);
    } else if (token.endsWith('+')) {                 // 22+, A2s+, KTo+
      const hand = token.slice(0, -1);
      // Pairs climb to aces; a kicker climbs to just under its high card.
      if (hand[0] === hand[1]) span(grid, hand, idx(hand[0]), 0, w);
      else span(grid, hand, idx(hand[1]), idx(hand[0]) + 1, w);
    } else {
      set(grid, token, w);
    }
  }

  const fn = (i, j) => grid[i][j];
  fn.grid = grid;
  return fn;
}

// A range is either a weight function already or notation to parse.
export function toRange(range, fallback) {
  if (typeof range === 'function') return range;
  if (typeof range === 'string' && range.trim()) return parseRange(range);
  return fallback;
}

// Share of all 1326 starting combos a range covers, weights included.
export function rangePercent(weightFn) {
  let combos = 0;
  eachCell((i, j) => { combos += weightFn(i, j) * combosOf(i, j); });
  return combos / 1326 * 100;
}

// Walk the grid once, handing each cell to `visit(i, j, name, combos)`.
export function eachCell(visit) {
  const out = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      out.push(visit(i, j, handName(i, j), combosOf(i, j)));
    }
  }
  return out;
}

// Map a weight to the class the CSS fills from.
export function weightClass(w) {
  return w >= 0.99 ? 'w-full' : w > 0 ? 'w-half' : 'w-none';
}
