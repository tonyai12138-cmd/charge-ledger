from pathlib import Path
import json,re,zipfile,hashlib,subprocess
root=Path(__file__).resolve().parent
out=root/'deliverables'
out.mkdir(exist_ok=True)
raw=(root/'web/tariffs.js').read_text('utf-8')
data=json.loads(raw[len('window.TARIFFS = '):].rstrip().rstrip(';'))
lines=['# 充电手账 · 电价参考资料来源','',f"资料检索日期：{data['checkedAt']}",'','大陆31个省级地区均有参考时段；港澳台保留资料入口。以下资料按文件适用范围提供参考，不能直接替代具体站点电费、服务费与优惠公示。','',
'27个大陆省级地区使用官方文件、政府解读或电网公示；天津、广西、海南、青海采用公开转载文本，已在应用中标为“转载待核”。文件年代及适用起点均单独显示，不将检索日期当成文件生效日期。','',
'河北南网与冀北电网分开，冀北新时段暂未补齐。青海直接市场交易主体按2026年交易规则，不给出人为统一的峰谷时段。','']
for p in data['provinces']:
 lines.extend(['## '+p['name'],''])
 for r in p['regions']:
  status='公开转载，官方原文待复核' if r.get('verified') is False else ('官方来源资料' if r.get('seasons') else '资料入口 / 待核实')
  lines.extend([f"- 区域 / 类型：{r['name']}",f"- 来源状态：{status}",f"- 适用范围：{r['scope']}",f"- 文件：{r.get('policy') or '未收录完整政策'}",f"- 资料适用起点：{r.get('effective') or '待核实'}",f"- 来源：[查看资料]({r['url']})"])
  if r.get('note'):lines.append('- 说明：'+r['note'])
  if r.get('reason'):lines.append('- 待核实说明：'+r['reason'])
  lines.append('')
(out/'电价资料来源.md').write_text('\n'.join(lines),encoding='utf-8')
apk=out/'ChargeLedger.apk'
with zipfile.ZipFile(apk) as z:
 for asset in (root/'web').rglob('*'):
  if asset.is_file():
   name=asset.relative_to(root/'web').as_posix()
   assert z.read('assets/'+name)==asset.read_bytes(),name+' mismatched APK asset'
 assert 'classes.dex' in z.namelist() and 'AndroidManifest.xml' in z.namelist()
sha=hashlib.sha256(apk.read_bytes()).hexdigest()
(out/'SHA256.txt').write_text(sha+'  '+apk.name+'\n',encoding='utf-8')
for report_name in ['ui-report.json','upgrade-ui-report.json','fluid-ui-report.json','polish-ui-report.json','launch-ui-report.json','browser-performance.json']:
 assert json.loads((root/'qa'/report_name).read_text('utf-8'))['passed'], report_name
java=next((root/'.tools/jdk').rglob('java.exe'))
signer=next((root/'.tools/build-tools').rglob('apksigner.jar'))
aapt=next((root/'.tools/build-tools').rglob('aapt2.exe'))
def certificate(path):
 result=subprocess.run([str(java),'-jar',str(signer),'verify','--print-certs',str(path)],capture_output=True,text=True,check=True)
 return re.search(r'certificate SHA-256 digest: ([a-f0-9]+)',result.stdout).group(1)
def apk_version(path):
 result=subprocess.run([str(aapt),'dump','badging',str(path.relative_to(root))],cwd=root,capture_output=True,text=True,check=True)
 match=re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'",result.stdout)
 return match.group(1),int(match.group(2)),match.group(3)
