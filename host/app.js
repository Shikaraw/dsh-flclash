import crypto from 'node:crypto'
import fsp from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load as parseYaml } from '../vendor/js-yaml.mjs'
import { loadShipped } from './shipped.js'
import { MihomoCore } from './mihomo.js'

const HOST_DIR = path.dirname(fileURLToPath(import.meta.url))
const PACKAGE_DIR = path.resolve(HOST_DIR, '..')
const ICON_PATH = path.join(PACKAGE_DIR, 'icon.png')
const DEFAULT_SETTINGS = {
  autoStart: true,
  takeOverDsh: true,
  mode: 'rule',
  delayTestUrl: 'https://www.gstatic.com/generate_204',
}
const PROFILE_NAME_LIMIT = 80

export class FlClashHost {
  constructor(ctx, config = {}) {
    this.ctx = ctx
    this.config = config && typeof config === 'object' ? { ...config } : {}
    this.packageDir = PACKAGE_DIR
    this.dataDir = this.config.dataDir
      ? path.resolve(String(this.config.dataDir))
      : path.join(process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), 'flclash-plugin')
    this.statePath = path.join(this.dataDir, 'state.json')
    this.state = this.defaultState()
    this.core = null
    this.ready = null
    this.disposed = false
    this.loaded = false
    this.starting = false
    this.lastError = null
    this.proxyDispose = null
    this.dshProxyError = null
    this.dshProxyRoute = false
    this.startedAt = 0
    this.proxyInfo = { mixedPort: null, controllerPort: null, version: null }
    this.reloadChain = Promise.resolve()
    this.iconCache = null
  }

  defaultState() {
    return {
      version: 1,
      settings: { ...DEFAULT_SETTINGS, ...pickSettings(this.config) },
      activeProfileId: null,
      profiles: [],
    }
  }

  log(message) {
    try { this.ctx.logger?.info?.(`[flclash] ${message}`) } catch {}
  }

  async init() {
    await this.loadState()
    this.loaded = true
    this.exitHandler = () => {
      try { this.core?.child?.kill() } catch {}
    }
    process.once('exit', this.exitHandler)
    if (this.state.settings.autoStart && this.state.activeProfileId) {
      this.ensureRunning().catch((error) => {
        this.lastError = errorText(error)
        this.log(`auto start failed: ${this.lastError}`)
      })
    }
  }

  async loadState() {
    await fsp.mkdir(this.dataDir, { recursive: true })
    await fsp.mkdir(path.join(this.dataDir, 'profiles'), { recursive: true })
    try {
      const raw = await fsp.readFile(this.statePath, 'utf8')
      const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
      if (parsed && typeof parsed === 'object') {
        this.state = {
          version: 1,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {}) },
          activeProfileId: typeof parsed.activeProfileId === 'string' ? parsed.activeProfileId : null,
          profiles: Array.isArray(parsed.profiles) ? parsed.profiles.filter(isProfileRecord) : [],
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') this.log(`state read failed: ${errorText(error)}`)
    }
    const settings = this.state.settings
    if (!['rule', 'global', 'direct'].includes(settings.mode)) settings.mode = 'rule'
    if (!this.state.profiles.some((profile) => profile.id === this.state.activeProfileId)) {
      this.state.activeProfileId = null
    }
    this.secret = this.state.secret || crypto.randomBytes(18).toString('hex')
    this.state.secret = this.secret
    this.core = new MihomoCore({
      rootDir: this.packageDir,
      dataDir: this.dataDir,
      config: {
        ...this.config,
        delayTestUrl: settings.delayTestUrl,
      },
      secret: this.secret,
      onExit: () => this.handleCoreExit(),
      onLog: (line) => {
        if (/error|fatal|failed/i.test(line)) this.log(line)
      },
    })
  }

  async saveState() {
    await fsp.mkdir(this.dataDir, { recursive: true })
    const temp = `${this.statePath}.tmp`
    await fsp.writeFile(temp, JSON.stringify(this.state, null, 2), 'utf8')
    await fsp.rename(temp, this.statePath)
  }

  settings() {
    return { ...DEFAULT_SETTINGS, ...this.state.settings }
  }

  activeProfile() {
    return this.state.profiles.find((profile) => profile.id === this.state.activeProfileId) ?? null
  }

  profilePath(profile) {
    return path.join(this.dataDir, 'profiles', `${profile.id}.yaml`)
  }

  async readProfileText(profile = this.activeProfile()) {
    if (!profile) throw new Error('尚未选择配置')
    try {
      return await fsp.readFile(this.profilePath(profile), 'utf8')
    } catch (error) {
      throw new Error(`读取配置失败：${errorText(error)}`)
    }
  }

  async ensureRunning() {
    if (this.disposed) throw new Error('插件已卸载')
    if (this.starting) return await this.ready
    if (this.core?.running) {
      if (!this.core.ready) await this.core.waitForApi(30000)
      await this.syncDshProxy()
      return this.status()
    }
    const profile = this.activeProfile()
    if (!profile) throw new Error('尚未导入配置，请先在“配置”中添加订阅或粘贴 YAML')
    this.starting = true
    this.lastError = null
    this.ready = (async () => {
      try {
        const text = await this.readProfileText(profile)
        const parsed = this.parseProfile(text)
        const settings = this.settings()
        const info = await this.core.start(parsed.data, {
          mode: settings.mode,
          delayTestUrl: settings.delayTestUrl,
        })
        this.proxyInfo = info
        this.startedAt = Date.now()
        await this.syncDshProxy()
        this.log(`core running mixed=${info.mixedPort} controller=${info.controllerPort}`)
        return this.status()
      } catch (error) {
        this.lastError = errorText(error)
        this.log(`start failed: ${this.lastError}`)
        await this.stopCore({ keepError: true })
        throw error
      } finally {
        this.starting = false
      }
    })()
    return await this.ready
  }

  async stopCore(options = {}) {
    await this.disposeDshProxy()
    try { await this.core?.stop() } catch (error) { this.log(`stop failed: ${errorText(error)}`) }
    this.proxyInfo = { mixedPort: null, controllerPort: null, version: null }
    this.startedAt = 0
    if (!options.keepError) this.lastError = null
  }

  async handleCoreExit() {
    this.proxyInfo = { mixedPort: null, controllerPort: null, version: null }
    this.startedAt = 0
    await this.disposeDshProxy()
    if (!this.disposed) this.lastError = 'mihomo 核心已退出'
  }

  async syncDshProxy() {
    const settings = this.settings()
    const should = Boolean(this.core?.running && this.core.ready && settings.takeOverDsh)
    if (!should) {
      await this.disposeDshProxy()
      return
    }
    if (this.proxyDispose) return
    try {
      const mod = await loadShipped('@deepseek-ai/dsh-http-proxy')
      if (typeof mod.installProxyFromEnvironment !== 'function') {
        throw new Error('@deepseek-ai/dsh-http-proxy 没有导出 installProxyFromEnvironment')
      }
      const proxyUrl = `http://127.0.0.1:${this.core.mixedPort}`
      const inheritedNoProxy = [process.env.NO_PROXY, process.env.no_proxy].filter(Boolean).join(',')
      const noProxy = [inheritedNoProxy, 'localhost', '127.0.0.1', '::1', '[::1]'].filter(Boolean).join(',')
      const values = new Map([
        ['HTTP_PROXY', proxyUrl],
        ['HTTPS_PROXY', proxyUrl],
        ['NO_PROXY', noProxy],
      ])
      const env = {
        get(name) {
          return values.has(name) ? { value: values.get(name) } : undefined
        },
      }
      this.proxyDispose = await mod.installProxyFromEnvironment(env, (message) => this.log(`proxy: ${message}`))
      this.dshProxyError = null
      try {
        this.dshProxyRoute = mod.proxyRouteFor?.(new URL('https://example.com'))?.proxied === true
      } catch {
        this.dshProxyRoute = true
      }
      this.log(`DSH proxy installed -> ${proxyUrl}`)
    } catch (error) {
      this.dshProxyError = errorText(error)
      this.dshProxyRoute = false
      this.log(`DSH proxy install failed: ${this.dshProxyError}`)
    }
  }

  async disposeDshProxy() {
    if (!this.proxyDispose) {
      this.dshProxyRoute = false
      return
    }
    try { await this.proxyDispose() } catch (error) { this.log(`proxy dispose failed: ${errorText(error)}`) }
    this.proxyDispose = null
    this.dshProxyRoute = false
  }

  async dispose() {
    this.disposed = true
    if (this.exitHandler) {
      try { process.removeListener('exit', this.exitHandler) } catch {}
      this.exitHandler = null
    }
    await this.disposeDshProxy()
    try { await this.core?.dispose() } catch {}
    if (this.loaded) {
      try { await this.saveState() } catch {}
    }
  }

  parseProfile(text) {
    let data
    try {
      data = parseYaml(text)
    } catch (error) {
      throw new Error(`YAML 解析失败：${errorText(error)}`)
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('配置必须是一个 YAML 对象')
    }
    const proxies = Array.isArray(data.proxies) ? data.proxies : []
    const providers = data['proxy-providers'] && typeof data['proxy-providers'] === 'object' ? data['proxy-providers'] : null
    const groups = Array.isArray(data['proxy-groups']) ? data['proxy-groups'] : []
    if (proxies.length === 0 && !providers && groups.length === 0) {
      throw new Error('配置中没有 proxies / proxy-providers / proxy-groups，无法作为 Clash/Mihomo 配置使用')
    }
    const names = new Set()
    for (const proxy of proxies) {
      if (!proxy || typeof proxy !== 'object' || typeof proxy.name !== 'string' || !proxy.name.trim()) {
        throw new Error('proxies 中存在缺少 name 的节点')
      }
      if (names.has(proxy.name)) throw new Error(`节点名称重复：${proxy.name}`)
      names.add(proxy.name)
    }
    return {
      data,
      proxyCount: proxies.length,
      providerCount: providers ? Object.keys(providers).length : 0,
      groupCount: groups.length,
    }
  }

  async fetchSubscription(url) {
    let parsed
    try { parsed = new URL(url) } catch { throw new Error('订阅链接格式不正确') }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('订阅链接必须是 http(s)')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 30000)
    try {
      const response = await fetch(parsed, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'user-agent': 'FlClash-DSH/1.0',
          'accept': 'text/yaml, application/yaml, text/plain, */*',
        },
      })
      if (!response.ok) throw new Error(`订阅下载失败：HTTP ${response.status}`)
      const text = await response.text()
      if (!text.trim()) throw new Error('订阅返回了空内容')
      if (/^\s*</.test(text)) throw new Error('订阅返回了 HTML 页面，请检查链接是否需要登录或已失效')
      const decoded = maybeDecodeBase64(text)
      return decoded ?? text
    } catch (error) {
      if (error?.name === 'AbortError') throw new Error('订阅下载超时（30 秒）')
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  async addProfile(input = {}) {
    const name = cleanName(input.name)
    const content = typeof input.content === 'string' ? input.content.trim() : ''
    const url = typeof input.url === 'string' ? input.url.trim() : ''
    if (!content && !url) throw new Error('请填写订阅链接或粘贴 YAML 配置')
    let text = content
    let type = 'file'
    let sourceUrl = null
    if (url) {
      text = await this.fetchSubscription(url)
      type = 'url'
      sourceUrl = url
    }
    const parsed = this.parseProfile(text)
    const id = crypto.randomUUID()
    const profileName = name || (sourceUrl ? new URL(sourceUrl).hostname : `配置 ${this.state.profiles.length + 1}`)
    const profile = {
      id,
      name: profileName,
      type,
      url: sourceUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      proxyCount: parsed.proxyCount,
      groupCount: parsed.groupCount,
    }
    await fsp.writeFile(this.profilePath(profile), text, 'utf8')
    this.state.profiles.push(profile)
    if (!this.state.activeProfileId) {
      this.state.activeProfileId = id
      await this.saveState()
      if (this.settings().autoStart) {
        this.ensureRunning().catch((error) => { this.lastError = errorText(error) })
      }
    } else {
      await this.saveState()
    }
    return { profile: publicProfile(profile), activeId: this.state.activeProfileId }
  }

  async updateProfile(input = {}) {
    const profile = this.state.profiles.find((item) => item.id === input.id)
    if (!profile) throw new Error('配置不存在')
    let text
    if (typeof input.content === 'string' && input.content.trim()) {
      text = input.content.trim()
    } else if (profile.type === 'url' && profile.url) {
      text = await this.fetchSubscription(profile.url)
    } else {
      throw new Error('没有可更新的内容')
    }
    const parsed = this.parseProfile(text)
    await fsp.writeFile(this.profilePath(profile), text, 'utf8')
    profile.updatedAt = Date.now()
    profile.proxyCount = parsed.proxyCount
    profile.groupCount = parsed.groupCount
    if (typeof input.name === 'string' && input.name.trim()) profile.name = cleanName(input.name)
    await this.saveState()
    if (profile.id === this.state.activeProfileId && this.core?.running) {
      await this.reload()
    }
    return { profile: publicProfile(profile) }
  }

  async deleteProfile(input = {}) {
    const index = this.state.profiles.findIndex((item) => item.id === input.id)
    if (index < 0) throw new Error('配置不存在')
    const [profile] = this.state.profiles.splice(index, 1)
    try { await fsp.unlink(this.profilePath(profile)) } catch {}
    if (this.state.activeProfileId === profile.id) {
      await this.stopCore()
      this.state.activeProfileId = null
    }
    await this.saveState()
    return { activeId: this.state.activeProfileId }
  }

  async activateProfile(input = {}) {
    const profile = this.state.profiles.find((item) => item.id === input.id)
    if (!profile) throw new Error('配置不存在')
    this.state.activeProfileId = profile.id
    await this.saveState()
    if (this.core?.running) {
      await this.reload()
    } else if (this.settings().autoStart) {
      this.ensureRunning().catch((error) => { this.lastError = errorText(error) })
    }
    return { activeId: profile.id }
  }

  async reload() {
    if (this.starting && this.ready) {
      try { await this.ready } catch {}
    }
    const previous = this.reloadChain
    let release
    this.reloadChain = new Promise((resolve) => { release = resolve })
    await previous
    try {
      if (!this.core?.running && !this.starting) {
        if (this.settings().autoStart) await this.ensureRunning()
        return this.status()
      }
      await this.stopCore({ keepError: true })
      return await this.ensureRunning()
    } finally {
      release()
    }
  }

  async updateSettings(input = {}) {
    const next = { ...this.state.settings }
    if (typeof input.autoStart === 'boolean') next.autoStart = input.autoStart
    if (typeof input.takeOverDsh === 'boolean') next.takeOverDsh = input.takeOverDsh
    if (typeof input.mode === 'string' && ['rule', 'global', 'direct'].includes(input.mode)) next.mode = input.mode
    if (typeof input.delayTestUrl === 'string' && /^https?:\/\//.test(input.delayTestUrl)) next.delayTestUrl = input.delayTestUrl
    this.state.settings = next
    this.core.delayTestUrl = next.delayTestUrl
    await this.saveState()
    if (this.core.running) {
      if (next.mode !== this.core.mode) await this.core.setMode(next.mode)
      if (next.takeOverDsh) await this.syncDshProxy()
      else await this.disposeDshProxy()
    } else if (next.autoStart && this.state.activeProfileId) {
      this.ensureRunning().catch((error) => { this.lastError = errorText(error) })
    }
    return this.status()
  }

  async status() {
    const settings = this.settings()
    const profile = this.activeProfile()
    const running = Boolean(this.core?.running)
    return {
      running,
      starting: Boolean(running ? !this.core?.ready : this.starting),
      coreVersion: this.proxyInfo.version,
      mixedPort: running ? this.core.mixedPort : null,
      controllerPort: running ? this.core.controllerPort : null,
      mode: this.core?.mode ?? settings.mode,
      autoStart: settings.autoStart,
      takeOverDsh: settings.takeOverDsh,
      dshProxyActive: Boolean(this.proxyDispose),
      dshProxyRoute: this.dshProxyRoute,
      dshProxyError: this.dshProxyError,
      delayTestUrl: settings.delayTestUrl,
      activeProfileId: this.state.activeProfileId,
      activeProfileName: profile?.name ?? null,
      profilesCount: this.state.profiles.length,
      uptimeMs: running && this.startedAt ? Date.now() - this.startedAt : 0,
      up: this.core?.stats.up ?? 0,
      down: this.core?.stats.down ?? 0,
      upTotal: this.core?.stats.upTotal ?? 0,
      downTotal: this.core?.stats.downTotal ?? 0,
      lastError: this.lastError,
      platform: process.platform,
      dataDir: this.dataDir,
      logs: this.core?.tail(30) ?? [],
    }
  }

  async dispatch(action, payload = {}) {
    switch (action) {
      case 'status':
        return await this.status()
      case 'profiles.list':
        return {
          activeId: this.state.activeProfileId,
          profiles: this.state.profiles.map((profile) => publicProfile(profile, this.state.activeProfileId)),
        }
      case 'profiles.read': {
        const profile = this.state.profiles.find((item) => item.id === payload.id)
        if (!profile) throw new Error('配置不存在')
        const content = await this.readProfileText(profile)
        return { profile: publicProfile(profile, this.state.activeProfileId), content }
      }
      case 'profiles.add':
        return await this.addProfile(payload)
      case 'profiles.update':
        return await this.updateProfile(payload)
      case 'profiles.delete':
        return await this.deleteProfile(payload)
      case 'profiles.activate':
        return await this.activateProfile(payload)
      case 'core.start':
        await this.ensureRunning()
        return await this.status()
      case 'core.stop':
        await this.stopCore()
        return await this.status()
      case 'core.restart':
        await this.reload()
        return await this.status()
      case 'settings.update':
        return await this.updateSettings(payload)
      case 'proxies.list': {
        if (!this.core?.running) return { running: false, groups: [], mode: this.settings().mode, delayTestUrl: this.settings().delayTestUrl }
        if (!this.core.ready) {
          return {
            running: true,
            starting: true,
            groups: [],
            mode: this.settings().mode,
            delayTestUrl: this.settings().delayTestUrl,
          }
        }
        try {
          const data = await this.core.snapshotProxies()
          return { running: true, ...data }
        } catch (error) {
          return {
            running: true,
            groups: [],
            mode: this.settings().mode,
            delayTestUrl: this.settings().delayTestUrl,
            error: errorText(error),
          }
        }
      }
      case 'proxies.select': {
        if (!this.core?.running || !this.core.ready) throw new Error('核心正在启动，请稍候')
        if (!payload.group || !payload.name) throw new Error('缺少分组或节点')
        await this.core.select(String(payload.group), String(payload.name))
        const data = await this.core.snapshotProxies()
        return { running: true, ...data }
      }
      case 'proxies.test': {
        if (!this.core?.running || !this.core.ready) throw new Error('核心正在启动，请稍候')
        if (!payload.name) throw new Error('缺少节点名称')
        const delay = await this.core.testNode(String(payload.name), Number(payload.timeout) || 5000)
        return { name: payload.name, delay }
      }
      case 'proxies.testAll': {
        if (!this.core?.running || !this.core.ready) throw new Error('核心正在启动，请稍候')
        const groups = Array.isArray(payload.groups)
          ? payload.groups.map(String)
          : typeof payload.group === 'string' && payload.group
            ? [payload.group]
            : undefined
        const result = await this.core.testAll(groups)
        const snapshot = await this.core.snapshotProxies()
        return { running: true, ...snapshot, results: result.results, errors: result.errors }
      }
      case 'logs':
        return { logs: this.core?.tail(120) ?? [] }
      case 'ui.icon':
        return await this.iconDataUrl()
      default:
        throw new Error(`未知操作：${action}`)
    }
  }

  async iconDataUrl() {
    if (this.iconCache) return { dataUrl: this.iconCache }
    try {
      const data = await fsp.readFile(ICON_PATH)
      this.iconCache = `data:image/png;base64,${data.toString('base64')}`
    } catch {
      this.iconCache = ''
    }
    return { dataUrl: this.iconCache }
  }

  async handleRpc(payload) {
    try {
      if (!payload || typeof payload.action !== 'string') throw new Error('缺少 action')
      return { ok: true, value: await this.dispatch(payload.action, payload) }
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'flclash/error',
          message: errorText(error),
          details: {},
        },
      }
    }
  }
}

