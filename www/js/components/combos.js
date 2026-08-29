// 09 · Combo breakdown — the value:bluff ratio of a river bet against target.
import { el, fill } from '../dom.js';
import { buildHand } from '../hand.js';

function comboList(title, cls, rows) {
  return el('div', {},
    el(`div.combo-col-title.${cls}`, { text: title }),
    rows.map(v => el('div.combo-row', {},
      el('span', { text: v.h }),
      el('span.n', { text: String(v.n) }),
    )),
  );
}

export function createCombos(store) {
  const sub = el('div.panel-sub');
  const bar = el('div.combo-bar');
  const legend = el('div.combo-legend');
  const lists = el('div.combo-lists');
  const note = el('div.panel-note');

  const root = el('section.panel', { 'data-component': 'combo-breakdown' },
    el('div.panel-title', { text: '09 · COMBO BREAKDOWN' }),
    sub, bar, legend, lists, note,
  );

  store.subscribe(state => {
    const c = buildHand(state).combos;
    const target = `${c.targetPct.toFixed(0)} : ${(100 - c.targetPct).toFixed(0)}`;

    sub.textContent = `BTN river bet ${c.betPct}% pot · value : bluff`;

    fill(bar,
      el('div.fill-value', { style: { width: `${c.valuePct}%` } }),
      el('div.fill-bluff'),
      el('div.combo-target', { style: { left: `${c.targetPct}%` }, title: `GTO target ${target}` }),
    );

    fill(legend,
      el('span', {},
        el('span.is-value', { text: `${c.valueCombos} value` }),
        document.createTextNode(` (${c.valuePct.toFixed(1)}%)`)),
      el('span', { text: `GTO target ${target}` }),
      el('span', {},
        el('span.is-bluff', { text: `${c.bluffCombos} bluffs` }),
        document.createTextNode(` (${c.bluffPct.toFixed(1)}%)`)),
    );

    fill(lists,
      comboList('VALUE', 'is-value', c.value),
      comboList('BLUFF', 'is-bluff', c.bluff),
    );

    // Over- or under-bluffed, and by how many combos.
    const verdict = c.over > 0
      ? `${c.bluffCombos}/${c.total} (${c.bluffPct.toFixed(1)}%) is over-bluffed — drop the weakest ${c.over} combos.`
      : c.over < 0
        ? `${c.bluffCombos}/${c.total} (${c.bluffPct.toFixed(1)}%) is under-bluffed — add ${-c.over} combos.`
        : `${c.bluffCombos}/${c.total} (${c.bluffPct.toFixed(1)}%) is on target.`;
    note.textContent =
      `At ${c.betPct}% pot, bluffs should be ~${c.targetBluffPct.toFixed(0)}% of the betting range. ${verdict}`;
  });

  return root;
}
