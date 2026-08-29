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

export const RANGES = { BTN: btnWeight, BB: bbWeight };

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
  return w === 1 ? 'w-full' : w === 0.5 ? 'w-half' : 'w-none';
}
