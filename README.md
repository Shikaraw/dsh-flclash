# FlClash for DSH

一个 **只接管 DSH 流量** 的代理插件。它把 FLClash 的核心能力带进 DeepSeek Harness：

- 窗口右下角的悬浮球（使用 FLClash 原图标），点击打开插件面板，可拖动位置。
- 导入 Clash / Mihomo 订阅链接，或直接粘贴 YAML 配置；支持编辑、更新订阅、删除。
- 查看策略组、选择节点，一键测试当前策略组全部节点延迟。
- 规则 / 全局 / 直连三种路由模式。
- DSH 需要访问被墙站点时自动走代理；国内站点按 GEOSITE 规则直连。
- 只把代理策略注入当前 DSH 进程（及其子进程），不修改系统代理、不启用 TUN、不劫持其它应用流量。

## 它是怎么工作的

插件在 `127.0.0.1` 上启动一个随包附带的 [mihomo](https://github.com/MetaCubeX/mihomo) 核心：

- 混合代理端口：默认 `17890`
- 控制接口：默认 `17891`（仅监听回环地址，随机密钥）
- 数据目录：`$DSH_HOME/flclash-plugin`（默认 `C:\Users\<你>\.dsh\flclash-plugin`）

核心启动后，插件通过 DSH 自带的 `@deepseek-ai/dsh-http-proxy` 把 `HTTP_PROXY` / `HTTPS_PROXY` 指向本机混合端口，并且只安装到 DSH 进程内。DSH 的 `web_fetch`、模型请求、网页搜索等基于 `fetch` 的出站请求都会经过 mihomo；mihomo 再按配置里的规则决定直连还是走节点。

如果导入的配置没有规则，插件会自动补上：

```yaml
rules:
  - GEOSITE,private,DIRECT
  - GEOSITE,cn,DIRECT
  - MATCH,PROXY
```

因此：

- `baidu.com` 等国内站点 → 直连
- `example.com` 等非国内站点 → 走当前节点（mihomo 规则命中 `MATCH,PROXY`）
- 你的订阅里自带规则时，优先使用订阅规则

回环地址（`localhost`、`127.0.0.0/8`、`::1`）始终直连，DSH 自己的 Web UI 和本地服务不会绕进代理。

## 使用

1. 安装插件后，DSH 窗口右下角出现悬浮球。
2. 点击悬浮球 → “配置” → 导入订阅链接，或粘贴 Clash / Mihomo YAML。
3. 在“节点”里选择策略组和节点；点“一键测速”查看全部节点延迟。
4. 回到“概览”，确认“接管 DSH 网络”已开启，核心显示“运行中”。
5. 之后 DSH 访问被墙站点会自动走代理；不需要时关掉“接管 DSH 网络”或停止核心即可，DSH 立即恢复直连。

所有配置都保存在本机数据目录。订阅下载会使用 DSH 当前网络（已接管时也走代理）。

## 配置项

可以在 `cordis.patch.yml` 里覆盖：

```yaml
- id: flclash-proxy
  name: '@local/dsh-flclash'
  config:
    autoStart: true          # 随 DSH 自动启动核心
    takeOverDsh: true        # 自动把 DSH 出站请求交给本机核心
    mixedPort: 17890         # 混合代理端口
    controllerPort: 17891    # mihomo 控制接口端口
    delayTestUrl: 'https://www.gstatic.com/generate_204'
    dataDir: ''              # 自定义数据目录；留空使用 $DSH_HOME/flclash-plugin
    corePath: ''             # 自定义 mihomo 可执行文件；留空使用随包核心
```

端口被占用时会自动向后寻找可用端口，面板会显示实际端口。

## 支持范围

- **Windows x64**：随包附带 `bin/mihomo.exe`（mihomo v1.19.32，amd64-compatible）。
- **macOS / Linux**：把对应平台的 mihomo 可执行文件放到 `bin/mihomo`，或在配置里指定 `corePath`。
- 订阅格式：Clash / Mihomo YAML；也支持 base64 包裹的 YAML 订阅。暂不支持把单条 `ss://` / `vmess://` 分享链接转换成配置。
- 不提供 TUN、系统代理、开机自启；这些都会影响其它应用，因此刻意不做。

## 安全边界

- 控制接口只绑定 `127.0.0.1`，使用每次安装生成的随机密钥。
- 面板通过 DSH Connection 服务的认证 Fetch 路由（`/api/flclash`）调用 Host；该路由位于 `/api` 共享通道内，复用 DSH 的浏览器认证和 Host/Origin 检查，只接受 owner peer。
- 生成的运行配置强制：`allow-lan: false`、`bind-address: 127.0.0.1`，并删除 `tun`、`port`、`socks-port`、`redir-port`、`tproxy-port`、`external-ui` 等会扩大影响面的字段。
- 订阅内容只保存在本机，不会上传。

## 数据目录

```
$DSH_HOME/flclash-plugin/
├── state.json                 # 配置列表、当前配置、设置、控制密钥
├── profiles/<id>.yaml         # 导入的配置
├── runtime/config.yaml        # 生成的 mihomo 运行配置
├── runtime/core.log           # 核心日志
├── GeoIP.dat / GeoSite.dat    # 随包规则数据（首次启动复制）
├── ASN.mmdb / geoip.metadb    # 随包 MMDB，避免核心首次启动联网下载
```

## 验证记录

在 Windows + DSH Desktop 环境实测：

- 悬浮球成功注册到 `shell.overlay`，Client slot 为 `flclash-overlay` 且 active；原图标通过宿主 `ui.icon` 动作以 data URL 返回，桌面壳与 Web 页面都能显示。
- 面板 API 使用 DSH Connection 的认证 Fetch 路由 `/api/flclash`；未认证请求返回 401，旧的无认证 `/flclash/api` 已移除。
- 导入配置、启动核心、策略组/节点读取、节点切换、一键测速 API 均返回正确结果。
- 用本地测试节点（HTTP 上游代理）验证：
  - `web_fetch https://example.com/` → `match Match using PROXY[local-upstream]`
  - `web_fetch https://www.baidu.com/` → `match GeoSite(cn) using DIRECT`
  - DSH 的 `api.commandcode.ai` 模型请求也走 `PROXY[local-upstream]`
- 停止核心 / 删除配置后 `dshProxyActive: false`，DSH 恢复直连；其它应用不受影响。
- 带 `GEOIP` 规则的订阅首次启动直接加载随包 `geoip.metadb`，核心约 50ms 就绪；控制接口未就绪时节点页显示“启动中”，不再出现 `ECONNREFUSED 127.0.0.1:17891`。
- 未做浏览器截图级视觉验证；面板样式只使用 DSH 主题 token，并已在 slot 注册层面确认加载。

## 许可证

插件代码与随包的 FlClash 图标、mihomo 核心、GeoIP/GeoSite 数据按 **GPL-3.0** 分发。详见 `LICENSE` 与 `THIRD-PARTY-NOTICES.md`。
