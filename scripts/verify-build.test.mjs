import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { verifyBuild } from './verify-build.mjs'

function fixture(domain = '') {
  const dir = mkdtempSync(join(tmpdir(), 'learn-build-'))
  const base = domain ? '/' : '/learn-react/'
  mkdirSync(join(dir, 'assets'))
  writeFileSync(join(dir, 'assets/app.js'), 'console.log("lesson")')
  writeFileSync(join(dir, 'index.html'), `<script src="${base}assets/app.js"></script>`)
  writeFileSync(join(dir, 'version.json'), JSON.stringify({ commit: 'abc1234', dirty: false, base }))
  if (domain) writeFileSync(join(dir, 'CNAME'), domain)
  return dir
}

test('project and custom-domain assets pass only with matching clean revision', () => {
  for (const domain of ['', 'example.org']) {
    const dir = fixture(domain)
    try {
      assert.deepEqual(verifyBuild(dir, { commit: 'abc1234', domain }), [])
      assert.match(verifyBuild(dir, { commit: 'other', domain }).join(), /revision/)
      writeFileSync(join(dir, 'version.json'), JSON.stringify({ commit: 'abc1234', dirty: true, base: domain ? '/' : '/learn-react/' }))
      assert.match(verifyBuild(dir, { commit: 'abc1234', domain }).join(), /clean/)
    } finally { rmSync(dir, { recursive: true, force: true }) }
  }
})

test('wrong base, private files and synthetic credentials are rejected without printing values', () => {
  const dir = fixture()
  try {
    writeFileSync(join(dir, 'index.html'), '<script src="/assets/app.js"></script>')
    writeFileSync(join(dir, '.env'), 'synthetic=yes')
    const fake = 'ghp_' + 'x'.repeat(30)
    writeFileSync(join(dir, 'assets/app.js'), fake)
    const errors = verifyBuild(dir, { commit: 'abc1234' }).join('\n')
    assert.match(errors, /deployment base/)
    assert.match(errors, /private file/)
    assert.match(errors, /credential/)
    assert.ok(!errors.includes(fake))
  } finally { rmSync(dir, { recursive: true, force: true }) }
})


test('build provenance uses its source checkout and detects untracked source', () => {
  const dir = mkdtempSync(join(tmpdir(), 'learn-provenance-'))
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
  try {
    mkdirSync(join(dir, 'scripts'))
    mkdirSync(join(dir, 'dist'))
    copyFileSync(new URL('./write-build-version.mjs', import.meta.url), join(dir, 'scripts/write-build-version.mjs'))
    writeFileSync(join(dir, '.gitignore'), 'dist/\n')
    git('init', '--quiet')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'add', '.')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture')
    const run = () => {
      execFileSync(process.execPath, [join(dir, 'scripts/write-build-version.mjs')], { cwd: tmpdir(), env: { ...process.env, LEARN_SITE_DOMAIN: '' } })
      return JSON.parse(readFileSync(join(dir, 'dist/version.json'), 'utf8'))
    }
    assert.deepEqual(run(), { commit: git('rev-parse', 'HEAD'), dirty: false, base: '/learn-react/' })
    writeFileSync(join(dir, 'new-lesson.ts'), 'export const lesson = 1')
    assert.equal(run().dirty, true)
  } finally { rmSync(dir, { recursive: true, force: true }) }
})
