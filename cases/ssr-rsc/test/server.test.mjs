import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

test('production server returns rendered HTML without leaking a server-only marker into HTML or browser chunks', async t => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const probe = createServer().listen(0, '127.0.0.1')
  await once(probe, 'listening')
  const port = probe.address().port
  await new Promise(resolve => probe.close(resolve))
  const marker = 'SYNTHETIC_SERVER_BOUNDARY_MARKER_20260919'
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: root, env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', LAB_PRIVATE_NOTE: marker }, stdio: ['ignore', 'pipe', 'pipe'],
  })
  child.stdout.resume(); child.stderr.resume()
  t.after(async () => { if (child.exitCode === null) { child.kill('SIGTERM'); await once(child, 'exit') } })
  let response
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error('Next server exited before readiness')
    try { response = await fetch(`http://127.0.0.1:${port}`, { signal: AbortSignal.timeout(1500) }); break } catch { await new Promise(resolve => setTimeout(resolve, 100)) }
  }
  assert.ok(response, 'server ready within bounded wait')
  assert.equal(response.status, 200)
  const html = await response.text()
  assert.ok(html.includes('服务端读取，客户端交互'))
  assert.ok(html.includes('本地点赞'))
  assert.ok(!html.includes(marker))
  const staticRoot = path.join(root, '.next/static')
  async function inspect(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name)
      if (entry.isDirectory()) await inspect(file)
      else if (/\.(js|json|html)$/.test(entry.name)) assert.ok(!(await readFile(file, 'utf8')).includes(marker), 'server marker absent from browser artifact')
    }
  }
  await inspect(staticRoot)
})
