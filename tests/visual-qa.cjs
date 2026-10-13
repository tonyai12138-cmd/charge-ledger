const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Shanghai'}),page=await context.newPage();
 const out=path.resolve(__dirname,'../deliverables');
 await page.goto('http://127.0.0.1:4317/?demo=1');await page.waitForTimeout(1200);
 await page.screenshot({path:path.join(out,'界面预览-首页手机.png')});
 await page.locator('[data-action="navigate"][data-value="stats"]').click();await page.waitForTimeout(850);await page.screenshot({path:path.join(out,'界面预览-统计手机.png')});
 await page.locator('[data-action="navigate"][data-value="profile"]').click();await page.locator('[data-action="import"]').click();await page.waitForTimeout(550);await page.screenshot({path:path.join(out,'界面预览-追加导入.png')});
 await page.locator('[data-action="close"]').click();await page.waitForTimeout(250);
 await page.setViewportSize({width:320,height:760});await page.locator('[data-action="navigate"][data-value="home"]').click();await page.locator('.page-view.is-current [data-action="new"]').first().click();await page.waitForTimeout(550);await page.screenshot({path:path.join(out,'界面预览-小屏录入.png')});
 await page.locator('#f-precision').selectOption('month');await page.locator('#f-time').fill('2026-10');await page.locator('#f-kind').selectOption('trip_expense_summary');await page.locator('#f-amount').fill('80.00');
 await page.screenshot({path:path.join(out,'界面预览-仅月份录入.png')});
 await page.locator('[data-action="close"]').click();await page.locator('[data-action="discard"]').click();await page.waitForTimeout(250);
 await page.setViewportSize({width:390,height:844});await page.locator('[data-action="navigate"][data-value="home"]').click();await page.waitForTimeout(1200);
 // Capture real browser motion samples rather than fabricate a performance claim.
 await page.locator('[data-action="navigate"][data-value="stats"]').click();await page.waitForTimeout(100);
 await page.screenshot({path:path.join(out,'动画预览-切换中.png')});await page.waitForTimeout(500);
 await page.screenshot({path:path.join(out,'动画预览-切换完成.png')});
 await browser.close();console.log('VISUAL_QA_CAPTURED');
})().catch(e=>{console.error(e);process.exit(1);});
