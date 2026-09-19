import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { checkCurriculum } from './check-curriculum.mjs'
const root = fileURLToPath(new URL('../', import.meta.url))
const load = () => JSON.parse(readFileSync(new URL('../curriculum.json', import.meta.url), 'utf8'))
test('actual project entries and references resolve', () => assert.deepEqual(checkCurriculum(load(), root), []))
test('missing task and mistaken prerequisite case IDs are rejected', () => {
  const data = load(); data.roles[0].task_refs.push('missing-task'); data.cases[0].prerequisite_refs = ['basic-component']
  assert.equal(checkCurriculum(data, root).length, 2)
})
test('escaping entry and unsupported passing claim are rejected', () => {
  const data = load(); data.cases[0].entry = '../package.json'; data.cases[0].verification = 'passed'; delete data.cases[0].verification_evidence
  assert.equal(checkCurriculum(data, root).length, 2)
})
