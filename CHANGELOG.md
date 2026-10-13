# 更新记录

## v1.3.2 单行首页与完整开屏节奏

- “每次补能，心中有数。”恢复为一行。字号随标题容器宽度调整，侧边安全区域和小屏也不折行。
- 完整开屏约3秒：光环展开、字标与标题依次浮现、能量节奏点亮、短暂停留、720ms Logo落位与首页渐显。
- 动效计时从原生退场确认后开始，取消500ms直接开始的旧兜底。4秒无回调时先要求原生移除遮罩并确认，再开始品牌展示。
- 原生“系统动画关闭”标志只决定系统遮罩如何移除，不再直接跳过品牌展示。系统或App减少动态效果时保留约2秒静态品牌画面与轻柔透明度过渡，不旋转或移动Logo。
- 验证六种视口的单行、完整展示时长、原生回调延迟、系统动画关闭标志、低动态展示、Logo落位与不预加载后台页。真机上的系统交接仍需安装后验收。

## v1.3.1 品牌开屏与字体层次

- 中文品牌、首页大标题、页面标题及分区标题使用 Noto Serif SC 衬线字体子集；正文、表单和说明使用 Noto Sans SC；金额、度数和环比数据使用圆润的 Outfit。字体离线随包，不通过网络加载，附 SIL OFL 许可证。
- 设计独立品牌开屏：浅薄荷光感、能量光环、轻微轨道运动、品牌字标与补能节奏。文字和光环依次出现，随后 Logo 收拢到首页左上角，首页在同一画面中渐显；不重建首页。
- 原生 SplashScreen 只做160ms的已绘制帧交接。设计开屏与首页由同一 WebView 控制，消除跨原生/WebView坐标换算；设计动效约1秒，减少动画时跳过。安卓系统自身的启动动画仍由系统负责。
- 光感和阴影是静态绘制；逐帧只动画 transform、opacity。其他4个页面的预加载延至开屏结束，避免与启动动画争用渲染。
- 新增开屏专项：三种字体真实加载、原生交接回调、首页节点不重建、开屏期间不预加载页面、Logo落点、6种屏幕尺寸含横屏、减少动画、4倍CPU限速启动帧采样。
- 动画演示与截图见 deliverables/开屏设计演示.webm、界面预览-设计开屏.png、界面预览-字体首页.png。演示录自桌面浏览器，不是安卓真机录屏。

## v1.3.0 字体、开屏、安全区域与环比

- 中文界面使用随包的 Noto Sans SC 可变字体子集；金额、度数和统计数字使用 Manrope 可变字体与等宽数字。未收录字符由手机系统字体补齐。字体离线加载，附 SIL OFL 许可证；来源与校验和见 web/fonts/SOURCES.md。
- Android 12及以上接入系统 SplashScreen 退出动画；首屏字体、页面布局与 WebView 可见帧准备后，Logo 移向首页标识、背景平滑淡出。Android 8–11使用同一 Activity 内的覆盖层衔接，不新增启动 Activity；减少动画及系统动画关闭时直接完成退场。
- Android 11及以上窗口绘制到系统栏后，使用系统栏、刘海、手势及输入法 Insets。底栏、悬浮按钮与弹层留出导航安全区域；页面左右滑动避开系统返回手势区域；输入法高度随系统动画更新。Android 8–10沿用系统栏外的安全窗口。
- 五个页面的标题栏固定在顶部；明细新增按钮移到独立固定层，避免随列表滚动。
- 弹层复用同一窗口，独立处理前景位移与遮罩透明度。开关时不改变页面 overflow，不重建后台页面；支持快速重开与减少动画。
- 日、周、月、季、年增加充电费用、已知电量、有电量均价与费用条目环比。红色及向上箭头表示增加，绿色及向下箭头表示减少。对比相同用途的上一完整自然周期；本期未结束会提示。上期无记录、电量缺失时不计算相应比例；上期为0时不显示无穷百分比。仅记月份费用仍不分摊到日或周。
- 新增3项环比边界单元测试和浏览器专项：本地字体、固定页头/按钮、Insets模拟、8次弹层复用、快速重开、红绿箭头、五种宽度与字体准备后的启动桥。旧版数据、JSON和Markdown格式保持兼容。
- 以上原生功能已编译，浏览器回归通过；尚未在小米18 Pro、Android 17、澎湃OS4.0上实际测量开屏、输入法动画、小白条或帧率。

参照 [Google 边到边布局](https://developer.android.com/develop/ui/views/layout/edge-to-edge?hl=zh-cn)、[沉浸式适配 Codelab](https://developer.android.com/codelabs/edge-to-edge?hl=zh-cn#5)、[原生 Activity 手动配置](https://developer.android.com/develop/ui/views/layout/edge-to-edge-manually)、[SplashScreen](https://developer.android.com/develop/ui/views/launch/splash-screen)。本项目使用原生 Activity 与系统 WindowInsets API，按手动配置路径实现相同布局规则，未引入 ComponentActivity。用户提供的 Jetpack enableEdgeToEdge 入口现有 API 文档转向 WindowCompat.enableEdgeToEdge。

## v1.2.1 图标更新

桌面图标与 App 内标识统一换成青柠黄到薄荷绿渐变，搭配暖白闪电和轻盈高光。仅更新图标与版本标识，沿用 v1.2.0 的交互与数据格式。

## v1.2.0 动效与性能

- 五个主页面分别保留 DOM 和滚动位置，数据或筛选变化时局部更新；切换不清空整页，不使用浏览器截图/View Transition。
- 主页面沿水平方向连续移动，支持手指拖动、取消、快速切换和减少动画。录入弹层只在首次打开时做轻微位移，详情到编辑保留同一个外壳。
- 横向模块支持点击和拖动；指示层主要通过 transform 运动，不在每个触摸采样中重建内容。
- 自定义选择浮层覆盖日期、月份、年份、时间和普通选项。取消选择不修改输入，系统返回先关闭选择浮层；选择闰日及变更月份时按真实日历处理。
- 页面卡片不再逐个叠加 backdrop-filter；仅小面积底部导航保留背景模糊。明细首批显示80条，可追加显示；搜索短暂合并输入事件，保留光标。
- 安卓端明确启用硬件加速、关闭 WebView 算法变暗；Android 13及以上采用 OnBackInvokedCallback，仅在内部页面或浮层需要返回时拦截，首页退出由系统处理。
- 本机使用1,000条合成记录、4倍CPU限速、25次已缓存导航做浏览器压力测试。结果见 qa/browser-performance.json 和 deliverables/动效与性能验证.md。该结果不等于小米18 Pro、Android 17、澎湃OS4.0的真机帧率。

参考资料：[Google 高性能网页动画](https://web.dev/articles/animations-guide)、[Android 渲染优化](https://developer.android.com/topic/performance/rendering)、[Android 慢帧排查](https://developer.android.com/topic/performance/issues/render)、[Android 返回手势适配](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture)。

## 桌面预览

在项目目录执行：

```powershell
node preview-server.cjs
```

打开 `http://127.0.0.1:4317/?demo=1` 查看独立样例；移除 `?demo=1` 可体验空账本。浏览器数据只保存在当前浏览器，不与手机自动同步。

