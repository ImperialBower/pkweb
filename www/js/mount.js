// Declarative mounting: put the data in the HTML, call mountAll(), done.
//
//   <div data-pk="board" data-hero="Ah Kh" data-board="Ks 7d 2h" ...>
//
// Every [data-pk] element under the root shares one store by default, so a
// replayer drives the panels beside it exactly as it does in the gallery.
// Give elements a data-store name to run several independent hands on one
// page. Anything that will not fit in an attribute — actions, solver rows,
// combo lists — goes in an inline <script type="application/json"> child.
import { createStore } from './store.js';
import { STREETS } from './hand.js';

import { createReplayer } from './components/replayer.js';
import { createBoard } from './components/board.js';
import { createEquity } from './components/equity.js';
import { createStack } from './components/stack.js';
import { createTimeline } from './components/timeline.js';
import { createRangeGrid } from './components/range-grid.js';
import { createStrategyMix } from './components/strategy-mix.js';
import { createRangeVsRange } from './components/range-vs-range.js';
import { createCombos } from './components/combos.js';

export const COMPONENTS = {
  'replayer': createReplayer,
  'board': createBoard,
  'equity': createEquity,
  'stack': createStack,
  'timeline': createTimeline,
  'range-grid': createRangeGrid,
  'strategy-mix': createStrategyMix,
  'range-vs-range': createRangeVsRange,
  'combos': createCombos,
};

// ── Attribute parsing ─────────────────────────────────────────────────
// 'Ks 7d 2h', 'Ks,7d,2h' and 'Ks7d2h' all mean the same three cards.
export function parseCards(value) {
  return String(value).split(/[\s,]+/).filter(Boolean)
    .flatMap(tok => tok.length > 2 ? tok.match(/.{1,2}/g) : [tok]);
}

// '2', 'flop', 'FLOP' -> the street index.
export function parseStreet(value) {
  const v = String(value).trim().toUpperCase();
  const named = STREETS.indexOf(v);
  if (named >= 0) return named;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : Math.max(0, Math.min(3, n));
}

const nums = v => String(v).split(/[\s,]+/).filter(Boolean).map(Number);

// data-* attributes that describe the hand, and how to read each one.
const SPEC_ATTRS = {
  hero:        v => ({ hero: parseCards(v) }),
  villain:     v => ({ villain: parseCards(v) }),
  board:       v => ({ board: parseCards(v) }),
  heroHand:    v => ({ heroHand: v.trim().toUpperCase() }),
  heroPos:     v => ({ hero_pos: v.trim().toUpperCase() }),
  stack:       v => ({ stack: Number(v) }),
  open:        v => ({ open: Number(v) }),
  barrel:      v => ({ barrel: nums(v).map(n => n > 1 ? n / 100 : n) }),
  game:        v => ({ game: v }),
  equity:      v => ({ equity: nums(v) }),
  rangeBtn:    v => ({ ranges: { BTN: v } }),
  rangeBb:     v => ({ ranges: { BB: v } }),
  rangeEquity: v => ({ rangeEquity: { btn: nums(v)[0], bb: nums(v)[1] } }),
};

// data-* attributes that are UI state rather than hand data.
const STATE_ATTRS = {
  players: v => Number(v),
  street: parseStreet,
  view: v => v.trim().toUpperCase(),
};

function readConfig(node) {
  const spec = {}, state = {};

  // The JSON block first, so a same-element attribute can override it.
  const json = node.querySelector(':scope > script[type="application/json"]');
  if (json?.textContent.trim()) {
    try {
      const { players, street, view, ...rest } = JSON.parse(json.textContent);
      Object.assign(spec, rest);
      if (players !== undefined) state.players = Number(players);
      if (street !== undefined) state.street = parseStreet(street);
      if (view !== undefined) state.view = String(view).toUpperCase();
    } catch (err) {
      console.warn('pkweb: bad JSON config on', node, err.message);
    }
  }

  for (const [key, read] of Object.entries(SPEC_ATTRS)) {
    if (node.dataset[key] !== undefined) {
      const patch = read(node.dataset[key]);
      // ranges arrive one side at a time, so merge rather than replace.
      for (const [k, v] of Object.entries(patch)) {
        spec[k] = (k === 'ranges' || k === 'rangeEquity') ? { ...spec[k], ...v } : v;
      }
    }
  }

  for (const [key, read] of Object.entries(STATE_ATTRS)) {
    if (node.dataset[key] !== undefined) state[key] = read(node.dataset[key]);
  }

  return { spec, state };
}

// ── Mounting ──────────────────────────────────────────────────────────
// Mounts every [data-pk] under `root` and returns the stores by name, so a
// page can keep driving them afterwards.
export function mountAll(root = document) {
  const nodes = [...root.querySelectorAll('[data-pk]')];
  const groups = new Map();

  // One pass to pool each group's config: config on any element in a group
  // applies to the whole group, so the hand can be declared once.
  for (const node of nodes) {
    const name = node.dataset.store ?? 'default';
    const group = groups.get(name) ?? { hand: {}, state: {}, nodes: [] };
    const { spec, state } = readConfig(node);

    group.hand = { ...group.hand, ...spec,
      ranges: { ...group.hand.ranges, ...spec.ranges },
      rangeEquity: { ...group.hand.rangeEquity, ...spec.rangeEquity } };
    group.state = { ...group.state, ...state };
    group.nodes.push(node);
    groups.set(name, group);
  }

  const stores = new Map();
  for (const [name, group] of groups) {
    // Empty range/equity objects would shadow the reference hand's own.
    for (const k of ['ranges', 'rangeEquity']) {
      if (group.hand[k] && !Object.keys(group.hand[k]).length) delete group.hand[k];
    }

    const store = createStore({
      players: 2, street: 0, view: 'BTN', hov: null,
      ...group.state,
      hand: group.hand,
    });
    stores.set(name, store);

    for (const node of group.nodes) {
      const create = COMPONENTS[node.dataset.pk];
      if (!create) {
        console.warn(`pkweb: no component named "${node.dataset.pk}"`, node);
        continue;
      }
      node.append(create(store));
    }
  }

  return stores;
}
