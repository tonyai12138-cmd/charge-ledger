/* Persistent pages, shared sliding surfaces and app-owned pickers. No snapshots or remote UI. */
'use strict';
window.Interactions=(()=>{
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const order=['home','records','stats','tariffs','profile'],views=new Map(),signatures=new Map();
 const metrics={pagesBuilt:0,patches:0,cacheHits:0,transitions:0};
 let config={},current='',generation=0,pageAnimations=[],gesture=null,raf=0,suppressUntil=0,picker=null,pickerFocus=null,idleTask=0;
 const ease='cubic-bezier(.22,1,.36,1)',pad=n=>String(n).padStart(2,'0');
 function configure(options){config=options;}
 function animate(el,frames,opts){return !config.reduced?.()&&el.animate?el.animate(frames,opts):null;}
 function key(node){return node.nodeType===1?(node.id||node.dataset.key||(node.dataset.action==='detail'?'record:'+node.dataset.id:'')):'';}
 function sameKind(a,b){return a.nodeType===b.nodeType&&(a.nodeType!==1||a.tagName===b.tagName&&key(a)===key(b));}
 function patchNode(old,next){
  if(old.nodeType!==1){if(old.nodeValue!==next.nodeValue)old.nodeValue=next.nodeValue;return;}
  if(old.isEqualNode(next))return;
  const value=next.matches('input,textarea,select')?next.value:null;
  for(const attr of [...old.attributes])if(!next.hasAttribute(attr.name))old.removeAttribute(attr.name);
  for(const attr of [...next.attributes])if(old.getAttribute(attr.name)!==attr.value){if(attr.name==='style')old.style.cssText=next.style.cssText;else old.setAttribute(attr.name,attr.value);}
  patchChildren(old,next);
  if(value!=null&&old.value!==value){const active=old===document.activeElement,pos=active?old.selectionStart:null;old.value=value;if(active&&pos!=null)try{old.setSelectionRange(pos,pos);}catch(_){}}
  if(old.matches('input[type="checkbox"],input[type="radio"]'))old.checked=next.checked;
 }
 function patchChildren(parent,next){
  const existing=[...parent.childNodes],keyed=new Map(existing.filter(n=>key(n)).map(n=>[key(n),n]));let cursor=parent.firstChild;
  for(const child of [...next.childNodes]){
   let node=key(child)?keyed.get(key(child)):cursor;
   if(!node||!sameKind(node,child)){node=child;parent.insertBefore(node,cursor);}
   else{if(node!==cursor)parent.insertBefore(node,cursor);patchNode(node,child);}
   cursor=node.nextSibling;
  }
  while(cursor){const next=cursor.nextSibling;cursor.remove();cursor=next;}
 }
 function controlLabel(el){return (el.closest('.control-shell')?.querySelector('.picker-trigger')?.getAttribute('aria-label')||el.labels?.[0]?.querySelector('.field-label')?.textContent||el.closest('label')?.querySelector('.field-label')?.textContent||el.closest('.field')?.querySelector('.field-label')?.textContent||el.labels?.[0]?.textContent||'选择').trim();}
 function controlText(el){
  if(el.tagName==='SELECT')return el.selectedOptions[0]?.textContent||'请选择';
  return el.value?el.value.replace('T',' ').replace(/-/g,'.'):(el.type==='month'?'选择月份':'选择日期');
 }
 function updateControl(el){const button=el?.closest('.control-shell')?.querySelector('.picker-trigger');if(button){button.querySelector('.control-value').textContent=controlText(el);button.classList.toggle('placeholder',!el.value);button.dataset.controlType=el.tagName==='SELECT'?'select':el.type;}}
 function enhanceControls(root){
  root.querySelectorAll('select[id],input[type="date"][id],input[type="month"][id],input[type="datetime-local"][id]').forEach(el=>{
   if(el.closest('.control-shell')){updateControl(el);return;}
   const wrap=document.createElement('span');wrap.className='control-shell';el.replaceWith(wrap);wrap.append(el);
   el.classList.add('native-control');el.tabIndex=-1;el.setAttribute('aria-hidden','true');
   const button=document.createElement('button');button.type='button';button.className='picker-trigger';button.dataset.pickerFor=el.id;button.setAttribute('aria-label',controlLabel(el));button.setAttribute('aria-haspopup','dialog');
   button.innerHTML='<span class="control-value"></span><svg class="control-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';wrap.append(button);updateControl(el);
  });
  root.querySelectorAll('input[list][id]').forEach(el=>{
   const source=el.getAttribute('list');el.dataset.stationList=source;el.removeAttribute('list');
   if(!root.querySelector(`#${source} option`))return;
   const wrap=document.createElement('span');wrap.className='station-autocomplete';el.replaceWith(wrap);wrap.append(el);
   const button=document.createElement('button');button.type='button';button.className='saved-station-trigger';button.dataset.stationFor=el.id;button.setAttribute('aria-label','选择常用充电地点');button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>';wrap.append(button);
  });
 }
 function groupItems(group){return [...group.children].filter(el=>el.matches('button,label.choice'));}
 function selectedIndex(group){const items=groupItems(group);return Math.max(0,items.findIndex(el=>el.classList.contains('active')||el.classList.contains('selected')||el.querySelector('input:checked')));}
 function positionPill(group,index,stretch=1,pixels=false){
  const pill=group.querySelector(':scope > .segment-indicator');if(!pill)return;
  const gap=group.classList.contains('nav')?0:3;
  const transform=pixels?`translate3d(${index}px,0,0) scaleX(${stretch})`:`translateX(${index*100}%) translateX(${index*gap}px) scaleX(${stretch})`;
  if(pill.style.transform!==transform)pill.style.transform=transform;
 }
 function enhanceSegments(root){
  const groups=root.matches?.('.tabs,.nav,.choice-row')?[root]:root.querySelectorAll('.tabs,.nav,.choice-row');
  groups.forEach(group=>{
   const items=groupItems(group);if(group.style.getPropertyValue('--segments')!==String(items.length))group.style.setProperty('--segments',items.length);
   if(!group.querySelector(':scope > .segment-indicator')){const pill=document.createElement('span');pill.className='segment-indicator';pill.dataset.key='segment-indicator';pill.setAttribute('aria-hidden','true');group.prepend(pill);}
   positionPill(group,selectedIndex(group));
  });
 }
 function enhance(root){enhanceControls(root);enhanceSegments(root);}
 function fragment(html){const t=document.createElement('template');t.innerHTML=html;enhance(t.content);return t.content;}
 function ensurePage(name){
  const descriptor=config.page(name);let view=views.get(name);
  if(!view){view=document.createElement('section');view.className='page-view';view.dataset.page=name;view.hidden=true;view.inert=true;document.getElementById('page-content').append(view);views.set(name,view);metrics.pagesBuilt++;}
  if(signatures.get(name)!==descriptor.signature){
   const content=fragment(descriptor.html());if(view.childNodes.length){patchChildren(view,content);metrics.patches++;}else view.append(content);
   signatures.set(name,descriptor.signature);
  }else metrics.cacheHits++;
  return view;
 }
 function captureAndCancel(){
  if(pageAnimations.length)for(const view of views.values())if(!view.hidden){const transform=getComputedStyle(view).transform;view.style.transform=transform==='none'?'translate3d(0,0,0)':transform;}
  pageAnimations.forEach(a=>a.cancel());pageAnimations=[];generation++;
 }
 function finishPages(name,token){
  if(token!==generation)return;
  for(const [id,view] of views){view.hidden=id!==name;view.classList.toggle('is-current',id===name);view.inert=id!==name;view.setAttribute('aria-hidden',String(id!==name));view.style.transform='';view.style.willChange='';}
  document.getElementById('page-content').classList.remove('page-moving');pageAnimations=[];
 }
 function offsetX(view){const transform=view.style.transform;if(!transform)return 0;if(transform.startsWith('matrix3d'))return Number(transform.slice(transform.indexOf('(')+1,-1).split(',')[12]);if(transform.startsWith('matrix'))return Number(transform.slice(transform.indexOf('(')+1,-1).split(',')[4]);return parseFloat(transform.slice(transform.indexOf('(')+1))||0;}
 function transition(from,to,direction,startX=null){
  captureAndCancel();const token=generation,width=document.getElementById('page-content').clientWidth;
  const incomingStart=to.hidden?`translate3d(${offsetX(from)+direction*width}px,0,0)`:to.style.transform||'translate3d(0,0,0)';
  const outgoingStart=from.style.transform||'translate3d(0,0,0)';
  for(const view of views.values())if(view!==to&&view!==from){view.hidden=true;view.inert=true;view.style.transform='';view.style.willChange='';}
  to.hidden=false;to.inert=false;to.classList.add('is-current');to.setAttribute('aria-hidden','false');from.inert=true;from.classList.remove('is-current');from.setAttribute('aria-hidden','true');
  document.getElementById('page-content').classList.add('page-moving');from.style.willChange=to.style.willChange='transform';
  const duration=startX==null?300:Math.max(160,Math.round(280*(1-Math.min(Math.abs(startX)/width,.8))));
  const a=animate(from,[{transform:outgoingStart},{transform:`translate3d(${-direction*width}px,0,0)`}],{duration,easing:ease,fill:'forwards'});
  const b=animate(to,[{transform:incomingStart},{transform:'translate3d(0,0,0)'}],{duration,easing:ease,fill:'forwards'});
  if(a&&b){pageAnimations=[a,b];Promise.allSettled([a.finished,b.finished]).then(()=>{if(token===generation){finishPages(to.dataset.page,token);a.cancel();b.cancel();}});}else finishPages(to.dataset.page,token);
  metrics.transitions++;
 }
 function render(){
  const name=config.screen(),to=ensurePage(name),nav=document.querySelector('.nav');
  if(nav.dataset.active!==String(order.indexOf(name)))nav.dataset.active=String(order.indexOf(name));nav.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b.dataset.value===name);if(b.dataset.value===name){if(b.getAttribute('aria-current')!=='page')b.setAttribute('aria-current','page');}else if(b.hasAttribute('aria-current'))b.removeAttribute('aria-current');});enhanceSegments(nav);
  if(!current){current=name;finishPages(name,generation);}
  else if(current!==name){let from=views.get(current);if(pageAnimations.length){captureAndCancel();if(to.hidden){const visible=[...views.values()].filter(v=>!v.hidden);from=visible.sort((a,b)=>Math.abs(offsetX(a))-Math.abs(offsetX(b)))[0]||from;}}
   let direction=order.indexOf(name)>order.indexOf(from.dataset.page)?1:-1;
   if(!to.hidden&&Math.abs(offsetX(to))>.1)direction=offsetX(to)>0?1:-1;
   else if(to.hidden&&Math.abs(offsetX(from))>.1)direction=offsetX(from)<0?1:-1;
   current=name;transition(from,to,direction,gesture?.type==='page'?gesture.dx:null);}
  else if(config.reduced?.()){captureAndCancel();finishPages(name,generation);}
  prewarm();
 }
 document.addEventListener('launch-finished',()=>prewarm());
 function prewarm(){
  if(idleTask||gesture||window.Launch?.active)return;
  const pending=order.filter(n=>!views.has(n));if(!pending.length)return;
  const run=()=>{idleTask=0;if(gesture||window.Launch?.active||document.querySelector('.modal-backdrop:not([hidden]) .sheet'))return;ensurePage(pending[0]);prewarm();};
  idleTask=window.requestIdleCallback?requestIdleCallback(run,{timeout:1800}):setTimeout(run,500);
 }
 function settlePageDrag(g,commit){
  if(commit){config.go(g.neighbor.dataset.page);return;}
  captureAndCancel();const token=generation,width=g.width,direction=g.direction;
  const a=animate(g.page,[{transform:g.page.style.transform},{transform:'translate3d(0,0,0)'}],{duration:220,easing:ease,fill:'forwards'});
  const b=g.neighbor?animate(g.neighbor,[{transform:g.neighbor.style.transform},{transform:`translate3d(${direction*width}px,0,0)`}],{duration:220,easing:ease,fill:'forwards'}):null;
  const animations=[a,b].filter(Boolean);pageAnimations=animations;Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(token===generation){finishPages(current,token);animations.forEach(a=>a.cancel());pageAnimations=[];}});
 }
 function moveGesture(){
  raf=0;const g=gesture;if(!g?.dragging)return;
  if(g.type==='segment'){
   const index=Math.max(0,Math.min(g.items.length-1,g.initial+g.dx/g.step));positionPill(g.group,index*g.step,1+Math.min(Math.abs(g.velocity)*.045,.07),true);g.preview=Math.round(index);
  }else{
   const displacement=g.neighbor?Math.max(-g.width,Math.min(g.width,g.dx)):g.dx*.18;
   g.page.style.transform=`translate3d(${displacement}px,0,0)`;
   if(g.neighbor)g.neighbor.style.transform=`translate3d(${displacement+g.direction*g.width}px,0,0)`;
  }
 }
 document.addEventListener('pointerdown',e=>{
  if(e.button!==0||picker||gesture)return;
  const group=e.target.closest('.tabs,.nav,.choice-row');
  if(group){const items=groupItems(group),first=items[0].getBoundingClientRect(),second=items[1]?.getBoundingClientRect();gesture={type:'segment',group,items,initial:selectedIndex(group),preview:selectedIndex(group),step:second?second.left-first.left:first.width,x:e.clientX,y:e.clientY,dx:0,pointer:e.pointerId,velocity:0,lastX:e.clientX,lastTime:performance.now(),dragging:false};return;}
  const page=e.target.closest('.page-view.is-current'),edges=window.__gestureInsets||[20,20];if(!page||e.clientX<edges[0]||e.clientX>innerWidth-edges[1]||e.target.closest('input,textarea,select,.control-shell,a,summary')||document.querySelector('.modal-backdrop:not([hidden]) .sheet'))return;
  gesture={type:'page',page,x:e.clientX,y:e.clientY,dx:0,pointer:e.pointerId,velocity:0,lastX:e.clientX,lastTime:performance.now(),dragging:false,width:page.clientWidth,neighbor:null,direction:0};
 },{passive:true});
 document.addEventListener('pointermove',e=>{
  const g=gesture;if(!g||g.pointer!==e.pointerId)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.dragging){if(Math.abs(dy)>8&&Math.abs(dy)>Math.abs(dx)){gesture=null;return;}if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.25)return;g.dragging=true;
   const capture=g.type==='segment'?g.group:g.page;try{capture.setPointerCapture(e.pointerId);}catch(_){}
   if(g.type==='segment')g.group.classList.add('dragging');
   else{captureAndCancel();finishPages(current,generation);g.direction=dx<0?1:-1;const index=order.indexOf(current)+g.direction;
    if(index>=0&&index<order.length){g.neighbor=ensurePage(order[index]);g.neighbor.hidden=false;g.neighbor.inert=true;g.neighbor.setAttribute('aria-hidden','true');g.neighbor.style.transform=`translate3d(${g.direction*g.width}px,0,0)`;g.neighbor.style.willChange='transform';}
    g.page.style.willChange='transform';document.getElementById('page-content').classList.add('page-moving');}
  }
  e.preventDefault();const now=performance.now();g.velocity=(e.clientX-g.lastX)/Math.max(1,now-g.lastTime);g.lastX=e.clientX;g.lastTime=now;g.dx=dx;if(!raf)raf=requestAnimationFrame(moveGesture);
 },{passive:false});
 function endGesture(e,canceled=false){
  const g=gesture;if(!g||g.pointer!==e.pointerId)return;if(raf){cancelAnimationFrame(raf);raf=0;moveGesture();}
  if(g.dragging){suppressUntil=performance.now()+350;
   if(g.type==='segment'){g.group.classList.remove('dragging');const index=canceled?g.initial:g.preview;positionPill(g.group,index);if(!canceled&&index!==g.initial){const item=g.items[index];(item.querySelector('input')||item).click();}else positionPill(g.group,selectedIndex(g.group));}
   else settlePageDrag(g,!canceled&&!!g.neighbor&&(g.dx*g.direction<0)&&(Math.abs(g.dx)>g.width*.23||Math.abs(g.dx)>45&&Math.abs(g.velocity)>.45));
  }
  gesture=null;
 }
 document.addEventListener('pointerup',e=>endGesture(e));document.addEventListener('pointercancel',e=>endGesture(e,true));
 document.addEventListener('click',e=>{if(e.isTrusted&&performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 function root(){let el=document.getElementById('picker-root');if(!el){el=document.createElement('div');el.id='picker-root';document.body.append(el);}return el;}
 function triggerChange(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));updateControl(el);}
 function openPicker(el,kind=null){
  if(!el||el.disabled)return;pickerFocus=document.activeElement;
  if(kind==='station')picker={el,kind:'station',label:'常用充电地点',options:[...document.getElementById(el.dataset.stationList).options].map(o=>({value:o.value,textContent:o.value,selected:o.value===el.value,disabled:false}))};
  else if(el.tagName==='SELECT')picker={el,kind:'select',label:controlLabel(el),search:''};
  else{const raw=el.value||config.now(),parts=raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?(?:T(\d{2}):(\d{2}))?$/)||config.now().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
   picker={el,kind:el.type,label:controlLabel(el),year:Number(parts[1]),month:Number(parts[2]),day:Number(parts[3]||1),hour:Number(parts[4]||0),minute:Number(parts[5]||0),pane:el.type==='month'?'months':'calendar'};}
  const sheet=document.querySelector('.modal-backdrop:not([hidden]) .sheet');if(sheet)sheet.inert=true;else document.getElementById('app').inert=true;document.querySelector('.nav').inert=true;
  root().innerHTML='<div class="picker-backdrop"><section class="picker-panel" role="dialog" aria-modal="true" tabindex="-1"><div class="sheet-handle" aria-hidden="true"></div><div class="picker-content"></div></section></div>';
  const panel=root().querySelector('.picker-panel');panel.setAttribute('aria-label',picker.label);paintPicker();panel.focus({preventScroll:true});
  config.onBackState?.();
  animate(root().firstElementChild,[{opacity:0},{opacity:1}],{duration:130,easing:'ease-out'});animate(panel,[{transform:'translate3d(0,22px,0)'},{transform:'translate3d(0,0,0)'}],{duration:240,easing:ease});
 }
 function closePicker(){
  if(!picker)return false;picker=null;root().replaceChildren();const sheet=document.querySelector('.modal-backdrop:not([hidden]) .sheet');if(sheet)sheet.inert=false;else document.getElementById('app').inert=false;document.querySelector('.nav').inert=!!sheet;
  if(pickerFocus?.isConnected)pickerFocus.focus({preventScroll:true});pickerFocus=null;config.onBackState?.();return true;
 }
 function pickerButton(text,action,extra='',cls=''){return `<button type="button" class="${cls}" data-pick="${action}" ${extra}>${escape(text)}</button>`;}
 function daysInMonth(year,month){return new Date(Date.UTC(year,month,0)).getUTCDate();}
 function calendarHTML(){
  const p=picker,first=new Date(Date.UTC(p.year,p.month-1,1)),offset=(first.getUTCDay()+6)%7,days=daysInMonth(p.year,p.month),now=config.now().slice(0,10);
  return `<div class="calendar-weekdays">${['一','二','三','四','五','六','日'].map(s=>`<span>${s}</span>`).join('')}</div><div class="calendar-grid">${Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const d=i-offset+1;return d<1||d>days?'<span></span>':pickerButton(d,'day',`data-number="${d}" aria-pressed="${p.day===d}"`,`${p.day===d?'chosen ':''}${`${p.year}-${pad(p.month)}-${pad(d)}`===now?'today':''}`);}).join('')}</div>`;
 }
 function dateHeader(){const p=picker;return `<div class="calendar-heading">${pickerButton('‹','prev','','calendar-arrow')}${pickerButton(p.year+'年','years','','year-title')}${pickerButton(p.month+'月','months','','month-title')}${pickerButton('›','next','','calendar-arrow')}</div>`;}
 function wheelHTML(part,max,label,value){return `<div class="time-wheel-box"><span>${label}</span><div class="time-wheel" data-wheel="${part}" tabindex="0" role="spinbutton" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max-1}" aria-valuenow="${value}">${Array.from({length:max},(_,i)=>pickerButton(pad(i),'time',`data-part="${part}" data-number="${i}" tabindex="-1"`)).join('')}</div></div>`;}
 function paintPicker(direction=0){
  if(!picker)return;const p=picker,content=root().querySelector('.picker-content');
  let body='';
  if(p.kind==='select'||p.kind==='station'){
   const options=p.options||[...p.el.options],isMonths=/month/.test(p.el.id),province=p.el.id==='tariff-province';
   body=`<header class="picker-header"><h2>${escape(p.label)}</h2>${pickerButton('取消','cancel','','picker-cancel')}</header>${province?'<input class="input picker-search" placeholder="搜索省级地区" aria-label="搜索省级地区">':''}<div class="picker-options ${isMonths||province?'option-grid':''}">${options.map(o=>pickerButton(o.textContent,'option',`data-value="${escape(o.value)}" aria-pressed="${o.selected}" ${o.disabled?'disabled':''}`,`${o.selected?'chosen ':''}picker-option`)).join('')}</div>`;
  }else{
   body=`<header class="picker-header"><h2>${escape(p.label)}</h2>${pickerButton('取消','cancel','','picker-cancel')}</header>${dateHeader()}<div class="calendar-body">${p.pane==='years'?`<div class="year-grid">${Array.from({length:101},(_,i)=>pickerButton(i+2000,'year',`data-number="${i+2000}"`,p.year===i+2000?'chosen':'')).join('')}</div>`:p.pane==='months'?`<div class="month-grid">${Array.from({length:12},(_,i)=>pickerButton((i+1)+'月','month',`data-number="${i+1}"`,p.month===i+1?'chosen':'')).join('')}</div>`:calendarHTML()}</div>${p.kind==='datetime-local'?`<div class="time-picker"><span class="time-label">时间</span>${wheelHTML('hour',24,'小时',p.hour)}<span class="time-colon">:</span>${wheelHTML('minute',60,'分钟',p.minute)}</div>`:''}<footer class="picker-footer">${pickerButton('清空','clear','','picker-clear')}${pickerButton('确定','apply','','primary')}</footer>`;
  }
  const next=fragment(body);patchChildren(content,next);
  if(direction){animate(content.querySelector('.calendar-body'),[{transform:`translate3d(${direction*12}px,0,0)`},{transform:'translate3d(0,0,0)'}],{duration:180,easing:ease});}
  if(p.pane==='years'){const button=content.querySelector('.year-grid .chosen');if(button)requestAnimationFrame(()=>button.scrollIntoView({block:'center',behavior:'instant'}));}
  content.querySelectorAll('[data-wheel]').forEach(wheel=>{
   wheel.scrollTop=p[wheel.dataset.wheel]*40;
   wheel.onscroll=()=>{if(!picker)return;const value=Math.max(0,Math.min(Number(wheel.getAttribute('aria-valuemax')),Math.round(wheel.scrollTop/40)));picker[wheel.dataset.wheel]=value;wheel.setAttribute('aria-valuenow',value);};
   wheel.onkeydown=e=>{if(['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();wheel.scrollTo({top:(p[wheel.dataset.wheel]+(e.key==='ArrowDown'?1:-1))*40,behavior:config.reduced?.()?'instant':'smooth'});}};
  });
 }
 function changeMonth(delta){const p=picker;let y=p.year,m=p.month+delta;if(m<1){m=12;y--;}if(m>12){m=1;y++;}if(y<2000||y>2100)return;p.year=y;p.month=m;p.day=Math.min(p.day,daysInMonth(y,m));paintPicker(delta);}
 document.addEventListener('click',e=>{
  const station=e.target.closest('[data-station-for]');if(station){e.preventDefault();openPicker(document.getElementById(station.dataset.stationFor),'station');return;}
  const trigger=e.target.closest('[data-picker-for]');if(trigger){e.preventDefault();openPicker(document.getElementById(trigger.dataset.pickerFor));return;}
  if(!picker)return;const button=e.target.closest('[data-pick]');if(!button){if(e.target.classList.contains('picker-backdrop'))closePicker();return;}const p=picker,a=button.dataset.pick,n=Number(button.dataset.number);
  switch(a){
   case'cancel':closePicker();break;
   case'option':{const el=p.el;el.value=button.dataset.value;closePicker();triggerChange(el);break;}
   case'prev':case'next':if(p.pane==='calendar')changeMonth(a==='next'?1:-1);else{p.year=Math.max(2000,Math.min(2100,p.year+(a==='next'?1:-1)));p.day=Math.min(p.day,daysInMonth(p.year,p.month));paintPicker(a==='next'?1:-1);}break;
   case'years':p.pane='years';paintPicker();break;
   case'months':p.pane='months';paintPicker();break;
   case'year':p.year=n;p.day=Math.min(p.day,daysInMonth(p.year,p.month));p.pane=p.kind==='month'?'months':'calendar';paintPicker();break;
   case'month':p.month=n;p.day=Math.min(p.day,daysInMonth(p.year,p.month));p.pane=p.kind==='month'?'months':'calendar';paintPicker();break;
   case'day':p.day=n;paintPicker();break;
   case'time':p[button.dataset.part]=n;root().querySelector(`[data-wheel="${button.dataset.part}"]`).scrollTo({top:n*40,behavior:config.reduced?.()?'instant':'smooth'});break;
   case'clear':{const el=p.el;el.value='';closePicker();triggerChange(el);break;}
   case'apply':{const el=p.el;el.value=`${p.year}-${pad(p.month)}`+(p.kind==='month'?'':`-${pad(p.day)}`)+(p.kind==='datetime-local'?`T${pad(p.hour)}:${pad(p.minute)}`:'');closePicker();triggerChange(el);break;}
  }
 });
 document.addEventListener('input',e=>{
  if(e.target.matches('.native-control'))updateControl(e.target);
  if(picker&&e.target.matches('.picker-search')){const query=e.target.value.trim().toLowerCase();root().querySelectorAll('.picker-option').forEach(button=>button.hidden=!button.textContent.toLowerCase().includes(query));}
 });
 document.addEventListener('change',e=>{if(e.target.matches('.native-control'))queueMicrotask(()=>updateControl(e.target));});
 document.addEventListener('keydown',e=>{
  if(!picker)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closePicker();return;}
  if(e.key==='Tab'){const panel=root().querySelector('.picker-panel'),els=[...panel.querySelectorAll('button:not(:disabled),input,[tabindex="0"]')].filter(el=>!el.hidden&&el.getClientRects().length),first=els[0],last=els.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===panel)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}e.stopImmediatePropagation();}
 },true);
 window.addEventListener('blur',()=>{if(gesture){endGesture({pointerId:gesture.pointer},true);}});
 return {configure,render,fragment,patchChildren,enhance,updateControl,closePicker,openPicker,hasPicker:()=>!!picker,metrics:()=>({...metrics,cachedPages:views.size}),activeView:()=>views.get(current)};
})();
