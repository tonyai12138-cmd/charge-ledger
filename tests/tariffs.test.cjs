const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../web/tariffs.js'),'utf8'),context);const data=context.window.TARIFFS;
const parse=str=>String(str||'').split('、').filter(Boolean).flatMap(x=>{assert.match(x,/^\d{2}:\d{2}—\d{2}:\d{2}$/);const [a,b]=x.split('—').map(t=>Number(t.slice(0,2))*60+Number(t.slice(3)));assert.ok(a>=0&&a<1440&&b>=0&&b<=1440&&a!==b);return a<b?[[a,b]]:[[a,1440],[0,b]];});
test('34 province-level indices, all 31 mainland regions have source-bound reference schedules',()=>{
 assert.equal(data.provinces.length,34);assert.equal(new Set(data.provinces.map(p=>p.name)).size,34);
 assert.equal(data.provinces.filter(p=>p.regions.some(r=>r.seasons?.length)).length,31);
 for(const p of data.provinces)for(const r of p.regions){assert.ok(r.scope);assert.match(r.url,/^https:\/\//);if(r.seasons?.length){assert.ok(r.policy);assert.ok(r.effective);}}
});
test('seasonal months cover exactly once, valid half-open intervals and no peak-valley conflict',()=>{
 for(const p of data.provinces)for(const r of p.regions){if(!r.seasons?.length)continue;
  for(let month=1;month<=12;month++)assert.equal(r.seasons.filter(s=>s.months.includes(month)).length,1,`${p.name} ${r.name} month ${month}`);
  for(const s of r.seasons){const peak=parse(s.peak),valley=parse(s.valley);parse(s.sharp);parse(s.deep);
   for(const a of peak)for(const b of valley)assert.ok(Math.max(a[0],b[0])>=Math.min(a[1],b[1]),`${p.name} conflicting peak / valley`);
  }
 }
});
test('special charging-facility rules and secondary-source labels are retained',()=>{
 const zj=data.provinces.find(p=>p.name==='浙江');assert.equal(zj.regions.length,2);assert.ok(zj.regions[0].seasons[0].valley.includes('22:30'));
 const secondary=data.provinces.filter(p=>p.regions.some(r=>r.verified===false)).map(p=>p.name);assert.deepEqual(Array.from(secondary).sort(),['天津','广西','海南','青海'].sort());
 assert.ok(data.provinces.find(p=>p.name==='河北').regions[1].reason);assert.ok(data.provinces.find(p=>p.name==='青海').regions[1].reason);
});
