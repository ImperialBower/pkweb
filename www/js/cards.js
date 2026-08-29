// Card element factory. cardStr is 2-char ("Kh"); pass down:true for a back.
import { el } from './dom.js';

const SUIT_CHAR = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SIZES = { mini: 'card-mini', board: 'card-board', small: 'card-small', big: 'card-big' };

export function makeCard(cardStr, size = 'board', down = false) {
  const cls = SIZES[size] ?? SIZES.board;
  if (down || !cardStr) return el(`div.card.${cls}.card-down`);

  const suit = cardStr[cardStr.length - 1];
  const rank = cardStr.slice(0, -1);
  return el(`div.card.${cls}.suit-${suit}`, {},
    el('span.card-rank', { text: rank === 'T' ? '10' : rank }),
    el('span.card-suit', { text: SUIT_CHAR[suit] ?? '?' }),
  );
}

// An undealt board position. `label` names the street it is waiting on.
export function makeSlot(size = 'board', label = '') {
  const cls = SIZES[size] ?? SIZES.board;
  return el(`div.card.card-slot.${cls}`, {},
    label ? el('span.card-slot-label', { text: label }) : null,
  );
}

// The five community-card positions for a given reveal count (0/3/4/5).
const BOARD_LABELS = ['FLOP', 'FLOP', 'FLOP', 'TURN', 'RIVER'];

export function makeBoard(board, reveal, size = 'board') {
  return board.map((code, i) => i < reveal
    ? makeCard(code, size)
    : makeSlot(size, size === 'board' ? BOARD_LABELS[i] : ''));
}
