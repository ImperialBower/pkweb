// Minimal observable store. Components subscribe; every set() re-renders them.
export function createStore(initial) {
  let state = { ...initial };
  const subs = new Set();
  return {
    get() { return state; },
    set(patch) {
      state = { ...state, ...patch };
      for (const fn of subs) fn(state);
    },
    subscribe(fn) {
      subs.add(fn);
      fn(state);
      return () => subs.delete(fn);
    },
  };
}
