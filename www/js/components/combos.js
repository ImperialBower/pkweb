// 09 · Combo breakdown — the value:bluff ratio of a river bet against target.
import { el } from '../dom.js';
import { COMBOS } from '../hand.js';

const VALUE_COMBOS = 27;
const BLUFF_COMBOS = 13;
const TOTAL = VALUE_COMBOS + BLUFF_COMBOS;
const VALUE_PCT = VALUE_COMBOS / TOTAL * 100;   // 67.5
const TARGET_PCT = 71.6;                        // GTO 72:28 at a 66% pot bet

function comboList(title, cls, rows) {
  return el('div', {},
    el(`div.combo-col-title.${cls}`, { text: title }),
    rows.map(v => el('div.combo-row', {},
      el('span', { text: v.h }),
      el('span.n', { text: v.n }),
    )),
  );
}

export function createCombos() {
  return el('section.panel', { 'data-component': 'combo-breakdown' },
    el('div.panel-title', { text: '09 · COMBO BREAKDOWN' }),
    el('div.panel-sub', { text: 'BTN river bet 66% pot · value : bluff' }),
    el('div.combo-bar', {},
      el('div.fill-value', { style: { width: `${VALUE_PCT}%` } }),
      el('div.fill-bluff'),
      el('div.combo-target', { style: { left: `${TARGET_PCT}%` }, title: 'GTO target 72 : 28' }),
    ),
    el('div.combo-legend', {},
      el('span', {},
        el('span.is-value', { text: `${VALUE_COMBOS} value` }),
        document.createTextNode(` (${VALUE_PCT.toFixed(1)}%)`)),
      el('span', { text: 'GTO target 72 : 28' }),
      el('span', {},
        el('span.is-bluff', { text: `${BLUFF_COMBOS} bluffs` }),
        document.createTextNode(` (${(100 - VALUE_PCT).toFixed(1)}%)`)),
    ),
    el('div.combo-lists', {},
      comboList('VALUE', 'is-value', COMBOS.value),
      comboList('BLUFF', 'is-bluff', COMBOS.bluff),
    ),
    el('div.panel-note', { text: `At 66% pot, bluffs should be ~28% of the betting range. ${BLUFF_COMBOS}/${TOTAL} (${(100 - VALUE_PCT).toFixed(1)}%) is slightly over-bluffed — drop the weakest 2 combos.` }),
  );
}
