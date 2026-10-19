import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const cache = new Map()

/**
 * Resolve a package that ships with the DeepSeek Harness installation rather
 * than with this plugin. A normal bare import is tried first; when the plugin
 * is linked from a workspace, Node cannot see the harness package table from
 * here, so the harness installation root is probed explicitly.
 */
export async function loadShipped(specifier) {
  const cached = cache.get(specifier)
  if (cached) return cached
  const pending = (async () => {
    const failures = []
    try {
      return await import(specifier)
    } catch (error) {
      failures.push(error)
    }
    for (const root of candidateRoots()) {
      try {
        const require = createRequire(path.join(root, 'package.json'))
        const resolved = require.resolve(specifier)
        return await import(pathToFileURL(resolved).href)
      } catch (error) {
        failures.push(error)
      }
      const direct = directManifest(specifier, root)
      if (direct) {
        try {
          return await import(pathToFileURL(direct).href)
        } catch (error) {
          failures.push(error)
        }
      }
    }
    const detail = failures.map((error) => String(error?.message ?? error)).filter(Boolean).slice(-3).join(' | ')
    throw new Error(`cannot resolve harness package ${specifier}${detail ? `: ${detail}` : ''}`)
  })()
  cache.set(specifier, pending)
  return pending
}

function candidateRoots() {
  const roots = new Set()
  const add = (value) => {
    if (!value) return
    const normalized = path.resolve(value)
    if (!roots.has(normalized)) roots.add(normalized)
  }
  const resources = process.resourcesPath
  if (resources) {
    add(path.join(resources, 'app.asar', 'dsh'))
    add(path.join(resources, 'app.asar'))
    add(path.join(resources, 'app', 'dsh'))
  }
  const argv = process.argv.join(' ')
  for (const match of argv.matchAll(/([A-Za-z]:\\[^"']*?app\.asar[\\/](?:dsh|node_modules)[^"']*)/gi)) {
    const value = match[1].replace(/[\\/]node_modules.*$/i, '')
    add(value.replace(/[\\/](?:lib|dist)[\\/].*$/i, ''))
  }
  for (const match of argv.matchAll(/([A-Za-z]:\\[^"']*?[\\/]dsh)[\\/](?:lib|dist|node_modules)/gi)) {
    add(match[1])
  }
  if (process.execPath) {
    add(path.join(path.dirname(process.execPath), 'resources', 'app.asar', 'dsh'))
  }
  add(process.env.DSH_INSTALL_DIR)
  return [...roots]
}

function directManifest(specifier, root) {
  const packageDir = path.join(root, 'node_modules', ...specifier.split('/'))
  const manifestPath = path.join(packageDir, 'package.json')
  if (!fs.existsSync(manifestPath)) return undefined
  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch {
    return undefined
  }
  const entry = pickEntry(manifest.exports?.['.']) ?? manifest.module ?? manifest.main ?? 'index.js'
  if (typeof entry !== 'string') return undefined
  return path.join(packageDir, entry)
}

function pickEntry(value) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  return pickEntry(value.import) ?? pickEntry(value.default) ?? pickEntry(value.require)
}
