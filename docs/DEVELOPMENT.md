# 开发与交付

## 环境

- Node.js 20+（核心测试不需要第三方包）；UI 测试使用 Playwright 1.62.1 和已安装的 Google Chrome。
- Python 3.10+ 用于资料维护及交付脚本；资料提取的额外依赖见各脚本 import。
- 原生工程使用 JDK 17、Android SDK 35、Build Tools 35.0.0，Gradle 8.9 与 AGP 8.7.3。

运行 `npm ci`、`npm test`。另开终端运行 `npm run preview`，再执行 `npm run test:ui` 或 `npm run test:performance`。浏览器报告和截图写入已忽略的 `qa/`。Playwright 使用 Chrome channel，不需要单独下载 Chromium。

## Android Studio / Gradle

打开 `android/`，安装 SDK 35，设置 JDK 17，运行 `./gradlew.bat assembleDebug`（macOS / Linux 用 `bash gradlew assembleDebug`）。首次构建需要下载 Gradle 和插件。

输出在 `android/app/build/outputs/apk/debug/`。调试签名无法覆盖本仓库的正式包；开发副本可修改 applicationId 后并存安装，或使用单独设备。

## Windows 本地签名构建

`python tools-bootstrap.py` 下载官方 Android 工具与 Temurin JDK 到 `.tools/` 并校验下载包。需要代理时传 `--proxy` 参数；不会全局安装工具。

`build.ps1` 编译 Java、资源、DEX，打包 `web/` 全部资源，zipalign 后签名验证，再输出 `deliverables/ChargeLedger.apk`。可传入 `-JavaHome`、`-PlatformJar`、`-BuildTools`、`-KeyFile`、`-KeyAlias` 指定环境。

签名密码从本机环境变量 `CHARGE_LEDGER_STORE_PASSWORD` 和 `CHARGE_LEDGER_KEY_PASSWORD` 读取，脚本不保存密码。原作者沿用本地 `.tools/charge-ledger-local.jks`，私钥和密码不公开。其他开发者须自行建立签名密钥并传入路径。

```powershell
# 先在本机设置签名环境变量，再执行：
./build.ps1 -KeyFile 'C:/private/your-release.jks' -KeyAlias 'your-alias'
```

若已存在交付 APK，脚本会检查证书一致，证书不同不会覆盖旧交付。原作者密钥缺失时无法构建可覆盖既有正式版的升级包。

## 资料与交付脚本

`generate-tariffs.py`、`tariff-extra.py`、`tariff-additions.json` 维护随包 `web/tariffs.js`；来源文件与适用范围须人工核实，生成后应执行 `npm test`。

`source-extract.py` 是公开政策资料提取辅助脚本，缓存仅写 `.tools/references`，使用前调整其中的代理配置。`refine-delivery.py` 是早期交付资料辅助脚本；正式校验入口为 `package-delivery.py`。

`python package-delivery.py` 要求本地存在已签名 APK、旧版基线 `.tools/upgrade-baseline.apk` 和六份已通过的浏览器 QA 报告。它检查 APK 资源与源码逐字节一致、版本递增、旧新证书一致，然后更新公开验证文档、校验信息与源码 ZIP。干净克隆没有这些本地验收材料，不能直接生成同等验证的交付包。

Release 中源码 ZIP 包含项目代码、文档、字体许可证、测试和来源资料；不包含私钥、工具缓存、用户记录、node_modules 或 QA 临时文件。字体授权详见 `web/fonts/`。公开源码不等于拥有正式包的签名权限。

## 验证边界

GitHub Actions 执行 24 项核心规则测试。UI 回归在桌面 Chrome 运行，模拟系统桥与 Insets；性能报告是桌面采样。APK 编译及证书检查已通过，实际安卓启动、系统交接、覆盖安装、GPU 帧率与原生能力仍需真机验证。
