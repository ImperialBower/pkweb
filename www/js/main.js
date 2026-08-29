// Wires the gallery. The panels are declared in index.html — mountAll() finds
// every [data-pk] element there and mounts it, sharing one store, so the seat
// and street chips in the replayer drive all nine panels at once.
//
// The gallery declares no hand data, so every panel shows the reference hand
// from js/hand.js. Add data-* attributes in index.html to change that.
import { initThemes, initDeckToggle } from './themes.js';
import { mountAll } from './mount.js';

initThemes(document.getElementById('theme-chips'));
initDeckToggle(document.getElementById('deck-toggle'));

const stores = mountAll(document.getElementById('gallery'));

// Exposed for console poking and for host pages that embed the library.
window.pkweb = { stores, store: stores.get('default') };
