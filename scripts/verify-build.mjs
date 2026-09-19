import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

export function verifyBuild(directory, { commit, domain = '' }) {
  const errors = []
  const base = domain ? '/' : '/learn-react/'
  let version
  try { version = JSON.parse(readFileSync(resolve(directory, 'version.json'), 'utf8')) }
  catch { errors.push('version.json missing or invalid') }
  if (version && (version.commit !== commit || version.dirty !== false || version.base !== base)) {
    errors.push('version must match clean source revision and deployment base')
  }
  const cname = resolve(directory, 'CNAME')
  if (domain ? !existsSync(cname) || readFileSync(cname, 'utf8').trim() !== domain : existsSync(cname)) {
    errors.push('CNAME must match the explicitly configured domain')
  }
  const index = resolve(directory, 'index.html')
  if (!existsSync(index)) errors.push('index.html missing')
  else {
    const html = readFileSync(index, 'utf8')
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']*\/assets\/[^"']+)["']/g)].map(match => match[1])
    if (!assets.length || assets.some(asset => !asset.startsWith(base + 'assets/') || !existsSync(resolve(directory, asset.slice(base.length))))) {
      errors.push('entry assets must exist under the configured deployment base')
    }
  }
  const patterns = {
    credential: /gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9_-]{24,}|LTAI[A-Za-z0-9]{12,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/,
    localPath: /\/Users\/[^ /]+\/|[A-Z]:\\Users\\/,
    internalHost: /192\.168\.\d+\.\d+|https?:\/\/[^/\s]*\.nn\.com/,
  }
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = resolve(dir, entry.name)
      const name = relative(directory, file)
      if (entry.isSymbolicLink()) { errors.push(name + ': symlink forbidden'); continue }
      if (/^(?:\.env(?:\.|$)|\.git$|\.claude$|\.agents$|secrets?(?:\.|$))/.test(entry.name)) {
        errors.push(name + ': private file forbidden')
      }
      if (entry.isDirectory()) walk(file)
      else if (/\.(?:html|js|css|json|map|txt|md)$/.test(entry.name)) {
        const text = readFileSync(file, 'utf8')
        for (const [rule, pattern] of Object.entries(patterns)) if (pattern.test(text)) errors.push(name + ': ' + rule)
      }
    }
  }
  if (existsSync(directory)) walk(directory)
  return errors
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const errors = verifyBuild(resolve(root, 'dist'), { commit, domain: process.env.LEARN_SITE_DOMAIN?.trim() || '' })
  for (const error of errors) console.error('ERROR: ' + error)
  if (errors.length) process.exitCode = 1
  else console.log('PASS build revision, assets, base, domain and privacy patterns')
}