old_apk=root/'.tools/upgrade-baseline.apk'
old_certificate=certificate(old_apk);new_certificate=certificate(apk)
assert old_certificate==new_certificate,'Signing certificate changed'
old_package,old_code,old_version=apk_version(old_apk)
new_package,new_code,new_version=apk_version(apk)
assert old_package==new_package=='cn.chargeledger.app'
gradle=(root/'android/app/build.gradle').read_text('utf-8')
assert new_code>old_code
assert new_version==re.search(r"versionName '([^']+)'",gradle).group(1)
assert new_code==int(re.search(r'versionCode (\d+)',gradle).group(1))
upgrade={'package':new_package,'previousVersion':old_version,'previousVersionCode':old_code,'version':new_version,'versionCode':new_code,'certificateSha256':new_certificate,'signatureMatchesPrevious':True,'apkSha256':sha,'androidDeviceInstallTested':False}
(out/'升级校验.json').write_text(json.dumps(upgrade,ensure_ascii=False,indent=2),encoding='utf-8')
report = [f'# 充电手账 v{new_version} · 验证记录','','验证日期：2026-10-13','','## 本次品牌开屏与字体更新','',
 'v1.3.2将首页标语恢复单行，开屏完整过程延长至约3秒，并等待原生退场确认才开始计时。系统动画关闭的原生标志不再跳过品牌展示，减少动态效果仍保留约2秒静态展示与轻柔淡入。沿用品牌开屏与字体层次。衬线中文标题、无衬线正文及圆润Outfit数字分别承担角色；开屏光环、品牌文字与能量节奏进入，再将Logo收拢到同一WebView中的首页。原生层仅淡出交接，其他页面延后预加载。已查看开屏、字体首页、录入和环比截图；APK构建、签名、版本与全部内置资源一致性重新验证。',
 '本次重新执行24项单元测试、品牌开屏与界面专项。原有功能/升级/导航动效回归及导航压力测试沿用同日v1.3.1基线；数据字段、存储入口、统计口径未修改。新增验证单行排版、3秒完整过程、延迟原生交接及动画关闭标志，重新测量桌面开屏帧间隔。','','## 功能基线已通过','',
 '- 24项自动化测试：环比跨年/闰日、五种周期、用途过滤、缺失电量、上期为0与无基线；金额精度、缺失电量、有效样本加权均价、时间精度、时段归属、趋势金额守恒、重复与冲突编号、旧备份兼容、Markdown缺失值和隐私、电价资料结构。',
 '- 原有浏览器流程：新增/编辑/持久化、无效输入校验、五种统计粒度、用途筛选、回收站恢复、Markdown下载与隐私隐藏、JSON备份与完整恢复。',
 '- 升级专项：v1.0.0本地记录原样读取；空电量/地点与仅日期/仅月份录入；月度支出与有电量样本均价分别计算；日周排除仅月份合计。',
 '- 追加导入：预览前不修改账本，确认后追加；已有记录、车辆、预算和回收站保留；再次导入跳过相同编号与内容；编号冲突整批中止。',
 '- v1.1.0费用字段、本地存储名和schema-1格式保留；仅日期、仅月份、缺失电量、行程合计和追加导入再次回归通过。用户源数据不写入项目或APK。',
 '- 动效专项：主页面与标题节点持续存在、独立滚动位置保留、快速中断后只保留一个活动页、已缓存导航不重复更新页面内容、指示层跟手拖动、真实触摸事件双向滑动页面。',
 '- 选择器专项：闰日、年月切换、取消不修改输入、表单内容保留、系统返回先关闭选择器、时间滚轮、省份搜索、月份选择、五种宽度和减少动画。',
 '- 界面专项：离线字体、五个固定标题栏、明细固定按钮、底部与侧边Insets模拟、八次弹层复用、快速重开、原背景滚动不变、五种环比维度、红绿变化及箭头、五种宽度和减少动画。',
 '- 品牌开屏专项：三类字体真实加载、首页节点保持、开屏期间只构建首页、只动画transform/opacity、6种屏幕含横屏的Logo落点误差小于1CSS像素、减少动态效果保留静态展示与淡入；4倍CPU限速采样见品牌开屏验证.md。',
 '- 原生启动桥模拟：首屏字体已加载、品牌位置在状态栏以下后，只发送一次uiReady。此项不等于实际运行Android SplashScreen。',
 '- 系统减少动态效果与手动减少动画均生效，设置重载后保留。',
 '- 全部34个省级地区页面切换正常。320、360、390、430、760像素宽度的五个页面及录入弹层无横向溢出。',
 '- 控制台无脚本错误。实际查看动画结束后的首页、统计、录入、导入和小屏截图。',
 '- Java、资源、DEX和APK构建成功；APK v2/v3签名通过；全部界面和字体资源与最终源码逐字节一致。',
 f'- 包名：{new_package}；版本：{old_version}（{old_code}）→ {new_version}（{new_code}）；新旧签名证书SHA256一致：`{new_certificate}`。',
 f'- APK SHA256：`{sha}`。','','## 尚未验证','',
 '未连接安卓真机，未启动安卓模拟器。签名与版本及浏览器存储兼容已验证；尚未实际执行手机覆盖升级安装。小米18 Pro、Android 17、澎湃OS4.0上的实际帧率、GPU耗时、系统返回、原生定位、文件选择器、分享和软键盘仍需真机验收。桌面压力测试不能证明该手机始终不卡顿。',
 '','','## 安装与导入验收','',
 '1. 在已装旧版的手机直接打开新版APK，选择更新；打开应用核对原有明细与设置。',
 '2. 录入一条只有金额与月份的差旅行程合计，确认电量显示未记录，月统计纳入、日周统计不纳入。',
 '3. 从“我的 → 追加导入历史费用”选择临时JSON，核对预览后确认，再次导入确认重复条目被跳过。',
 '4. 补充一条记录电量，确认均价只使用有电量样本；导出.md核对未知电量与月份合计。',
 '5. 检查定位、保存文件、分享、软键盘和系统返回；在“车辆与预算”切换减少动画。','']
