import { spawn } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import http from 'node:http'
import net from 'node:net'
import path from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const MAX_LOG_LINES = 400
const LOOPBACKS = new Set(['DIRECT', 'REJECT', 'REJECT-DROP', 'PASS', 'PASS-RULE', 'COMPATIBLE'])

export class MihomoCore {
  constructor(options) {
    this.rootDir = options.rootDir
    this.dataDir = options.dataDir
    this.runtimeDir = path.join(options.dataDir, 'runtime')
    this.logPath = path.join(this.runtimeDir, 'core.log')
    this.config = options.config ?? {}
    this.mixedPort = Number(this.config.mixedPort) || 17890
    this.controllerPort = Number(this.config.controllerPort) || 17891
    this.secret = options.secret || ''
    this.mode = 'rule'
    this.logLevel = this.config.logLevel || 'info'
    this.delayTestUrl = this.config.delayTestUrl || 'https://www.gstatic.com/generate_204'
    this.onExit = options.onExit
    this.onLog = options.onLog
    this.child = null
    this.stopping = false
    this.logs = []
    this.logStream = null
    this.stats = { up: 0, down: 0, upTotal: 0, downTotal: 0, lastTick: 0 }
    this.startedAt = 0
    this.version = null
    this.trafficRequest = null
    this.trafficTimer = null
    this.delayCache = new Map()
    this.ready = false
  }

  get running() {
    return Boolean(this.child && this.child.exitCode === null && !this.child.killed)
  }

  async resolveBinary() {
    if (this.config.corePath) {
      const configured = path.resolve(this.config.corePath)
      if (fs.existsSync(configured)) return configured
      throw new Error(`配置的 mihomo 核心不存在: ${configured}`)
    }
    const platform = process.platform
    const names = platform === 'win32'
      ? ['mihomo.exe']
      : platform === 'darwin'
        ? ['mihomo', 'mihomo-darwin']
        : ['mihomo', 'mihomo-linux']
    for (const name of names) {
      const candidate = path.join(this.rootDir, 'bin', name)
      try {
        await fsp.access(candidate, fs.constants.X_OK)
        return candidate
      } catch {}
    }
    throw new Error(`未找到内置 mihomo 核心（${platform}）。请在插件配置中用 corePath 指定。`)
  }

  log(line) {
    const text = String(line ?? '').replace(/\r$/, '')
    if (!text) return
    const stamped = `${new Date().toISOString()} ${text}`
    this.logs.push(stamped)
    if (this.logs.length > MAX_LOG_LINES) this.logs.splice(0, this.logs.length - MAX_LOG_LINES)
    this.onLog?.(text)
    if (this.logStream) {
      try { this.logStream.write(`${stamped}\n`) } catch {}
    }
  }

  tail(count = 20) {
    return this.logs.slice(-count)
  }

  async ensureDirs() {
    await fsp.mkdir(this.runtimeDir, { recursive: true })
    await fsp.mkdir(path.join(this.dataDir, 'profiles'), { recursive: true })
    if (!this.logStream) {
      this.logStream = fs.createWriteStream(this.logPath, { flags: 'a' })
      this.logStream.on('error', () => { this.logStream = null })
    }
  }

  async copyGeoData() {
    const assets = [
      ['GeoIP.dat', 'GeoIP.dat'],
      ['GeoSite.dat', 'GeoSite.dat'],
      ['ASN.mmdb', 'ASN.mmdb'],
      ['geoip.metadb', 'geoip.metadb'],
    ]
    for (const [source, target] of assets) {
      const from = path.join(this.rootDir, 'data', source)
      const to = path.join(this.dataDir, target)
      try {
        const fromStat = await fsp.stat(from)
        let targetStat = null
        try { targetStat = await fsp.stat(to) } catch {}
        if (targetStat && targetStat.size === fromStat.size) continue
        await fsp.copyFile(from, to)
      } catch (error) {
        this.log(`geodata ${source} unavailable: ${String(error?.message ?? error)}`)
      }
    }
  }

  async portAvailable(port) {
    return await new Promise((resolve) => {
      const server = net.createServer()
      server.unref()
      server.once('error', () => resolve(false))
      server.listen({ port, host: '127.0.0.1' }, () => server.close(() => resolve(true)))
    })
  }

  async choosePort(preferred) {
    const start = Number(preferred) || 17890
    for (let port = start; port < start + 40; port += 1) {
      if (port > 65535) break
      if (await this.portAvailable(port)) return port
    }
    throw new Error(`没有可用的本地端口（从 ${start} 起）`)
  }

