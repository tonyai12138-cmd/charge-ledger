const {chromium}=require('playwright'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Shanghai',recordVideo:{dir:path.resolve(__dirname,'../qa/videos'),size:{width:390,height:844}}}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4317/?demo=1');await page.waitForFunction(()=>!window.Launch?.active);await page.waitForTimeout(1000);
 const nav=name=>page.locator(`[data-action="navigate"][data-value="${name}"]`),out=path.resolve(__dirname,'../deliverables');
 await page.screenshot({path:path.join(out,'界面预览-首页手机.png')});
 await nav('stats').click();await page.waitForTimeout(600);await page.screenshot({path:path.join(out,'界面预览-统计手机.png')});
 const a=await page.locator('.is-current [data-action="grain"][data-value="month"]').boundingBox(),b=await page.locator('.is-current [data-action="grain"][data-value="year"]').boundingBox();
 await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:30});await page.mouse.up();await page.waitForTimeout(650);
 await nav('home').click();await page.waitForTimeout(450);await nav('records').click();await page.waitForTimeout(160);await nav('home').click();await page.waitForTimeout(650);
 await page.locator('.is-current [data-action="new"]').first().click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'界面预览-录入.png')});
 await page.locator('[data-picker-for="f-precision"]').click();await page.waitForTimeout(400);await page.locator('[data-pick="option"][data-value="month"]').click();await page.locator('[data-picker-for="f-time"]').click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'界面预览-新月份.png')});await page.locator('[data-pick="month"][data-number="8"]').click();await page.waitForTimeout(300);await page.locator('[data-pick="apply"]').click();
 await page.locator('[data-picker-for="f-precision"]').click();await page.waitForTimeout(300);await page.locator('[data-pick="option"][data-value="minute"]').click();await page.locator('[data-picker-for="f-time"]').click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'界面预览-新日历.png')});
 await page.locator('[data-wheel="minute"]').evaluate(el=>el.scrollTo({top:20*40,behavior:'smooth'}));await page.waitForTimeout(650);await page.locator('[data-pick="cancel"]').click();
 await page.locator('#overlay-root [data-action="close"]').click();await page.locator('[data-action="discard"]').click();await page.waitForTimeout(300);
 await nav('tariffs').click();await page.waitForTimeout(450);await page.locator('[data-picker-for="tariff-province"]').click();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'界面预览-新省份选择.png')});await page.locator('[data-pick="option"][data-value="江苏"]').click();await page.waitForTimeout(500);
 const video=page.video();await context.close();await video.saveAs(path.join(out,'交互动效演示.webm'));await browser.close();console.log('MOTION_PREVIEW_SAVED');
})().catch(e=>{console.error(e);process.exit(1);});
