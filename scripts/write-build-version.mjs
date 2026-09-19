import { execFileSync } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const domain = process.env.LEARN_SITE_DOMAIN?.trim() || ''
const version = {
  commit: git('rev-parse', 'HEAD'),
  dirty: git('status', '--porcelain') !== '',
  base: domain ? '/' : '/learn-react/',
}
writeFileSync(new URL('../dist/version.json', import.meta.url), JSON.stringify(version) + '\n')
const cname = new URL('../dist/CNAME', import.meta.url)
if (domain) writeFileSync(cname, domain + '\n')
else rmSync(cname, { force: true })
