const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const L=require('../web/core.js');
const ROOT=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,locale:'zh-CN',timezoneId:'Asia/Shanghai'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const action=a=>a==='close'?page.locator('#overlay-root [data-action="close"]').first():page.locator(`#overlay-root [data-action="${a}"],.page-view.is-current [data-action="${a}"]`),nav=v=>page.locator(`[data-action="navigate"][data-value="${v}"]`);
 const old=L.emptyState();old.settings.vehicle='原有车辆';old.settings.budgetCents=98700;
 old.records=[{id:'old_v1',time:'2026-10-06T10:30',energyMilli:10000,amountCents:1500,category:'daily',station:'原有充电站'}];
 old.trash=[{id:'old_trash',time:'2026-09-01T10:30',energyMilli:20000,amountCents:1000,category:'daily',station:'回收站',deletedAt:'2026-09-02T10:00'}];
 await page.goto('http://127.0.0.1:4317/');await page.waitForFunction(()=>!window.Launch?.active);await page.evaluate(s=>localStorage.setItem('charge-ledger-v1',JSON.stringify(s)),old);await page.reload();
 assert.equal(await page.evaluate(()=>storageError),'');assert.equal(await page.evaluate(()=>state.records[0].energyMilli),10000);
 await action('new').first().click();await page.locator('#f-precision').selectOption('day');await page.locator('#f-time').fill('2026-10-06');await page.locator('#f-amount').fill('30.00');await page.locator('#record-form [type="submit"]').click();
 assert.equal(await page.evaluate(()=>state.records.length),2);assert.equal(await page.evaluate(()=>state.records[1].energyMilli),null);assert.equal(await page.evaluate(()=>state.records[1].station),null);assert.equal(await page.evaluate(()=>state.records[1].time),null);
 await action('new').first().click();await page.locator('#f-precision').selectOption('month');await page.locator('#f-time').fill('2026-10');await page.locator('#f-kind').selectOption('trip_expense_summary');await page.locator('#f-amount').fill('80.00');await page.locator('#f-trip').fill('测试路线');await page.locator('#record-form [type="submit"]').click();
 assert.equal(await page.evaluate(()=>state.records.length),3);assert.equal(await page.evaluate(()=>state.records[2].category),'business');
 await page.reload();await nav('stats').click();assert.equal(await page.locator('.summary-main b').textContent(),'¥125.00');assert.equal(await page.locator('.metric-trio b').nth(1).textContent(),'1.5000');
 assert.equal(await page.evaluate(()=>L.series(L.filter(state.records,{start:'2026-10-01',until:'2026-11-01'}),L.period('2026-10-06','month'),'month').reduce((s,x)=>s+x.amountCents,0)),12500);
 await page.evaluate(()=>{anchor='2026-10-06';render();});
 for(const grain of ['day','week']){await page.locator(`[data-action="grain"][data-value="${grain}"]`).click();assert.equal(await page.locator('.summary-main b').textContent(),'¥45.00');assert.ok(await page.locator('.precision-notice').isVisible());}
 const payload={format:'charge-ledger-legacy-expenses',version:1,currency:'CNY',records:[{id:'import_same_day_a',time:null,datePrecision:'day',date:'2026-08-29',monthKey:'2026-08',recordKind:'charging_expense',amountCents:1000,energyMilli:null,category:'daily',station:null},{id:'import_same_day_b',time:null,datePrecision:'day',date:'2026-08-29',monthKey:'2026-08',recordKind:'charging_expense',amountCents:2000,energyMilli:null,category:'daily',station:null}]};
 const upload=async data=>{await nav('profile').click();await action('import').click();await page.evaluate(()=>fileMode='append');await page.evaluate(()=>document.getElementById('toast').textContent='');await page.locator('#backup-file').setInputFiles({name:'history.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await page.waitForFunction(()=>modal==='import-preview'||document.getElementById('toast').textContent.includes('追加导入未执行'));};
 await upload(payload);assert.equal(await page.evaluate(()=>state.records.length),3);await action('confirm-import').click();assert.equal(await page.evaluate(()=>state.records.length),5);assert.equal(await page.evaluate(()=>state.settings.vehicle),'原有车辆');assert.equal(await page.evaluate(()=>state.settings.budgetCents),98700);assert.equal(await page.evaluate(()=>state.trash.length),1);
 await upload(payload);assert.equal(await action('confirm-import').isDisabled(),true);assert.equal(await page.evaluate(()=>state.records.length),5);await action('close').click();await page.waitForTimeout(230);
 await upload({...payload,records:[{...payload.records[0],amountCents:9999}]});assert.ok(await page.locator('#toast').textContent().then(t=>t.includes('内容不同')));assert.equal(await page.evaluate(()=>state.records.length),5);await action('close').click();await page.waitForTimeout(230);
 await nav('profile').click();await action('settings').click();await page.locator('#motion-mode').selectOption('reduced');await page.locator('#settings-form [type="submit"]').click();assert.equal(await page.evaluate(()=>document.documentElement.dataset.motion),'reduced');await page.reload();assert.equal(await page.evaluate(()=>state.settings.motion),'reduced');
 await action('new').first().click();assert.equal(await page.evaluate(()=>document.querySelector('.sheet').getAnimations().length),0);await action('close').click();
 await nav('profile').click();await action('settings').click();await page.locator('#motion-mode').selectOption('system');await page.locator('#settings-form [type="submit"]').click();await page.waitForTimeout(250);
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.equal(await page.evaluate(()=>document.documentElement.dataset.motion),'reduced');await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();
 for(const width of [320,360,390,430,760]){await page.setViewportSize({width,height:844});for(const name of ['home','records','stats','tariffs','profile']){await nav(name).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} ${name} overflow`);}await action('new').first().count().then(async n=>{if(!n)await nav('home').click();});await action('new').first().click();await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width} form overflow`);await action('close').click();await page.waitForTimeout(230);}
 if(process.env.LEGACY_IMPORT_FILE){
   const data=JSON.parse(fs.readFileSync(process.env.LEGACY_IMPORT_FILE,'utf8')),source=L.parseImport(data),expected=L.sum(source);
   const before=await page.evaluate(()=>L.sum(state.records));await page.setViewportSize({width:390,height:844});await upload(data);assert.equal(await page.evaluate(()=>pendingImport.length),source.length);await action('confirm-import').click();
   const totals=await page.evaluate(()=>L.sum(state.records));assert.equal(totals.amountCents,before.amountCents+expected.amountCents);assert.equal(totals.count,before.count+expected.count);assert.equal(totals.energyRecordCount,before.energyRecordCount);
   const sameDay=source.filter(r=>r.date==='2026-08-29');assert.equal(sameDay.length,2);for(const r of sameDay)assert.ok(await page.evaluate(id=>state.records.some(x=>x.id===id),r.id));
   await upload(data);assert.equal(await action('confirm-import').isDisabled(),true);await action('close').click();await page.waitForTimeout(230);await page.reload();assert.equal(await page.evaluate(()=>state.records.length),before.count+expected.count);
   console.log(JSON.stringify({temporaryFileImport:'PASS',expenses:expected.count,daily:source.filter(r=>r.category==='daily').length,businessSummaries:expected.tripSummaryCount,totalCents:expected.amountCents}));
 }
 const beforeIdentical=await page.evaluate(()=>state.records.length);
 for(let i=0;i<2;i++){await nav('home').click();await action('new').first().click();await page.locator('#f-precision').selectOption('day');await page.locator('#f-time').fill('2026-10-25');await page.locator('#f-amount').fill('12.34');await page.locator('#record-form [type="submit"]').click();}
 assert.equal(await page.evaluate(()=>state.records.length),beforeIdentical+2);
 assert.deepEqual(errors,[]);
 // No historical user records, exports or screenshots are written to the project.
 fs.writeFileSync(path.join(ROOT,'qa/upgrade-ui-report.json'),JSON.stringify({passed:true,checks:['v1 local data retained','optional energy and station','day and month precision CRUD','known-energy weighted average','monthly trend conservation','day/week coarse exclusion','append and duplicate handling','conflict atomic rejection','settings and trash retained','system and manual reduced motion','five widths and sheet overflow','temporary JSON import when provided','same-day equal manual costs retained'],consoleErrors:errors},null,2));
 await browser.close();console.log('UPGRADE_UI_PASS');
})().catch(e=>{console.error(e);process.exit(1);});
