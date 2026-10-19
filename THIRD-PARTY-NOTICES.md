# Third-party notices

This bundle redistributes the following third-party components.

## FlClash

- Project: FlClash — https://github.com/chen08209/FlClash
- Source used: `flclash/SourceCode/FlClash-main` in this workspace.
- License: GPL-3.0.
- Used for: the original application icon (`icon.png`), the GeoIP / GeoSite / ASN data files under `data/`, and the overall feature model (subscription profiles, node selection, latency testing).

## mihomo

- Project: MetaCubeX/mihomo — https://github.com/MetaCubeX/mihomo
- Version: v1.19.32, Windows amd64-compatible build.
- License: GPL-3.0.
- Used for: `bin/mihomo.exe`, the local proxy core launched by this plugin.
- Source: https://github.com/MetaCubeX/mihomo/tree/v1.19.32

## js-yaml

- Project: nodeca/js-yaml — https://github.com/nodeca/js-yaml
- Version: 4.3.2 (ESM distribution, `vendor/js-yaml.mjs`).
- License: MIT.
- Used for: parsing imported Clash / Mihomo YAML profiles.

## GeoIP / GeoSite / ASN / MMDB data

- Files: `data/GeoIP.dat`, `data/GeoSite.dat`, `data/ASN.mmdb`, `data/geoip.metadb`.
- Origin: `GeoIP.dat`, `GeoSite.dat` and `ASN.mmdb` are copied from the FlClash source tree's `assets/data/` directory. `geoip.metadb` is the MetaCubeX/meta-rules-dat release build (https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb).
- Upstream data projects include MetaCubeX/meta-rules-dat, Loyalsoldier/v2ray-rules-dat and the MaxMind/ASN data used by those projects; consult their licenses for redistribution terms.

## Full license text

The complete GPL-3.0 text is in `LICENSE` (copied from the FlClash source tree).
