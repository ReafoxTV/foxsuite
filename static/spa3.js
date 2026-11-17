const FORMAT_ICONS={"pdf": "format-0.svg", "doc": "format-1.svg", "docx": "format-1.svg", "odt": "format-1.svg", "rtf": "format-1.svg", "ppt": "format-3.svg", "pptx": "format-3.svg", "odp": "format-3.svg", "jpg": "format-4.svg", "jpeg": "format-4.svg", "png": "format-4.svg", "gif": "format-4.svg", "webp": "format-4.svg", "avif": "format-4.svg", "svg": "format-4.svg", "bmp": "format-4.svg", "ico": "format-4.svg", "tif": "format-4.svg", "tiff": "format-4.svg", "heic": "format-4.svg", "mp4": "format-5.svg", "mkv": "format-5.svg", "mov": "format-5.svg", "avi": "format-5.svg", "webm": "format-5.svg", "m4v": "format-5.svg", "mpeg": "format-5.svg", "mpg": "format-5.svg", "mp3": "format-6.svg", "wav": "format-6.svg", "flac": "format-6.svg", "aac": "format-6.svg", "ogg": "format-6.svg", "m4a": "format-6.svg", "opus": "format-6.svg", "aiff": "format-6.svg", "rar": "format-7.svg", "zip": "format-8.svg", "txt": "format-9.svg", "md": "format-9.svg", "log": "format-9.svg", "html": "format-10.svg", "css": "format-10.svg", "js": "format-10.svg", "jsx": "format-10.svg", "ts": "format-10.svg", "tsx": "format-10.svg", "py": "format-10.svg", "json": "format-10.svg", "xml": "format-10.svg", "yml": "format-10.svg", "yaml": "format-10.svg", "sh": "format-10.svg", "sql": "format-10.svg", "exe": "format-11.svg", "mis": "format-11.svg", "apk": "format-11.svg", "dmg": "format-11.svg", "deb": "format-11.svg", "rpm": "format-11.svg", "appimage": "format-11.svg", "msi": "format-11.svg"};
function formatIcon(name){const e=(name.split(".").pop()||"").toLowerCase();const img=document.createElement("img");img.src="/static/icons/"+(FORMAT_ICONS[e]||"format-12.svg");img.alt="";img.width=32;img.height=32;return img;}
const UI_ICONS={"SUBIR": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 8L12 3M12 3L7 8M12 3V15\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "DESCARGAR": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M21 15V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V15M17 10L12 15M12 15L7 10M12 15V3\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "COPIAR ENLACE": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "ELIMINAR": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "CANDADO": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M17 10V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V10M12 14.5V16.5M8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C17.7202 10 16.8802 10 15.2 10H8.8C7.11984 10 6.27976 10 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "MOSTRAR CONTRASE\u00d1A": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M7 11V8C7 5.23858 9.23858 3 12 3C14.419 3 16.4367 4.71776 16.9 7M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V15.8C21 14.1198 21 13.2798 20.673 12.638C20.3854 12.0735 19.9265 11.6146 19.362 11.327C18.7202 11 17.8802 11 16.2 11H7.8C6.11984 11 5.27976 11 4.63803 11.327C4.07354 11.6146 3.6146 12.0735 3.32698 12.638C3 13.2798 3 14.1198 3 15.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "OCULTAR CONTRASE\u00d1A": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M17 11V8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V11M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V15.8C21 14.1198 21 13.2798 20.673 12.638C20.3854 12.0735 19.9265 11.6146 19.362 11.327C18.7202 11 17.8802 11 16.2 11H7.8C6.11984 11 5.27976 11 4.63803 11.327C4.07354 11.6146 3.6146 12.0735 3.32698 12.638C3 13.2798 3 14.1198 3 15.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "RELOJ": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>", "MIS ARCHIVOS": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M22 10.5L21.5256 6.70463C21.3395 5.21602 21.2465 4.47169 20.8961 3.9108C20.5875 3.41662 20.1416 3.02301 19.613 2.77804C19.013 2.5 18.2629 2.5 16.7626 2.5H7.23735C5.73714 2.5 4.98704 2.5 4.38702 2.77804C3.85838 3.02301 3.4125 3.41662 3.10386 3.9108C2.75354 4.47169 2.6605 5.21601 2.47442 6.70463L2 10.5M5.5 14.5H18.5M5.5 14.5C3.567 14.5 2 12.933 2 11C2 9.067 3.567 7.5 5.5 7.5H18.5C20.433 7.5 22 9.067 22 11C22 12.933 20.433 14.5 18.5 14.5M5.5 14.5C3.567 14.5 2 16.067 2 18C2 19.933 3.567 21.5 5.5 21.5H18.5C20.433 21.5 22 19.933 22 18C22 16.067 20.433 14.5 18.5 14.5M6 11H6.01M6 18H6.01M12 11H18M12 18H18\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "USUARIOS": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "MI PERFIL": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5.3163 19.4384C5.92462 18.0052 7.34492 17 9 17H15C16.6551 17 18.0754 18.0052 18.6837 19.4384M16 9.5C16 11.7091 14.2091 13.5 12 13.5C9.79086 13.5 8 11.7091 8 9.5C8 7.29086 9.79086 5.5 12 5.5C14.2091 5.5 16 7.29086 16 9.5ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>", "REANUDAR": "<svg class=\"ui-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M22 10C22 10 19.995 7.26822 18.3662 5.63824C16.7373 4.00827 14.4864 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.1031 21 19.5649 18.2543 20.6482 14.5M22 10V4M22 10H16\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>"};
const $=id=>document.getElementById(id);const MAX=5,GB=1e9;let me=null,csrfToken=null,currentView='upload',running=false,pauseRequested=false,queue=[],serial=0,viewToken=0;
function size(n){n=Number(n);for(const u of ['B','KB','MB','GB','TB']){if(n<1000||u==='TB')return(u==='B'?String(n):n.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1'))+' '+u;n/=1000;}}
function kind(name){const e=(name.split('.').pop()||'').toLowerCase();const groups=[['🖼','Imagen',['jpg','jpeg','png','gif','webp','bmp','tif','tiff','avif','heic','svg']],['🎬','Vídeo',['mp4','mkv','mov','webm','avi','flv','m4v','mpeg','mpg','ts']],['🎵','Audio',['mp3','flac','wav','ogg','aac','m4a','opus']],['📦','Comprimido',['zip','rar','7z','gz','tar','bz2','xz']],['📕','PDF',['pdf']],['📄','Documento',['doc','docx','odt','txt','md','rtf']],['📊','Hoja de cálculo',['xls','xlsx','csv','ods']],['📽','Presentación',['ppt','pptx','odp']],['⌨','Código',['py','js','ts','json','html','css','java','sh','yml','yaml']],['⚙','Aplicación',['exe','msi','apk','deb','rpm']]];for(const [icon,label,exts]of groups)if(exts.includes(e))return{icon,label:label+' · '+e.toUpperCase()};return{icon:'📁',label:name.includes('.')?e.toUpperCase():'Archivo'};}
let noticeAnimation=null,noticeRun=0,temporaryNoticeTimer=null,moduleStatusPoll=null,moduleStatusPollInFlight=false;
function message(text,duration=6500){
 const notice=$('notice'),run=++noticeRun;
 if(!notice)throw new Error('No se encontró el contenedor de notificaciones.');
 const loginVisible=!$('login').hidden;
 notice.classList.toggle('login-notice',loginVisible);
 if(loginVisible)$('login').after(notice);
 else $('pendingUploadNotice').before(notice);
 let content=$('noticeText');
 if(!content){
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');
  icon.classList.add('notice-icon');
  icon.setAttribute('aria-hidden','true');
  icon.setAttribute('focusable','false');
  icon.setAttribute('width','24');
  icon.setAttribute('height','24');
  icon.setAttribute('viewBox','0 0 24 24');
  icon.setAttribute('fill','none');
  const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z');
  path.setAttribute('stroke','currentColor');
  path.setAttribute('stroke-width','2');
  path.setAttribute('stroke-linecap','round');
  path.setAttribute('stroke-linejoin','round');
  icon.append(path);
  content=document.createElement('span');
  content.id='noticeText';
  notice.replaceChildren(icon,content);
 }
 clearTimeout(temporaryNoticeTimer);
 if(noticeAnimation)noticeAnimation.cancel();
 if(!text){
  if(!content.textContent){notice.hidden=true;return;}
  const clear=()=>{if(run===noticeRun){content.textContent='';notice.hidden=true;}};
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){clear();return;}
  noticeAnimation=notice.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-5px)'}],{duration:180,easing:'ease-in'});
  noticeAnimation.finished.then(clear).catch(()=>{});
  return;
 }
 content.textContent=text;
 notice.hidden=false;
 if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)noticeAnimation=notice.animate([{opacity:0,transform:'translateY(-5px)'},{opacity:1,transform:'translateY(0)'}],{duration:220,easing:'ease-out'});
 if(duration>0)temporaryNoticeTimer=setTimeout(()=>{if(run===noticeRun)message('');},duration);
}
function temporaryMessage(text,duration=6500){message(text,duration);}
async function api(path,method='GET',body){const headers={};if(me)headers['X-CSRF-Token']=me.csrf;if(csrfToken)headers['X-WTF-CSRF-Token']=csrfToken;if(body!==undefined){headers['Content-Type']='application/json';body=JSON.stringify(body);}const r=await fetch('/api'+path,{method,headers,body});let j;try{j=await r.json();}catch(e){throw Error('Respuesta inesperada ('+r.status+').');}if(!r.ok){const e=Error(j.error||'Error '+r.status);e.status=r.status;throw e;}return j;}
const MODULE_STATUS_LABELS={available:'Disponible',partial:'Parcialmente disponible',unavailable:'No disponible'};
const USER_MODULES=[{key:'foxdrop',name:'FoxDrop'},{key:'foxget',name:'FoxGet'},{key:'foxconvert',name:'FoxConvert'}];
const MODULE_NAMES=Object.fromEntries(USER_MODULES.map(({key,name})=>[key,name]));
function moduleName(module){return MODULE_NAMES[module]||module.replace(/[_-]+/g,' ').replace(/\b\w/g,char=>char.toUpperCase());}
function syncModuleStatusForm(){
 const form=$('moduleStatusForm'),appSelect=form.elements.module,statusSelect=form.elements.status;
 const selected=appSelect.value;
 const modules=Object.keys(me?.module_statuses||{});
 appSelect.replaceChildren(...modules.map(module=>{const option=document.createElement('option');option.value=module;option.textContent=moduleName(module);return option;}));
 appSelect.value=modules.includes(selected)?selected:modules[0]||'';
 const currentStatus=me?.module_statuses?.[appSelect.value];
 $('moduleCurrentStatus').textContent=currentStatus?`Estado actual: ${MODULE_STATUS_LABELS[currentStatus]||currentStatus}`:'No hay aplicaciones disponibles.';
 statusSelect.value=currentStatus||'available';
 statusSelect.dispatchEvent(new Event('change',{bubbles:true}));
}
function updateModuleAvailabilityNotices(){
 document.querySelectorAll('[data-module-notice]').forEach(notice=>{
  const module=notice.dataset.moduleNotice;
  const inModule=module==='foxdrop'?['upload','files'].includes(currentView):currentView===module;
  notice.hidden=me?.module_statuses?.[module]!=='partial'||!inModule;
 });
}
function applyModuleStatuses(){
 const statuses=me?.module_statuses||{foxdrop:'available',foxget:'available',foxconvert:'available'};
 for(const module of ['foxdrop','foxget','foxconvert']){
  const status=statuses[module]||'available';
  const view=module==='foxdrop'?'upload':module==='foxget'?'foxget':'foxconvert';
  const card=document.querySelector(`#view-home [data-view="${view}"]`);
  const permission=!!me?.admin||!!me?.[module];
  const allowed=permission&&(!!me?.admin||status!=='unavailable');
  if(card){
   card.dataset.availability=status;
   card.classList.toggle('is-unavailable',!allowed);
   card.setAttribute('aria-disabled',String(!allowed));
   card.tabIndex=0;
   card.href=module==='foxdrop'?'/foxdrop':`/${module}`;
   card.querySelector('.portal-module-status').textContent=permission?MODULE_STATUS_LABELS[status]:'Sin acceso';
  }
 }
 updateModuleAvailabilityNotices();
 const foxdropEnabled=(!!me?.admin||!!me?.foxdrop)&&(!!me?.admin||statuses.foxdrop!=='unavailable');
 document.querySelectorAll('#panel>.app-nav [data-view="upload"],#panel>.app-nav [data-view="files"]').forEach(link=>link.hidden=!foxdropEnabled);
}
function button(text,fn,cls='secondary'){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;if(text==='Eliminar')b.innerHTML=UI_ICONS['ELIMINAR']+' Eliminar';b.onclick=async()=>{try{await fn();}catch(e){message(e.message);}};return b;}
function line(parent,text,cls){const p=document.createElement('p');p.textContent=text;if(cls)p.className=cls;parent.append(p);return p;}
window.foxConfirm=function(options){
  const opt=typeof options==='string'?{description:options}:(options||{});
  const title=opt.title||'¿Confirmar acción?';
  const description=opt.description||'Por favor confirma si deseas continuar.';
  const eyebrow=opt.eyebrow||'AVISO';
  const confirmText=opt.confirmText||'Confirmar';
  const cancelText=opt.cancelText||'Cancelar';
  const danger=!!opt.danger;
  const detail=opt.detail||'';
  const previous=document.activeElement;
  const d=document.createElement('dialog');
  d.className='fox-resume-modal'+(danger?' fox-delete-modal':'');
  d.setAttribute('aria-labelledby','fx-modal-title');
  d.setAttribute('aria-describedby','fx-modal-desc');
  const iconSvg=danger
    ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg>'
    :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  const detailHtml=detail?`<div class="fr-file" style="justify-content:center;margin-bottom:14px;"><span class="fr-file-name" style="text-align:center;">${detail}</span></div>`:'';
  d.innerHTML=`<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true">${iconSvg}</div><span class="fr-eyebrow">${eyebrow}</span><h2 id="fx-modal-title">${title}</h2><p class="fr-description" id="fx-modal-desc">${description}</p>${detailHtml}<div class="fr-actions"><button type="button" class="fr-cancel secondary" autofocus>${cancelText}</button><button type="button" class="${danger?'fr-delete':'fr-resume'}">${confirmText}</button></div>`;
  document.body.append(d);
  return new Promise(resolve=>{
    let finished=false;
    const finish=val=>{
      if(finished)return;
      finished=true;
      if(window.foxCloseDialog)window.foxCloseDialog(d).then(()=>{if(previous?.isConnected)previous.focus();resolve(val);});
      else{if(d.open)d.close();d.remove();if(previous?.isConnected)previous.focus();resolve(val);}
    };
    d.querySelector('.fr-close').onclick=()=>finish(false);
    d.querySelector('.fr-cancel').onclick=()=>finish(false);
    d.querySelector(danger?'.fr-delete':'.fr-resume').onclick=()=>finish(true);
    d.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
    d.addEventListener('click',e=>{if(e.target===d)finish(false);});
    d.addEventListener('close',()=>{if(!finished){finished=true;d.remove();resolve(false);}});
    d.showModal();
    d.querySelector('.fr-cancel').focus();
  });
};
function linkCard(url){const b=document.createElement('button');b.type='button';b.className='link-card';const head=document.createElement('span');head.className='link-head';const title=document.createElement('small');title.textContent='ENLACE PARA COMPARTIR';const tag=document.createElement('span');tag.className='copy-pill';tag.innerHTML=UI_ICONS['COPIAR ENLACE']+' Copiar';head.append(title,tag);const code=document.createElement('code');code.textContent=url;b.append(head,code);b.onclick=async()=>{try{await navigator.clipboard.writeText(url);b.classList.add('copied');tag.textContent='✓ Copiado';setTimeout(()=>{b.classList.remove('copied');tag.innerHTML=UI_ICONS['COPIAR ENLACE']+' Copiar';},2300);}catch(e){message('El navegador bloqueó la copia. Selecciona el enlace para copiarlo manualmente.');const s=getSelection(),r=document.createRange();r.selectNodeContents(code);s.removeAllRanges();s.addRange(r);}};return b;}
function route(){const moduleViews=new Map([['foxdrop','upload'],['foxget','foxget'],['foxconvert','foxconvert']]);const requestedModule=new URLSearchParams(location.search).get('module');return location.pathname==='/profile'?'profile':location.pathname==='/users'?'users':location.pathname==='/files'?'files':location.pathname==='/foxget'?'foxget':location.pathname==='/foxconvert'?'foxconvert':location.pathname==='/foxdrop'?'upload':moduleViews.get(requestedModule)||'home';}
function viewURL(name){return name==='home'?'/':name==='profile'?'/':name==='upload'?'/foxdrop':name==='foxget'?'/foxget':name==='foxconvert'?'/foxconvert':'/'+name;}
let viewExitAnimation=null;
async function showView(name,push=false){
 if(window.fxSelectsClose)window.fxSelectsClose();
 hideAllFilePasswords();
 if(!me)return;
 const statuses=me.module_statuses||{};
 const module=['foxget','foxconvert'].includes(name)?name:['upload','files'].includes(name)?'foxdrop':null;
 const unavailable=!!module&&!me.admin&&statuses[module]==='unavailable';
 if(unavailable){
  const moduleLabel=moduleName(module);
  name='home';
  history.replaceState({view:name},'',viewURL(name));
  temporaryMessage(`${moduleLabel} no está disponible temporalmente. Inténtalo más tarde.`);
 }else if(name==='users'&&!me.admin||module&&!me.admin&&!me[module]){
  if(module)temporaryMessage(`No tienes acceso a ${moduleName(module)}.`);
  name='home';
  history.replaceState({view:name},'',viewURL(name));
 }
 const nextView=$('view-'+name);
 const currentVisible=Array.from(document.querySelectorAll('#panel .view')).find(el=>!el.hidden);
 if(currentVisible?.id==='view-foxconvert'&&currentVisible!==nextView){
  if(window.foxConvertConfirmLeave&&!await window.foxConvertConfirmLeave()){
   if(!push)history.replaceState({view:currentView},'',viewURL(currentView));
   return;
  }
  if(window.foxConvertOnLeave)window.foxConvertOnLeave();
 }
 const ticket=++viewToken;
 if(currentVisible&&currentVisible!==nextView&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  if(viewExitAnimation)viewExitAnimation.cancel();
  const exit=viewExitAnimation=currentVisible.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-6px)'}],{duration:220,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
  try{await exit.finished;}catch(e){}
  if(viewExitAnimation===exit){exit.cancel();viewExitAnimation=null;}
  if(ticket!==viewToken)return;
 }
 if(ticket!==viewToken)return;
 currentView=name;
 updateModuleAvailabilityNotices();
 document.body.classList.add('portal-active');
 $('panel').dataset.portalView=name;
 for(const viewName of ['home','upload','files','users','profile','foxget','foxconvert'])$('view-'+viewName).hidden=viewName!==name;
 if(name==='foxconvert'&&currentVisible!==nextView&&window.foxConvertOnEnter)window.foxConvertOnEnter();
 document.querySelectorAll('[data-view]').forEach(a=>a.classList.toggle('active',a.dataset.view===name));
 if(window.portalMotion20)window.portalMotion20(name);
 const baseTitle=name==='home'?'Explorar herramientas':name==='profile'?'Mi perfil':name==='files'?'Mis archivos':name==='users'?'Usuarios':name==='foxget'?'Descargar · FoxGet':name==='foxconvert'?'Convertir · FoxConvert':'Subir';
 const pageBrand=name==='upload'||name==='files'?'FoxDrop':'FoxSuite';
 document.title=name==='home'?'FoxSuite':(name==='foxget'||name==='foxconvert'||name==='profile'||name==='users')?baseTitle:baseTitle+' · '+pageBrand;
 if(push&&location.pathname+location.search!==viewURL(name))history.pushState({view:name},'',viewURL(name));
 try{if(name==='files')await refreshFiles();if(name==='users'){await users();await loadFeedback();}if(name==='profile')await loadProfile();}
 catch(e){if(ticket===viewToken)message(e.message);}
}
document.querySelectorAll('[data-view]').forEach(a=>a.addEventListener('click',async e=>{
 if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 if(a.matches('#view-foxget [data-foxget-section]'))return;
 e.preventDefault();
 if(a.matches('#view-home .portal-module-card')){
 try{
  Object.assign(me,await api('/me'));
  applyModuleStatuses();
  await showView(a.dataset.view,true);
 }catch(error){message(error.message);}
  return;
 }
 showView(a.dataset.view,true);
}));
window.addEventListener('popstate',()=>showView(route(),false));
// The brand is also internal navigation; public share pages keep their normal link.
const brand=document.querySelector('header a');if(brand)brand.addEventListener('click',e=>{if(me&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&e.button===0){e.preventDefault();showView('upload',true);}});
async function boot(){
 try{csrfToken=(await api('/csrf')).csrf_token;me=await api('/me');csrfToken=me.csrf_token;}catch(e){document.title='FoxSuite';$('login').hidden=false;$('panel').hidden=true;return;}
 $('login').hidden=true;
 $('panel').hidden=false;
 renderAccount();
 $('adminNav').hidden=!me.admin;
 $('adminProfilePanel').hidden=!me.admin;
 if(me.admin){
  $('filesHeading').textContent='Mis Archivos';
  $('filesTitle').textContent='Todos los archivos';
  $('moduleStatusPanel').hidden=!me.admin;
  syncModuleStatusForm();
 }
 applyModuleStatuses();
 await showView(route());
 if(!moduleStatusPoll)moduleStatusPoll=setInterval(pollModuleStatuses,5000);
 summary();
}
async function pollModuleStatuses(){
 if(!me||document.hidden||moduleStatusPollInFlight)return;
 moduleStatusPollInFlight=true;
 try{
  const latest=await api('/me');
  const previousStatuses=me.module_statuses||{},nextStatuses=latest.module_statuses||{};
  const changedStatuses=Object.keys(nextStatuses).some(module=>previousStatuses[module]!==nextStatuses[module]);
  const changedAccess=USER_MODULES.some(({key})=>!!me[key]!==!!latest[key]);
  Object.assign(me,latest);
  if(!changedStatuses&&!changedAccess)return;
  applyModuleStatuses();
  if(me.admin){
   if(currentView==='users')syncModuleStatusForm();
   return;
  }
  const activeModule=['foxget','foxconvert'].includes(currentView)?currentView:['upload','files'].includes(currentView)?'foxdrop':null;
  if(activeModule&&changedAccess&&!me[activeModule]){
   await showView('home',true);
   temporaryMessage(`Tu acceso a ${moduleName(activeModule)} fue revocado. Te llevamos al inicio.`);
  }else if(activeModule&&nextStatuses[activeModule]==='unavailable'){
   await showView('home',true);
   temporaryMessage(`${moduleName(activeModule)} ya no está disponible. Te llevamos al inicio.`);
  }
 }catch(error){
  if(error.status===401){
   clearInterval(moduleStatusPoll);
   moduleStatusPoll=null;
   $('panel').hidden=true;
   $('login').hidden=false;
   temporaryMessage('Tu sesión terminó. Inicia sesión para continuar.');
  }else console.error('No se pudo actualizar la disponibilidad de los módulos.',error);
 }finally{moduleStatusPollInFlight=false;}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pollModuleStatuses();});