function pickSettings(config) {
  const out = {}
  if (typeof config.autoStart === 'boolean') out.autoStart = config.autoStart
  if (typeof config.takeOverDsh === 'boolean') out.takeOverDsh = config.takeOverDsh
  if (typeof config.mode === 'string' && ['rule', 'global', 'direct'].includes(config.mode)) out.mode = config.mode
  if (typeof config.delayTestUrl === 'string' && /^https?:\/\//.test(config.delayTestUrl)) out.delayTestUrl = config.delayTestUrl
  return out
}

function isProfileRecord(value) {
  return Boolean(value && typeof value === 'object' && typeof value.id === 'string' && typeof value.name === 'string')
}

function publicProfile(profile, activeId) {
  return {
    id: profile.id,
    name: profile.name,
    type: profile.type === 'url' ? 'url' : 'file',
    url: profile.url ?? null,
    createdAt: profile.createdAt ?? null,
    updatedAt: profile.updatedAt ?? null,
    proxyCount: profile.proxyCount ?? 0,
    groupCount: profile.groupCount ?? 0,
    active: profile.id === activeId,
  }
}

function cleanName(value) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, PROFILE_NAME_LIMIT)
}

function errorText(error) {
  return String(error?.message ?? error ?? 'unknown error')
}

function maybeDecodeBase64(text) {
  const trimmed = text.trim()
  if (!/^[A-Za-z0-9+/=\s]+$/.test(trimmed) || trimmed.length < 40) return undefined
  try {
    const decoded = Buffer.from(trimmed.replace(/\s+/g, ''), 'base64').toString('utf8')
    if (!decoded.includes(':') || !/(proxies|proxy-groups|proxy-providers)\s*:/.test(decoded)) return undefined
    return decoded
  } catch {
    return undefined
  }
}
