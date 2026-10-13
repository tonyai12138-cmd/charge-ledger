const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../web/core.js');
const r = (id,time,energyMilli,amountCents,category='daily')=>({id,time,energyMilli,amountCents,category,station:'测试站',address:'',note:'',operator:'',trip:'',location:null});
test('money and energy use integer storage and reject implicit rounding',()=>{
 assert.equal(L.decimal('0.29',2,'金额'),29); assert.equal(L.decimal('38.561',3,'电量'),38561);
 assert.equal(L.energy(1000),'1');assert.equal(L.money(29),'0.29');assert.equal(L.energy(0),'0');
 for(const n of ['1.234','-1','1e2','NaN','Infinity','','1,234']) assert.throws(()=>L.decimal(n,2,'金额'));
});
test('weighted average differs from averaging per-session prices',()=>{
 const s=L.sum([r('a','2026-10-01T10:00',10000,1000),r('b','2026-10-02T10:00',30000,6000)]);
 assert.equal(s.energyMilli,40000);assert.equal(s.amountCents,7000);assert.equal(L.price(s),1.75);
 assert.equal(L.price(L.sum([])),null);assert.equal(L.price(r('f','2026-10-01T10:00',1000,0)),0);
});
test('Monday-start weeks, leap dates, year and quarter boundaries',()=>{
 assert.equal(L.period('2026-01-01','week').start,'2025-12-29');assert.equal(L.period('2026-01-04','week').end,'2026-01-05');
 assert.deepEqual([L.period('2026-12-31','quarter').start,L.period('2026-12-31','quarter').end],['2026-10-01','2027-01-01']);
 assert.equal(L.period('2024-02-28','month').end,'2024-03-01');assert.equal(L.validDate('2024-02-29'),true);assert.equal(L.validDate('2026-02-29'),false);
 assert.equal(L.movePeriod('2026-01-31','month',1),'2026-02-01');assert.equal(L.movePeriod('2026-01-31','month',-1),'2025-12-01');
 assert.equal(L.validTime('2026-10-13T24:00'),false);
});
test('filters include end date but exclude next period and partition purposes',()=>{
 const rs=[r('a','2026-09-30T23:59',1000,100),r('b','2026-10-01T00:00',2000,200,'business'),r('c','2026-10-31T23:59',3000,300),r('d','2026-11-01T00:00',4000,400)];
 assert.equal(L.filter(rs,{start:'2026-10-01',end:'2026-10-31'}).length,2);
 assert.equal(L.sum(L.filter(rs,{start:'2026-10-01',until:'2026-11-01'})).amountCents,500);
 assert.equal(L.sum(L.filter(rs,{category:'business'})).amountCents,200);
 for(const g of ['day','week','month','quarter','year'])assert.equal(L.groups(rs,g).reduce((s,x)=>s+x.amountCents,0),1000);
});
test('backup validation rejects duplicate ids, invalid values and corrupt settings',()=>{
 const s=L.emptyState();s.records.push(r('a','2026-10-13T10:00',1000,100));L.validateState(s);
 s.records.push({...s.records[0]});assert.throws(()=>L.validateState(s));s.records.pop();
 s.records[0].energyMilli=0;assert.throws(()=>L.validateState(s));s.records[0].energyMilli=1000;
 s.settings.budgetCents=1.1;assert.throws(()=>L.validateState(s));
});
test('Markdown preserves exact values, escapes table cells, and hides private fields',()=>{
 const rec={...r('a','2026-10-13T10:00',38561,2988,'business'),station:'杭州|测试站',note:'优惠\n第二行',trip:'秘密行程',parkingCents:500,location:{lat:30,lng:120,accuracy:10}};
 const md=L.markdown([rec]);assert.ok(md.includes('38.561'));assert.ok(md.includes('29.88'));assert.ok(md.includes('34.88'));assert.ok(md.includes('杭州\\|测试站'));assert.ok(md.includes('优惠<br>第二行'));
 for(const title of ['按日','按周','按月','按季度','按年'])assert.ok(md.includes(title));
 assert.ok(!md.includes('"lat"'));const hidden=L.markdown([rec],{includePrivate:false});assert.ok(!hidden.includes('杭州'));assert.ok(!hidden.includes('秘密行程'));assert.ok(!hidden.includes('优惠<br>'));
});
test('series fills missing dates with zeros and has correct period totals',()=>{
 const rs=[r('a','2026-10-01T10:00',1000,100),r('b','2026-10-31T23:59',2000,200)];
 const items=L.series(rs,L.period('2026-10-13','month'),'month');assert.equal(items.length,31);assert.equal(items[1].count,0);assert.equal(items.reduce((s,x)=>s+x.amountCents,0),300);
 assert.equal(L.series(rs,L.period('2026-10-13','year'),'year').length,12);
});
