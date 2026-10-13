const test=require('node:test'),assert=require('node:assert/strict'),L=require('../web/core.js');
const row=(id,date,amount,energy=10000,category='daily')=>({id,date,datePrecision:'day',time:null,energyMilli:energy,amountCents:amount,category});
test('all five periods compare adjacent calendar periods across leap and year boundaries',()=>{
 for(const [grain,anchor,previous,current] of [['day','2024-03-01','2024-02-29','2024-03-01'],['week','2026-01-01','2025-12-28','2025-12-29'],['month','2026-01-31','2025-12-31','2026-01-01'],['quarter','2026-01-15','2025-12-31','2026-01-01'],['year','2026-10-13','2025-12-31','2026-01-01']]){
  const c=L.comparison([row('p',previous,4000),row('c',current,5000)],anchor,grain);
  assert.equal(c.metrics[0].percent,25,grain);assert.equal(c.metrics[0].direction,'up');assert.equal(c.previousPeriod.end,c.currentPeriod.start);
 }
});
test('same purpose filters, month-only expenses and missing energy retain their meaning',()=>{
 const rows=[row('p','2026-09-12',4000,null),row('c','2026-10-12',2000,10000),row('business','2026-10-12',9000,10000,'business'),{id:'summary',datePrecision:'month',monthKey:'2026-10',amountCents:3000,energyMilli:null,category:'daily'}];
 const c=L.comparison(rows,'2026-10-12','month','daily');assert.equal(c.current.amountCents,5000);assert.equal(c.metrics[0].percent,25);assert.equal(c.metrics[1].direction,'unknown');assert.equal(c.metrics[2].direction,'unknown');
 const d=L.comparison(rows,'2026-10-12','day','daily');assert.equal(d.current.amountCents,2000);assert.equal(d.current.count,1);
});
test('zero denominator, absent baseline, decrease and unchanged values never produce Infinity',()=>{
 assert.equal(L.change(10,0).label,'上期为0');assert.equal(L.change(10,0).percent,null);assert.equal(L.change(0,0).direction,'flat');assert.equal(L.change(0,100).percent,-100);assert.equal(L.change(100,100).label,'持平');
 const empty=L.comparison([row('c','2026-10-12',1000)],'2026-10-12','month');assert.equal(empty.metrics[0].direction,'unknown');assert.equal(empty.metrics[0].percent,null);
 const free=L.comparison([row('p','2026-09-12',0),row('c','2026-10-12',1000)],'2026-10-12','month');assert.equal(free.metrics[0].direction,'up');assert.equal(free.metrics[0].percent,null);
});
