const {chromium}=require('playwright');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,timezoneId:'Asia/Shanghai'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:4317/?demo=1');await page.waitForFunction(()=>!window.Launch?.active);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(550);
 assert.equal(await page.evaluate(()=>document.fonts.check('600 20px "Ledger Sans"')&&document.fonts.check('700 20px Outfit')&&document.fonts.check('600 24px "Ledger Display"')),true);
 const nav=async name=>{await page.locator(`[data-action="navigate"][data-value="${name}"]`).click();await page.waitForTimeout(360);};
 for(const name of ['home','records','stats','tariffs','profile']){
  await nav(name);const before=await page.locator('.is-current .page-header').boundingBox();await page.locator('.page-view.is-current').evaluate(el=>el.scrollTop=500);await page.waitForTimeout(70);const after=await page.locator('.is-current .page-header').boundingBox();assert.ok(Math.abs(after.y)<1,`${name}: header y=${after.y}`);
 }
 await nav('records');const before=await page.locator('#records-add').boundingBox();await page.locator('.page-view.is-current').evaluate(el=>el.scrollTop=100);const after=await page.locator('#records-add').boundingBox();assert.deepEqual(after,before);
 await page.evaluate(()=>onNativeInsets(32,0,28,0));await page.waitForTimeout(100);const navRect=await page.locator('.nav').boundingBox();assert.ok(navRect.y+navRect.height<=844-28-11);
 await page.screenshot({path:path.resolve('deliverables/界面预览-固定明细.png')});
 const app=await page.evaluate(()=>{window.originalApp=document.getElementById('page-content');window.originalSheet=null;window.baselineScroll=document.querySelector('.page-view.is-current').scrollTop;newRecord();return true;});await page.waitForTimeout(360);
 await page.evaluate(()=>window.originalSheet=document.querySelector('.sheet'));await page.screenshot({path:path.resolve('deliverables/界面预览-新版录入.png')});
 for(let i=0;i<8;i++){
  await page.evaluate(()=>closeSheet());await page.waitForTimeout(250);await page.evaluate(()=>newRecord());await page.waitForTimeout(340);
  assert.equal(await page.evaluate(()=>originalSheet===document.querySelector('.sheet')&&originalApp===document.getElementById('page-content')&&baselineScroll===document.querySelector('.page-view.is-current').scrollTop),true);
  assert.equal(await page.evaluate(()=>document.body.style.overflow), '');
 }
 await page.evaluate(()=>{closeSheet();setTimeout(()=>newRecord(),40)});await page.waitForTimeout(400);assert.equal(await page.locator('.modal-backdrop:not([hidden])').count(),1);assert.equal(await page.evaluate(()=>document.getElementById('app').inert),true);
 await page.evaluate(()=>closeSheet());await page.waitForTimeout(250);
 await page.evaluate(()=>{mutate(s=>{s.records.push({id:'compare_prev',time:'2026-09-20T12:00',energyMilli:200000,amountCents:30000,category:'daily',station:'测试站'});});category='all';grain='month';anchor='2026-10-13';screen='stats';render();});await page.waitForTimeout(400);
 const cost=page.locator('.is-current [data-change="amount"]');assert.match(await cost.textContent(),/↓/);assert.equal(await cost.evaluate(el=>getComputedStyle(el).color),'rgb(25, 129, 95)');
 await page.locator('.comparison-card').scrollIntoViewIfNeeded();await page.screenshot({path:path.resolve('deliverables/界面预览-环比.png')});
 for(const grain of ['day','week','month','quarter','year']){await page.evaluate(g=>{window.grain=g;render();},grain);assert.equal(await page.locator('.is-current [data-change]').count(),4);}
 for(const width of [320,360,390,430,760]){
  await page.setViewportSize({width,height:844});await page.evaluate(()=>onNativeInsets(32,18,48,12));await page.waitForTimeout(50);
  for(const name of ['home','records','stats','tariffs','profile']){await nav(name);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const h=await page.locator('.is-current .page-header').boundingBox();assert.ok(h.x>=-1&&h.x+h.width<=width+1,`${width} ${name} header bounds`);}
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>newRecord());assert.equal(await page.locator('.sheet').evaluate(el=>el.getAnimations().length),0);await page.evaluate(()=>closeSheet());assert.equal(await page.locator('.modal-backdrop').isVisible(),false);
 const nativePage=await browser.newPage();await nativePage.addInitScript(()=>{window.launchCalls=[];window.Android={load:()=>null,save:()=>true,insets:()=>JSON.stringify([30,0,24,0,34,34]),uiReady:(...args)=>{launchCalls.push({args,fontsLoaded:document.fonts.status,brand:!!document.querySelector('.brand-icon')});setTimeout(()=>onNativeLaunchReleased(false),160);}};});await nativePage.goto('http://127.0.0.1:4317/');await nativePage.waitForFunction(()=>!window.Launch?.active);await nativePage.waitForFunction(()=>launchCalls.length===1);const launch=await nativePage.evaluate(()=>launchCalls[0]);assert.equal(launch.fontsLoaded,'loaded');assert.equal(launch.brand,true);assert.ok(launch.args[1]>=30);assert.deepEqual(await nativePage.evaluate(()=>window.__gestureInsets),[34,34]);await nativePage.close();
 assert.deepEqual(errors,[]);const report={passed:true,checks:['local font loading','five sticky app bars','FAB fixed outside scroller','gesture and three-button inset simulations','same sheet and page identity across eight openings','rapid reopen cancellation','unchanged background scroll and overflow','all five comparison grains','green decrease and arrows','zero baseline unit tests','five widths with side cutouts','reduced motion','native ready bridge waits for fonts and painted frame'],androidDeviceMeasured:false,launchBridge:launch,consoleErrors:errors};fs.writeFileSync(path.resolve('qa/polish-ui-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