  buildConfig(profile, mode = 'rule') {
    const source = profile && typeof profile === 'object' ? structuredClone(profile) : {}
    const removed = [
      'tun', 'port', 'socks-port', 'redir-port', 'tproxy-port', 'mixed-port',
      'external-controller', 'external-controller-tls', 'external-controller-unix',
      'external-controller-pipe', 'external-ui', 'interface-name', 'routing-mark',
      'iptables', 'ebpf', 'auto-redir', 'auto-route', 'auto-detect-interface',
      'dns-hijack',
    ]
    for (const key of removed) delete source[key]
    source['mixed-port'] = this.mixedPort
    source['allow-lan'] = false
    source['bind-address'] = '127.0.0.1'
    source['mode'] = mode
    source['log-level'] = this.logLevel
    source['external-controller'] = `127.0.0.1:${this.controllerPort}`
    source['secret'] = this.secret
    source['profile'] = { ...(source.profile && typeof source.profile === 'object' ? source.profile : {}), 'store-selected': true }
    source['geo-auto-update'] = false

    const proxies = Array.isArray(source.proxies) ? source.proxies : []
    const providerNames = source['proxy-providers'] && typeof source['proxy-providers'] === 'object'
      ? Object.keys(source['proxy-providers'])
      : []
    const groups = Array.isArray(source['proxy-groups']) ? source['proxy-groups'] : []
    const names = proxies.map((proxy) => proxy?.name).filter((name) => typeof name === 'string' && name.length > 0)

    if (groups.length === 0) {
      if (names.length > 0) {
        source['proxy-groups'] = [{ name: 'PROXY', type: 'select', proxies: [...names, 'DIRECT'] }]
      } else if (providerNames.length > 0) {
        source['proxy-groups'] = [{ name: 'PROXY', type: 'select', use: providerNames }]
      }
    }

    const finalGroups = Array.isArray(source['proxy-groups']) ? source['proxy-groups'] : []
    const groupNames = finalGroups.map((group) => group?.name).filter((name) => typeof name === 'string' && name.length > 0)
    const target = groupNames.includes('PROXY') ? 'PROXY' : groupNames[0] || 'DIRECT'
    const rules = Array.isArray(source.rules) ? source.rules.filter((rule) => typeof rule === 'string' && rule.trim()) : []
    if (rules.length === 0) {
      source.rules = target !== 'DIRECT'
        ? [
            'GEOSITE,private,DIRECT',
            'GEOSITE,cn,DIRECT',
            `MATCH,${target}`,
          ]
        : ['MATCH,DIRECT']
    } else {
      source.rules = rules
    }
    return source
  }

  async writeConfig(profile, mode = 'rule') {
    await this.ensureDirs()
    const config = this.buildConfig(profile, mode)
    const configPath = path.join(this.runtimeDir, 'config.yaml')
    const text = JSON.stringify(config, null, 2)
    await fsp.writeFile(configPath, text, 'utf8')
    return { config, configPath }
  }

