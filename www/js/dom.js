// el('div.foo', { onclick, text, style }, ...children) -> HTMLElement
// The tag accepts a trailing .class.list, which keeps component code close to
// the markup it produces.
export function el(spec, props = {}, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');

  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'class') node.className = [node.className, v].filter(Boolean).join(' ');
    else if (k === 'style') Object.assign(node.style, v);
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }

  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c);
  }
  return node;
}

// Replace an element's children in one shot.
export function fill(node, ...children) {
  node.replaceChildren(...children.flat().filter(c => c !== null && c !== undefined && c !== false));
  return node;
}

// Toggle a class from a boolean.
export function on(node, cls, active) {
  node.classList.toggle(cls, !!active);
  return node;
}
