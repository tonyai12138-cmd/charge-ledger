const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'}),context=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Asia/Shanghai'}),page=await context.newPage();
 await page.goto('http://127.0.0.1:4317/');await page.waitForFunction(()=>!window.Launch?.active);
 await page.evaluate(()=>{
  mutate(s=>s.records=Array.from({length:1000},(_,i)=>({id:'perf_'+i,time:`2026-10-${String(i%28+1).padStart(2,'0')}T10:30`,energyMilli:20000,amountCents:1800,category:i%2?'business':'daily',station:'合成性能测试站 '+i%10,note:'',trip:'',operator:'',address:''})));render();
 });
 for(const name of ['records','stats','tariffs','profile','home']){await page.locator(`[data-action="navigate"][data-value="${name}"]`).click();await page.waitForTimeout(350);}
 assert.equal(await page.evaluate(()=>document.querySelector('[data-page="records"] .record-list').children.length),80);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const results=await page.evaluate(async()=>{
  const times=[],frames=[],longTasks=[],before=Interactions.metrics();let active=true,last=performance.now(),blank=0;
  const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));observer.observe({type:'longtask',buffered:false});
  function sample(now){if(!active)return;frames.push(now-last);last=now;const views=[...document.querySelectorAll('.page-view:not([hidden])')];if(!views.length||views.every(v=>!v.childNodes.length))blank++;requestAnimationFrame(sample);}requestAnimationFrame(sample);
  for(let i=0;i<25;i++){const names=['records','stats','tariffs','profile','home'],name=names[i%5],t=performance.now();document.querySelector(`[data-action="navigate"][data-value="${name}"]`).click();times.push(performance.now()-t);await new Promise(r=>setTimeout(r,335));}
  active=false;observer.disconnect();return {handlerMs:times,frameIntervalsMs:frames,mainThreadLongTasksMs:longTasks,blankSurfaceSamples:blank,before,after:Interactions.metrics(),cardsWithBackdropBlur:[...document.querySelectorAll('.card,.record-list,.mini-card')].filter(el=>getComputedStyle(el).backdropFilter!=='none').length};
 });
 const stats=values=>{const v=[...values].sort((a,b)=>a-b);return {count:v.length,median:+(v[Math.floor(v.length*.5)]||0).toFixed(2),p95:+(v[Math.floor(v.length*.95)]||0).toFixed(2),max:+(v.at(-1)||0).toFixed(2)};};
 assert.equal(results.blankSurfaceSamples,0);assert.equal(results.after.pagesBuilt,5);assert.equal(results.after.patches,results.before.patches);assert.equal(results.cardsWithBackdropBlur,0);assert.ok(results.mainThreadLongTasksMs.every(t=>t<700));
 const report={passed:true,environment:'Desktop Chrome headless; 390x844; synthetic 1000 entries; CPU slowdown 4x; 25 warm navigation transitions',androidDeviceMeasured:false,navigationHandlerMs:stats(results.handlerMs),browserFrameIntervalsMs:stats(results.frameIntervalsMs),mainThreadLongTasksMs:results.mainThreadLongTasksMs,blankSurfaceSamples:results.blankSurfaceSamples,cachedPages:results.after.pagesBuilt,cachedPagePatchesDuringNavigation:results.after.patches-results.before.patches,cardBackdropBlurCount:results.cardsWithBackdropBlur};
 fs.writeFileSync(path.resolve(__dirname,'../qa/browser-performance.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