  async start(profile, options = {}) {
    if (this.running) await this.stop()
    this.stopping = false
    this.ready = false
    this.mode = options.mode || 'rule'
    this.delayTestUrl = options.delayTestUrl || this.delayTestUrl
    await this.ensureDirs()
    await this.copyGeoData()
    const binary = await this.resolveBinary()
    this.mixedPort = await this.choosePort(Number(this.config.mixedPort) || 17890)
    this.controllerPort = await this.choosePort(Number(this.config.controllerPort) || this.mixedPort + 1)
    while (this.controllerPort === this.mixedPort) {
      this.controllerPort = await this.choosePort(this.controllerPort + 1)
    }
    this.secret = options.secret || this.secret || ''
    const { configPath } = await this.writeConfig(profile, this.mode)
    this.log(`starting core on mixed :${this.mixedPort}, controller :${this.controllerPort}`)
    const args = [
      '-d', this.dataDir,
      '-f', configPath,
      '-ext-ctl', `127.0.0.1:${this.controllerPort}`,
      '-secret', this.secret,
    ]
    const child = spawn(binary, args, {
      cwd: this.dataDir,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    this.child = child
    this.startedAt = Date.now()
    this.stats = { up: 0, down: 0, upTotal: 0, downTotal: 0, lastTick: Date.now() }
    this.delayCache.clear()
    const consume = (stream, level) => {
      stream.setEncoding('utf8')
      let buffer = ''
      stream.on('data', (chunk) => {
        buffer += chunk
        let index
        while ((index = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, index)
          buffer = buffer.slice(index + 1)
          if (line.trim()) this.log(`${level} ${line}`)
        }
      })
      stream.on('end', () => {
        if (buffer.trim()) this.log(`${level} ${buffer}`)
      })
    }
    consume(child.stdout, 'core')
    consume(child.stderr, 'core!')
    child.on('error', (error) => {
      this.log(`core spawn error: ${String(error?.message ?? error)}`)
    })
    child.on('exit', (code, signal) => {
      this.log(`core exited code=${code ?? 'null'} signal=${signal ?? 'null'}`)
      const wasRunning = this.running
      this.ready = false
      this.child = null
      this._stopTraffic()
      if (!this.stopping) {
        this.onExit?.({ code, signal })
      }
      if (wasRunning && !this.stopping) this.log('core stopped unexpectedly')
    })
    try {
      this.version = await this.waitForApi(30000)
      this.ready = true
      this.log(`core ready ${this.version?.version ?? ''}`)
      if (this.mode !== 'rule') await this.setMode(this.mode)
      this._startTraffic()
      return { mixedPort: this.mixedPort, controllerPort: this.controllerPort, version: this.version?.version ?? null }
    } catch (error) {
      await this.stop()
      throw error
    }
  }

  async waitForApi(timeoutMs = 15000) {
    const deadline = Date.now() + timeoutMs
    let lastError = null
    while (Date.now() < deadline) {
      if (!this.running) {
        throw new Error(`mihomo 核心启动失败：${this.tail(6).join(' / ') || '进程已退出'}`)
      }
      try {
        return await this.api('GET', '/version', undefined, 1200)
      } catch (error) {
        lastError = error
      }
      await delay(250)
    }
    throw new Error(`mihomo 控制接口在 ${Math.round(timeoutMs / 1000)} 秒内未就绪：${String(lastError?.message ?? lastError ?? '')}`)
  }

  async stop() {
    this.stopping = true
    this.ready = false
    this._stopTraffic()
    const child = this.child
    this.child = null
    if (child && child.exitCode === null) {
      try { child.kill() } catch {}
      const deadline = Date.now() + 2500
      while (child.exitCode === null && Date.now() < deadline) await delay(100)
      if (child.exitCode === null) {
        await new Promise((resolve) => {
          try {
            const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' })
            killer.on('exit', resolve)
            killer.on('error', resolve)
          } catch { resolve() }
        })
      }
    }
    this.version = null
    this.startedAt = 0
    this.stats = { up: 0, down: 0, upTotal: 0, downTotal: 0, lastTick: 0 }
    this.logStream?.end()
    this.logStream = null
    this.stopping = false
  }

  async dispose() {
    await this.stop()
    this.logs = []
  }

  api(method, requestPath, body, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const payload = body === undefined ? null : Buffer.from(JSON.stringify(body))
      const headers = { Accept: 'application/json' }
      if (this.secret) headers.Authorization = `Bearer ${this.secret}`
      if (payload) {
        headers['Content-Type'] = 'application/json'
        headers['Content-Length'] = String(payload.length)
      }
      const request = http.request({
        host: '127.0.0.1',
        port: this.controllerPort,
        path: requestPath,
        method,
        headers,
        timeout: timeoutMs,
      }, (response) => {
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          if (response.statusCode && response.statusCode >= 400) {
            let message = text
            try { message = JSON.parse(text)?.message ?? text } catch {}
            reject(new Error(`mihomo API ${response.statusCode}: ${message || requestPath}`))
            return
          }
          if (!text) return resolve(null)
          try { resolve(JSON.parse(text)) } catch { resolve(text) }
        })
      })
      request.on('timeout', () => request.destroy(new Error('mihomo API timeout')))
      request.on('error', reject)
      if (payload) request.write(payload)
      request.end()
    })
  }

  async getVersion() {
    return await this.api('GET', '/version')
  }

  async getConfigs() {
    return await this.api('GET', '/configs')
  }

  async setMode(mode) {
    if (!['rule', 'global', 'direct'].includes(mode)) throw new Error(`unknown mode: ${mode}`)
    await this.api('PATCH', '/configs', { mode })
    this.mode = mode
  }

  async select(group, name) {
    await this.api('PUT', `/proxies/${encodeURIComponent(group)}`, { name })
  }

  async testNode(name, timeout = 5000) {
    const url = encodeURIComponent(this.delayTestUrl)
    const result = await this.api('GET', `/proxies/${encodeURIComponent(name)}/delay?timeout=${timeout}&url=${url}`, undefined, timeout + 5000)
    const value = Number(result?.delay)
    if (Number.isFinite(value) && value > 0) this.delayCache.set(name, value)
    return Number.isFinite(value) ? value : 0
  }

  async testGroup(name, timeout = 5000) {
    const url = encodeURIComponent(this.delayTestUrl)
    const result = await this.api('GET', `/group/${encodeURIComponent(name)}/delay?timeout=${timeout}&url=${url}`, undefined, timeout + 25000)
    const out = {}
    if (result && typeof result === 'object') {
      for (const [node, value] of Object.entries(result)) {
        const numeric = Number(value)
        if (Number.isFinite(numeric) && numeric > 0) {
          out[node] = numeric
          this.delayCache.set(node, numeric)
        } else {
          out[node] = 0
          this.delayCache.delete(node)
        }
      }
    }
    return out
  }

  async testAll(groups) {
    const targets = Array.isArray(groups) && groups.length > 0
      ? groups
      : (await this.snapshotProxies()).groups.filter((group) => group.name !== 'GLOBAL').map((group) => group.name)
    const results = {}
    const errors = {}
    let cursor = 0
    const worker = async () => {
      for (;;) {
        const index = cursor++
        if (index >= targets.length) return
        const name = targets[index]
        try {
          results[name] = await this.testGroup(name)
        } catch (error) {
          errors[name] = String(error?.message ?? error)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, targets.length) }, () => worker()))
    return { results, errors }
  }

  async snapshotProxies() {
    const data = await this.api('GET', '/proxies')
    const proxies = data?.proxies && typeof data.proxies === 'object' ? data.proxies : {}
    const groups = []
    for (const [name, proxy] of Object.entries(proxies)) {
      if (!proxy || !Array.isArray(proxy.all)) continue
      if (LOOPBACKS.has(name) || name === 'COMPATIBLE') continue
      const nodes = proxy.all.map((childName) => {
        const child = proxies[childName]
        const history = Array.isArray(child?.history) ? child.history[child.history.length - 1] : null
        const lastDelay = Number(history?.delay)
        const delay = this.delayCache.get(childName) ?? (Number.isFinite(lastDelay) && lastDelay > 0 ? lastDelay : undefined)
        return {
          name: childName,
          type: child?.type ?? 'Unknown',
          delay: delay ?? null,
          alive: child?.alive !== false,
          selected: proxy.now === childName,
          group: Array.isArray(child?.all),
        }
      })
      groups.push({
        name,
        type: proxy.type ?? 'Selector',
        now: proxy.now ?? null,
        testable: !['Relay'].includes(proxy.type) && nodes.length > 0,
        nodes,
      })
    }
    groups.sort((left, right) => {
      const rank = (name) => name === 'PROXY' ? 0 : name === 'GLOBAL' ? 2 : 1
      return rank(left.name) - rank(right.name) || left.name.localeCompare(right.name)
    })
    return { groups, mode: this.mode, delayTestUrl: this.delayTestUrl }
  }

  _startTraffic() {
    this._stopTraffic()
    if (!this.running) return
    const request = http.request({
      host: '127.0.0.1',
      port: this.controllerPort,
      path: '/traffic',
      method: 'GET',
      headers: this.secret ? { Authorization: `Bearer ${this.secret}` } : {},
    }, (response) => {
      if (response.statusCode !== 200) {
        response.resume()
        this._scheduleTrafficRestart()
        return
      }
      response.setEncoding('utf8')
      let buffer = ''
      response.on('data', (chunk) => {
        buffer += chunk
        let index
        while ((index = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, index)
          buffer = buffer.slice(index + 1)
          if (!line.trim()) continue
          try {
            const frame = JSON.parse(line)
            const now = Date.now()
            const seconds = Math.max(0, (now - (this.stats.lastTick || now)) / 1000)
            const up = Number(frame.up) || 0
            const down = Number(frame.down) || 0
            this.stats.up = up
            this.stats.down = down
            this.stats.upTotal += up * seconds
            this.stats.downTotal += down * seconds
            this.stats.lastTick = now
          } catch {}
        }
      })
      response.on('end', () => this._scheduleTrafficRestart())
      response.on('error', () => this._scheduleTrafficRestart())
    })
    request.on('error', () => this._scheduleTrafficRestart())
    request.end()
    this.trafficRequest = request
  }

  _scheduleTrafficRestart() {
    if (this.trafficTimer || this.stopping || !this.running) return
    this.trafficTimer = setTimeout(() => {
      this.trafficTimer = null
      if (!this.stopping && this.running) this._startTraffic()
    }, 2000)
  }

  _stopTraffic() {
    if (this.trafficTimer) {
      clearTimeout(this.trafficTimer)
      this.trafficTimer = null
    }
    if (this.trafficRequest) {
      try { this.trafficRequest.destroy() } catch {}
      this.trafficRequest = null
    }
    this.stats.up = 0
    this.stats.down = 0
    this.stats.lastTick = 0
  }
}
