window.__ModuleLoader__.load({
  id: '@local/dsh-flclash',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState, useReducer } = React

    const NS = 'flclash'
    const POS_KEY = 'flclash.ball.position.v1'

    const zh = {
      appName: 'FlClash',
      appSubtitle: 'DSH 专用代理',
      tabOverview: '概览',
      tabProfiles: '配置',
      tabNodes: '节点',
      close: '关闭',
      refresh: '刷新',
      save: '保存',
      saving: '保存中…',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      update: '更新订阅',
      activate: '启用',
      active: '使用中',
      running: '运行中',
      starting: '启动中…',
      stopped: '已停止',
      error: '错误',
      noProfile: '尚未导入配置',
      takeOver: '接管 DSH 网络',
      takeOverHint: '只影响 DSH 进程及其子进程，不修改系统代理，也不启用 TUN。',
      core: '核心',
      mixedPort: '混合端口',
      mode: '路由模式',
      modeRule: '规则',
      modeGlobal: '全局',
      modeDirect: '直连',
      traffic: '实时流量',
      up: '上传',
      down: '下载',
      total: '累计',
      activeProfile: '当前配置',
      profilesCount: '个配置',
      noProfileHint: '导入 Clash / Mihomo 订阅或粘贴 YAML 配置后即可启动。',
      start: '启动',
      stop: '停止',
      restart: '重启',
      testAll: '一键测速',
      testing: '测速中…',
      test: '测速',
      noNodes: '暂无节点',
      noNodesHint: '核心未运行或当前配置没有可用节点。',
      group: '策略组',
      selectGroup: '选择策略组',
      nodes: '个节点',
      current: '当前',
      timeout: '超时',
      selectNode: '选择',
      addProfile: '添加配置',
      fromUrl: '订阅链接',
      fromYaml: '粘贴 YAML',
      nameLabel: '名称（可选）',
      namePlaceholder: '例如：机场订阅',
      urlLabel: '订阅链接',
      urlPlaceholder: 'https://example.com/subscribe?token=…',
      yamlLabel: 'YAML 配置',
      yamlPlaceholder: '粘贴完整的 Clash / Mihomo YAML 配置…',
      import: '导入',
      importing: '导入中…',
      profilesHint: '配置保存在本机 DSH 目录，不会上传到任何服务器。订阅下载走当前 DSH 网络。',
      noProfiles: '还没有任何配置',
      subscription: '订阅',
      local: '本地',
      updated: '更新于',
      editProfile: '编辑配置',
      editHint: '修改后保存会重新加载核心。',
      confirmDelete: '确认删除这个配置？',
      advanced: '高级设置',
      autoStart: '随 DSH 自动启动核心',
      delayTestUrl: '延迟测试地址',
      logs: '核心日志',
      showLogs: '查看日志',
      hideLogs: '收起日志',
      footer: '仅 DSH 流量 · 基于 mihomo 核心',
      firstRunTitle: '让 DSH 自动访问被墙站点',
      firstRunBody: '导入你的 Clash / Mihomo 订阅，选择节点后开启接管。其它应用完全不受影响。',
      firstRunCta: '去添加配置',
      coreNotRunning: '核心未运行',
      profileRequired: '请先导入一份配置',
      dshProxy: 'DSH 代理',
      dshProxyOn: '已接管',
      dshProxyOff: '未接管',
      dshProxyError: '接管失败',
      proxyError: 'DSH 代理接管失败',
      lastError: '最近错误',
      uptime: '运行时长',
      dataDir: '数据目录',
      saved: '已保存',
      imported: '配置已导入',
      activated: '已切换配置',
      deleted: '配置已删除',
      selected: '节点已切换',
      ok: '完成',
      requestFailed: '请求失败',
      emptyNodes: '核心已运行，但配置里没有可展示的策略组。',
      engineOff: '核心未运行',
      startFirst: '先启动核心',
      auto: '自动',
      manual: '手动',
      delayHint: '延迟测试会并发访问测试地址，可能产生少量流量。',
      loadFailed: '加载失败',
      noLogs: '暂无日志',
      allGroups: '全部策略组',
      retry: '重试',
      coreVersion: '核心版本',
      selectedNode: '选中节点',
      profileName: '配置名称',
      dshOnlyNote: '代理只注入当前 DSH 进程；操作系统、浏览器和其它应用不会改变。',
    }

    const en = {
      appName: 'FlClash',
      appSubtitle: 'Proxy for DSH only',
      tabOverview: 'Overview',
      tabProfiles: 'Profiles',
      tabNodes: 'Nodes',
      close: 'Close',
      refresh: 'Refresh',
      save: 'Save',
      saving: 'Saving…',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      update: 'Update',
      activate: 'Use',
      active: 'Active',
      running: 'Running',
      starting: 'Starting…',
      stopped: 'Stopped',
      error: 'Error',
      noProfile: 'No profile yet',
      takeOver: 'Route DSH traffic',
      takeOverHint: 'Only the DSH process and its children. No system proxy, no TUN.',
      core: 'Core',
      mixedPort: 'Mixed port',
      mode: 'Routing mode',
      modeRule: 'Rule',
      modeGlobal: 'Global',
      modeDirect: 'Direct',
      traffic: 'Live traffic',
      up: 'Up',
      down: 'Down',
      total: 'Total',
      activeProfile: 'Active profile',
      profilesCount: 'profiles',
      noProfileHint: 'Import a Clash / Mihomo subscription or paste YAML to start.',
      start: 'Start',
      stop: 'Stop',
      restart: 'Restart',
      testAll: 'Test all',
      testing: 'Testing…',
      test: 'Test',
      noNodes: 'No nodes',
      noNodesHint: 'The core is not running or this profile has no nodes.',
      group: 'Group',
      selectGroup: 'Select group',
      nodes: 'nodes',
      current: 'Current',
      timeout: 'Timeout',
      selectNode: 'Select',
      addProfile: 'Add profile',
      fromUrl: 'Subscription URL',
      fromYaml: 'Paste YAML',
      nameLabel: 'Name (optional)',
      namePlaceholder: 'e.g. Airport subscription',
      urlLabel: 'Subscription URL',
      urlPlaceholder: 'https://example.com/subscribe?token=…',
      yamlLabel: 'YAML profile',
      yamlPlaceholder: 'Paste a complete Clash / Mihomo YAML profile…',
      import: 'Import',
      importing: 'Importing…',
      profilesHint: 'Profiles stay in the local DSH folder. Subscription downloads use the current DSH network.',
      noProfiles: 'No profiles yet',
      subscription: 'Subscription',
      local: 'Local',
      updated: 'Updated',
      editProfile: 'Edit profile',
      editHint: 'Saving reloads the core.',
      confirmDelete: 'Delete this profile?',
      advanced: 'Advanced',
      autoStart: 'Start core with DSH',
      delayTestUrl: 'Latency test URL',
      logs: 'Core logs',
      showLogs: 'Show logs',
      hideLogs: 'Hide logs',
      footer: 'DSH-only traffic · powered by mihomo',
      firstRunTitle: 'Let DSH reach blocked sites',
      firstRunBody: 'Import your Clash / Mihomo subscription, pick a node, and turn on takeover. Other apps stay untouched.',
      firstRunCta: 'Add a profile',
      coreNotRunning: 'Core is not running',
      profileRequired: 'Import a profile first',
      dshProxy: 'DSH proxy',
      dshProxyOn: 'Active',
      dshProxyOff: 'Inactive',
      dshProxyError: 'Takeover failed',
      proxyError: 'DSH proxy takeover failed',
      lastError: 'Last error',
      uptime: 'Uptime',
      dataDir: 'Data directory',
      saved: 'Saved',
      imported: 'Profile imported',
      activated: 'Profile switched',
      deleted: 'Profile deleted',
      selected: 'Node selected',
      ok: 'Done',
      requestFailed: 'Request failed',
      emptyNodes: 'The core is running, but this profile exposes no groups.',
      engineOff: 'Core is not running',
      startFirst: 'Start the core first',
      auto: 'Auto',
      manual: 'Manual',
      delayHint: 'Latency tests hit the test URL concurrently and may use a little traffic.',
      loadFailed: 'Failed to load',
      noLogs: 'No logs yet',
      allGroups: 'All groups',
      retry: 'Retry',
      coreVersion: 'Core version',
      selectedNode: 'Selected node',
      profileName: 'Profile name',
      dshOnlyNote: 'The proxy is injected into the DSH process only; the OS, browsers and other apps are untouched.',
    }

    const dictionaries = { zh, en }

    const css = `
.fl-root{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:inherit;font-size:13px;line-height:1.45;color:var(--dsw-alias-label-primary)}
.fl-ball{position:fixed;width:54px;height:54px;border-radius:50%;padding:0;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-overlay);box-shadow:0 8px 26px rgba(15,23,42,.22),0 2px 8px rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;touch-action:none;transition:transform .16s ease,box-shadow .16s ease;user-select:none;-webkit-user-select:none;outline:none}
.fl-ball:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 12px 32px rgba(15,23,42,.28)}
.fl-ball:focus-visible{box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 35%,transparent),0 8px 26px rgba(15,23,42,.22)}
.fl-ball img{width:36px;height:36px;border-radius:50%;display:block;pointer-events:none;object-fit:cover}
.fl-ball-logo{width:100%;height:100%;border-radius:50%;background:linear-gradient(135deg,#6467f2,#2563a8);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;pointer-events:none}
.fl-head-placeholder{width:36px;height:36px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);display:flex;align-items:center;justify-content:center;flex:none}
.fl-ball-dot{position:absolute;right:1px;bottom:1px;width:13px;height:13px;border-radius:50%;border:2px solid var(--dsw-alias-bg-overlay);background:var(--dsw-alias-state-idle-primary);transition:background .2s ease}
.fl-ball-dot.on{background:var(--dsw-alias-state-success-primary);box-shadow:0 0 0 4px color-mix(in srgb,var(--dsw-alias-state-success-primary) 20%,transparent)}
.fl-ball-dot.starting{background:var(--dsw-alias-state-warn-primary);animation:fl-pulse 1.2s infinite}
.fl-ball-dot.err{background:var(--dsw-alias-state-error-primary)}
.fl-ball-badge{position:absolute;top:-5px;right:-7px;min-width:20px;height:16px;padding:0 4px;border-radius:8px;background:var(--dsw-alias-brand-primary);color:#fff;font-size:9px;font-weight:700;line-height:16px;text-align:center;letter-spacing:.02em;box-shadow:0 2px 6px rgba(15,23,42,.25)}
.fl-panel{position:fixed;width:430px;max-width:calc(100vw - 24px);max-height:calc(100vh - 88px);display:flex;flex-direction:column;pointer-events:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-overlay);box-shadow:0 24px 64px rgba(15,23,42,.28),0 4px 16px rgba(15,23,42,.12);overflow:hidden;animation:fl-pop .18s ease-out;transform-origin:bottom right}
.fl-panel-tall{height:min(700px,calc(100vh - 88px))}
.fl-head{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:linear-gradient(180deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 7%,var(--dsw-alias-bg-overlay)),var(--dsw-alias-bg-overlay));flex:none}
.fl-head img{width:36px;height:36px;border-radius:10px;display:block;object-fit:cover;box-shadow:0 2px 8px rgba(15,23,42,.14)}
.fl-head-text{flex:1;min-width:0}
.fl-title{font-size:15px;font-weight:700;letter-spacing:.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-head-actions{display:flex;align-items:center;gap:4px}
.fl-tabs{display:flex;gap:2px;padding:6px 8px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);flex:none}
.fl-tab{flex:1;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;font-weight:600;padding:7px 8px;border-radius:8px;cursor:pointer;transition:background .15s,color .15s}
.fl-tab:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.fl-tab.on{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-brand-primary);box-shadow:0 1px 3px rgba(15,23,42,.08)}
.fl-body{padding:12px;overflow:auto;flex:1;min-height:0;display:flex;flex-direction:column;gap:10px}
.fl-body > *{flex:none}
.fl-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1);padding:12px}
.fl-card.flat{padding:0;overflow:hidden}
.fl-row{display:flex;align-items:center;gap:10px}
.fl-grow{flex:1;min-width:0}
.fl-section-title{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-secondary);margin-bottom:8px}
.fl-item-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-muted{font-size:11px;color:var(--dsw-alias-label-secondary)}
.fl-tiny{font-size:10px;color:var(--dsw-alias-label-secondary)}
.fl-hero{display:flex;align-items:center;gap:12px}
.fl-hero-icon{width:44px;height:44px;border-radius:12px;background:var(--dsw-alias-bg-layer-2);display:flex;align-items:center;justify-content:center;flex:none;overflow:hidden}
.fl-hero-icon img{width:34px;height:34px;display:block;object-fit:cover;border-radius:8px}
.fl-status{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:700;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.fl-status .dot{width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary)}
.fl-status.on{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,transparent);color:var(--dsw-alias-state-success-primary)}
.fl-status.on .dot{background:var(--dsw-alias-state-success-primary)}
.fl-status.warn{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent);color:var(--dsw-alias-state-warn-primary)}
.fl-status.warn .dot{background:var(--dsw-alias-state-warn-primary)}
.fl-status.err{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 14%,transparent);color:var(--dsw-alias-state-error-primary)}
.fl-status.err .dot{background:var(--dsw-alias-state-error-primary)}
.fl-switch-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-layer-1)}
.fl-switch{position:relative;width:38px;height:22px;border-radius:999px;border:0;padding:0;background:var(--dsw-alias-state-idle-primary);cursor:pointer;flex:none;transition:background .18s ease;opacity:1}
.fl-switch:disabled{opacity:.45;cursor:not-allowed}
.fl-switch.on{background:var(--dsw-alias-brand-primary)}
.fl-switch-knob{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.3);transition:transform .18s ease}
.fl-switch.on .fl-switch-knob{transform:translateX(16px)}
.fl-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fl-stat{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:9px 10px;min-width:0}
.fl-stat .label{font-size:10px;color:var(--dsw-alias-label-secondary);margin-bottom:2px}
.fl-stat .value{font-size:13px;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:10px}
.fl-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:600;padding:6px 11px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;transition:filter .15s,background .15s;white-space:nowrap}
.fl-btn:hover{filter:brightness(.97)}
.fl-btn:disabled{opacity:.45;cursor:not-allowed}
.fl-btn.primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:#fff}
.fl-btn.ghost{background:transparent}
.fl-btn.danger{background:transparent;border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 50%,transparent);color:var(--dsw-alias-state-error-primary)}
.fl-btn.sm{padding:4px 8px;font-size:11px;border-radius:7px}
.fl-icon-btn{width:26px;height:26px;border-radius:7px;border:0;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none;padding:0}
.fl-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.fl-icon-btn:disabled{opacity:.4;cursor:not-allowed}
.fl-seg{display:flex;gap:4px;padding:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1)}
.fl-seg button{flex:1;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;font-weight:600;padding:5px 8px;border-radius:7px;cursor:pointer}
.fl-seg button.on{background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-brand-primary);box-shadow:0 1px 3px rgba(15,23,42,.1)}
.fl-field{display:flex;flex-direction:column;gap:5px;margin-top:10px}
.fl-field label{font-size:11px;font-weight:600;color:var(--dsw-alias-label-secondary)}
.fl-input,.fl-textarea,.fl-select{width:100%;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:7px 9px;outline:none;transition:border-color .15s,box-shadow .15s}
.fl-input:focus,.fl-textarea:focus,.fl-select:focus{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--dsw-alias-brand-primary) 18%,transparent)}
.fl-textarea{min-height:150px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Consolas,"Liberation Mono",monospace;font-size:11px;line-height:1.5}
.fl-select{appearance:none;padding-right:26px;background-image:linear-gradient(45deg,transparent 50%,var(--dsw-alias-label-secondary) 50%),linear-gradient(135deg,var(--dsw-alias-label-secondary) 50%,transparent 50%);background-position:calc(100% - 14px) 50%,calc(100% - 9px) 50%;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
.fl-banner{border-radius:10px;padding:8px 10px;font-size:11px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);display:flex;gap:8px;align-items:flex-start}
.fl-banner.err{border-color:color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 9%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-error-primary)}
.fl-banner.ok{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 9%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-success-primary)}
.fl-banner.warn{border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,var(--dsw-alias-bg-layer-1));color:var(--dsw-alias-state-warn-primary)}
.fl-profile{border:1px solid var(--dsw-alias-border-l1);border-radius:11px;background:var(--dsw-alias-bg-layer-1);padding:10px}
.fl-profile.active{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 55%,var(--dsw-alias-border-l1));box-shadow:inset 3px 0 0 var(--dsw-alias-brand-primary)}
.fl-radio{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:center;flex:none;color:#fff}
.fl-radio.on{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.fl-node{display:flex;align-items:center;gap:9px;padding:7px 9px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:background .12s,border-color .12s}
.fl-node:hover{background:var(--dsw-alias-bg-layer-2)}
.fl-node.on{background:color-mix(in srgb,var(--dsw-alias-brand-primary) 8%,transparent);border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 35%,transparent)}
.fl-node .name{font-size:12px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-node .type{font-size:9px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:4px;padding:1px 4px;flex:none}
.fl-delay{font-size:10px;font-weight:700;font-variant-numeric:tabular-nums;padding:2px 6px;border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);min-width:38px;text-align:center;flex:none}
.fl-delay.good{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 12%,transparent)}
.fl-delay.warn{color:var(--dsw-alias-state-warn-primary);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 14%,transparent)}
.fl-delay.bad{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent)}
.fl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:26px 12px;text-align:center;color:var(--dsw-alias-label-secondary)}
.fl-empty .fl-empty-icon{width:46px;height:46px;border-radius:14px;background:var(--dsw-alias-bg-layer-2);display:flex;align-items:center;justify-content:center}
.fl-empty .title{font-size:13px;font-weight:650;color:var(--dsw-alias-label-primary)}
.fl-empty .body{font-size:11px;max-width:280px}
.fl-logs{background:color-mix(in srgb,var(--dsw-alias-bg-base) 70%,#000 0%);border:1px solid var(--dsw-alias-border-l1);border-radius:9px;padding:8px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:10px;line-height:1.5;white-space:pre-wrap;word-break:break-all;max-height:150px;min-height:42px;overflow:auto;color:var(--dsw-alias-label-secondary)}
.fl-footer{padding:7px 12px;border-top:1px solid var(--dsw-alias-border-l1);font-size:10px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--dsw-alias-bg-layer-1);flex:none}
.fl-spin{width:12px;height:12px;border-radius:50%;border:2px solid color-mix(in srgb,currentColor 25%,transparent);border-top-color:currentColor;animation:fl-spin .7s linear infinite;display:inline-block;flex:none}
.fl-divider{height:1px;background:var(--dsw-alias-border-l1);margin:2px 0}
.fl-kv{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:11px;padding:2px 0}
.fl-kv .k{color:var(--dsw-alias-label-secondary)}
.fl-kv .v{font-weight:600;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62%}
.fl-scroll{overflow:auto;max-height:340px;display:flex;flex-direction:column;gap:2px}
@keyframes fl-pop{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes fl-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent)}50%{box-shadow:0 0 0 5px transparent}}
@keyframes fl-spin{to{transform:rotate(360deg)}}
`

    function icon(path, size = 16, extra = {}) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
        stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true, ...extra,
      }, ...path)
    }
    const Icons = {
      close: (s = 15) => icon([h('path', { key: 'a', d: 'M18 6 6 18' }), h('path', { key: 'b', d: 'm6 6 12 12' })], s),
      refresh: (s = 14) => icon([h('path', { key: 'a', d: 'M21 12a9 9 0 1 1-2.64-6.36' }), h('path', { key: 'b', d: 'M21 3v6h-6' })], s),
      play: (s = 13) => icon([h('path', { key: 'a', d: 'm8 5 11 7-11 7Z', fill: 'currentColor', stroke: 'none' })], s),
      stop: (s = 13) => icon([h('rect', { key: 'a', x: 6, y: 6, width: 12, height: 12, rx: 2, fill: 'currentColor', stroke: 'none' })], s),
      trash: (s = 13) => icon([h('path', { key: 'a', d: 'M3 6h18' }), h('path', { key: 'b', d: 'M8 6V4h8v2' }), h('path', { key: 'c', d: 'm5 6 1 14h12l1-14' }), h('path', { key: 'd', d: 'M10 11v5M14 11v5' })], s),
      check: (s = 12) => icon([h('path', { key: 'a', d: 'm20 6-11 11-5-5' })], s),
      bolt: (s = 13) => icon([h('path', { key: 'a', d: 'M13 2 3 14h7l-1 8 10-12h-7l1-8Z' })], s),
      plus: (s = 13) => icon([h('path', { key: 'a', d: 'M12 5v14M5 12h14' })], s),
      link: (s = 14) => icon([h('path', { key: 'a', d: 'M10 13a5 5 0 0 0 7.54.54l2-2a5 5 0 0 0-7.07-7.07l-1.1 1.1' }), h('path', { key: 'b', d: 'M14 11a5 5 0 0 0-7.54-.54l-2 2a5 5 0 0 0 7.07 7.07l1.1-1.1' })], s),
      file: (s = 14) => icon([h('path', { key: 'a', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z' }), h('path', { key: 'b', d: 'M14 2v6h6' })], s),
      shield: (s = 14) => icon([h('path', { key: 'a', d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z' })], s),
      globe: (s = 14) => icon([h('circle', { key: 'a', cx: 12, cy: 12, r: 9 }), h('path', { key: 'b', d: 'M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z' })], s),
      settings: (s = 14) => icon([h('circle', { key: 'a', cx: 12, cy: 12, r: 3 }), h('path', { key: 'b', d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.12.36.33.7.6 1 .3.3.7.44 1.1.4H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51.6Z' })], s),
    }

    function LogoMark({ size = 34 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 64 64', 'aria-hidden': true,
        style: { display: 'block', flex: 'none' },
      },
        h('rect', { x: 10, y: 7, width: 46, height: 13, rx: 6.5, fill: '#6366f1', transform: 'rotate(-30 33 32)' }),
        h('rect', { x: 18, y: 26, width: 36, height: 13, rx: 6.5, fill: '#2563a8', transform: 'rotate(-20 36 32)' }),
        h('circle', { cx: 33, cy: 51, r: 7.5, fill: '#4aa3df' }))
    }

    function useDictionary(ctx) {
      const [, force] = useReducer((x) => x + 1, 0)
      useEffect(() => {
        const locale = ctx.get?.('locale') ?? ctx.locale
        if (!locale?.subscribe) return
        return locale.subscribe(() => force())
      }, [ctx])
      let active = 'zh'
      try {
        const locale = ctx.get?.('locale') ?? ctx.locale
        active = locale?.getSnapshot?.().active ?? (String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en')
      } catch {
        active = String(navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'
      }
      const dict = dictionaries[active] ?? en
      return (key) => dict[key] ?? en[key] ?? key
    }

    async function call(action, payload = {}, timeout = 60000) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)
      try {
        const response = await fetch('/api/flclash', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action, ...payload }),
          signal: controller.signal,
        })
        let data = null
        try { data = await response.json() } catch {}
        if (!response.ok) throw new Error(data?.error?.message || `HTTP ${response.status}`)
        if (!data || data.ok !== true) throw new Error(data?.error?.message || 'Host API failed')
        return data.value
      } catch (error) {
        if (error?.name === 'AbortError') throw new Error('请求超时')
        throw error
      } finally {
        clearTimeout(timer)
      }
    }

    function initialPosition() {
      const fallback = { right: 22, bottom: 22 }
      try {
        const raw = localStorage.getItem(POS_KEY)
        if (!raw) return fallback
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return fallback
        return { right: Number(parsed.right) || 22, bottom: Number(parsed.bottom) || 22 }
      } catch {
        return fallback
      }
    }

    function clampPosition(pos) {
      const maxRight = Math.max(8, window.innerWidth - 62)
      const maxBottom = Math.max(8, window.innerHeight - 62)
      return {
        right: Math.min(Math.max(8, pos.right), maxRight),
        bottom: Math.min(Math.max(8, pos.bottom), maxBottom),
      }
    }

    function fmtRate(value) {
      const n = Number(value) || 0
      if (n < 1024) return `${n} B/s`
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10 * 1024 ? 1 : 0)} KB/s`
      return `${(n / (1024 * 1024)).toFixed(2)} MB/s`
    }

    function fmtBytes(value) {
      const n = Number(value) || 0
      if (n < 1024) return `${n} B`
      if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
      if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`
      return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }

    function fmtUptime(ms) {
      const total = Math.max(0, Math.floor(Number(ms) / 1000))
      const hours = Math.floor(total / 3600)
      const minutes = Math.floor((total % 3600) / 60)
      const seconds = total % 60
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m ${seconds}s`
      return `${seconds}s`
    }

    function delayClass(delay) {
      if (!delay) return 'bad'
      if (delay < 200) return 'good'
      if (delay < 600) return 'warn'
      return 'bad'
    }

    function delayText(delay, t) {
      return Number(delay) > 0 ? `${Math.round(Number(delay))} ms` : t('timeout')
    }

    function Segmented({ value, options, onChange }) {
      return h('div', { className: 'fl-seg' },
        options.map((option) => h('button', {
          key: option.value,
          type: 'button',
          className: value === option.value ? 'on' : '',
          onClick: () => onChange(option.value),
        }, option.label)))
    }

    function Switch({ checked, onChange, disabled, label }) {
      return h('button', {
        type: 'button',
        role: 'switch',
        'aria-checked': Boolean(checked),
        'aria-label': label,
        className: `fl-switch${checked ? ' on' : ''}`,
        disabled,
        onClick: () => onChange(!checked),
      }, h('span', { className: 'fl-switch-knob' }))
    }

    function StatusChip({ kind, label }) {
      return h('span', { className: `fl-status ${kind || ''}` }, h('span', { className: 'dot' }), label)
    }

    function Banner({ kind = 'warn', children }) {
      return h('div', { className: `fl-banner ${kind}` }, children)
    }

    function Overview({ t, status, profiles, onRefresh, onAction, busy, setTab, showAdvanced, setShowAdvanced, form, setForm, iconSrc }) {
      const running = Boolean(status?.running)
      const starting = Boolean(status?.starting)
      const statusKind = running ? 'on' : starting ? 'warn' : status?.lastError ? 'err' : ''
      const statusLabel = running ? t('running') : starting ? t('starting') : t('stopped')
      const profile = profiles.find((item) => item.id === status?.activeProfileId)
      const noProfile = !status?.activeProfileId
      return h(React.Fragment, null,
        noProfile ? h('div', { className: 'fl-card' },
          h('div', { className: 'fl-hero' },
            h('div', { className: 'fl-hero-icon' }, iconSrc ? h('img', { src: iconSrc, alt: '' }) : h(LogoMark, { size: 34 })),
            h('div', { className: 'fl-grow' },
              h('div', { className: 'fl-item-title' }, t('firstRunTitle')),
              h('div', { className: 'fl-muted', style: { marginTop: 2 } }, t('firstRunBody')))),
          h('div', { className: 'fl-actions' }, h('button', { className: 'fl-btn primary', onClick: () => setTab('profiles') }, Icons.plus(), t('firstRunCta'))))
          : null,
        h('div', { className: 'fl-switch-row' },
          h('div', { className: 'fl-grow' },
            h('div', { className: 'fl-row', style: { gap: 6 } },
              h('div', { className: 'fl-item-title' }, t('takeOver')),
              h(StatusChip, { kind: status?.dshProxyActive ? 'on' : '', label: status?.dshProxyActive ? t('dshProxyOn') : t('dshProxyOff') })),
            h('div', { className: 'fl-muted', style: { marginTop: 2 } }, t('takeOverHint'))),
          h(Switch, {
            checked: Boolean(status?.takeOverDsh),
            label: t('takeOver'),
            onChange: (value) => onAction('settings.update', { takeOverDsh: value }),
          })),
        h('div', { className: 'fl-hero' },
          h('div', { className: 'fl-hero-icon' }, iconSrc ? h('img', { src: iconSrc, alt: '' }) : h(LogoMark, { size: 34 })),
          h('div', { className: 'fl-grow' },
            h('div', { className: 'fl-row', style: { gap: 6 } },
              h('div', { className: 'fl-item-title' }, profile?.name || (running ? t('running') : t('noProfile'))),
              h(StatusChip, { kind: statusKind, label: statusLabel })),
            h('div', { className: 'fl-muted' }, running ? `${t('core')} ${status?.coreVersion || ''} · ${t('uptime')} ${fmtUptime(status?.uptimeMs)}` : t('noProfileHint')))),
        h('div', { className: 'fl-grid' },
          h('div', { className: 'fl-stat' }, h('div', { className: 'label' }, t('mixedPort')), h('div', { className: 'value' }, status?.mixedPort ? `127.0.0.1:${status.mixedPort}` : '—')),
          h('div', { className: 'fl-stat' }, h('div', { className: 'label' }, t('mode')), h('div', { className: 'value' }, t(status?.mode === 'global' ? 'modeGlobal' : status?.mode === 'direct' ? 'modeDirect' : 'modeRule'))),
          h('div', { className: 'fl-stat' }, h('div', { className: 'label' }, `${t('down')} / ${t('up')}`), h('div', { className: 'value' }, `${fmtRate(status?.down)} / ${fmtRate(status?.up)}`)),
          h('div', { className: 'fl-stat' }, h('div', { className: 'label' }, t('total')), h('div', { className: 'value' }, fmtBytes((status?.downTotal || 0) + (status?.upTotal || 0))))),
        h('div', { className: 'fl-actions' },
          running
            ? h('button', { className: 'fl-btn', disabled: busy, onClick: () => onAction('core.stop') }, Icons.stop(), t('stop'))
            : h('button', { className: 'fl-btn primary', disabled: busy || noProfile || starting, onClick: () => onAction('core.start') }, Icons.play(), starting ? t('starting') : t('start')),
          h('button', { className: 'fl-btn ghost', disabled: busy || !running, onClick: () => onAction('core.restart') }, Icons.refresh(), t('restart')),
          h('button', { className: 'fl-btn ghost', disabled: busy, onClick: onRefresh }, Icons.refresh(), t('refresh'))),
        status?.lastError ? h(Banner, { kind: 'err' }, h('div', { className: 'fl-grow' }, `${t('lastError')}: ${status.lastError}`)) : null,
        status?.dshProxyError ? h(Banner, { kind: 'err' }, h('div', { className: 'fl-grow' }, `${t('proxyError')}: ${status.dshProxyError}`)) : null,
        h('div', { className: 'fl-card' },
          h('div', { className: 'fl-row', style: { cursor: 'pointer' }, onClick: () => setShowAdvanced(!showAdvanced) },
            h('div', { className: 'fl-grow', style: { fontWeight: 600 } }, t('advanced')),
            h('span', { className: 'fl-tiny' }, showAdvanced ? '−' : '+')),
          showAdvanced ? h(React.Fragment, null,
            h('div', { className: 'fl-field' },
              h('label', null, t('delayTestUrl')),
              h('input', {
                className: 'fl-input',
                value: form.delayTestUrl,
                onChange: (event) => setForm({ ...form, delayTestUrl: event.target.value }),
                placeholder: 'https://www.gstatic.com/generate_204',
              })),
            h('div', { className: 'fl-row', style: { marginTop: 8, gap: 8 } },
              h('div', { className: 'fl-grow fl-muted' }, t('autoStart')),
              h(Switch, {
                checked: Boolean(status?.autoStart),
                label: t('autoStart'),
                onChange: (value) => onAction('settings.update', { autoStart: value }),
              })),
            h('div', { className: 'fl-actions' },
              h('button', { className: 'fl-btn', onClick: () => onAction('settings.update', { delayTestUrl: form.delayTestUrl }) }, t('save')),
              h('button', { className: 'fl-btn ghost', onClick: onRefresh }, t('refresh'))),
            h('div', { className: 'fl-divider', style: { margin: '10px 0' } }),
            h('div', { className: 'fl-kv' }, h('span', { className: 'k' }, t('dataDir')), h('span', { className: 'v', title: status?.dataDir }, status?.dataDir || '—')),
            h('div', { className: 'fl-kv' }, h('span', { className: 'k' }, t('coreVersion')), h('span', { className: 'v' }, status?.coreVersion || '—'))
          ) : null),
        h('div', { className: 'fl-tiny', style: { textAlign: 'center', padding: '2px 6px' } }, t('dshOnlyNote')))
    }

    function Profiles({ t, status, profiles, onRefresh, busy, setBusy, setNotice, setError, setTab }) {
      const [mode, setMode] = useState('url')
      const [name, setName] = useState('')
      const [url, setUrl] = useState('')
      const [yaml, setYaml] = useState('')
      const [editing, setEditing] = useState(null)
      const [editName, setEditName] = useState('')
      const [editYaml, setEditYaml] = useState('')
      const [localBusy, setLocalBusy] = useState('')

      const submitAdd = async () => {
        setError('')
        setNotice('')
        setBusy(true)
        setLocalBusy('add')
        try {
          await call('profiles.add', { name, url: mode === 'url' ? url : '', content: mode === 'yaml' ? yaml : '' }, 45000)
          setName('')
          setUrl('')
          setYaml('')
          setNotice(t('imported'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setBusy(false)
          setLocalBusy('')
        }
      }

      const beginEdit = async (profile) => {
        setError('')
        setNotice('')
        setLocalBusy(`edit-${profile.id}`)
        try {
          const data = await call('profiles.read', { id: profile.id })
          setEditing(profile)
          setEditName(profile.name)
          setEditYaml(data.content || '')
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setLocalBusy('')
        }
      }

      const saveEdit = async () => {
        if (!editing) return
        setBusy(true)
        setLocalBusy('save-edit')
        setError('')
        try {
          await call('profiles.update', { id: editing.id, name: editName, content: editYaml }, 45000)
          setEditing(null)
          setNotice(t('saved'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setBusy(false)
          setLocalBusy('')
        }
      }

      const remove = async (profile) => {
        if (!window.confirm(t('confirmDelete'))) return
        setError('')
        setLocalBusy(`del-${profile.id}`)
        try {
          await call('profiles.delete', { id: profile.id })
          setNotice(t('deleted'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setLocalBusy('')
        }
      }

      const activate = async (profile) => {
        setError('')
        setLocalBusy(`use-${profile.id}`)
        try {
          await call('profiles.activate', { id: profile.id }, 45000)
          setNotice(t('activated'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setLocalBusy('')
        }
      }

      const update = async (profile) => {
        setError('')
        setLocalBusy(`upd-${profile.id}`)
        try {
          await call('profiles.update', { id: profile.id }, 45000)
          setNotice(t('saved'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setLocalBusy('')
        }
      }

      return h(React.Fragment, null,
        profiles.length === 0
          ? h('div', { className: 'fl-empty' },
              h('div', { className: 'fl-empty-icon' }, Icons.file(22)),
              h('div', { className: 'title' }, t('noProfiles')),
              h('div', { className: 'body' }, t('noProfileHint')))
          : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
              profiles.map((profile) => h('div', { key: profile.id, className: `fl-profile${profile.id === status?.activeProfileId ? ' active' : ''}` },
                h('div', { className: 'fl-row' },
                  h('div', { className: `fl-radio${profile.id === status?.activeProfileId ? ' on' : ''}` }, profile.id === status?.activeProfileId ? Icons.check(10) : null),
                  h('div', { className: 'fl-grow' },
                    h('div', { className: 'fl-row', style: { gap: 6 } },
                      h('div', { className: 'fl-item-title' }, profile.name),
                      profile.id === status?.activeProfileId ? h('span', { className: 'fl-tiny', style: { color: 'var(--dsw-alias-brand-primary)', fontWeight: 700 } }, t('active')) : null),
                    h('div', { className: 'fl-muted' },
                      `${profile.type === 'url' ? t('subscription') : t('local')} · ${profile.proxyCount || 0} ${t('nodes')}`,
                      profile.updatedAt ? ` · ${t('updated')} ${new Date(profile.updatedAt).toLocaleString()}` : ''))),
                  h('button', { className: 'fl-icon-btn', title: t('edit'), disabled: Boolean(localBusy), onClick: () => beginEdit(profile) }, Icons.settings(14)),
                h('div', { className: 'fl-actions' },
                  profile.id !== status?.activeProfileId
                    ? h('button', { className: 'fl-btn primary sm', disabled: Boolean(localBusy) || busy, onClick: () => activate(profile) }, Icons.check(11), t('activate'))
                    : h('button', { className: 'fl-btn ghost sm', disabled: true }, Icons.check(11), t('active')),
                  profile.type === 'url'
                    ? h('button', { className: 'fl-btn ghost sm', disabled: Boolean(localBusy) || busy, onClick: () => update(profile) }, Icons.refresh(11), t('update'))
                    : null,
                  h('button', { className: 'fl-btn ghost sm', disabled: Boolean(localBusy) || busy, onClick: () => beginEdit(profile) }, t('edit')),
                  h('button', { className: 'fl-btn danger sm', disabled: Boolean(localBusy) || busy, onClick: () => remove(profile) }, Icons.trash(11), t('delete'))))))),

        editing ? h('div', { className: 'fl-card' },
          h('div', { className: 'fl-section-title' }, t('editProfile')),
          h('div', { className: 'fl-muted', style: { marginBottom: 6 } }, t('editHint')),
          h('div', { className: 'fl-field', style: { marginTop: 0 } },
            h('label', null, t('nameLabel')),
            h('input', { className: 'fl-input', value: editName, onChange: (event) => setEditName(event.target.value) })),
          h('div', { className: 'fl-field' },
            h('label', null, t('yamlLabel')),
            h('textarea', { className: 'fl-textarea', value: editYaml, onChange: (event) => setEditYaml(event.target.value) })),
          h('div', { className: 'fl-actions' },
            h('button', { className: 'fl-btn primary', disabled: localBusy === 'save-edit', onClick: saveEdit }, localBusy === 'save-edit' ? t('saving') : t('save')),
            h('button', { className: 'fl-btn ghost', onClick: () => setEditing(null) }, t('cancel'))))
          : null,
        h('div', { className: 'fl-card' },
          h('div', { className: 'fl-section-title' }, t('addProfile')),
          h(Segmented, {
            value: mode,
            onChange: setMode,
            options: [
              { value: 'url', label: t('fromUrl') },
              { value: 'yaml', label: t('fromYaml') },
            ],
          }),
          h('div', { className: 'fl-field' },
            h('label', null, t('nameLabel')),
            h('input', { className: 'fl-input', value: name, placeholder: t('namePlaceholder'), onChange: (event) => setName(event.target.value) })),
          mode === 'url'
            ? h('div', { className: 'fl-field' },
                h('label', null, t('urlLabel')),
                h('input', { className: 'fl-input', value: url, placeholder: t('urlPlaceholder'), onChange: (event) => setUrl(event.target.value), spellCheck: false }))
            : h('div', { className: 'fl-field' },
                h('label', null, t('yamlLabel')),
                h('textarea', { className: 'fl-textarea', value: yaml, placeholder: t('yamlPlaceholder'), onChange: (event) => setYaml(event.target.value), spellCheck: false })),
          h('div', { className: 'fl-actions' },
            h('button', { className: 'fl-btn primary', disabled: Boolean(busy) || (mode === 'url' ? !url.trim() : !yaml.trim()), onClick: submitAdd },
              localBusy === 'add' ? t('importing') : t('import'))),
          h('div', { className: 'fl-tiny', style: { marginTop: 8 } }, t('profilesHint')))
    }

    function Nodes({ t, status, proxyData, onRefresh, setError, setNotice }) {
      const [group, setGroup] = useState('')
      const [testing, setTesting] = useState(false)
      const [nodeTesting, setNodeTesting] = useState('')
      const groups = proxyData?.groups || []
      const mode = status?.mode || 'rule'

      const defaultGroup = useMemo(() => {
        if (mode === 'global' && groups.some((item) => item.name === 'GLOBAL')) return 'GLOBAL'
        if (groups.some((item) => item.name === 'PROXY')) return 'PROXY'
        return groups[0]?.name || ''
      }, [groups, mode])

      useEffect(() => {
        if (!groups.some((item) => item.name === group)) setGroup(defaultGroup)
      }, [groups, group, defaultGroup])

      const current = groups.find((item) => item.name === group) ?? groups[0] ?? null
      const nodes = current?.nodes ?? []
      const fastest = useMemo(() => {
        const values = nodes.filter((node) => Number(node.delay) > 0).map((node) => Number(node.delay))
        return values.length ? Math.min(...values) : 0
      }, [nodes])

      const changeMode = async (value) => {
        setError('')
        try {
          await call('settings.update', { mode: value })
          setNotice('')
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        }
      }

      const testAll = async () => {
        if (!current) return
        setTesting(true)
        setError('')
        try {
          const data = await call('proxies.testAll', { group: current.name }, 120000)
          if (data.errors && Object.keys(data.errors).length) {
            setError(Object.values(data.errors)[0])
          }
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setTesting(false)
        }
      }

      const select = async (nodeName) => {
        if (!current) return
        setError('')
        try {
          await call('proxies.select', { group: current.name, name: nodeName })
          setNotice(t('selected'))
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        }
      }

      const testNode = async (event, nodeName) => {
        event.stopPropagation()
        setNodeTesting(nodeName)
        setError('')
        try {
          await call('proxies.test', { name: nodeName }, 30000)
          await onRefresh()
        } catch (error) {
          setError(String(error?.message || error))
        } finally {
          setNodeTesting('')
        }
      }

      if (status?.starting) {
        return h('div', { className: 'fl-empty' },
          h('div', { className: 'fl-empty-icon' }, Icons.refresh(22)),
          h('div', { className: 'title' }, t('starting')),
          h('div', { className: 'body' }, t('noNodesHint')))
      }

      if (!status?.running) {
        return h('div', { className: 'fl-empty' },
          h('div', { className: 'fl-empty-icon' }, Icons.globe(22)),
          h('div', { className: 'title' }, t('coreNotRunning')),
          h('div', { className: 'body' }, t('noNodesHint')))
      }

      if (groups.length === 0) {
        return h('div', null,
          proxyData?.error ? h(Banner, { kind: 'err' }, h('div', { className: 'fl-grow' }, proxyData.error)) : null,
          h('div', { className: 'fl-empty' },
            h('div', { className: 'fl-empty-icon' }, Icons.globe(22)),
            h('div', { className: 'title' }, t('noNodes')),
            h('div', { className: 'body' }, t('emptyNodes'))))
      }

      return h(React.Fragment, null,
        h('div', { className: 'fl-card' },
          h('div', { className: 'fl-section-title' }, t('mode')),
          h(Segmented, {
            value: mode,
            onChange: changeMode,
            options: [
              { value: 'rule', label: t('modeRule') },
              { value: 'global', label: t('modeGlobal') },
              { value: 'direct', label: t('modeDirect') },
            ],
          }),
          h('div', { className: 'fl-field' },
            h('label', null, t('group')),
            h('select', { className: 'fl-select', value: current?.name || '', onChange: (event) => setGroup(event.target.value) },
              groups.map((item) => h('option', { key: item.name, value: item.name }, `${item.name} (${item.nodes.length})`))))),
        current
          ? h('div', { className: 'fl-card flat' },
              h('div', { className: 'fl-row', style: { padding: '10px 12px', borderBottom: '1px solid var(--dsw-alias-border-l1)' } },
                h('div', { className: 'fl-grow' },
                  h('div', { className: 'fl-item-title' }, current.name),
                  h('div', { className: 'fl-muted' }, `${current.nodes.length} ${t('nodes')}${fastest ? ` · ${t('current')} ${current.now || '—'} · ${fastest} ms` : ''}`)),
                h('button', { className: 'fl-btn primary sm', disabled: testing, onClick: testAll },
                  testing ? h('span', { className: 'fl-spin' }) : Icons.bolt(12), testing ? t('testing') : t('testAll'))),
              h('div', { className: 'fl-scroll', style: { padding: 6 } },
                current.nodes.map((node) => h('div', {
                  key: node.name,
                  className: `fl-node${node.selected ? ' on' : ''}`,
                  onClick: () => select(node.name),
                  role: 'button',
                  tabIndex: 0,
                  onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') select(node.name) },
                },
                  h('div', { className: `fl-radio${node.selected ? ' on' : ''}` }, node.selected ? Icons.check(10) : null),
                  h('div', { className: 'fl-grow' },
                    h('div', { className: 'name', title: node.name }, node.name),
                    node.group ? h('div', { className: 'fl-tiny' }, t('group')) : null),
                  h('span', { className: 'type' }, String(node.type || '')),
                  h('span', { className: `fl-delay ${delayClass(node.delay)}` }, nodeTesting === node.name ? h('span', { className: 'fl-spin' }) : delayText(node.delay, t)),
                  h('button', {
                    className: 'fl-icon-btn',
                    title: t('test'),
                    disabled: Boolean(nodeTesting) || testing,
                    onClick: (event) => testNode(event, node.name),
                  }, Icons.bolt(12))))),
              h('div', { className: 'fl-tiny', style: { padding: '0 12px 10px' } }, t('delayHint')))
          : null)
    }

    function Panel({ t, status, profiles, proxyData, onRefresh, onRefreshProxies, notice, setNotice, error, setError, setTab, tab, busy, setBusy, form, setForm, onClose, iconSrc, showAdvanced, setShowAdvanced }) {
      const [logsOpen, setLogsOpen] = useState(false)
      const logsRef = useRef(null)

      useEffect(() => {
        if (logsOpen) logsRef.current?.scrollIntoView({ block: 'nearest' })
      }, [logsOpen])

      return h(React.Fragment, null,
        h('div', { className: 'fl-head' },
          iconSrc ? h('img', { src: iconSrc, alt: '' }) : h('div', { className: 'fl-head-placeholder' }, h(LogoMark, { size: 30 })),
          h('div', { className: 'fl-head-text' },
            h('div', { className: 'fl-title' }, t('appName')),
            h('div', { className: 'fl-sub' }, t('appSubtitle'))),
          h('div', { className: 'fl-head-actions' },
            h('button', { className: 'fl-icon-btn', title: t('refresh'), disabled: busy, onClick: onRefresh }, Icons.refresh(14)),
            h('button', { className: 'fl-icon-btn', title: t('close'), onClick: onClose }, Icons.close(15)))),
        h('div', { className: 'fl-tabs' },
          h('button', { className: `fl-tab${tab === 'overview' ? ' on' : ''}`, onClick: () => setTab('overview') }, t('tabOverview')),
          h('button', { className: `fl-tab${tab === 'profiles' ? ' on' : ''}`, onClick: () => setTab('profiles') }, t('tabProfiles')),
          h('button', { className: `fl-tab${tab === 'nodes' ? ' on' : ''}`, onClick: () => setTab('nodes') }, t('tabNodes'))),
        h('div', { className: 'fl-body' },
          error ? h(Banner, { kind: 'err' }, h('div', { className: 'fl-grow' }, error)) : null,
          notice ? h(Banner, { kind: 'ok' }, h('div', { className: 'fl-grow' }, notice)) : null,
          tab === 'overview'
            ? h(Overview, {
                t, status, profiles, onRefresh, busy, setTab,
                onAction: async (action, payload) => {
                  setBusy(true)
                  setError('')
                  setNotice('')
                  try {
                    await call(action, payload || {}, 45000)
                    await onRefresh()
                  } catch (error) {
                    setError(String(error?.message || error))
                  } finally {
                    setBusy(false)
                  }
                },
                showAdvanced, setShowAdvanced, form, setForm, iconSrc,
              })
            : null,
          tab === 'profiles'
            ? h(Profiles, { t, status, profiles, onRefresh, busy, setBusy, setNotice, setError, setTab })
            : null,
          tab === 'nodes'
            ? h(Nodes, { t, status, proxyData, onRefresh: onRefreshProxies, setError, setNotice })
            : null,
          h('div', { className: 'fl-divider' }),
          h('div', { className: 'fl-row', style: { cursor: 'pointer' }, onClick: () => setLogsOpen(!logsOpen) },
            h('div', { className: 'fl-grow', style: { fontWeight: 600 } }, t('logs')),
            h('span', { className: 'fl-tiny' }, logsOpen ? t('hideLogs') : t('showLogs'))),
          logsOpen
            ? h('div', { className: 'fl-logs', ref: logsRef }, (status?.logs && status.logs.length ? status.logs.join('\n') : t('noLogs')))
            : null),
        h('div', { className: 'fl-footer' },
          h('span', null, t('footer')),
          h('span', null, status?.running ? `:${status.mixedPort}` : t('stopped'))))
    }

    function Root({ ctx }) {
      const t = useDictionary(ctx)
      const [open, setOpen] = useState(false)
      const [tab, setTab] = useState('overview')
      const [status, setStatus] = useState(null)
      const [profiles, setProfiles] = useState([])
      const [proxyData, setProxyData] = useState({ groups: [], running: false })
      const [busy, setBusy] = useState(false)
      const [notice, setNotice] = useState('')
      const [error, setError] = useState('')
      const [pos, setPos] = useState(initialPosition)
      const [form, setForm] = useState({ delayTestUrl: 'https://www.gstatic.com/generate_204' })
      const [iconSrc, setIconSrc] = useState('')
      const [showAdvanced, setShowAdvanced] = useState(false)
      const posRef = useRef(pos)
      const dragRef = useRef(null)
      const refreshChain = useRef(Promise.resolve())
      const openRef = useRef(open)
      openRef.current = open
      posRef.current = pos

      const refreshStatus = useCallback(async () => {
        try {
          const data = await call('status', {}, 20000)
          setStatus(data)
          if (data.delayTestUrl) setForm((current) => current.delayTestUrl === data.delayTestUrl ? current : { ...current, delayTestUrl: data.delayTestUrl })
          if (data.activeProfileId !== undefined) {
            const list = await call('profiles.list', {}, 20000)
            setProfiles(list.profiles || [])
          }
        } catch (cause) {
          if (!openRef.current) return
          setError(String(cause?.message || cause))
        }
      }, [])

      const refreshProxies = useCallback(async () => {
        try {
          const data = await call('proxies.list', {}, 20000)
          setProxyData(data)
        } catch (cause) {
          if (!openRef.current) return
          setError(String(cause?.message || cause))
        }
      }, [])

      const refreshAll = useCallback(() => {
        const run = refreshChain.current.then(async () => {
          await refreshStatus()
          if (openRef.current) await refreshProxies()
        })
        refreshChain.current = run.catch(() => {})
        return run
      }, [refreshStatus, refreshProxies])

      const openPanel = useCallback(() => {
        setOpen(true)
        setError('')
        setNotice('')
        refreshAll()
      }, [refreshAll])

      useEffect(() => {
        let alive = true
        call('ui.icon', {}, 10000)
          .then((data) => { if (alive && data?.dataUrl) setIconSrc(data.dataUrl) })
          .catch(() => {})
        return () => { alive = false }
      }, [])

      useEffect(() => {
        const timer = setInterval(() => {
          if (openRef.current) refreshAll()
        }, 2500)
        return () => clearInterval(timer)
      }, [refreshAll])

      useEffect(() => {
        if (!open) return
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [open])

      const beginDrag = (event) => {
        if (event.button !== 0) return
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch {}
        dragRef.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          right: pos.right,
          bottom: pos.bottom,
          moved: false,
        }
      }

      const moveDrag = (event) => {
        const drag = dragRef.current
        if (!drag || drag.id !== event.pointerId) return
        const dx = event.clientX - drag.x
        const dy = event.clientY - drag.y
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true
        if (drag.moved) {
          const next = clampPosition({ right: drag.right - dx, bottom: drag.bottom - dy })
          posRef.current = next
          setPos(next)
        }
      }

      const endDrag = (event) => {
        const drag = dragRef.current
        if (!drag || drag.id !== event.pointerId) return
        dragRef.current = null
        if (!drag.moved) {
          if (openRef.current) setOpen(false)
          else openPanel()
        } else {
          try { localStorage.setItem(POS_KEY, JSON.stringify(posRef.current)) } catch {}
        }
      }

      const statusKind = status?.running ? 'on' : status?.starting ? 'starting' : status?.lastError ? 'err' : ''
      const panelBottom = Math.min(pos.bottom + 66, Math.max(16, window.innerHeight - 220))
      const panelRight = Math.max(12, Math.min(pos.right, window.innerWidth - 440))
      const panelStyle = { right: panelRight, bottom: panelBottom, maxHeight: `calc(100vh - ${panelBottom + 16}px)` }

      return h('div', { className: 'fl-root' },
        h('style', null, css),
        open
          ? h('div', { className: `fl-panel${tab === 'nodes' ? ' fl-panel-tall' : ''}`, style: panelStyle, role: 'dialog', 'aria-label': t('appName') },
              h(Panel, {
                t, status, profiles, proxyData,
                onRefresh: refreshAll,
                onRefreshProxies: async () => {
                  await refreshStatus()
                  await refreshProxies()
                },
                notice, setNotice, error, setError, setTab, tab, busy, setBusy, form, setForm,
                onClose: () => setOpen(false), iconSrc, showAdvanced, setShowAdvanced,
              }))
          : null,
        h('button', {
          className: 'fl-ball',
          style: { right: pos.right, bottom: pos.bottom },
          title: t('appName'),
          'aria-label': t('appName'),
          onPointerDown: beginDrag,
          onPointerMove: moveDrag,
          onPointerUp: endDrag,
          onPointerCancel: endDrag,
          onContextMenu: (event) => event.preventDefault(),
        },
          iconSrc ? h('img', { src: iconSrc, alt: '' }) : h(LogoMark, { size: 38 }),
          h('span', { className: `fl-ball-dot ${statusKind}` }),
          status?.dshProxyActive ? h('span', { className: 'fl-ball-badge' }, 'ON') : null))
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { error: null }
      }
      static getDerivedStateFromError(error) {
        return { error }
      }
      componentDidCatch() {
        // The fallback button keeps a visible entry point even if a future
        // render path throws; the Host remains reachable from the panel.
      }
      render() {
        if (this.state.error) {
          return h('button', {
            title: `FlClash UI error: ${String(this.state.error?.message || this.state.error)}`,
            style: {
              position: 'fixed', right: 22, bottom: 22, width: 54, height: 54,
              borderRadius: '50%', border: '0', cursor: 'pointer',
              background: 'var(--dsw-alias-state-error-primary, #dc2626)', color: '#fff',
              fontSize: 22, fontWeight: 800, pointerEvents: 'auto', zIndex: 2147483000,
            },
            onClick: () => { try { this.setState({ error: null }) } catch {} },
          }, '!')
        }
        return this.props.children
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.get?.('locale') ?? ctx.locale
        if (locale?.register) {
          ctx.effect(() => {
            try { return locale.register(NS, 'zh', zh) } catch { return () => {} }
          })
          ctx.effect(() => {
            try { return locale.register(NS, 'en', en) } catch { return () => {} }
          })
        }
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'flclash-overlay',
          order: 80,
        }, () => h(Boundary, null, h(Root, { ctx }))))
      },
    }
  },
})