(out/'验证记录.md').write_text('\n'.join(report),encoding='utf-8')
perf=json.loads((root/'qa/browser-performance.json').read_text('utf-8'))
motion=[f'# 充电手账 v{new_version} · 动效与性能验证','','验证日期：2026-10-13','','导航压力测试沿用同日v1.3.1基线；v1.3.2重新执行的开屏专项见品牌开屏验证.md。原生交接、输入法动画和系统栏尚未真机测量。','','## 实现与回归','',
 '保留五个主页面及各自滚动位置；同屏数据用节点比对更新。导航以transform做连续水平移动，日期和选项统一在App浮层内选择。大面积卡片背景模糊已移除，导航模糊局限于底部的小面积区域。',
 '快速导航、取消拖动、双向触摸滑动、跟手选项指示层、日历闰日、月份、年份、时间滚轮、省份搜索、取消与返回、表单保留、减少动画和五种窗口宽度已通过浏览器回归。',
 '', '## 本机压力测试','',f"环境：{perf['environment']}",'',
 '| 指标 | 结果 |','| --- | --- |',
 f"| 导航处理耗时中位数 | {perf['navigationHandlerMs']['median']} ms |",
 f"| 导航处理耗时P95 | {perf['navigationHandlerMs']['p95']} ms |",
 f"| 浏览器帧间隔中位数 / P95 / 最大值 | {perf['browserFrameIntervalsMs']['median']} / {perf['browserFrameIntervalsMs']['p95']} / {perf['browserFrameIntervalsMs']['max']} ms |",
 f"| 空白页面采样数 | {perf['blankSurfaceSamples']} |",
 f"| 已缓存导航中的页面内容更新数 | {perf['cachedPagePatchesDuringNavigation']} |",
 f"| 卡片背景模糊数 | {perf['cardBackdropBlurCount']} |",
 f"| 超过50ms的主线程任务 | {perf['mainThreadLongTasksMs']} |",'',
 '这些是桌面Chrome上的合成测试数据，包含测量开销，不是手机GPU测量，也不代表所有帧都能达到120Hz预算。测试中没有空白页面采样；已缓存导航没有内容重建。',
 '','','## 真机验证边界','',
 '尚未在用户的小米18 Pro、Android 17、澎湃OS4.0上测量。建议连续来回切换、左右滑动、拖动时间精度/用途选择、打开日历并滚动时间轮；需要量化帧率时在手机启用Profile GPU Rendering或录制Perfetto系统跟踪。',
 '','','## Google参考资料','',
 '- [边到边布局与窗口Insets](https://developer.android.com/develop/ui/views/layout/edge-to-edge?hl=zh-cn)',
 '- [沉浸式适配Codelab](https://developer.android.com/codelabs/edge-to-edge?hl=zh-cn#5)',
 '- [原生Activity手动配置](https://developer.android.com/develop/ui/views/layout/edge-to-edge-manually)',
 '- [系统SplashScreen与退出动画](https://developer.android.com/develop/ui/views/launch/splash-screen)',
 '- [高性能CSS动画：transform/opacity与减少布局和绘制](https://web.dev/articles/animations-guide)',
 '- [Android渲染：减少重复绘制、优化布局层级](https://developer.android.com/topic/performance/rendering)',
 '- [Android慢帧诊断：60/90/120fps预算及设备跟踪](https://developer.android.com/topic/performance/issues/render)',
 '- [Android返回手势：现代回调和首页退出交还系统](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)','']
