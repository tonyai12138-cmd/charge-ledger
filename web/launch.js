/* One composed launch surface; only transform/opacity animate. */
'use strict';
window.Launch=(()=>{
 const root=document.getElementById('launch-screen'),app=document.getElementById('app'),logo=root.querySelector('.launch-logo');
 const ease='cubic-bezier(.22,1,.36,1)',animations=[];
 let active=true,started=false,ending=false,reduced=false,fallback=0;
 const metrics={startedAt:null,finishedAt:null,pageBuildsDuringMotion:0,phase:'waiting',landingErrorPx:null,mode:'full',handoffConfirmed:false};
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function motion(el,frames,duration,delay=0){
  if(reduced||!el?.animate)return null;
  const a=el.animate(frames,{duration,delay,easing:ease,fill:'both'});animations.push(a);return a;
 }
 function finish(){
  if(!active)return;active=false;clearTimeout(fallback);
  document.documentElement.classList.remove('launch-active');
  app.inert=false;root.remove();animations.forEach(a=>a.cancel());
  const brand=document.querySelector('.brand-icon');if(brand)brand.style.opacity='';
  metrics.finishedAt=performance.now();metrics.phase='done';document.dispatchEvent(new Event('launch-finished'));
 }
 async function enterHome(){
  if(ending||!active)return;ending=true;metrics.phase='exit';
  if(reduced){
   motionFade(root,1,0,250);motionFade(app,0,1,250);
   await pause(260);finish();return;
  }
  const brand=document.querySelector('.brand-icon'),from=logo.getBoundingClientRect(),to=brand?.getBoundingClientRect();
  // Both rectangles come from the same viewport. No native-to-WebView density conversion.
  if(brand)brand.style.opacity='0';
  motion(root.querySelector('.launch-copy'),[{opacity:1,transform:'translate3d(0,0,0)'},{opacity:0,transform:'translate3d(0,-12px,0)'}],420);
  motion(root.querySelector('.launch-foot'),[{opacity:1},{opacity:0}],400);
  motion(root.querySelector('.launch-halo'),[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(1.12)'}],650);
  motion(root.querySelector('.launch-wash'),[{opacity:1},{opacity:0}],720);
  motion(app,[{opacity:0,transform:'translate3d(0,8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],720);
  const parentScale=from.width/logo.offsetWidth;
  if(to)motion(logo,[{transform:'translate3d(0,0,0) scale(1)'},{transform:`translate3d(${(to.left-from.left)/parentScale}px,${(to.top-from.top)/parentScale}px,0) scale(${to.width/from.width})`}],720);
  await pause(740);
  if(to&&logo.isConnected){const landed=logo.getBoundingClientRect();metrics.landingErrorPx=Math.max(Math.abs(landed.left-to.left),Math.abs(landed.top-to.top),Math.abs(landed.width-to.width));}
  finish();
 }
 function motionFade(el,from,to,duration){const a=el.animate([{opacity:from},{opacity:to}],{duration,fill:'both',easing:ease});animations.push(a);}
 async function begin(){
  if(started||!active)return;started=true;clearTimeout(fallback);
  metrics.startedAt=performance.now();metrics.phase='intro';
  if(reduced){metrics.mode='calm';await pause(1750);await enterHome();return;}
  const before=window.Interactions?.metrics().pagesBuilt||0;
  motion(root.querySelector('.launch-halo'),[{opacity:.15,transform:'scale(.86)'},{opacity:1,transform:'scale(1)'}],1000);
  motion(root.querySelector('.launch-orbit'),[{transform:'rotate(-36deg)'},{transform:'rotate(34deg)'}],1800);
  motion(root.querySelector('.launch-wordmark'),[{opacity:0,transform:'translate3d(0,8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],500,300);
  motion(root.querySelector('.launch-title'),[{opacity:0,transform:'translate3d(0,12px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],650,500);
  motion(root.querySelector('.launch-copy p'),[{opacity:0,transform:'translate3d(0,8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],600,800);
  motion(root.querySelector('.launch-foot'),[{opacity:0},{opacity:1}],650,1050);
  root.querySelectorAll('.energy-cell').forEach((cell,i)=>motion(cell,[{opacity:.22,transform:'scaleY(.6)'},{opacity:1,transform:'scaleY(1)'}],400,1200+i*180));
  await pause(1900);if(!active)return;metrics.phase='hold';await pause(350);
  metrics.pageBuildsDuringMotion=(window.Interactions?.metrics().pagesBuilt||0)-before;
  await enterHome();
 }
 function prepare(isReduced,native){
  reduced=!!isReduced;root.dataset.mode=reduced?'calm':'full';app.inert=true;
  // Native animation-scale flags describe the OS handoff, not the brand presentation.
  window.onNativeLaunchReleased=()=>{metrics.handoffConfirmed=true;begin();};
  if(native&&typeof native.uiReady==='function')fallback=setTimeout(()=>{if(typeof native.releaseLaunch==='function')native.releaseLaunch();else begin();},4000);
  else begin();
 }
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'&&started)enterHome();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&started)finish();});
 return {prepare,finish,get active(){return active;},metrics:()=>({...metrics})};
})();
