(()=>{
const formats={"pdf": "format-0.svg", "doc": "format-1.svg", "docx": "format-1.svg", "odt": "format-1.svg", "rtf": "format-1.svg", "ppt": "format-3.svg", "pptx": "format-3.svg", "odp": "format-3.svg", "jpg": "format-4.svg", "jpeg": "format-4.svg", "png": "format-4.svg", "gif": "format-4.svg", "webp": "format-4.svg", "avif": "format-4.svg", "svg": "format-4.svg", "bmp": "format-4.svg", "ico": "format-4.svg", "tif": "format-4.svg", "tiff": "format-4.svg", "heic": "format-4.svg", "mp4": "format-5.svg", "mkv": "format-5.svg", "mov": "format-5.svg", "avi": "format-5.svg", "webm": "format-5.svg", "m4v": "format-5.svg", "mpeg": "format-5.svg", "mpg": "format-5.svg", "mp3": "format-6.svg", "wav": "format-6.svg", "flac": "format-6.svg", "aac": "format-6.svg", "ogg": "format-6.svg", "m4a": "format-6.svg", "opus": "format-6.svg", "aiff": "format-6.svg", "rar": "format-7.svg", "zip": "format-8.svg", "txt": "format-9.svg", "md": "format-9.svg", "log": "format-9.svg", "html": "format-10.svg", "css": "format-10.svg", "js": "format-10.svg", "jsx": "format-10.svg", "ts": "format-10.svg", "tsx": "format-10.svg", "py": "format-10.svg", "json": "format-10.svg", "xml": "format-10.svg", "yml": "format-10.svg", "yaml": "format-10.svg", "sh": "format-10.svg", "sql": "format-10.svg", "exe": "format-11.svg", "mis": "format-11.svg", "apk": "format-11.svg", "dmg": "format-11.svg", "deb": "format-11.svg", "rpm": "format-11.svg", "appimage": "format-11.svg", "msi": "format-11.svg"};
const copySVG="<svg class=\"fox-copy-icon\" aria-hidden=\"true\" focusable=\"false\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path\n        d=\"M5 15C4.06812 15 3.60218 15 3.23463 14.8478C2.74458 14.6448 2.35523 14.2554 2.15224 13.7654C2 13.3978 2 12.9319 2 12V5.2C2 4.0799 2 3.51984 2.21799 3.09202C2.40973 2.71569 2.71569 2.40973 3.09202 2.21799C3.51984 2 4.0799 2 5.2 2H12C12.9319 2 13.3978 2 13.7654 2.15224C14.2554 2.35523 14.6448 2.74458 14.8478 3.23463C15 3.60218 15 4.06812 15 5M12.2 22H18.8C19.9201 22 20.4802 22 20.908 21.782C21.2843 21.5903 21.5903 21.2843 21.782 20.908C22 20.4802 22 19.9201 22 18.8V12.2C22 11.0799 22 10.5198 21.782 10.092C21.5903 9.71569 21.2843 9.40973 20.908 9.21799C20.4802 9 19.9201 9 18.8 9H12.2C11.0799 9 10.5198 9 10.092 9.21799C9.71569 9.40973 9.40973 9.71569 9.21799 10.092C9 10.5198 9 11.0799 9 12.2V18.8C9 19.9201 9 20.4802 9.21799 20.908C9.40973 21.2843 9.71569 21.5903 10.092 21.782C10.5198 22 11.0799 22 12.2 22Z\"\n        stroke=\"currentColor\"\n        stroke-width=\"2\"\n        stroke-linecap=\"round\"\n        stroke-linejoin=\"round\"\n    />\n</svg>";
function init(){
 const page=document.querySelector('.share-page');if(!page)return;
 const title=page.querySelector('h1');
 if(title&&!page.querySelector('.fox-share-title')){
   const ext=(title.textContent.split('.').pop()||'').toLowerCase().trim();
   const row=document.createElement('div');row.className='fox-share-title';
   const img=document.createElement('img');img.className='fox-format-icon';img.width=34;img.height=34;img.alt='';img.src='/static/icons/'+(formats[ext]||"format-12.svg");
   title.before(row);row.append(title,img);
 }
 const badge=page.querySelector('.type-badge');
 if(badge){badge.textContent=badge.textContent.replace(/^[^\p{L}\p{N}]+/u,'').trim();}
 const button=document.getElementById('shareCopy'),hint=button?.querySelector('small');
 if(button&&hint){
   const paint=(text)=>{hint.replaceChildren();const holder=document.createElement('span');holder.innerHTML=copySVG;hint.append(holder.firstElementChild,document.createTextNode(text));};
   paint('HAZ CLIC PARA COPIAR EL ENLACE');
   const observer=new MutationObserver(()=>{if(!hint.querySelector('.fox-copy-icon'))paint(hint.textContent.replace(/^[^\p{L}\p{N}]+/u,'').trim());});
   observer.observe(hint,{childList:true});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

;
(()=>{
function layout(){
 const page=document.querySelector('.share-page');
 if(!page||page.querySelector('.fox-share-header13'))return;
 const title=page.querySelector('.fox-share-title'),image=title?.querySelector('.fox-format-icon');
 const eyebrow=page.querySelector('.eyebrow'),badge=page.querySelector('.type-badge'),meta=page.querySelector('.share-meta');
 if(!title||!image||!eyebrow||!badge||!meta)return;
 const header=document.createElement('div');header.className='fox-share-header13';
 const text=document.createElement('div');text.className='fox-share-text13';
 eyebrow.before(header);header.append(text);
 text.append(eyebrow,title,badge,meta);header.append(image);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',layout,{once:true});else layout();
})();