(out/'动效与性能验证.md').write_text('\n'.join(motion),encoding='utf-8')
launch=json.loads((root/'qa/launch-ui-report.json').read_text('utf-8'))
frame=launch['desktopCpu4x']['frameIntervalsMs']
launch_report=[f"# 充电手账 v{new_version} · 品牌开屏验证",'', '验证日期：2026-10-13','',
 '首页标语在六种视口单行显示；完整品牌展示约3秒，动效计时从原生退场确认开始。减少动态效果保留约2秒可读静态画面。',
 '三种角色字体已在浏览器真实加载：品牌/标题Noto Serif SC，正文Noto Sans SC，数据Outfit。来源与许可证随包保留。',
 '开屏布局包含静态薄荷光感、能量光环、品牌字标、能量节奏。逐帧只动画transform与opacity，首页持续保留同一节点，动画期间不预加载其他页面。原生系统开屏只做已绘制帧的淡出交接。','',
 '## 浏览器验证','',
 '- 320×640、360×740、390×844、430×932、760×900及844×390六种视口：Logo落点误差小于1CSS像素。',
 '- 原生交接延迟1800ms、系统关闭动画标志、3秒完整过程、约2秒低动态展示、字体准备、节点保留和无控制台错误通过。',
 '- 开屏设计演示.webm为桌面浏览器录制；包含实际HTML/SVG界面动效，不是安卓录屏。','',
 '## 桌面4倍CPU限速启动采样','',
 f"帧样本：{frame['count']}；中位数：{frame['median']:.2f}ms；P95：{frame['p95']:.2f}ms；最大值：{frame['max']:.2f}ms。",
 f"动画期间主线程长任务：{launch['desktopCpu4x']['longTasks']}。动画期间其他页面预加载数：{launch['launch']['pageBuildsDuringMotion']}。",'',
 '采样是桌面Chrome数据，不代表小米18 Pro、Android 17、澎湃OS4.0的实际帧率。原生系统到WebView的交接、实际启动耗时及GPU仍需真机验收。','',
 '[Google SplashScreen规范](https://developer.android.com/develop/ui/views/launch/splash-screen)','']
(out/'品牌开屏验证.md').write_text('\n'.join(launch_report),encoding='utf-8')
allow_files=['README.md','CHANGELOG.md','.gitignore','.gitattributes','package.json','package-lock.json','build.ps1','tools-bootstrap.py','preview-server.cjs','generate-tariffs.py','tariff-extra.py','tariff-additions.json','source-extract.py','refine-delivery.py','package-delivery.py']
source=out/'充电手账-源码.zip'
with zipfile.ZipFile(source,'w',zipfile.ZIP_DEFLATED) as z:
 for name in allow_files:z.write(root/name,name)
 for directory in ['web','android','tests','docs','.github']:
  for f in (root/directory).rglob('*'):
   if f.is_file() and not any(p in ['build','.gradle'] for p in f.relative_to(root).parts) and f.name!='local.properties':z.write(f,f.relative_to(root).as_posix())
 for name in ['电价资料来源.md','验证记录.md','动效与性能验证.md','品牌开屏验证.md','SHA256.txt','升级校验.json']:z.write(out/name,'deliverables/'+name)
print(json.dumps({'apk_bytes':apk.stat().st_size,'source_bytes':source.stat().st_size,'sha256':sha,'private_key_in_zip':False},ensure_ascii=False))
