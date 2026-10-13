(function(root, factory) { const api = factory(); if (typeof module === 'object' && module.exports) module.exports = api; else root.Ledger = api; })(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const categories = { daily: '日常用电', business: '差旅用电' };
  function decimal(value, digits, label) {
    const s = String(value).trim();
    if (!new RegExp('^\\d+(?:\\.\\d{1,' + digits + '})?$').test(s)) throw new Error(label + '最多支持' + digits + '位小数，请输入非负数字');
    const parts = s.split('.');
    const n = Number(parts[0]) * 10 ** digits + Number((parts[1] || '').padEnd(digits, '0'));
    if (!Number.isSafeInteger(n) || n > 100000000) throw new Error(label + '超出支持范围');
    return n;
  }
  function fixed(value, digits = 2) { return Number(value).toLocaleString('zh-CN', {minimumFractionDigits: digits, maximumFractionDigits: digits}); }
  function energy(milli) { return milli == null ? '—' : (milli / 1000).toFixed(3).replace(/\.?0+$/, ''); }
  function money(cents) { return (cents / 100).toFixed(2); }
  function price(s) { return s.energyMilli > 0 ? (s.pairedAmountCents ?? s.amountCents) * 10 / s.energyMilli : null; }
  function priceText(s, digits=2) { const p=price(s);return p==null?'—':p.toFixed(digits); }
  function precision(r) { return r.time ? 'minute' : r.datePrecision; }
  function recordDate(r) { return r.time ? r.time.slice(0,10) : (r.datePrecision==='day' ? r.date : r.monthKey+'-01'); }
  function displayDate(r) { return r.time ? r.time.replace('T',' ') : (r.datePrecision==='day' ? r.date+' · 时刻未记录' : r.monthKey+' · 仅记月份'); }
  function energySummary(s) { return s.count && !s.energyRecordCount ? '—' : energy(s.energyMilli); }
  function coverage(s) { return s.count ? `电量已记 ${s.energyRecordCount}/${s.count} 条；均价仅使用有电量记录的费用与电量。` : '记录费用时可暂不填写电量，之后随时补齐。'; }
  function validMonth(s) { return typeof s==='string' && /^\d{4}-\d{2}$/.test(s) && validDate(s+'-01'); }
  function recordBounds(r) { const start=recordDate(r);return {start,end:precision(r)==='month'?period(start,'month').end:shift(start,1)}; }
  function fitsGrain(r, grain) { return precision(r)!=='month' || ['month','quarter','year'].includes(grain); }
  const timeFormatter=new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Shanghai', year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function todayTime() {
    const p = timeFormatter.formatToParts(new Date());
    const x = Object.fromEntries(p.map(i => [i.type,i.value])); return `${x.year}-${x.month}-${x.day}T${x.hour}:${x.minute}`;
  }
  function validDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const [y,m,d] = s.split('-').map(Number); const dt = new Date(Date.UTC(y,m-1,d));
    return y >= 2000 && y <= 2100 && dt.toISOString().slice(0,10) === s;
  }
  function validTime(s) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s) && validDate(s.slice(0,10)) && Number(s.slice(11,13)) < 24 && Number(s.slice(14,16)) < 60; }
  function date(s) { const a = s.slice(0,10).split('-').map(Number); return new Date(Date.UTC(a[0],a[1]-1,a[2])); }
  function iso(d) { return d.toISOString().slice(0,10); }
  function shift(s, days) { const d=date(s); d.setUTCDate(d.getUTCDate()+days); return iso(d); }
  function period(anchor, grain) {
    const d=date(anchor), y=d.getUTCFullYear(), m=d.getUTCMonth(); let a,b;
    if(grain==='day') { a=d; b=date(shift(anchor,1)); }
    else if(grain==='week') { a=date(shift(anchor,-((d.getUTCDay()+6)%7))); b=date(shift(iso(a),7)); }
    else if(grain==='quarter') { a=new Date(Date.UTC(y,Math.floor(m/3)*3,1)); b=new Date(Date.UTC(y,Math.floor(m/3)*3+3,1)); }
    else if(grain==='year') { a=new Date(Date.UTC(y,0,1)); b=new Date(Date.UTC(y+1,0,1)); }
    else { a=new Date(Date.UTC(y,m,1)); b=new Date(Date.UTC(y,m+1,1)); }
    const start=iso(a), end=iso(b); let label;
    if(grain==='day') label=`${y}年${m+1}月${d.getUTCDate()}日`;
    else if(grain==='week') label=`${start.replace(/-/g,'.')} — ${shift(end,-1).slice(5).replace('-','.')}`;
    else if(grain==='quarter') label=`${y}年 · 第${Math.floor(m/3)+1}季度`;
    else if(grain==='year') label=`${y}年`;
    else label=`${y}年${m+1}月`;
    return {start,end,label};
  }
  function movePeriod(anchor, grain, delta) { const p=period(anchor,grain); if(delta>0) return p.end; return period(shift(p.start,-1),grain).start; }
  function filter(records, f={}) {
    return records.filter(r => {
      const b=recordBounds(r),until=f.until||(f.end?shift(f.end,1):'');
      return (!f.category||f.category==='all'||r.category===f.category)&&(!f.grain||fitsGrain(r,f.grain))&&(!f.start||b.start>=f.start)&&(!until||b.end<=until)&&(!f.search||[r.station,r.address,r.note,r.trip,r.operator].join(' ').toLowerCase().includes(f.search.toLowerCase()));
    }).sort((a,b)=>recordDate(b).localeCompare(recordDate(a))||(b.time||'').localeCompare(a.time||'')||(b.sourceSequence||0)-(a.sourceSequence||0)||b.id.localeCompare(a.id));
  }
  function sum(records) {
    return records.reduce((s,r)=>{s.count++;s.amountCents+=r.amountCents;s.parkingCents+=r.parkingCents||0;if(r.recordKind==='trip_expense_summary')s.tripSummaryCount++;else s.singleCount++;
      if(r.energyMilli!=null){s.energyMilli+=r.energyMilli;s.pairedAmountCents+=r.amountCents;s.energyRecordCount++;}return s;
    },{count:0,singleCount:0,tripSummaryCount:0,energyMilli:0,energyRecordCount:0,pairedAmountCents:0,amountCents:0,parkingCents:0});
  }
  function groups(records, grain) { const map=new Map(); records.filter(r=>fitsGrain(r,grain)).forEach(r=>{const k=period(recordDate(r),grain);if(!map.has(k.start))map.set(k.start,{...k,records:[]});map.get(k.start).records.push(r);});return [...map.values()].sort((a,b)=>a.start.localeCompare(b.start)).map(g=>({...g,...sum(g.records)})); }
  function change(current, previous, available=true) {
    if(!available||current==null||previous==null)return {direction:'unknown',percent:null,label:'暂无可比数据'};
    const delta=current-previous,direction=delta>0?'up':delta<0?'down':'flat';
    if(previous===0)return {direction,percent:null,label:delta===0?'持平':'上期为0'};
    const percent=delta/previous*100,absolute=Math.abs(percent);
    return {direction,percent,label:delta===0?'持平':(delta>0?'+':'−')+(absolute<.1?'<0.1':absolute.toFixed(1))+'%'};
  }
  function comparison(records, anchor, grain, category='all') {
    const currentPeriod=period(anchor,grain),previousPeriod=period(movePeriod(anchor,grain,-1),grain);
    const current=sum(filter(records,{category,start:currentPeriod.start,until:currentPeriod.end,grain}));
    const previous=sum(filter(records,{category,start:previousPeriod.start,until:previousPeriod.end,grain}));
    const hasBaseline=previous.count>0;
    const metrics=[['amount','充电费用',current.amountCents,previous.amountCents,hasBaseline],['energy','已知电量',current.energyRecordCount?current.energyMilli:null,previous.energyRecordCount?previous.energyMilli:null,hasBaseline],['price','有电量均价',price(current),price(previous),hasBaseline],['count','费用条目',current.count,previous.count,hasBaseline]].map(([key,label,value,before,available])=>({key,label,value,before,...change(value,before,available)}));
    return {currentPeriod,previousPeriod,current,previous,metrics};
  }
  function series(records, p, grain) {
    records=filter(records,{start:p.start,until:p.end,grain});
    if(grain==='day') {const items=Array.from({length:24},(_,i)=>({label:`${i}时`,...sum(records.filter(r=>r.time&&Number(r.time.slice(11,13))===i))}));const unknown=records.filter(r=>!r.time);if(unknown.length)items.push({label:'时刻未记',...sum(unknown)});return items;}
    const items=[]; let s=p.start;
    while(s<p.end) { const monthly=grain==='year'||grain==='quarter'; const b=monthly?period(s,'month').end:shift(s,1); const a=date(s);items.push({label:monthly?`${a.getUTCMonth()+1}月`:`${a.getUTCMonth()+1}/${a.getUTCDate()}`,...sum(filter(records,{start:s,until:b}))});s=b; }
    if(grain==='month'){const coarse=records.filter(r=>precision(r)==='month');if(coarse.length)items.push({label:'仅记月份',...sum(coarse)});}
    return items;
  }
  function text(v,max,label) { if(typeof v!=='string' || v.length>max) throw new Error(label+'格式不正确或过长'); return v; }
  function validateRecord(r) {
    if(!r || typeof r!=='object' || typeof r.id!=='string' || !/^[A-Za-z0-9_-]{1,100}$/.test(r.id)) throw new Error('记录编号不正确');
    if(r.time!=null && !validTime(r.time)) throw new Error('充电时间不正确');
    if(r.time==null && !(r.datePrecision==='day'&&validDate(r.date)||r.datePrecision==='month'&&validMonth(r.monthKey))) throw new Error('请至少填写充电月份，或有效日期');
    if(r.time!=null && r.datePrecision!=null && r.datePrecision!=='minute') throw new Error('时间精度与具体时刻不一致');
    if(r.datePrecision==='day' && r.monthKey!=null && r.monthKey!==r.date.slice(0,7)) throw new Error('日期与月份不一致');
    if(r.datePrecision==='month' && r.date!=null) throw new Error('仅记月份时不能提供具体日期');
    if(r.recordKind!=null&&!['charging_expense','trip_expense_summary'].includes(r.recordKind)) throw new Error('记录类型不正确');
    if(r.recordKind==='trip_expense_summary'&&r.category!=='business') throw new Error('行程合计请选择差旅用电');
    if(r.timezone!=null&&r.timezone!=='Asia/Shanghai') throw new Error('当前版本仅支持北京时间记录');
    if(r.energyMilli!=null&&(!Number.isSafeInteger(r.energyMilli)||r.energyMilli<=0||r.energyMilli>100000000)) throw new Error('电量可留空；填写时必须大于0，最多3位小数');
    if(!Number.isSafeInteger(r.amountCents)||r.amountCents<0||r.amountCents>100000000) throw new Error('总价格式不正确');
    if(!categories[r.category]) throw new Error('请选择日常用电或差旅用电');
    if(r.station!=null)text(r.station,160,'充电地点');
    if(r.sourceText!=null)text(r.sourceText,240,'原始记录');
    if(r.sourceSequence!=null&&(!Number.isSafeInteger(r.sourceSequence)||r.sourceSequence<1))throw new Error('来源序号不正确');
    for(const [k,n] of [['address',300],['note',2000],['trip',100],['operator',100]]) text(r[k]||'',n,k);
    if(r.parkingCents!=null && (!Number.isSafeInteger(r.parkingCents)||r.parkingCents<0||r.parkingCents>100000000)) throw new Error('停车费不正确');
    for(const k of ['socStart','socEnd']) if(r[k]!=null && (!Number.isInteger(r[k])||r[k]<0||r[k]>100)) throw new Error('电量百分比应在0至100之间');
    if(r.socStart!=null&&r.socEnd!=null&&r.socEnd<r.socStart) throw new Error('充电后电量不能低于充电前');
    if(r.odometer!=null&&(!Number.isFinite(r.odometer)||r.odometer<0||r.odometer>10000000)) throw new Error('里程不正确');
    if(r.duration!=null&&(!Number.isInteger(r.duration)||r.duration<1||r.duration>10080)) throw new Error('时长应为1至10080分钟');
    if(r.location!=null) {
      if(!Number.isFinite(r.location.lat)||!Number.isFinite(r.location.lng)||Math.abs(r.location.lat)>90||Math.abs(r.location.lng)>180||!Number.isFinite(r.location.accuracy)||r.location.accuracy<0) throw new Error('定位信息不正确');
    }
    return r;
  }
  function emptyState() {return {schema:1,records:[],trash:[],settings:{vehicle:'我的新能源汽车',budgetCents:50000,province:'浙江',autoLocate:false},updatedAt:null};}
  function validateState(s) {
    if(!s||s.schema!==1||!Array.isArray(s.records)||!Array.isArray(s.trash)||s.records.length+s.trash.length>100000) throw new Error('备份格式或版本不支持');
    const seen=new Set(); s.records.forEach(r=>{validateRecord(r);if(seen.has(r.id)) throw new Error('备份包含重复编号');seen.add(r.id);});
    s.trash.forEach(r=>{validateRecord(r);if(seen.has(r.id))throw new Error('回收站记录编号冲突');seen.add(r.id);});
    if(!s.settings||typeof s.settings.vehicle!=='string'||s.settings.vehicle.length>100||!Number.isSafeInteger(s.settings.budgetCents)||s.settings.budgetCents<0||s.settings.budgetCents>100000000||typeof s.settings.province!=='string'||s.settings.province.length>30||typeof s.settings.autoLocate!=='boolean') throw new Error('备份设置格式不正确');
    if(s.settings.motion!=null&&!['system','reduced'].includes(s.settings.motion))throw new Error('动画设置不正确');
    return s;
  }
  function mdCell(v) { return String(v??'').replace(/\\/g,'\\\\').replace(/\|/g,'\\|').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r?\n/g,'<br>'); }
  function markdown(records, options={}) {
    const n=options.includePrivate!==false,s=sum(records);
    const lines=['# 充电手账 · 充电记录','',`导出时间：${todayTime().replace('T',' ')}（北京时间）`,`车辆：${mdCell(options.vehicle||'我的新能源汽车')}`,`筛选：${mdCell(options.scope||'全部记录')}`,'','## 统计口径','',
      '- 金额为实际充电费用，停车费另计。电量为订单计费电量，不推算车辆实际能耗。',
      '- 电量未记录表示未知，不代表0；缺失电量的费用计入支出，不参与每度均价。',
      '- 加权均价 = 已记录电量的费用合计 ÷ 相应电量合计。费用条目数不等于充电次数。',
      '- 行程合计可能包含多次充电，不作为一次充电。补录其明细前应先移除合计，避免重复计算。',
      '- 仅记月份的费用参加月、季、年统计，不分摊到某日或某周；仅记日期不虚构具体时刻。',
      '- 日期范围筛选仅纳入完整落在范围内的月份合计。周一为周起始，季度为自然季度。','',
      '## 总览','','| 用途 | 费用条目 | 行程合计条目 | 已知电量(kWh) | 电量已记条目 | 费用(元) | 有电量费用(元) | 加权均价(元/kWh) | 停车费(元) |',
      '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'];
    for(const [label,rs] of [['全部',records],['日常用电',records.filter(r=>r.category==='daily')],['差旅用电',records.filter(r=>r.category==='business')]]){const t=sum(rs);lines.push(`| ${label} | ${t.count} | ${t.tripSummaryCount} | ${energySummary(t)} | ${t.energyRecordCount} | ${money(t.amountCents)} | ${money(t.pairedAmountCents)} | ${priceText(t,4)} | ${money(t.parkingCents)} |`);}
    lines.push('',`综合支出：${money(s.amountCents+s.parkingCents)}元`,'','## 充电明细','','| 日期或月份 | 时间精度 | 类型 | 用途 | 电量(kWh) | 费用(元) | 单价(元/kWh) | 停车费(元) | 地点 | 运营商 | 行程 | 充电前(%) | 充电后(%) | 时长(分钟) | 里程(km) | 备注 |',
      '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | --- |');
    filter(records).forEach(r=>lines.push('| '+[displayDate(r),{minute:'完整时间',day:'仅日期',month:'仅月份'}[precision(r)],r.recordKind==='trip_expense_summary'?'行程合计':'单笔费用',categories[r.category],energy(r.energyMilli),money(r.amountCents),priceText(r,4),r.parkingCents==null?'—':money(r.parkingCents),n?(r.station||'未记录'):'已隐藏',r.operator||'—',n?(r.trip||'—'):'已隐藏',r.socStart??'—',r.socEnd??'—',r.duration??'—',r.odometer??'—',n?(r.note||'—'):'已隐藏'].map(mdCell).join(' | ')+' |'));
    for(const [grain,title] of [['day','按日'],['week','按周'],['month','按月'],['quarter','按季度'],['year','按年']]){lines.push('',`## ${title}汇总`,'');if(['day','week'].includes(grain)){const excluded=sum(records.filter(r=>precision(r)==='month'));if(excluded.count)lines.push(`仅记月份的 ${excluded.count} 条费用（${money(excluded.amountCents)}元）无法归属具体${grain==='day'?'日期':'周'}，未纳入下表。`,'');}
      lines.push('| 时段 | 费用条目 | 已知电量(kWh) | 费用(元) | 加权均价(元/kWh) |','| --- | ---: | ---: | ---: | ---: |');groups(records,grain).forEach(g=>lines.push(`| ${g.label} | ${g.count} | ${energySummary(g)} | ${money(g.amountCents)} | ${priceText(g,4)} |`));}
    lines.push('','## 可向外部 AI 提问','','请依据上述费用记录分析支出趋势、日常与差旅差异。仅在电量已记录的样本中分析单价，不补猜电量、日期或充电次数，不将行程合计拆分成虚构明细。','');return lines.join('\n');
  }
  function parseImport(raw) {
    const data=typeof raw==='string'?JSON.parse(raw.replace(/^\uFEFF/,'')):raw;
    if(data?.schema===1)return validateState(data).records;
    if(data?.format!=='charge-ledger-legacy-expenses'||data.version!==1||data.currency!=='CNY'||!Array.isArray(data.records)||data.records.length>100000)throw new Error('请选择历史费用 JSON 或完整手账备份');
    const seen=new Set();return data.records.map(r=>{
      validateRecord(r);if(seen.has(r.id))throw new Error('导入文件包含重复编号');seen.add(r.id);
      if(r.time!=null)throw new Error('历史费用文件不能虚构具体时刻');
      if(r.year!=null&&String(r.year)!==recordDate(r).slice(0,4)||r.month!=null&&r.month!==Number(recordDate(r).slice(5,7))||r.day!=null&&r.day!==Number(recordDate(r).slice(8,10)))throw new Error('历史费用的年月日字段不一致');
      return {id:r.id,time:null,timezone:'Asia/Shanghai',datePrecision:r.datePrecision,date:r.date||null,monthKey:r.monthKey||r.date.slice(0,7),recordKind:r.recordKind||'charging_expense',energyMilli:r.energyMilli??null,amountCents:r.amountCents,category:r.category,station:r.station??null,address:r.address||'',trip:r.trip||'',operator:r.operator||'',note:r.note||'',parkingCents:r.parkingCents??null,location:null,sourceSequence:r.sourceSequence??null,sourceText:r.sourceText||''};
    });
  }
  function fingerprint(r) {
    const keys=['amountCents','energyMilli','category','station','address','note','trip','operator','parkingCents','socStart','socEnd','duration','odometer','location'];
    const f={date:recordDate(r),time:r.time||null,precision:precision(r),kind:r.recordKind||'charging_expense'};keys.forEach(k=>f[k]=r[k]??(typeof r[k]==='string'?'':null));for(const k of ['station','address','note','trip','operator'])f[k]=r[k]||'';return JSON.stringify(f);
  }
  function planImport(state, records) {
    validateState(state);const existing=new Map([...state.records,...state.trash].map(r=>[r.id,r])),seen=new Set(),added=[];let skipped=0;
    for(const r of records){validateRecord(r);if(seen.has(r.id))throw new Error('导入文件包含重复编号');seen.add(r.id);const old=existing.get(r.id);if(old){if(fingerprint(old)!==fingerprint(r))throw new Error('编号 '+r.id+' 已存在但内容不同，请核对或修改文件编号');skipped++;}else added.push(r);}
    if(state.records.length+state.trash.length+added.length>100000)throw new Error('总记录数超出上限');return {added,skipped,total:records.length};
  }
  function distance(a,b) { const rad=x=>x*Math.PI/180;const dlat=rad(b.lat-a.lat),dlng=rad(b.lng-a.lng);const h=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h)); }
  return {categories,decimal,fixed,energy,money,price,priceText,precision,recordDate,displayDate,energySummary,coverage,validMonth,recordBounds,fitsGrain,todayTime,validDate,validTime,period,shift,movePeriod,filter,sum,groups,series,change,comparison,validateRecord,emptyState,validateState,markdown,distance,parseImport,planImport,fingerprint};
});
