const test=require('node:test');
const assert=require('node:assert/strict');
const L=require('../web/core.js');
const day=(id,date,amountCents,energyMilli=null)=>({id,date,datePrecision:'day',monthKey:date.slice(0,7),time:null,recordKind:'charging_expense',amountCents,energyMilli,category:'daily',station:null});
const trip=(id,monthKey,amountCents)=>({id,monthKey,date:null,datePrecision:'month',time:null,recordKind:'trip_expense_summary',amountCents,energyMilli:null,category:'business',station:null,trip:'测试行程'});
const archive=records=>({format:'charge-ledger-legacy-expenses',version:1,currency:'CNY',records});
test('missing energy and station remain unknown; explicit zero energy is rejected',()=>{
 const r=day('a','2026-10-06',3456);L.validateRecord(r);assert.equal(L.price(r),null);assert.equal(L.energy(r.energyMilli),'—');assert.equal(L.energySummary(L.sum([r])),'—');
 assert.throws(()=>L.validateRecord({...r,energyMilli:0}));assert.throws(()=>L.validateRecord({...r,energyMilli:-1}));assert.throws(()=>L.validateRecord({...r,energyMilli:1.5}));
});
test('missing-energy expense never contaminates weighted price, including free known-energy orders',()=>{
 const rows=[day('known','2026-10-06',3000,20000),day('unknown','2026-10-06',10000),day('free','2026-10-07',0,10000)];
 const s=L.sum(rows);assert.equal(s.amountCents,13000);assert.equal(s.energyMilli,30000);assert.equal(s.pairedAmountCents,3000);assert.equal(s.energyRecordCount,2);assert.equal(L.price(s),1);
});
test('month summaries enter month, quarter, year but never day or week',()=>{
 const rows=[day('a','2026-09-28',1200),trip('b','2026-09',8800)];
 for(const grain of ['month','quarter','year'])assert.equal(L.groups(rows,grain).reduce((s,g)=>s+g.amountCents,0),10000);
 for(const grain of ['day','week'])assert.equal(L.groups(rows,grain).reduce((s,g)=>s+g.amountCents,0),1200);
 assert.equal(L.sum(rows).tripSummaryCount,1);assert.equal(L.sum(rows).singleCount,1);
});
test('date ranges require whole-month containment, including leap-month end',()=>{
 const rows=[trip('a','2024-02',2000)];
 assert.equal(L.filter(rows,{start:'2024-02-01',end:'2024-02-29'}).length,1);
 assert.equal(L.filter(rows,{start:'2024-02-02',end:'2024-02-29'}).length,0);
 assert.equal(L.filter(rows,{end:'2024-02-28'}).length,0);
 assert.equal(L.filter(rows,{until:'2024-03-01'}).length,1);
});
test('trend series preserves all included expense; unknown hour and month are separate buckets',()=>{
 const rows=[day('a','2026-10-06',1234),trip('b','2026-10',8000),{id:'c',time:'2026-10-06T18:00',energyMilli:1000,amountCents:66,category:'daily',station:'测试站'}];
 const d=L.series(rows,L.period('2026-10-06','day'),'day');assert.equal(d.reduce((s,g)=>s+g.amountCents,0),1300);assert.equal(d.find(g=>g.label==='时刻未记').amountCents,1234);
 const m=L.series(rows,L.period('2026-10-06','month'),'month');assert.equal(m.reduce((s,g)=>s+g.amountCents,0),9300);assert.equal(m.find(g=>g.label==='仅记月份').amountCents,8000);
 for(const grain of ['week','quarter','year']){const p=L.period('2026-10-06',grain);assert.equal(L.series(rows,p,grain).reduce((s,g)=>s+g.amountCents,0),L.sum(L.filter(rows,{start:p.start,until:p.end,grain})).amountCents);}
});
test('same-day amounts and equal expense without identifiers are not deduplicated',()=>{
 const s=L.emptyState(),rs=L.parseImport(archive([day('a','2026-08-29',1000),day('b','2026-08-29',1000)]));
 const p=L.planImport(s,rs);assert.equal(p.added.length,2);assert.equal(L.sum(p.added).amountCents,2000);
});
test('append preserves existing settings and trash, reimport skips identical IDs in either collection',()=>{
 const s=L.emptyState();s.settings.vehicle='已有车辆';s.settings.budgetCents=32100;s.records=[day('old','2026-08-01',600)];s.trash=[{...day('deleted','2026-08-02',700),deletedAt:'2026-08-03T10:00'}];
 const before=JSON.stringify(s),rs=L.parseImport(archive([day('new','2026-08-03',1000),day('deleted','2026-08-02',700)])),p=L.planImport(s,rs);
 assert.equal(JSON.stringify(s),before);assert.equal(p.added.length,1);assert.equal(p.skipped,1);
 s.records.push(...p.added);const repeat=L.planImport(s,rs);assert.equal(repeat.added.length,0);assert.equal(repeat.skipped,2);assert.equal(s.settings.vehicle,'已有车辆');assert.equal(s.settings.budgetCents,32100);assert.equal(s.trash.length,1);
});
test('conflicting identifiers stop whole append and leave source state untouched',()=>{
 const s=L.emptyState();s.records=[day('a','2026-08-01',1000)];const before=JSON.stringify(s);
 assert.throws(()=>L.planImport(s,[day('new','2026-08-01',2000),day('a','2026-08-01',3000)]),/内容不同/);assert.equal(JSON.stringify(s),before);
 assert.throws(()=>L.planImport(s,[day('new','2026-08-01',2000),day('new','2026-08-02',3000)]),/重复编号/);
});
test('old schema-1 backup and old minute records survive new validation without migration',()=>{
 const s=L.emptyState();s.records=[{id:'v1',time:'2026-10-06T10:30',energyMilli:23567,amountCents:2345,category:'daily',station:'原有地点'}];const raw=JSON.stringify(s);
 const loaded=L.validateState(JSON.parse(raw));assert.equal(JSON.stringify(loaded),raw);assert.equal(L.precision(loaded.records[0]),'minute');assert.equal(L.parseImport(raw).length,1);
});
test('invalid dates, precision contradictions and wrong currency fail before import',()=>{
 const a=trip('a','2026-13',1000);assert.throws(()=>L.validateRecord(a));assert.throws(()=>L.validateRecord({...day('a','2026-02-29',1000)}));
 assert.throws(()=>L.validateRecord({...day('a','2026-08-03',1000),monthKey:'2026-07'}));assert.throws(()=>L.validateRecord({...trip('a','2026-08',1000),date:'2026-08-03'}));
 assert.throws(()=>L.parseImport({...archive([day('a','2026-08-03',1000)]),currency:'USD'}));assert.throws(()=>L.parseImport(archive([{...day('a','2026-08-03',1000),year:2025}])));
});
test('Markdown keeps unknowns, month precision and exclusions explicit, escaping remains safe',()=>{
 const rows=[day('a','2026-10-06',1234),{...trip('b','2026-10',8000),trip:'秘密|行程',note:'测试\n备注'}];const md=L.markdown(rows);
 assert.ok(md.includes('2026-10 · 仅记月份'));assert.ok(md.includes('2026-10-06 · 时刻未记录'));assert.ok(md.includes('1 条费用（80.00元）'));assert.ok(md.includes('行程合计'));assert.ok(md.includes('秘密\\|行程'));assert.ok(md.includes('测试<br>备注'));assert.ok(!md.includes('NaN'));assert.ok(!md.includes('Infinity'));
 const hidden=L.markdown(rows,{includePrivate:false});assert.ok(!hidden.includes('秘密'));assert.ok(!hidden.includes('测试<br>备注'));
});
