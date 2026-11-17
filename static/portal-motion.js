(()=>{
 let last=null;
 const active=new Map();
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function cancel(key){const animation=active.get(key);if(animation){animation.cancel();active.delete(key);}}
 function play(key,node,frames,duration,delay=0,easing='cubic-bezier(.22,.7,.25,1)'){
  cancel(key);if(!node||typeof node.animate!=='function'||reduced())return null;
  const animation=node.animate(frames,{duration,delay,easing,fill:'backwards'});
  active.set(key,animation);
  animation.finished.then(()=>{if(active.get(key)===animation)active.delete(key);}).catch(()=>{});
  return animation;
 }
 function animateModule(name,view){
  if(reduced())return;
  view.classList.add('portal-entering');
  const targets=[{key:name+'-view',node:view}];
  if(['upload','files'].includes(name)&&!['upload','files'].includes(last)){
   targets.push({key:'module-nav',node:document.querySelector('#panel>.app-nav')});
  }else if(['foxget','foxconvert'].includes(name)){
   targets.push({key:name+'-nav',node:view.querySelector(':scope > .app-nav')});
  }
  if(name==='upload'){
   targets.push({key:'upload-notice',node:document.querySelector('#foxdropAvailabilityNotice')});
  }
  requestAnimationFrame(()=>{
   if(last!==name||view.hidden){view.classList.remove('portal-entering');return;}
   const animations=targets.map(({key,node})=>play(
    key,
    node,
    [{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],
    460,
    0,
    'cubic-bezier(.22,.7,.25,1)'
   )).filter(Boolean);
   const finish=()=>{
    view.querySelectorAll('.queue-card').forEach(card=>card.classList.add('portal-initial-card'));
    view.classList.remove('portal-entering');
   };
   if(animations.length)Promise.all(animations.map(animation=>animation.finished)).then(finish).catch(finish);
   else view.classList.remove('portal-entering');
  });
 }
 window.portalMotion20=function(name){
  const label=document.querySelector('.portal-welcome>span');
  const info=document.querySelector('.portal-info');
  const text=name==='foxget'?'FoxGet':name==='foxconvert'?'FoxConvert':name==='upload'||name==='files'?'FoxDrop':'FoxSuite';
  const first=last===null;
  if(info)info.setAttribute('aria-hidden',name==='home'?'false':'true');
  if(last!==name){
   for(const key of ['upload-view','files-view','module-nav','upload-notice','foxget-view','foxget-nav','foxconvert-view','foxconvert-nav'])cancel(key);
   if(label&&label.textContent!==text){
    cancel('brand');label.textContent=text;
    if(!first||name==='upload'||name==='files')play('brand',label,[{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],400);
   }
   const view=document.getElementById('view-'+name);
   if(view&&['upload','files','foxget','foxconvert'].includes(name)&&!reduced())animateModule(name,view);
   else if(view&&!reduced())play('view',view,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],400);
  }
  last=name;
 };
})();
