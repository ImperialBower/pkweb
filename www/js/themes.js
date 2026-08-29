// Theme + deck-color switching with localStorage persistence.
// Same mechanism as pkarena0-web: a body.theme-* class plus body.four-color.
import { el, fill, on } from './dom.js';

const THEME_KEY = 'pkweb.theme';
const DECK_KEY = 'pkweb.deck';

export const THEMES = [
  { id: 'midnight', name: 'MIDNIGHT PRO' },
  { id: 'terminal', name: 'TERMINAL' },
  { id: 'luxe', name: 'TABLE STAKES' },
  { id: 'organic', name: 'ORGANIC' },
];

const IDS = THEMES.map(t => t.id);

function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }  // private mode
}
function write(key, value) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function applyTheme(id) {
  for (const t of IDS) document.body.classList.remove('theme-' + t);
  document.body.classList.add('theme-' + id);
}

// Renders the theme chips into `container` and restores the saved choice.
export function initThemes(container) {
  const saved = read(THEME_KEY);
  let current = IDS.includes(saved) ? saved : 'midnight';

  const chips = THEMES.map(t => el('button.chip.chip-sm', {
    type: 'button', text: t.name,
    onclick: () => select(t.id),
  }));

  function select(id) {
    current = id;
    applyTheme(id);
    chips.forEach((c, i) => on(c, 'is-on', THEMES[i].id === id));
    write(THEME_KEY, id);
  }

  fill(container, chips);
  select(current);
}

export function initDeckToggle(btn) {
  const apply = four => {
    document.body.classList.toggle('four-color', four);
    on(btn, 'is-on', four);
    btn.setAttribute('aria-pressed', String(four));
  };
  // Four-color is the library's default; only an explicit '2' turns it off.
  let four = read(DECK_KEY) !== '2';
  apply(four);

  btn.addEventListener('click', () => {
    four = !document.body.classList.contains('four-color');
    apply(four);
    write(DECK_KEY, four ? '4' : '2');
  });
}