$('loginForm').onsubmit=async e=>{e.preventDefault();try{await api('/login','POST',{name:$('username').value,password:$('loginPassword').value});$('loginPassword').value='';message('');await boot();}catch(e){message(e.message);}};
$('logout').onclick=async()=>{
  if(running){message('Pausa la cola antes de cerrar sesión.');return;}
  if(queue.some(q=>q.state!=='done')){
    const ok=await window.foxConfirm({
      eyebrow: 'COLA PENDIENTE',
      title: '¿Cerrar sesión?',
      description: 'Salir descarta la cola local. Podrás reanudar seleccionando los mismos archivos. ¿Continuar?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Seguir aquí',
      danger: true
    });
    if(!ok)return;
  }
  if(currentView==='foxconvert'&&window.foxConvertConfirmLeave&&!await window.foxConvertConfirmLeave())return;
  if(currentView==='foxconvert'&&window.foxConvertOnLeave)window.foxConvertOnLeave();
  try{await api('/logout','POST');location.href='/';}catch(e){message(e.message);}
};
async function refreshFiles(){const j=await api('/files');$('storage').textContent='Capacidad reservada global: '+size(j.reserved)+' / '+size(j.quota);$('files').replaceChildren();if(!j.files.length)line($('files'),'Todavía no hay archivos.','empty-state');for(const f of j.files){const k=kind(f.name),d=document.createElement('article');d.className='file-item';const head=document.createElement('div');head.className='file-heading';const icon=document.createElement('span');icon.className='file-icon';icon.append(formatIcon(f.name));const t=document.createElement('div'),n=document.createElement('strong');n.textContent=f.name;const titleRow=document.createElement("div");titleRow.className="file-title-row";titleRow.append(n,icon);t.append(titleRow);line(t,k.label+' · '+size(f.size),'file-meta');head.append(t);d.append(head);line(d,(f.state==='ready'?'Disponible':'Subida pendiente · '+(f.offset/f.size*100).toFixed(1)+'%')+(f.protected?' · 🔒 Protegido':''),'file-meta');if(f.recorded_at){const stamp=line(head,'Registrado: '+new Date(f.recorded_at).toLocaleString("es-ES"),'file-meta');stamp.classList.add('file-recorded-at');}if(f.expires)line(d,'Expira: '+new Date(f.expires).toLocaleString("es-ES"),'file-meta');const actions=document.createElement('div');actions.className='file-actions';if(f.state==='ready'){d.append(linkCard(f.url));const a=document.createElement('a');a.href=f.url;a.innerHTML=UI_ICONS['DESCARGAR']+' Abrir enlace';a.className='button secondary';a.target='_blank';a.rel='noopener';actions.append(a);}else{line(d,'Para reanudar, selecciona el archivo original.','muted fine');if(!me.admin||f.owner?.name===me.name)actions.append(button('Reanudar',async()=>{if(typeof window.foxResumePendingUpload!=='function'){message('No se pudo abrir la selección de archivos. Recarga la página e inténtalo de nuevo.');return;}await window.foxResumePendingUpload(f.id);},'secondary small'));}actions.append(button('Eliminar',async()=>{if(!await foxDeleteFile(f.name,()=>api('/files/'+f.id,'DELETE')))return;for(const q of queue){if(q.remote===f.id&&q.state==='done')removeVisual(q);}await refreshFiles();},'danger'));d.append(actions);$('files').append(d);}}
$('refresh').onclick=()=>refreshFiles().catch(e=>message(e.message));
function pendingCount(){return queue.filter(q=>q.state!=='done').length;}
function summary(){const n=pendingCount(),done=queue.filter(q=>q.state==='done').length,active=queue.find(q=>q.state==='uploading');$('queueLimit').textContent=n+' / '+MAX+' pendientes';$('queueSummary').textContent=active?'Subiendo: '+active.file.name:n?n+' pendiente'+(n===1?'':'s')+(pauseRequested?' · Cola pausada':'')+(done?' · '+done+' completado'+(done===1?'':'s')+' visible'+(done===1?'':'s'):''):done?'Todo listo. Los enlaces también están en Mis archivos.':'Todavía no has añadido archivos.';$('startQueue').disabled=running||!queue.some(q=>['waiting','paused','error'].includes(q.state));$('startQueue').innerHTML=queue.some(q=>q.state==='paused')?UI_ICONS['REANUDAR']+' Continuar cola':UI_ICONS['SUBIR']+' Subir cola';$('pauseQueue').disabled=!running||pauseRequested;if(window.foxSetVisible)window.foxSetVisible($('queueEmpty'),queue.length===0);else $('queueEmpty').hidden=queue.length>0;}
function removeVisual(q){queue=queue.filter(x=>x!==q);if(q.node){q.node.classList.add('queue-leave');setTimeout(()=>q.node.remove(),240);}q.password='';summary();}
function trimCompleted(){while(queue.length>MAX){const old=queue.filter(q=>q.state==='done').sort((a,b)=>a.order-b.order)[0];if(!old)break;removeVisual(old);}}
function keyFor(f){return 'rf:'+me.name+':'+f.name+':'+f.size+':'+f.lastModified;}
function drawCard(q){const d=document.createElement('article');d.className='queue-card';const top=document.createElement('div');top.className='queue-top';const ico=document.createElement('span');ico.className='queue-icon';ico.append(formatIcon(q.file.name));const info=document.createElement('div');info.className='queue-info';const name=document.createElement('strong');name.textContent=q.file.name;const titleRow=document.createElement("div");titleRow.className="file-title-row";titleRow.append(name,ico);info.append(titleRow);line(info,size(q.file.size)+' · '+kind(q.file.name).label,'file-meta');const close=button('×',async()=>{if(q.state==='uploading')return;if(q.remote&&q.state!=='done'){if(typeof window.foxConfirmUploadCancel!=='function'){message('No se pudo abrir la confirmación. Recarga la página e inténtalo de nuevo.');return;}if(!await window.foxConfirmUploadCancel(q.file.name))return;try{await api('/files/'+q.remote,'DELETE');}catch(e){if(e.status!==404)throw e;}localStorage.removeItem(q.key);}removeVisual(q);},'queue-close');close.setAttribute('aria-label','Quitar tarjeta de '+q.file.name);top.append(info,close);d.append(top);const status=line(d,'En espera','queue-state');const progress=document.createElement('progress');progress.max=100;progress.value=0;progress.setAttribute('aria-label','Progreso de '+q.file.name);d.append(progress);q.configEl=line(d,'Expira '+(q.ttl<3600?q.ttl/60+' min':q.ttl/3600+' h')+' después de completar'+(q.password?' · Con contraseña':''),'queue-expiry');const result=document.createElement('div');d.append(result);const retry=button('Reintentar',async()=>{q.state='waiting';q.error='';updateCard(q);await runQueue();},'secondary small');retry.hidden=true;d.append(retry);q.node=d;q.statusEl=status;q.progressEl=progress;q.resultEl=result;q.closeEl=close;q.retryEl=retry;$('queueList').insertBefore(d,$('queueEmpty')); // DOM order is sorted below.
const cards=queue.filter(x=>x.node).sort((a,b)=>b.order-a.order);for(const x of cards)$('queueList').insertBefore(x.node,$('queueEmpty'));updateCard(q);}
function updateCard(q){if(!q.node)return;q.node.dataset.state=q.state;q.progressEl.value=q.offset/q.file.size*100;q.closeEl.disabled=q.state==='uploading';q.retryEl.hidden=q.state!=='error';const names={waiting:'En espera',uploading:'Subiendo',paused:'Pausado',done:'Completado',error:'Error'};q.statusEl.textContent=q.state==='error'?q.error:q.state==='uploading'?(q.offset/q.file.size*100).toFixed(1)+'% · '+size(q.offset)+' / '+size(q.file.size)+(q.speed?' · '+size(q.speed)+'/s':'')+(q.speed?' · '+Math.ceil((q.file.size-q.offset)/q.speed)+' s restantes':''):names[q.state];if(q.state==='done'&&!q.resultEl.children.length)q.resultEl.append(linkCard(location.origin+'/f/'+q.remote));summary();}
async function enqueue(files){if(!me)return;const notes=[];let ttl=Number($('ttl').value),pw=$('filePassword').value;let bigDecision=null;for(const f of files){if(pendingCount()>=MAX){notes.push('La cola admite un máximo de 5 pendientes. No se añadieron los restantes.');break;}if(f.size<1||f.size>10*GB){notes.push(f.name+': debe tener entre 1 byte y 10 GB.');continue;}const key=keyFor(f);if(queue.some(q=>q.key===key&&q.state!=='done')){notes.push(f.name+': ya está en la cola.');continue;}let fileTTL=ttl;if(f.size>5*GB&&ttl===259200){if(bigDecision===null)bigDecision=await window.foxConfirm({eyebrow:'EXPIRACIÓN DE ARCHIVOS',title:'Límite de tiempo',description:'Los archivos de más de 5 GB no permiten 72 horas. ¿Añadir los grandes con 24 horas? Los pequeños conservarán 72 horas.',confirmText:'Añadir con 24h',cancelText:'Cancelar'});if(!bigDecision){notes.push(f.name+': no añadido por la expiración de 72 horas.');continue;}fileTTL=86400;}const q={file:f,key,ttl:fileTTL,password:pw,longExpiryApproved:(ttl===259200&&f.size>5*GB&&fileTTL===86400),remote:null,offset:0,speed:0,order:++serial,state:'waiting',error:''};queue.push(q);drawCard(q);trimCompleted();}message(notes.join(' '));summary();$('file').value='';}
$('file').onchange=()=>enqueue(Array.from($('file').files));const drop=$('dropZone');for(const ev of ['dragenter','dragover'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('over');});drop.addEventListener('dragleave',()=>drop.classList.remove('over'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('over');enqueue(Array.from(e.dataTransfer.files));});
async function uploadOne(q){q.state='uploading';q.speed=0;updateCard(q);let id=q.remote||localStorage.getItem(q.key),s;if(id){try{s=await api('/files/'+id);}catch(e){if(e.status!==404)throw e;id=null;localStorage.removeItem(q.key);}}
if(!id){if(!captureUploadConfiguration(q))throw Error('Subida no iniciada: ajusta el tiempo de expiración y reintenta.');const x=await api('/files','POST',{name:q.file.name,size:q.file.size,ttl:q.ttl,password:q.password});id=x.id;localStorage.setItem(q.key,id);s=await api('/files/'+id);}q.remote=id;if(s.name!==q.file.name||s.size!==q.file.size)throw Error('El archivo no coincide con la subida guardada.');q.offset=s.offset;if(s.state==='uploading'&&s.ttl!==q.ttl)message('Reanudando '+q.file.name+' con la expiración de su subida original.');q.ttl=s.ttl;const start=performance.now(),initial=q.offset;
while(q.offset<q.file.size&&!pauseRequested){const end=Math.min(q.offset+me.chunk,q.file.size);const r=await fetch('/api/files/'+id,{method:'PATCH',headers:{'X-CSRF-Token':me.csrf,'X-WTF-CSRF-Token':csrfToken,'Upload-Offset':String(q.offset),'Content-Type':'application/octet-stream'},body:q.file.slice(q.offset,end)});let j;try{j=await r.json();}catch(e){throw Error('Respuesta inválida. Puedes reintentar la subida.');}if(!r.ok){const e=Error(j.error||'Error al subir.');e.status=r.status;throw e;}q.offset=j.offset;q.speed=(q.offset-initial)/Math.max((performance.now()-start)/1000,.01);updateCard(q);}
if(q.offset===q.file.size){q.state='done';q.password='';localStorage.removeItem(q.key);}else q.state='paused';updateCard(q);}
async function runQueue(){if(running||!me)return;if(!syncQueueSettings(true))return;running=true;pauseRequested=false;for(const q of queue)if(q.state==='paused')q.state='waiting';summary();try{while(!pauseRequested){const q=queue.filter(x=>x.state==='waiting').sort((a,b)=>a.order-b.order)[0];if(!q)break;try{await uploadOne(q);}catch(e){q.state='error';q.error=e.message;updateCard(q);if(e.status===401||e.status===403){pauseRequested=true;message('La sesión ya no permite subir. Inicia sesión de nuevo para continuar.');}}}}finally{running=false;summary();if($('notice').textContent==='Pausando al terminar el bloque actual.')message('');if(currentView==='files')refreshFiles().catch(e=>message(e.message));}}
$('startQueue').onclick=()=>{for(const q of queue)if(q.state==='error')q.state='waiting';runQueue().catch(e=>message(e.message));};$('pauseQueue').onclick=()=>{pauseRequested=true;message('Pausando al terminar el bloque actual.');summary();};window.addEventListener('beforeunload',e=>{if(running||queue.some(q=>q.state!=='done')){e.preventDefault();e.returnValue='';}});
$('userForm').onsubmit=async e=>{e.preventDefault();try{await api('/users','POST',{name:$('newUser').value,password:$('newPassword').value});$('userForm').reset();await users();message('Usuario creado.');}catch(e){message(e.message);}};$('refreshUsers').onclick=()=>users().catch(e=>message(e.message));
$('moduleStatusApp').addEventListener('change',syncModuleStatusForm);
$('moduleStatusForm').onsubmit=async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const button=form.querySelector('button[type="submit"]');
  button.disabled=true;
  try{
   const module=form.elements.module.value;
   const result=await api('/admin/modules','POST',{[module]:form.elements.status.value});
   me.module_statuses=result.module_statuses;
   syncModuleStatusForm();
   applyModuleStatuses();
   message(`Estado de ${moduleName(module)} actualizado.`);
   const currentStatus=currentView==='foxget'?me.module_statuses.foxget:['upload','files'].includes(currentView)?me.module_statuses.foxdrop:'available';
   if(!me.admin&&currentStatus==='unavailable')await showView('home',true);
  }catch(error){message(error.message);}
  finally{button.disabled=false;}
};
async function users(){
  if(!me?.admin)return;
  const result=await api('/users');
  const list=$('users');
  list.replaceChildren();
  if(!result.users.length){line(list,'Todavía no hay usuarios creados.','empty-state');return;}
  result.users.forEach((user,index)=>{
    const card=document.createElement('article');
    card.className='user-card';
    card.style.animationDelay=`${Math.min(index,7)*45}ms`;

    const header=document.createElement('div');
    header.className='user-card-header';
    const identity=document.createElement('div');
    identity.className='user-card-identity';
    const avatar=avatarNode(user,'owner-avatar user-card-avatar');
    avatar.setAttribute('aria-hidden','true');
    const nameBlock=document.createElement('div');
    nameBlock.className='user-card-name-block';
    const name=document.createElement('strong');
    name.className='user-card-name';
    name.textContent=user.display_name||user.name;
    nameBlock.append(name);
    if(user.display_name&&user.display_name!==user.name){
      const handle=document.createElement('span');
      handle.className='user-card-username';
      handle.textContent='@'+user.name;
      nameBlock.append(handle);
    }
    identity.append(avatar,nameBlock);

    const badges=document.createElement('div');
    badges.className='user-card-badges';
    if(user.admin){
      const role=document.createElement('span');
      role.className='user-badge user-badge-role';
      role.textContent='Administrador';
      badges.append(role);
    }
    const status=document.createElement('span');
    status.className='user-badge '+(user.active?'user-badge-active':'user-badge-disabled');
    status.textContent=user.active?'Activo':'Desactivado';
    badges.append(status);
    header.append(identity,badges);
    card.append(header);

    if(user.name!==me.name){
      const applications=document.createElement('details');
      applications.className='user-password-details user-applications-details';
      const applicationsSummary=document.createElement('summary');
      applicationsSummary.textContent='Acceso a módulos';
      const applicationsHint=document.createElement('p');
      applicationsHint.className='user-applications-hint';
      applicationsHint.textContent='Selecciona un módulo y define si esta cuenta puede acceder.';
      const applicationForm=document.createElement('form');
      applicationForm.className='user-access-form';
      const moduleLabel=document.createElement('label');
      moduleLabel.className='user-access-field';
      moduleLabel.append(document.createTextNode('Módulo'));
      const moduleSelect=document.createElement('select');
      moduleSelect.setAttribute('aria-label',`Módulo para ${user.name}`);
      USER_MODULES.forEach(({key,name})=>{
        const option=document.createElement('option');
        option.value=key;
        option.textContent=name;
        moduleSelect.append(option);
      });
      moduleLabel.append(moduleSelect);
      const accessLabel=document.createElement('label');
      accessLabel.className='user-access-field';
      accessLabel.append(document.createTextNode('Permiso'));
      const accessSelect=document.createElement('select');
      accessSelect.setAttribute('aria-label',`Permiso del módulo para ${user.name}`);
      [['true','Con acceso'],['false','Sin acceso']].forEach(([value,label])=>{
        const option=document.createElement('option');
        option.value=value;
        option.textContent=label;
        accessSelect.append(option);
      });
      accessLabel.append(accessSelect);
      const permissionStatus=document.createElement('p');
      permissionStatus.className='user-access-current';
      permissionStatus.setAttribute('aria-live','polite');
      const syncPermissionControls=()=>{
        const module=moduleSelect.value;
        const allowed=!!user[module];
        permissionStatus.textContent=`Acceso actual a ${moduleName(module)}: ${allowed?'Con acceso':'Sin acceso'}.`;
        accessSelect.value=String(allowed);
        accessSelect.dispatchEvent(new Event('change',{bubbles:true}));
      };
      moduleSelect.addEventListener('change',syncPermissionControls);
      const saveAccess=document.createElement('button');
      saveAccess.type='submit';
      saveAccess.className='secondary small user-access-save';
      saveAccess.textContent='Guardar acceso';
      applicationForm.append(moduleLabel,accessLabel,permissionStatus,saveAccess);
      applicationForm.onsubmit=async event=>{
        event.preventDefault();
        const field=moduleSelect.value;
        const previous=!!user[field];
        const allowed=accessSelect.value==='true';
        saveAccess.disabled=true;
        try{
          await api('/users/'+user.id,'POST',{[field]:allowed});
          user[field]=allowed;
          syncPermissionControls();
          message(`Acceso a ${moduleName(field)} ${allowed?'concedido':'revocado'} para ${user.display_name||user.name}.`);
        }catch(error){
          accessSelect.value=String(previous);
          accessSelect.dispatchEvent(new Event('change',{bubbles:true}));
          message(error.message);
        }finally{saveAccess.disabled=false;}
      };
      applications.append(applicationsSummary,applicationsHint,applicationForm);

      const actions=document.createElement('div');
      actions.className='file-actions user-card-actions';
      const addAccessSwitch=(field,label,checked)=>{
        const control=document.createElement('label');
        control.className='user-access-switch';
        const text=document.createElement('span');
        text.textContent=label;
        const input=document.createElement('input');
        input.type='checkbox';
        input.checked=checked;
        input.setAttribute('role','switch');
        input.setAttribute('aria-label',`${label} para ${user.name}`);
        const track=document.createElement('span');
        track.className='user-access-track';
        control.append(text,input,track);
        input.onchange=async()=>{
          const previous=user[field];
          input.disabled=true;
          try{
            await api('/users/'+user.id,'POST',{[field]:input.checked});
            user[field]=input.checked;
            if(field==='active'){
              status.className='user-badge '+(user.active?'user-badge-active':'user-badge-disabled');
              status.textContent=user.active?'Activo':'Desactivado';
            }
          }catch(error){input.checked=previous;message(error.message);}
          finally{input.disabled=false;}
        };
        return control;
      };
      actions.append(addAccessSwitch('active','Cuenta activa',user.active));
      syncPermissionControls();
      card.append(applications);
      actions.append(button('Revocar sesiones',async()=>{await api('/users/'+user.id,'POST',{});message('Sesiones revocadas.');},'secondary small'));
      actions.append(button('Eliminar',async()=>{
        const ok=await window.foxConfirm({
          eyebrow: 'ELIMINAR USUARIO',
          title: '¿Eliminar cuenta?',
          description: `¿Estás seguro de que deseas eliminar permanentemente la cuenta de ${user.display_name||user.name}?`,
          detail: 'Se borrarán todos sus archivos subidos.',
          confirmText: 'Eliminar usuario',
          cancelText: 'Cancelar',
          danger: true
        });
        if(!ok)return;
        try{
          await api('/users/'+user.id,'DELETE');
          message(`Usuario ${user.display_name||user.name} eliminado.`);
          await users();
        }catch(error){message(error.message);}
      },'danger small'));
      card.append(actions);

      const details=document.createElement('details');
      details.className='user-password-details';
      const summary=document.createElement('summary');
      summary.textContent='Cambiar contraseña';
      const form=document.createElement('form');
      form.className='user-password-form';
      const input=document.createElement('input');
      input.type='password';
      input.autocomplete='new-password';
      input.placeholder='Mínimo 12 caracteres';
      input.setAttribute('aria-label','Nueva contraseña');
      input.minLength=12;
      input.maxLength=256;
      input.required=true;
      const save=document.createElement('button');
      save.type='submit';
      save.className='secondary small';
      save.textContent='Guardar contraseña';
      form.append(input,save);
      form.onsubmit=async event=>{
        event.preventDefault();
        try{
          await api('/users/'+user.id,'POST',{password:input.value});
          input.value='';
          details.open=false;
          message('Contraseña cambiada y sesiones revocadas.');
        }catch(error){message(error.message);}
      };
      details.append(summary,form);
      card.append(details);
    }
    list.append(card);
  });
 if(window.fxSelectsSetup)window.fxSelectsSetup(list);
}
function syncFeedbackList(){
 const list=$('adminFeedbackList');
 const filter=$('adminFeedbackFilter');
 const counts={new:0,reviewed:0};
 list.querySelectorAll('.admin-feedback-card').forEach(card=>{counts[card.dataset.status]++;});
 filter.querySelector('[value="new"]').textContent=`Nuevos (${counts.new})`;
 filter.querySelector('[value="reviewed"]').textContent=`Revisados (${counts.reviewed})`;
 list.querySelectorAll('.admin-feedback-section').forEach(section=>{
  section.hidden=section.dataset.status!==filter.value;
  const cards=section.querySelector('.admin-feedback-cards');
  cards.querySelector('.empty-state')?.remove();
  if(!cards.querySelector('.admin-feedback-card'))line(cards,section.dataset.status==='new'?'No hay mensajes nuevos.':'No hay mensajes revisados.','empty-state');
 });
 list.classList.toggle('has-scroll',counts[filter.value]>5);
}
async function animateFeedbackCardOut(card){
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 card.style.maxHeight=`${card.offsetHeight}px`;
 card.offsetHeight;
 card.classList.add('is-leaving');
 card.style.maxHeight='0px';
 await new Promise(resolve=>setTimeout(resolve,260));
}
function createFeedbackCard(item,cards){
 const card=document.createElement('article');
 card.className='admin-feedback-card';
 card.dataset.category=item.category==='bug'?'bug':'suggestion';
 card.dataset.status=item.status==='reviewed'?'reviewed':'new';
 const header=document.createElement('div');
 header.className='admin-feedback-header';
 const author=document.createElement('strong');
 author.textContent=item.username;
 const meta=document.createElement('span');
 const type=item.category==='bug'?'Informó un error':'Sugerencia';
 meta.textContent=`${type} · ${new Date(item.created_at*1000).toLocaleString('es-ES')}`;
 const state=document.createElement('span');
 state.className='admin-feedback-state';
 state.textContent=card.dataset.status==='new'?'Nuevo':'Revisado';
 header.append(author,meta,state);
 const text=line(card,item.message,'admin-feedback-message');
 text.style.whiteSpace='pre-wrap';
 const actions=document.createElement('div');
 actions.className='file-actions';
 const reviewButton=button(card.dataset.status==='new'?'Marcar revisado':'Volver a pendientes',async()=>{
  const buttons=actions.querySelectorAll('button');
  buttons.forEach(action=>action.disabled=true);
  try{
   const reviewed=card.dataset.status!=='reviewed';
   await api('/admin/feedback/'+item.id,'POST',{reviewed});
   await animateFeedbackCardOut(card);
   item.status=reviewed?'reviewed':'new';
   card.dataset.status=item.status;
   state.textContent=reviewed?'Revisado':'Nuevo';
   reviewButton.textContent=reviewed?'Volver a pendientes':'Marcar revisado';
   card.style.maxHeight='';
   card.classList.remove('is-leaving');
   card.classList.add('is-entering');
   const target=$(`adminFeedback${reviewed?'Reviewed':'New'}Cards`);
   target.prepend(card);
   card.addEventListener('animationend',()=>card.classList.remove('is-entering'),{once:true});
   setTimeout(()=>card.classList.remove('is-entering'),300);
   syncFeedbackList();
  }finally{buttons.forEach(action=>action.disabled=false);}
 },'secondary small');
 actions.append(reviewButton);
 actions.append(button('Eliminar',async()=>{
  const buttons=actions.querySelectorAll('button');
  buttons.forEach(action=>action.disabled=true);
  try{
   await api('/admin/feedback/'+item.id,'DELETE');
   await animateFeedbackCardOut(card);
   card.remove();
   syncFeedbackList();
  }finally{buttons.forEach(action=>action.disabled=false);}
 },'danger small'));
 card.append(header,text,actions);
 cards.append(card);
}
async function loadFeedback(){
 if(!me?.admin)return;
 const result=await api('/admin/feedback');
 const list=$('adminFeedbackList');
 list.replaceChildren();
 list.classList.remove('has-scroll');
 [['new','Nuevos'],['reviewed','Revisados']].forEach(([status,title])=>{
  const section=document.createElement('section');
  section.className='admin-feedback-section';
  section.dataset.status=status;
  const cards=document.createElement('div');
  cards.className='admin-feedback-cards';
  cards.id=`adminFeedback${status==='new'?'New':'Reviewed'}Cards`;
  section.append(cards);
  list.append(section);
 });
 if(!result.feedback.length){line($('adminFeedbackNewCards'),'Todavía no hay mensajes.','empty-state');syncFeedbackList();return;}
 result.feedback.forEach(item=>{
  const cards=$(item.status==='reviewed'?'adminFeedbackReviewedCards':'adminFeedbackNewCards');
  createFeedbackCard(item,cards);
 });
 syncFeedbackList();
}
 $('adminFeedbackFilter').addEventListener('change',()=>{
  syncFeedbackList();
 });
