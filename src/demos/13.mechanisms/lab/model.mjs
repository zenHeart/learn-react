// A pure queue model, not a Fiber renderer: no lanes, interruption or effects.
export function processQueue(initial, actions) {
  const steps = []
  let state = initial
  for (const action of actions) {
    const before = state
    state = typeof action === 'function' ? action(state) : action
    steps.push({ before, after: state, kind: typeof action === 'function' ? 'update' : 'replace' })
  }
  return { state, steps }
}
// One sibling scope with unique keys; a changed component type creates new state.
export function reconcileIdentity(previous, next) {
  const keys = new Set()
  return next.map(item => {
    if (keys.has(item.key)) throw new Error('Duplicate key in one sibling scope')
    keys.add(item.key)
    const old = previous.find(candidate => candidate.key === item.key && candidate.type === item.type)
    return { ...item, state: old ? old.state : item.initial }
  })
}
