import test from 'node:test'
import assert from 'node:assert/strict'
import { processQueue, reconcileIdentity } from './model.mjs'
test('replacement captures render snapshot while functions consume preceding result', () => {
  const snapshot = 4
  assert.equal(processQueue(snapshot, [snapshot + 1, snapshot + 1, snapshot + 1]).state, 5)
  assert.equal(processQueue(snapshot, [n => n + 1, n => n + 1, n => n + 1]).state, 7)
  assert.equal(processQueue(snapshot, [10, n => n + 1, 3]).state, 3)
  assert.equal(processQueue(snapshot, []).state, snapshot)
})
test('stable keys retain identity after reorder, index keys attach state to positions', () => {
  const previous = [{ key: 'a', type: 'Counter', state: 5 }, { key: 'b', type: 'Counter', state: 0 }]
  assert.deepEqual(reconcileIdentity(previous, ['b', 'a'].map(key => ({ key, type: 'Counter', initial: 0 }))).map(row => row.state), [0, 5])
  assert.deepEqual(reconcileIdentity(previous.map((row, i) => ({ ...row, key: String(i) })), ['b', 'a'].map((_, i) => ({ key: String(i), type: 'Counter', initial: 0 }))).map(row => row.state), [5, 0])
})
test('changed type or key resets state and duplicate siblings are rejected', () => {
  const previous = [{ key: 'a', type: 'Counter', state: 5 }]
  assert.equal(reconcileIdentity(previous, [{ key: 'a', type: 'Other', initial: 0 }])[0].state, 0)
  assert.equal(reconcileIdentity(previous, [{ key: 'b', type: 'Counter', initial: 0 }])[0].state, 0)
  assert.throws(() => reconcileIdentity([], [{ key: 'a' }, { key: 'a' }]), /Duplicate key/)
})