const feedbackWidget=$('feedbackWidget');
const feedbackToggle=$('feedbackToggle');
const feedbackForm=$('feedbackForm');
let feedbackCloseTimer=null;
function setFeedbackOpen(open){
 if(open){
  clearTimeout(feedbackCloseTimer);
  feedbackWidget.classList.remove('is-form-closing');
 }else if(feedbackWidget.classList.contains('is-form-open')){
  clearTimeout(feedbackCloseTimer);
  feedbackWidget.classList.add('is-form-closing');
  feedbackCloseTimer=setTimeout(()=>feedbackWidget.classList.remove('is-form-closing'),220);
 }
 feedbackWidget.classList.toggle('is-form-open',open);
 feedbackToggle.setAttribute('aria-expanded',String(open));
}
feedbackWidget.addEventListener('pointerenter',()=>feedbackWidget.classList.add('is-hovered'));
feedbackWidget.addEventListener('pointerleave',()=>{
 feedbackWidget.classList.remove('is-hovered');
});
feedbackWidget.addEventListener('focusin',()=>feedbackWidget.classList.add('is-hovered'));
feedbackToggle.addEventListener('click',()=>setFeedbackOpen(!feedbackWidget.classList.contains('is-form-open')));
document.addEventListener('pointerdown',event=>{
 if(event.target.closest('.fx-select-menu'))return;
 if(!feedbackWidget.contains(event.target))setFeedbackOpen(false);
});
feedbackWidget.addEventListener('keydown',event=>{
 if(event.key==='Escape'){
 setFeedbackOpen(false);
 feedbackToggle.focus();
 }
});
feedbackForm.addEventListener('submit',async event=>{
 event.preventDefault();
 const submit=$('feedbackSubmit');
 const status=$('feedbackStatus');
 submit.disabled=true;
 status.classList.remove('is-error');
 status.textContent='Enviando…';
 try{
 await api('/feedback','POST',{category:$('feedbackCategory').value,message:$('feedbackMessage').value});
 feedbackForm.reset();
 status.textContent='Gracias. Tu mensaje se envió al equipo.';
 }catch(error){status.classList.add('is-error');status.textContent=error.message;}
 finally{submit.disabled=false;}
});
$('refreshFeedback').onclick=()=>loadFeedback().catch(error=>message(error.message));
boot();


