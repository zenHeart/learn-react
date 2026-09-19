import { readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function checkCurriculum(data, root) {
  const errors = []
  const maps = {}
  for (const group of ['capabilities', 'sources', 'series', 'roles', 'cases']) {
    const rows = data[group]
    if (!Array.isArray(rows)) { errors.push(`${group}: array required`); continue }
    maps[group] = new Set()
    for (const row of rows) {
      if (!row?.id || maps[group].has(row.id)) errors.push(`${group}: missing or duplicate id`)
      maps[group].add(row?.id)
    }
  }
  if (errors.length) return errors
  const refs = (row, key, target) => {
    if (!Array.isArray(row[key]) || row[key].some(id => !maps[target].has(id))) errors.push(`${row.id}: invalid ${key}`)
  }
  const entry = row => {
    try {
      if (typeof row.entry !== 'string' || path.isAbsolute(row.entry)) throw Error()
      const base = realpathSync(root), file = realpathSync(path.resolve(base, row.entry))
      if (!file.startsWith(base + path.sep) || !statSync(file).isFile()) throw Error()
    } catch { errors.push(`${row.id}: missing or escaping entry`) }
  }
  for (const row of data.series) { entry(row); refs(row, 'capability_refs', 'capabilities') }
  for (const row of data.cases) {
    entry(row)
    for (const [key, target] of [['capability_refs', 'capabilities'], ['source_refs', 'sources'], ['prerequisite_refs', 'capabilities']]) refs(row, key, target)
    if (!maps.series.has(row.owner)) errors.push(`${row.id}: unknown owner`)
    if (!['passed', 'failed', 'not-run', 'manual'].includes(row.verification)) errors.push(`${row.id}: invalid verification`)
    if (row.verification === 'passed' && !row.verification_evidence) errors.push(`${row.id}: passed needs evidence`)
  }
  for (const row of data.roles) {
    refs(row, 'task_refs', 'cases')
    for (const requirement of row.requirements || []) { refs(requirement, 'capability_refs', 'capabilities'); refs(requirement, 'source_refs', 'sources') }
  }
  return errors
}
const root = fileURLToPath(new URL('../', import.meta.url))
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const data = JSON.parse(readFileSync(path.join(root, 'curriculum.json'), 'utf8'))
  const errors = checkCurriculum(data, root)
  if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
  else console.log(`PASS references and local entrypoints: ${data.cases.length} cases. This is not content or learner acceptance.`)
}