// FoxDrop profile4 frontend
let ownerFilterValue='all';
function initials(name){return String(name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();}
function avatarNode(person,cls='owner-avatar'){const wrap=document.createElement('span');wrap.className=cls;wrap.dataset.accent=person.accent||'orange';if(person.avatar){const img=document.createElement('img');img.src=person.avatar;img.alt='';img.addEventListener('error',()=>{wrap.textContent=initials(person.display_name||person.name);});wrap.append(img);}else wrap.textContent=initials(person.display_name||person.name);return wrap;}
function renderAccount(){const account=$('account');account.replaceChildren(avatarNode(me,'account-avatar'));const n=document.createElement('span');n.textContent=me.display_name||me.name;account.append(n);account.title='@'+me.name;}
async function loadProfile(){const p=await api('/profile');Object.assign(me,{display_name:p.display_name,avatar:p.avatar,accent:p.accent});renderAccount();$('profileUsername').value=p.name;$('displayName').value=p.display_name;setCustomColors(p);$('profileRole').textContent=p.admin?'Administrador':'Usuario';$('profileAvatar').replaceChildren(avatarNode(p,'large-avatar'));$('profileHandle').textContent='@'+p.name;$('removeAvatar').disabled=!p.avatar;paintProfile();}
function paintProfile(){$('profileTitle').textContent=$('displayName').value||me.name;paintCustomBanner();}
$('displayName').addEventListener('input',paintProfile);
$('profileForm').onsubmit=async e=>{e.preventDefault();try{await api('/profile','POST',{display_name:$('displayName').value,...profileColorValues()});await loadProfile();message('Perfil actualizado.');}catch(e){message(e.message);}};
$('avatarInput').onchange=async()=>{const f=$('avatarInput').files[0];if(!f)return;if(f.size>2000000){message('La imagen debe pesar como máximo 2 MB.');$('avatarInput').value='';return;}try{const form=new FormData();form.append('avatar',f);const r=await fetch('/api/profile/avatar',{method:'POST',headers:{'X-CSRF-Token':me.csrf,'X-WTF-CSRF-Token':csrfToken},body:form});const j=await r.json();if(!r.ok)throw Error(j.error||'No se pudo subir la foto.');await loadProfile();message('Foto de perfil actualizada.');}catch(e){message(e.message);}finally{$('avatarInput').value='';}};
$('removeAvatar').onclick=async()=>{try{await api('/profile/avatar','DELETE');await loadProfile();message('Foto eliminada.');}catch(e){message(e.message);}};
$('passwordForm').onsubmit=async e=>{e.preventDefault();if($('nextPassword').value!==$('repeatPassword').value){message('Las contraseñas nuevas no coinciden.');return;}try{await api('/profile/password','POST',{current:$('currentPassword').value,password:$('nextPassword').value});$('passwordForm').reset();message('Contraseña actualizada. Las otras sesiones se han cerrado.');}catch(e){message(e.message);}};
function ownerBadge(person){const row=document.createElement('div');row.className='owner-badge';row.append(avatarNode(person));const label=document.createElement('span');label.textContent=(person.display_name||person.name)+' · @'+person.name;row.append(label);return row;}
async function refreshFiles(){const j=await api('/files');$('storage').textContent='Capacidad reservada global: '+size(j.reserved)+' / '+size(j.quota);const filter=$('ownerFilter');$('ownerFilterBox').hidden=!me.admin;if(me.admin){const accounts=await api('/users');filter.replaceChildren();const all=document.createElement('option');all.value='all';all.textContent='Todos los usuarios';filter.append(all);for(const u of accounts.users){const opt=document.createElement('option');opt.value=String(u.id);opt.textContent=u.name+(u.active?'':' · Desactivado');filter.append(opt);}if(!Array.from(filter.options).some(x=>x.value===ownerFilterValue))ownerFilterValue='all';filter.value=ownerFilterValue;}
const rows=j.files.filter(f=>!me.admin||ownerFilterValue==='all'||String(f.uid)===ownerFilterValue);$('fileCount').textContent=rows.length===0?'Sin archivos':rows.length+' archivo'+(rows.length===1?'':'s');$('files').replaceChildren();if(!rows.length)line($('files'),'No hay archivos para mostrar.','empty-state');for(const f of rows){const k=kind(f.name),d=document.createElement('article');d.className='file-item';const head=document.createElement('div');head.className='file-heading';const icon=document.createElement('span');icon.className='file-icon';icon.append(formatIcon(f.name));const t=document.createElement('div'),n=document.createElement('strong');n.textContent=f.name;const titleRow=document.createElement("div");titleRow.className="file-title-row";titleRow.append(n,icon);t.append(titleRow);line(t,k.label+' · '+size(f.size),'file-meta');head.append(t);d.append(head);if(me.admin&&f.owner)d.append(ownerBadge(f.owner));line(d,(f.state==='ready'?'Disponible':'Subida pendiente · '+(f.offset/f.size*100).toFixed(1)+'%')+(f.protected?' · 🔒 Protegido':''),'file-meta');if(f.recorded_at){const stamp=line(head,'Registrado: '+new Date(f.recorded_at).toLocaleString("es-ES"),'file-meta');stamp.classList.add('file-recorded-at');}if(f.expires)line(d,'Expira: '+new Date(f.expires).toLocaleString("es-ES"),'file-meta');if(f.protected&&f.state==='ready')d.append(filePasswordBox(f));const actions=document.createElement('div');actions.className='file-actions';if(f.state==='ready'){d.append(linkCard(f.url));const a=document.createElement('a');a.href=f.url;a.innerHTML=UI_ICONS['DESCARGAR']+' Abrir enlace';a.className='button secondary';a.target='_blank';a.rel='noopener';actions.append(a);if(me.admin){const dl=document.createElement('a');dl.href='/api/admin/files/'+f.id+'/download';dl.className='button secondary';dl.innerHTML=UI_ICONS['DESCARGAR']+' Descarga admin';actions.append(dl);}}else{line(d,'Para reanudar selecciona el mismo archivo desde Subir.','muted fine');if(!me.admin||f.owner?.name===me.name)actions.append(button('Reanudar',async()=>{if(typeof window.foxResumePendingUpload!=='function'){message('No se pudo abrir la selección de archivos. Recarga la página e inténtalo de nuevo.');return;}await window.foxResumePendingUpload(f.id);},'secondary small'));}actions.append(button('Eliminar',async()=>{if(!await foxDeleteFile(f.name,()=>api('/files/'+f.id,'DELETE')))return;for(const q of queue){if(q.remote===f.id&&q.state==='done')removeVisual(q);}await refreshFiles();},'danger'));d.append(actions);$('files').append(d);}}
$('ownerFilter').onchange=()=>{ownerFilterValue=$('ownerFilter').value;refreshFiles().catch(e=>message(e.message));};
const usersBeforeProfile=users;
users=async function(){await usersBeforeProfile();if(!me?.admin)return;const j=await api('/users');const cards=Array.from($('users').children);j.users.forEach((u,i)=>{if(!cards[i])return;const b=button('Ver archivos',async()=>{ownerFilterValue=String(u.id);await showView('files',true);},'secondary small');let actions=cards[i].querySelector('.file-actions');if(!actions){actions=document.createElement('div');actions.className='file-actions';cards[i].append(actions);}actions.append(b);});};

// FoxDrop profile layout5


// FoxDrop security6 frontend
function validHex(s){return /^#[0-9a-fA-F]{6}$/.test(s);}
function profileColorValues(){const mode=$('profileMode').value,start=$('colorStartHex').value.trim();return{color_mode:mode,color_start:start,color_end:mode==='solid'?start:$('colorEndHex').value.trim()};}
function paintCustomBanner(){const values=profileColorValues();const gradient=values.color_mode==='gradient';$('colorEndLabel').hidden=!gradient;$('colorEndHex').required=gradient;$('colorEndHex').disabled=!gradient;$('colorEndPicker').disabled=!gradient;const cover=$('profileCard').querySelector('.profile-cover');if(!validHex(values.color_start)||!validHex(values.color_end))return;let img=cover.querySelector('img');if(!img){img=document.createElement('img');img.alt='';cover.replaceChildren(img);}const query=new URLSearchParams({start:values.color_start,end:gradient?values.color_end:values.color_start,mode:values.color_mode});const next='/api/profile/banner?'+query.toString();if(img.getAttribute('src')!==next)img.src=next;}
function setCustomColors(p){$('profileMode').value=p.color_mode||'gradient';$('colorStartHex').value=(p.color_start||'#ffad69').toUpperCase();$('colorStartPicker').value=$('colorStartHex').value.toLowerCase();$('colorEndHex').value=(p.color_end||'#b3699b').toUpperCase();$('colorEndPicker').value=$('colorEndHex').value.toLowerCase();}
for(const which of ['Start','End']){$('color'+which+'Picker').addEventListener('input',()=>{$('color'+which+'Hex').value=$('color'+which+'Picker').value.toUpperCase();paintCustomBanner();});$('color'+which+'Hex').addEventListener('input',()=>{const field=$('color'+which+'Hex');field.value=field.value.toUpperCase();if(validHex(field.value.trim()))$('color'+which+'Picker').value=field.value.trim().toLowerCase();paintCustomBanner();});}$('profileMode').addEventListener('change',paintCustomBanner);
function hideFilePassword(box){clearTimeout(box._hideTimer);box.querySelector('.secret-value').textContent='••••••••••';const b=box.querySelector('.secret-toggle');b.innerHTML=UI_ICONS['MOSTRAR CONTRASEÑA']+' Mostrar';b.dataset.shown='no';}
function hideAllFilePasswords(){document.querySelectorAll('.file-secret').forEach(hideFilePassword);}
function filePasswordBox(f){const box=document.createElement('div');box.className='file-secret';const row=document.createElement('div');row.className='secret-row';const title=document.createElement('span');title.className='secret-label';title.textContent='Contraseña';const value=document.createElement('code');value.className='secret-value';value.textContent='••••••••••';const toggle=button('Mostrar',async()=>{if(toggle.dataset.shown==='yes'){hideFilePassword(box);return;}toggle.disabled=true;try{const j=await api('/files/'+f.id+'/password/reveal','POST',{});value.textContent=j.password;toggle.innerHTML=UI_ICONS['OCULTAR CONTRASEÑA']+' Ocultar';toggle.dataset.shown='yes';box._hideTimer=setTimeout(()=>hideFilePassword(box),30000);}catch(e){note.textContent=e.message;if(e.status===409)details.open=true;}finally{toggle.disabled=false;}},'secondary small secret-toggle');toggle.innerHTML=UI_ICONS['MOSTRAR CONTRASEÑA']+' Mostrar';toggle.dataset.shown='no';row.append(title,value,toggle);box.append(row);const note=line(box,'Solo el propietario y el administrador pueden mostrarla. Se oculta a los 30 segundos.','secret-note');const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Establecer una nueva contraseña';details.append(summary);const form=document.createElement('form');const input=document.createElement('input');input.type='password';input.required=true;input.maxLength=256;input.autocomplete='new-password';input.placeholder='Nueva contraseña del enlace';const save=document.createElement('button');save.textContent='Guardar contraseña';save.className='secondary small';form.append(input,save);form.onsubmit=async e=>{e.preventDefault();const ok=await window.foxConfirm({eyebrow:'CONTRASEÑA DEL ENLACE',title:'¿Cambiar contraseña?',description:'Las autorizaciones anteriores de este enlace dejarán de ser válidas.',confirmText:'Cambiar contraseña',cancelText:'Cancelar',danger:false});if(!ok)return;save.disabled=true;try{await api('/files/'+f.id+'/password','POST',{password:input.value});input.value='';details.open=false;hideFilePassword(box);note.textContent='Contraseña actualizada. Ya puedes mostrarla.';}catch(e){note.textContent=e.message;}finally{save.disabled=false;}};details.append(form);box.append(details);return box;}

document.addEventListener('visibilitychange',()=>{if(document.hidden)hideAllFilePasswords();});

// FoxDrop layout7


// FoxDrop motion8 queue settings
let lastAcceptedQueueTTL=Number($('ttl').value);
function showQueueConfiguration(q){if(q.configEl)q.configEl.textContent='Expira '+(q.ttl<3600?q.ttl/60+' min':q.ttl/3600+' h')+' después de completar'+(q.password?' · Con contraseña':' · Sin contraseña');}
function syncQueueSettings(ask=true){const pending=queue.filter(q=>q.state==='waiting'&&!q.remote&&!localStorage.getItem(q.key));const password=$('filePassword').value;for(const q of pending){q.password=password;showQueueConfiguration(q);}const ttl=Number($('ttl').value);if(![600,1800,3600,10800,21600,43200,86400,259200].includes(ttl))return false;const needsApproval=pending.filter(q=>q.file.size>5*GB&&ttl===259200&&!q.longExpiryApproved);if(needsApproval.length){if(!ask)return false;window.foxConfirm({eyebrow:'EXPIRACIÓN DE ARCHIVOS',title:'Límite de tiempo',description:'Los archivos de más de 5 GB solo permiten hasta 24 horas. ¿Deseas aplicar 24 horas a esos archivos y mantener 72 horas en los pequeños?',confirmText:'Aplicar 24h',cancelText:'Cancelar',danger:false}).then(ok=>{if(!ok){$('ttl').value=String(lastAcceptedQueueTTL);if(typeof syncAnimatedSelects==='function')syncAnimatedSelects();}else{for(const q of needsApproval)q.longExpiryApproved=true;for(const q of pending){q.ttl=q.file.size>5*GB&&ttl===259200?86400:ttl;showQueueConfiguration(q);}lastAcceptedQueueTTL=ttl;}});return false;}for(const q of pending){q.ttl=q.file.size>5*GB&&ttl===259200?86400:ttl;showQueueConfiguration(q);}lastAcceptedQueueTTL=ttl;return true;}
$('filePassword').addEventListener('input',()=>syncQueueSettings(false));$('filePassword').addEventListener('change',()=>syncQueueSettings(false));$('ttl').addEventListener('change',()=>syncQueueSettings(true));

async function captureUploadConfiguration(q){const ttl=Number($('ttl').value);if(q.file.size>5*GB&&ttl===259200&&!q.longExpiryApproved){const ok=await window.foxConfirm({eyebrow:'EXPIRACIÓN DE ARCHIVO',title:'Límite de tiempo',description:`El archivo "${q.file.name}" supera 5 GB. En archivos de este tamaño el límite máximo es de 24 horas. ¿Usar 24 horas en lugar de 72 horas?`,confirmText:'Usar 24 horas',cancelText:'Cancelar',danger:false});if(!ok)return false;q.longExpiryApproved=true;}q.ttl=q.file.size>5*GB&&ttl===259200?86400:ttl;q.password=$('filePassword').value;showQueueConfiguration(q);return true;}


// FoxDrop delete modal v11
async function foxDeleteFile(name, remove) {
  if (document.querySelector('dialog.fox-delete-modal[open]')) return false;

  const previous=document.activeElement,d=document.createElement('dialog');
  d.className='fox-resume-modal fox-delete-modal';d.setAttribute('aria-labelledby','fd-title');d.setAttribute('aria-describedby','fd-description');
  d.innerHTML=`<button type="button" class="fr-close" aria-label="Cerrar">×</button><div class="fr-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14h12l1-14M10 10v6M14 10v6"/></svg></div><span class="fr-eyebrow">ELIMINAR ARCHIVO</span><h2 id="fd-title">¿Eliminar archivo?</h2><p class="fr-description" id="fd-description">Dejará de estar disponible y no se podrá recuperar.</p><div class="fr-file"><span class="fr-file-icon"></span><span class="fr-file-name"></span></div><p class="fr-error" role="alert" aria-live="assertive"></p><div class="fr-actions"><button type="button" class="fr-cancel secondary" autofocus>Cancelar</button><button type="button" class="fr-delete">Eliminar</button></div>`;
  d.querySelector('.fr-file-name').textContent=name;
  const cancel=d.querySelector('.fr-cancel'),accept=d.querySelector('.fr-delete'),error=d.querySelector('.fr-error');
  document.body.append(d);
  return new Promise(resolve=>{
    let busy=false,finished=false;
    const finish=value=>{if(finished)return;finished=true;window.foxCloseDialog(d).then(()=>{if(previous?.isConnected)previous.focus();resolve(value);});};
    cancel.onclick=()=>{if(!busy)finish(false);};
    d.querySelector('.fr-close').onclick=()=>{if(!busy)finish(false);};
    d.addEventListener('cancel',e=>{e.preventDefault();if(!busy)finish(false);});
    d.addEventListener('close',()=>{if(!finished){finished=true;d.remove();resolve(false);}});
    accept.onclick=async()=>{if(busy)return;busy=true;cancel.disabled=true;accept.disabled=true;accept.textContent='Eliminando…';error.textContent='';d.setAttribute('aria-busy','true');
      try{
        await remove();
        skipNextFilesRefresh=true;
        const card=previous?.closest?.('.file-item');
        if(card){
          card.classList.add('file-removing');
          const removeCard=()=>{
            card.remove();
            const remaining=$('files').querySelectorAll('.file-item').length;
            if($('fileCount'))$('fileCount').textContent=remaining===0?'Sin archivos':remaining+' archivo'+(remaining===1?'':'s');
            if(remaining===0)line($('files'),'No hay archivos para mostrar.','empty-state');
            api('/files').then(j=>{$('storage').textContent='Capacidad reservada global: '+size(j.reserved)+' / '+size(j.quota);}).catch(e=>message('Archivo eliminado, pero no se pudo actualizar la cuota: '+e.message));
          };
          if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)removeCard();
          else setTimeout(removeCard,380);
        }
        finish(true);
      }catch(e){error.textContent=e?.message||'No se pudo eliminar el archivo. Inténtalo de nuevo.';}
      finally{busy=false;cancel.disabled=false;accept.disabled=false;accept.textContent='Eliminar archivo';d.removeAttribute('aria-busy');}
    };
    d.showModal();cancel.focus();
  });
}

let skipNextFilesRefresh=false;
const refreshFilesWithRender=refreshFiles;
refreshFiles=async function(){
  if(skipNextFilesRefresh){skipNextFilesRefresh=false;return;}
  return refreshFilesWithRender();
};
