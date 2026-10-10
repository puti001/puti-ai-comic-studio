'use strict';
const $ = id => document.getElementById(id);
const canvas = $('comic'), ctx = canvas.getContext('2d');
const rect = (x,y,w,h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const rows = specs => {const out=[];let y=0;for(const [h,widths] of specs){let x=0;for(const w of widths){out.push(rect(x,y,w,h));x+=w;}y+=h;}return out;};
const grid = (c,r) => rows(Array.from({length:r},()=>[1/r,Array(c).fill(1/c)]));
const templates = [
 ['經典六格','classic',grid(2,3)],['經典四格','classic',grid(2,2)],['直式四格','classic',grid(1,4)],['橫式四格','classic',grid(4,1)],['經典九格','classic',grid(3,3)],['十二分格','classic',grid(3,4)],['雙格故事','classic',grid(1,2)],['左右雙格','classic',grid(2,1)],['三段故事','classic',grid(1,3)],['橫式三格','classic',grid(3,1)],
 ['開場大畫面','story',rows([[.5,[1]],[.25,[.5,.5]],[.25,[.5,.5]]])],['壓軸大畫面','story',rows([[.25,[.5,.5]],[.25,[.5,.5]],[.5,[1]]])],['上下呼應','story',rows([[.35,[1]],[.3,[.5,.5]],[.35,[1]]])],['三格節奏','story',rows([[.6,[1]],[.4,[.5,.5]]])],['六格變奏','story',rows([[.25,[.35,.65]],[.5,[.65,.35]],[.25,[.5,.5]]])],['寬幅故事','story',rows([[.3,[1]],[.4,[.5,.5]],[.3,[1]]])],['主角登場','story',[rect(0,0,.62,1),rect(.62,0,.38,1/3),rect(.62,1/3,.38,1/3),rect(.62,2/3,.38,1/3)]],['細節特寫','story',[rect(0,0,.38,.5),rect(0,.5,.38,.5),rect(.38,0,.62,1)]],['八格日記','story',grid(2,4)],['七格旅程','story',rows([[.34,[1]],[.33,[1/3,1/3,1/3]],[.33,[1/3,1/3,1/3]]])],
 ['斜切雙格','dynamic',[[[0,0],[1,0],[.32,1],[0,1]],[[1,0],[1,1],[.32,1]]]],['斜切三格','dynamic',[[[0,0],[1,0],[1,.36],[0,.56]],[[0,.56],[1,.36],[1,.7],[0,.9]],[[0,.9],[1,.7],[1,1],[0,1]]]],['動感四格','dynamic',[[[0,0],[.62,0],[.42,.5],[0,.5]],[[.62,0],[1,0],[1,.5],[.42,.5]],[[0,.5],[.42,.5],[.62,1],[0,1]],[[.42,.5],[1,.5],[1,1],[.62,1]]]],['交錯六格','dynamic',[[[0,0],[.58,0],[.43,.33],[0,.33]],[[.58,0],[1,0],[1,.33],[.43,.33]],[[0,.33],[.43,.33],[.6,.66],[0,.66]],[[.43,.33],[1,.33],[1,.66],[.6,.66]],[[0,.66],[.6,.66],[.4,1],[0,1]],[[.6,.66],[1,.66],[1,1],[.4,1]]]],['爆發瞬間','dynamic',[[[0,0],[1,0],[1,.35],[0,.6]],[[0,.6],[1,.35],[1,1],[.48,1]],[[0,.6],[.48,1],[0,1]]]],['鏡頭推進','dynamic',rows([[.25,[.7,.3]],[.3,[.4,.6]],[.45,[1]]])],['電影分鏡','dynamic',rows([[.2,[1]],[.4,[.35,.65]],[.4,[.65,.35]]])],['斜線主角','dynamic',[[[0,0],[.37,0],[.55,1],[0,1]],[[.37,0],[1,0],[1,.5],[.46,.5]],[[.46,.5],[1,.5],[1,1],[.55,1]]]],['節奏八格','dynamic',rows([[.22,[.4,.6]],[.28,[.65,.35]],[.28,[.35,.65]],[.22,[.6,.4]]])],['單格海報','classic',grid(1,1)]
].map(([name,cat,polys],id)=>({id,name,cat,polys}));
// Foreground frames come last: drawing, clicking and dropping share this order.
[
 ['主角破格', [...grid(2,2),[[.21,.19],[.78,.15],[.88,.82],[.13,.88]]]],
 ['橫跨特寫', [rect(0,0,.58,.5),rect(.58,0,.42,.5),rect(0,.5,1,.5),[[.02,.36],[.98,.28],[.96,.58],[.04,.68]]]],
 ['舞台中央', [rect(0,0,.4,.34),rect(.6,0,.4,.34),rect(0,.34,.4,.33),rect(.6,.34,.4,.33),rect(0,.67,1,.33),[[.32,.09],[.65,.04],[.76,.92],[.23,.94]]]],
 ['跳出故事', [rect(0,0,1,.32),rect(0,.32,.5,.68),rect(.5,.32,.5,.68),[[.51,.16],[.91,.19],[.98,.95],[.44,.9]]]]
].forEach(([name,polys])=>templates.push({id:templates.length,name,cat:'breakout',polys}));
const stickerPresets=[
 {text:'轟隆隆！',fill:'#ef7649',color:'#ffffff',rotate:-9},
 {text:'咚！',fill:'#202630',color:'#fff0b0',rotate:8},
 {text:'刷——',fill:'#aedce5',color:'#202630',rotate:-12},
 {text:'哇！',fill:'#ffe08a',color:'#c55139',rotate:7},
 {text:'砰！',fill:'#e65e73',color:'#ffffff',rotate:-8},
 {text:'哈哈哈',fill:'#d8e6c8',color:'#3f6753',rotate:5},
 {text:'BOOM!',fill:'#e76d43',color:'#ffffff',rotate:-10},
 {text:'WOW!',fill:'#ffe08a',color:'#202630',rotate:9},
 {text:'沙沙…',fill:'#e1def1',color:'#65598c',rotate:-6}
];
const effectDefaults={effect:'none',effectStrength:45,effectColor:'#202630',effectFocus:'center',effectAngle:-9,effectDensity:50,effectWidth:2,effectLength:70,effectSpace:24,effectX:50,effectY:50};
const effectPositions={center:[50,50],top:[50,25],bottom:[50,75],left:[25,50],right:[75,50]};
const effectTypes=['none','radial','motion','burst','spiral','rain','dots'];
const effectRanges={effectAngle:[-180,180,'°'],effectDensity:[5,100,'%'],effectWidth:[1,10,' px'],effectLength:[10,100,'%'],effectSpace:[5,65,'%'],effectX:[0,100,'%'],effectY:[0,100,'%']};
const newPanel=(photo=null)=>({photo,zoom:1,x:0,y:0,...effectDefaults});
const borderTypes=[['classic','經典墨線','solid'],['bold','粗黑漫畫','solid'],['double','雙線邊框','double'],['dash','虛線手帳','dashed'],['round','圓角分格','solid'],['rough','手繪筆觸','solid'],['color','彩色故事','solid'],['none','無框留白','none']];
// Keep original IDs so existing saved projects retain their page shape.
const pageRatios={
  square:{label:'1:1 正方形',width:900,height:900},
  landscape:{label:'4:3 橫式',width:900,height:675},
  portrait:{label:'3:4 直式',width:900,height:1200},
  widescreen:{label:'16:9 寬螢幕',width:960,height:540},
  vertical:{label:'9:16 手機直式',width:900,height:1600},
  a4:{label:'A4 直式',width:900,height:1273},
  a4landscape:{label:'A4 橫式',width:1273,height:900}
};
$('ratio').replaceChildren(...Object.entries(pageRatios).map(([id,preset])=>new Option(preset.label,id)));
function syncExportInfo(){
  const labels={1:'標準',2:'高解析',3:'超高解析'};
  for(const option of $('resolution').options){const scale=Number(option.value);option.textContent=`${labels[scale]} · ${canvas.width*scale} × ${canvas.height*scale} px`;}
  const scale=Number($('resolution').value);
  $('exportSummary').textContent=`整頁 ${pageRatios[state.ratio].label} · ${canvas.width*scale} × ${canvas.height*scale} px`;
}
const defaults=()=>({template:0,panels:Array.from({length:6},()=>newPanel()),photos:[],bubbles:[],border:'classic',borderWidth:5,gap:16,ink:'#202630',paper:'#ffffff',ratio:'portrait',title:'我的漫畫故事'});
let state=defaults(),selected=0,selectedBubble=null,photoCache=new Map(),history=[],historyIndex=-1,drag=null,toastTimer,effectPositioning=false;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const uid=()=>crypto.randomUUID?crypto.randomUUID():Math.random().toString(36).slice(2);
const cloneState=s=>({...s,photos:s.photos.map(p=>({...p})),panels:s.panels.map(p=>({...p})),bubbles:s.bubbles.map(b=>({...b}))});
const snapshot=()=>({state:cloneState(state),signature:JSON.stringify({...state,photos:state.photos.map(({id,name})=>({id,name}))})});
function commit(){const value=snapshot();if(history[historyIndex]?.signature===value.signature)return;history=history.slice(0,historyIndex+1);history.push(value);if(history.length>32)history.shift();historyIndex=history.length-1;syncHistory();}
function syncHistory(){$('undo').disabled=historyIndex<=0;$('redo').disabled=historyIndex>=history.length-1;}
function restoreHistory(delta){const i=historyIndex+delta;if(i<0||i>=history.length)return;historyIndex=i;effectPositioning=false;state=cloneState(history[i].state);selected=clamp(selected,0,state.panels.length-1);selectedBubble=null;syncAll();}
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3300);}
function polygonPath(c,points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function inset(points,d){const lines=points.map((p,i)=>{const q=points[(i+1)%points.length],dx=q[0]-p[0],dy=q[1]-p[1],len=Math.hypot(dx,dy);return {p:[p[0]-dy/len*d,p[1]+dx/len*d],v:[dx,dy]};});return lines.map((b,i)=>{const a=lines[(i+lines.length-1)%lines.length],den=a.v[0]*b.v[1]-a.v[1]*b.v[0];if(Math.abs(den)<1e-6)return b.p;const dx=b.p[0]-a.p[0],dy=b.p[1]-a.p[1],t=(dx*b.v[1]-dy*b.v[0])/den;return[a.p[0]+a.v[0]*t,a.p[1]+a.v[1]*t];});}
function geometry(){const margin=32,W=canvas.width,H=canvas.height;return templates[state.template].polys.map(p=>{const pts=inset(p.map(([x,y])=>[margin+x*(W-margin*2),margin+y*(H-margin*2)]),state.gap/2);const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const x=Math.min(...xs),y=Math.min(...ys);return{pts,x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};});}
function roundedPath(c,g){const p=g.pts,isRect=p.length===4&&Math.abs(p[0][1]-p[1][1])<.1&&Math.abs(p[1][0]-p[2][0])<.1&&Math.abs(p[2][1]-p[3][1])<.1&&Math.abs(p[3][0]-p[0][0])<.1;if(state.border==='round'&&isRect){c.beginPath();c.roundRect(g.x,g.y,g.w,g.h,18);}else polygonPath(c,g.pts);}
function inside(p,pts){let hit=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if(((a[1]>p.y)!==(b[1]>p.y))&&(p.x<(b[0]-a[0])*(p.y-a[1])/(b[1]-a[1])+a[0]))hit=!hit;}return hit;}
function imageMetrics(p,g){const img=photoCache.get(p.photo);if(!img)return null;const s=Math.max(g.w/img.width,g.h/img.height)*p.zoom,w=img.width*s,h=img.height*s;return{img,w,h,maxX:Math.max(0,(w-g.w)/2/g.w),maxY:Math.max(0,(h-g.h)/2/g.h)};}
function draw(c,editing=true){const W=canvas.width,H=canvas.height;c.save();c.fillStyle=state.paper;c.fillRect(0,0,W,H);const frames=geometry();frames.forEach((g,i)=>{const p=state.panels[i],m=imageMetrics(p,g);c.save();roundedPath(c,g);c.clip();if(m){const px=clamp(p.x,-m.maxX,m.maxX),py=clamp(p.y,-m.maxY,m.maxY);c.drawImage(m.img,g.x+g.w/2-m.w/2+px*g.w,g.y+g.h/2-m.h/2+py*g.h,m.w,m.h);}else{c.fillStyle='#f8f6f1';c.fillRect(g.x,g.y,g.w,g.h);c.strokeStyle='#ede8df';c.lineWidth=1;for(let y=g.y-100;y<g.y+g.h;y+=32){c.beginPath();c.moveTo(g.x,y);c.lineTo(g.x+g.w,y+g.w*.22);c.stroke();}if(editing){const x=g.x+g.w/2,y=g.y+g.h/2;c.fillStyle='#eee7dc';c.beginPath();c.roundRect(x-26,y-49,52,52,12);c.fill();c.strokeStyle='#b8a58e';c.lineWidth=2.5;c.beginPath();c.moveTo(x-11,y-23);c.lineTo(x+11,y-23);c.moveTo(x,y-34);c.lineTo(x,y-12);c.stroke();c.textAlign='center';c.fillStyle='#aa9b86';c.font='700 26px "Microsoft JhengHei","PingFang TC",sans-serif';c.fillText('拖入照片',x,y+28);c.fillStyle='#c3b8a6';c.font='18px sans-serif';c.fillText(String(i+1).padStart(2,'0'),x,y+54);}}drawSpeedLines(c,g,p);c.restore();
 const lw=state.borderWidth*(state.border==='bold'?2:1);if(state.border!=='none'){c.save();c.strokeStyle=state.border==='color'?['#e8875d','#67979b','#bf9c54','#88967b','#8a84ab'][i%5]:state.ink;c.lineWidth=lw;c.lineJoin='round';if(state.border==='dash')c.setLineDash([14,9]);roundedPath(c,g);c.stroke();if(state.border==='double'){c.lineWidth=Math.max(1,lw*.45);polygonPath(c,inset(g.pts,lw+4));c.stroke();}if(state.border==='rough'){c.lineWidth=Math.max(1,lw*.35);polygonPath(c,g.pts.map(([x,y],j)=>[x+(j%2?2:-2),y+(j%2?-3:3)]));c.stroke();}c.restore();}if(editing&&i===selected&&!selectedBubble){c.save();c.strokeStyle='#ef7649';c.lineWidth=3;c.setLineDash([10,7]);polygonPath(c,inset(g.pts,-7));c.stroke();c.restore();}});
 state.bubbles.forEach(b=>drawBubble(c,b,editing&&selectedBubble===b.id));c.restore();}
function wrapText(c,text,maxWidth){const result=[];for(const paragraph of text.split('\n')){let line='';for(const char of Array.from(paragraph)){if(c.measureText(line+char).width>maxWidth&&line){result.push(line);line=char;}else line+=char;}result.push(line);}return result;}
function bubbleGeometry(c,b){return buildBubbleGeometry(c,b);}
function drawBubble(c,b,active){return paintBubble(c,b,active);}
function render(){draw(ctx);}
function templateThumb(t){return `<svg viewBox="0 0 100 120" aria-hidden="true">${t.polys.map(p=>`<polygon points="${inset(p.map(([x,y])=>[5+x*90,5+y*110]),2).map(p=>p.join(',')).join(' ')}" fill="${t.id===state.template?'#fae2cf':'#f0eee8'}" stroke="${t.id===state.template?'#b98564':'#727b82'}" stroke-width="1.5" stroke-linejoin="round"/>`).join('')}</svg>`;}
function renderTemplates(cat=document.querySelector('#categories .active').dataset.cat){$('templates').innerHTML=templates.filter(t=>cat==='all'||t.cat===cat).map(t=>`<button class="template ${state.template===t.id?'active':''}" data-template="${t.id}" aria-label="${t.name}，${t.polys.length} 格" aria-pressed="${state.template===t.id}">${templateThumb(t)}<span>${t.name}</span></button>`).join('');}
function renderBorders(){$('borders').innerHTML=borderTypes.map(([id,name,border])=>`<button data-border="${id}" class="${state.border===id?'active':''}" aria-pressed="${state.border===id}"><span class="border-sample" style="border-style:${border};border-width:${id==='bold'?4:id==='double'?4:2}px;border-radius:${id==='round'?7:0}px;${id==='color'?'border-color:#ef7649;':''}${id==='rough'?'transform:rotate(-4deg);':''}"></span>${name}</button>`).join('');}
function renderShelf(){$('photoShelf').replaceChildren();state.photos.forEach(p=>{const button=document.createElement('button');button.className='photo-card';button.draggable=true;button.title='拖入分格，或點選放到目前分格';button.dataset.photo=p.id;const img=document.createElement('img');img.src=p.src;img.alt=p.name;img.draggable=false;const del=document.createElement('span');del.className='photo-delete';del.textContent='×';del.title='從照片庫移除';del.dataset.deletePhoto=p.id;button.append(img,del);$('photoShelf').append(button);});$('photoCount').textContent=`${state.photos.length} 張`;$('emptyPhotos').hidden=state.photos.length>0;}
function currentBubble(){return state.bubbles.find(b=>b.id===selectedBubble);}
function syncSelection(){
  const p=state.panels[selected];
  $('selectedLabel').textContent=`第 ${selected+1} 格`;
  $('zoom').value=Math.round(p.zoom*100);$('zoomValue').textContent=`${Math.round(p.zoom*100)}%`;
  $('zoom').disabled=!p.photo;$('resetCrop').disabled=!p.photo;$('removePhoto').disabled=!p.photo;
  $('selectionHint').textContent=p.photo?'拖曳畫布照片，調整取景位置。':'選取分格後，點選照片即可放入。';
  $('effectPanelLabel').textContent=`第 ${selected+1} 格`;
  const effect=p.effect || 'none';
  document.querySelectorAll('[data-effect]').forEach(button=>{
    button.classList.toggle('active',button.dataset.effect===effect);
    button.setAttribute('aria-pressed',button.dataset.effect===effect);
  });
  $('effectStrength').value=p.effectStrength ?? 45;
  $('effectStrengthValue').textContent=(p.effectStrength ?? 45)+'%';
  $('effectColor').value=p.effectColor || '#202630';
  $('effectFocus').value=p.effectFocus || 'center';
  const radial=['radial','burst','spiral'].includes(effect);
  $('focusLabel').hidden=!radial;$('effectSpaceControl').hidden=!radial;
  $('effectLengthControl').hidden=!['motion','rain'].includes(effect);
  for(const [id,[min,max,suffix]] of Object.entries(effectRanges)){$(id).value=p[id] ?? effectDefaults[id];$(id+'Value').textContent=(p[id] ?? effectDefaults[id])+suffix;}
  ['effectStrength','effectColor','effectFocus','copyEffect','resetEffect','placeEffect',...Object.keys(effectRanges)].forEach(id=>$(id).disabled=effect==='none');
  if(effect==='none')effectPositioning=false;
  $('placeEffect').classList.toggle('active',effectPositioning);$('placeEffect').setAttribute('aria-pressed',String(effectPositioning));$('placeEffect').textContent=effectPositioning?'請點選目前分格 · 再按可取消':'⌖ 點畫布設定位置';
  canvas.classList.toggle('effect-positioning',effectPositioning);
  const b=currentBubble();
  for(const id of ['bubbleText','fontSize','bubbleWidth','bubbleRotation','textColor','bubbleColor','deleteBubble'])$(id).disabled=!b;
  if(b){
    $('bubbleText').value=b.text;$('fontSize').value=b.font;$('fontValue').value=b.font+' px';
    $('bubbleWidth').value=b.width;$('bubbleWidthValue').value=b.width+' px';
    $('bubbleRotation').value=b.rotate || 0;$('rotationValue').value=(b.rotate || 0)+'°';
    $('textColor').value=b.color;$('bubbleColor').value=b.fill;
  }else $('bubbleText').value='';
  renderBubbleList();
}
function renderBubbleList(){$('bubbleList').replaceChildren();state.bubbles.forEach(b=>{const button=document.createElement('button');button.textContent=b.text.replaceAll('\n',' ')||'空白文字框';button.dataset.bubble=b.id;button.classList.toggle('active',b.id===selectedBubble);$('bubbleList').append(button);});}
function setPane(pane){if(pane!=='effects'&&effectPositioning){effectPositioning=false;syncSelection();}document.querySelectorAll('#inspectorTabs button').forEach(b=>b.classList.toggle('active',b.dataset.pane===pane));['photos','style','text','effects'].forEach(p=>$(p+'Pane').hidden=p!==pane);}
function syncAll(){const size=pageRatios[state.ratio];canvas.width=size.width;canvas.height=size.height;syncExportInfo();$('templateCount').textContent=templates.length+' 款';$('layoutName').textContent=templates[state.template].name;$('panelCount').textContent=state.panels.length+' 格';$('borderWidth').value=state.borderWidth;$('borderValue').textContent=state.borderWidth+' px';$('gap').value=state.gap;$('gapValue').textContent=state.gap+' px';$('ink').value=state.ink;$('paper').value=state.paper;$('ratio').value=state.ratio;$('workTitle').value=state.title;renderTemplates();renderBorders();renderShelf();syncSelection();syncHistory();render();}
function setTemplate(id){if(id===state.template)return;const n=templates[id].polys.length;const lost=state.panels.slice(n).filter(p=>p.photo).length;state.template=id;state.panels=Array.from({length:n},(_,i)=>state.panels[i]||newPanel());selected=clamp(selected,0,n-1);selectedBubble=null;commit();syncAll();toast(lost?'已切換版型，多出的照片仍保留在照片庫。':`已換成「${templates[id].name}」`);}
function placePhoto(id,index=selected){if(!state.photos.some(p=>p.id===id))return;selected=index;selectedBubble=null;state.panels[index]={...newPanel(),...state.panels[index],photo:id,zoom:1,x:0,y:0};commit();syncSelection();render();toast(`照片已放入第 ${index+1} 格`);}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('無法讀取圖片'));img.src=src;});}
async function addFiles(files,target=null){const list=Array.from(files).filter(f=>f.type.startsWith('image/'));if(!list.length){toast('請選擇圖片檔案。');return;}const capacity=60-state.photos.length;if(capacity<=0){toast('照片庫已達 60 張，請先移除一些照片。');return;}let added=0,failed=0;for(const file of list.slice(0,capacity)){try{if(file.size>25*1024*1024)throw new Error('too large');const url=URL.createObjectURL(file);let img;try{img=await loadImage(url);}finally{URL.revokeObjectURL(url);}const resize=document.createElement('canvas'),scale=Math.min(1,3000/Math.max(img.width,img.height));resize.width=Math.max(1,Math.round(img.width*scale));resize.height=Math.max(1,Math.round(img.height*scale));resize.getContext('2d').drawImage(img,0,0,resize.width,resize.height);const src=resize.toDataURL('image/png'),id=uid(),decoded=await loadImage(src);photoCache.set(id,decoded);state.photos.push({id,name:file.name,src});if(target!==null&&target+added<state.panels.length){state.panels[target+added]={...newPanel(),...state.panels[target+added],photo:id,zoom:1,x:0,y:0};}added++;}catch{failed++;}}commit();renderShelf();syncSelection();render();toast(`${added} 張照片已加入${failed?'；部分圖片讀取失敗或超過 25 MB':''}${list.length>capacity?'；照片庫最多 60 張':''}`);}
function eventPoint(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*canvas.width,y:(e.clientY-r.top)/r.height*canvas.height};}
function frameAt(pt){const frames=geometry();for(let i=frames.length-1;i>=0;i--)if(inside(pt,frames[i].pts))return i;return -1;}
canvas.addEventListener('pointerdown',e=>{const pt=eventPoint(e);if(effectPositioning){const g=geometry()[selected];if(!inside(pt,g.pts)){toast('請點選目前選取的分格。');return;}const p=state.panels[selected];p.effectX=Math.round(clamp((pt.x-g.x)/g.w*100,0,100));p.effectY=Math.round(clamp((pt.y-g.y)/g.h*100,0,100));p.effectFocus='custom';effectPositioning=false;commit();syncSelection();render();toast('特效位置已更新。');return;}for(const b of [...state.bubbles].reverse()){const g=bubbleGeometry(ctx,b);if(bubbleHit(pt,b)){selectedBubble=b.id;drag={kind:'bubble',id:b.id,start:pt,x:g.x/canvas.width,y:g.y/canvas.height};canvas.setPointerCapture(e.pointerId);setPane('text');syncSelection();render();return;}}const i=frameAt(pt);if(i<0)return;selected=i;selectedBubble=null;const p=state.panels[i];if(p.photo){drag={kind:'photo',index:i,start:pt,x:p.x,y:p.y};canvas.setPointerCapture(e.pointerId);}syncSelection();render();});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const pt=eventPoint(e),dx=pt.x-drag.start.x,dy=pt.y-drag.start.y;if(drag.kind==='photo'){const p=state.panels[drag.index],g=geometry()[drag.index],m=imageMetrics(p,g);if(m){p.x=clamp(drag.x+dx/g.w,-m.maxX,m.maxX);p.y=clamp(drag.y+dy/g.h,-m.maxY,m.maxY);}}else{const b=state.bubbles.find(b=>b.id===drag.id),g=bubbleGeometry(ctx,b);b.x=clamp(drag.x+dx/canvas.width,4/canvas.width,(canvas.width-g.w-4)/canvas.width);b.y=clamp(drag.y+dy/canvas.height,4/canvas.height,Math.max(4,canvas.height-g.h-28)/canvas.height);}render();});
function finishDrag(){if(drag){drag=null;commit();}}canvas.addEventListener('pointerup',finishDrag);canvas.addEventListener('pointercancel',finishDrag);
canvas.addEventListener('wheel',e=>{if(selectedBubble||!state.panels[selected].photo)return;e.preventDefault();const p=state.panels[selected];p.zoom=clamp(p.zoom+(e.deltaY<0?.08:-.08),1,3);syncSelection();render();clearTimeout(canvas.wheelTimer);canvas.wheelTimer=setTimeout(commit,250);},{passive:false});
canvas.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy';});canvas.addEventListener('drop',async e=>{e.preventDefault();const i=frameAt(eventPoint(e));if(i<0){toast('請把照片拖入分格中。');return;}const id=e.dataTransfer.getData('application/x-puti-photo');if(id)placePhoto(id,i);else{selected=i;selectedBubble=null;await addFiles(e.dataTransfer.files,i);}});
$('photoShelf').addEventListener('dragstart',e=>{const card=e.target.closest('[data-photo]');if(card)e.dataTransfer.setData('application/x-puti-photo',card.dataset.photo);});
$('photoShelf').addEventListener('click',e=>{const del=e.target.closest('[data-delete-photo]');if(del){const id=del.dataset.deletePhoto;state.photos=state.photos.filter(p=>p.id!==id);state.panels.forEach(p=>{if(p.photo===id)Object.assign(p,{photo:null,zoom:1,x:0,y:0});});commit();syncAll();return;}const card=e.target.closest('[data-photo]');if(card)placePhoto(card.dataset.photo);});
$('upload').onclick=()=>$('files').click();$('files').onchange=async e=>{await addFiles(e.target.files);e.target.value='';};['dragenter','dragover'].forEach(name=>$('upload').addEventListener(name,e=>{e.preventDefault();$('upload').classList.add('over');}));$('upload').addEventListener('dragleave',()=>$('upload').classList.remove('over'));$('upload').addEventListener('drop',e=>{e.preventDefault();$('upload').classList.remove('over');addFiles(e.dataTransfer.files);});
document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('drop',e=>e.preventDefault());
$('templates').onclick=e=>{const t=e.target.closest('[data-template]');if(t)setTemplate(Number(t.dataset.template));};$('categories').onclick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;document.querySelectorAll('#categories button').forEach(x=>x.classList.toggle('active',x===b));renderTemplates(b.dataset.cat);};$('inspectorTabs').onclick=e=>{const b=e.target.closest('[data-pane]');if(b)setPane(b.dataset.pane);};
$('borders').onclick=e=>{const b=e.target.closest('[data-border]');if(b){state.border=b.dataset.border;commit();renderBorders();render();}};
function rangeBind(id,update){$(id).addEventListener('input',()=>{update(Number($(id).value));render();});$(id).addEventListener('change',commit);}
rangeBind('zoom',n=>{state.panels[selected].zoom=n/100;$('zoomValue').textContent=n+'%';});rangeBind('borderWidth',n=>{state.borderWidth=n;$('borderValue').textContent=n+' px';});rangeBind('gap',n=>{state.gap=n;$('gapValue').textContent=n+' px';});
['ink','paper'].forEach(id=>{$(id).oninput=()=>{state[id]=$(id).value;render();};$(id).onchange=commit;});$('ratio').onchange=()=>{state.ratio=$('ratio').value;commit();syncAll();toast(`整頁已改為 ${pageRatios[state.ratio].label}，照片可拖曳調整取景。`);};$('workTitle').onchange=()=>{state.title=$('workTitle').value.trim()||'我的漫畫故事';commit();};
$('resetCrop').onclick=()=>{Object.assign(state.panels[selected],{zoom:1,x:0,y:0});commit();syncSelection();render();};$('removePhoto').onclick=()=>{state.panels[selected]={...newPanel(),...state.panels[selected],photo:null,zoom:1,x:0,y:0};commit();syncSelection();render();};$('undo').onclick=()=>restoreHistory(-1);$('redo').onclick=()=>restoreHistory(1);
function addOverlay(kind,preset=null){
  if(state.bubbles.length>=24){toast('最多可加入 24 個文字框與貼紙。');return;}
  const g=geometry()[selected];
  const texts={caption:'故事就從這一天開始…',thought:'好像想到了什麼…',burst:'哇！太精彩了！',speech:'今天真是太棒了！'};
  const b={id:uid(),kind,text:preset?.text || texts[kind],
    x:(g.x+18)/canvas.width,y:(g.y+18)/canvas.height,
    width:kind==='sticker'?clamp(preset.text.length*40+40,220,420):kind==='burst'?340:280,
    font:kind==='sticker'?44:kind==='burst'?32:30,rotate:preset?.rotate || 0,
    color:preset?.color || (kind==='burst'?'#be5238':state.ink),
    fill:preset?.fill || (kind==='caption'?'#fff4d1':kind==='burst'?'#ffe08a':'#ffffff')};
  const placed=bubbleGeometry(ctx,b);b.x=placed.x/canvas.width;b.y=placed.y/canvas.height;
  state.bubbles.push(b);selectedBubble=b.id;commit();setPane('text');syncSelection();render();
}
document.querySelectorAll('[data-add]').forEach(button=>button.onclick=()=>addOverlay(button.dataset.add));
stickerPresets.forEach((preset,i)=>{
  const button=document.createElement('button');button.dataset.sticker=i;button.textContent=preset.text;
  button.style.background=preset.fill;button.style.color=preset.color;
  button.title='加入貼紙，文字、大小、顏色與角度都能修改';button.onclick=()=>addOverlay('sticker',preset);
  $('stickers').append(button);
});
rangeBind('bubbleRotation',n=>{const b=currentBubble();if(b){b.rotate=n;$('rotationValue').textContent=n+'°';}});
document.querySelectorAll('[data-effect]').forEach(button=>button.onclick=()=>{
  state.panels[selected].effect=button.dataset.effect;commit();syncSelection();render();
});
rangeBind('effectStrength',n=>{state.panels[selected].effectStrength=n;$('effectStrengthValue').textContent=n+'%';});
$('effectColor').oninput=()=>{state.panels[selected].effectColor=$('effectColor').value;render();};
$('effectColor').onchange=commit;
for(const [id,[min,max,suffix]] of Object.entries(effectRanges))rangeBind(id,n=>{const p=state.panels[selected];p[id]=n;$(id+'Value').textContent=n+suffix;if(id==='effectX'||id==='effectY'){p.effectFocus='custom';$('effectFocus').value='custom';}});
$('effectFocus').onchange=()=>{const p=state.panels[selected],focus=$('effectFocus').value;p.effectFocus=focus;if(effectPositions[focus])[p.effectX,p.effectY]=effectPositions[focus];commit();syncSelection();render();};
$('placeEffect').onclick=()=>{effectPositioning=!effectPositioning;syncSelection();if(effectPositioning)toast('點選目前分格中的位置，設定特效中心。');};
$('resetEffect').onclick=()=>{const p=state.panels[selected],kind=p.effect;Object.assign(p,effectDefaults,{effect:kind});effectPositioning=false;commit();syncSelection();render();};
$('copyEffect').onclick=()=>{
  const p=state.panels[selected];
  state.panels.forEach(frame=>{for(const key of Object.keys(effectDefaults))frame[key]=p[key] ?? effectDefaults[key];});
  commit();render();toast('特效與所有設定已套用到全部分格。');
};
$('bubbleText').oninput=()=>{const b=currentBubble();if(b){b.text=$('bubbleText').value;render();renderBubbleList();}};$('bubbleText').onchange=commit;rangeBind('fontSize',n=>{const b=currentBubble();if(b){b.font=n;$('fontValue').textContent=n+' px';}});rangeBind('bubbleWidth',n=>{const b=currentBubble();if(b){b.width=n;$('bubbleWidthValue').textContent=n+' px';}});[['textColor','color'],['bubbleColor','fill']].forEach(([id,key])=>{$(id).oninput=()=>{const b=currentBubble();if(b){b[key]=$(id).value;render();}};$(id).onchange=commit;});
function deleteBubble(){state.bubbles=state.bubbles.filter(b=>b.id!==selectedBubble);selectedBubble=null;commit();syncSelection();render();}$('deleteBubble').onclick=deleteBubble;$('bubbleList').onclick=e=>{const b=e.target.closest('[data-bubble]');if(b){selectedBubble=b.dataset.bubble;syncSelection();render();}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&effectPositioning){effectPositioning=false;syncSelection();return;}if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();restoreHistory(e.shiftKey?1:-1);}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();restoreHistory(1);}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();if(selectedBubble)deleteBubble();else $('removePhoto').click();}});
function outputCanvas(scale=1){const out=document.createElement('canvas');out.width=canvas.width*scale;out.height=canvas.height*scale;const c=out.getContext('2d');c.scale(scale,scale);draw(c,false);return out;}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
function safeName(){return (state.title||'我的漫畫故事').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').slice(0,60);}
$('export').onclick=()=>{syncExportInfo();$('exportDialog').showModal();};$('resolution').onchange=syncExportInfo;$('download').onclick=()=>{const button=$('download');button.disabled=true;const format=$('format').value;try{outputCanvas(Number($('resolution').value)).toBlob(blob=>{button.disabled=false;if(!blob){toast('圖片匯出失敗，請降低解析度後再試。');return;}downloadBlob(blob,safeName()+'.'+(format==='jpeg'?'jpg':'png'));$('exportDialog').close();toast('漫畫圖片已下載！');},'image/'+format,.94);}catch{button.disabled=false;toast('圖片匯出失敗，請降低解析度後再試。');}};
$('preview').onclick=()=>{$('previewImage').src=outputCanvas(1).toDataURL('image/png');$('previewDialog').showModal();};
$('print').onclick=()=>{const iframe=document.createElement('iframe');iframe.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;';document.body.append(iframe);const doc=iframe.contentDocument;doc.open();doc.write('<!doctype html><html><head><title>Puti-AI 漫畫列印</title><style>@page{margin:8mm;size:'+ (canvas.width>canvas.height?'landscape':'portrait')+'}html,body{margin:0;height:100%}body{display:flex;justify-content:center;align-items:center}img{max-width:100%;max-height:95vh;object-fit:contain}</style></head><body></body></html>');doc.close();const img=doc.createElement('img');img.onload=()=>{iframe.contentWindow.focus();iframe.contentWindow.print();setTimeout(()=>iframe.remove(),60000);};img.src=outputCanvas(2).toDataURL('image/png');doc.body.append(img);};
$('saveProject').onclick=()=>{commit();downloadBlob(new Blob([JSON.stringify({app:'puti-comic-studio',version:2,state})],{type:'application/json'}),safeName()+'.puti.json');toast('作品已儲存，之後可用「開啟作品」繼續編輯。');};$('openProject').onclick=()=>$('projectFile').click();
function validateProject(raw){
  if(raw?.app!=='puti-comic-studio'||![1,2].includes(raw.version))throw new Error('格式不符');
  const s=raw.state,finite=(n,a,b)=>typeof n==='number'&&Number.isFinite(n)&&n>=a&&n<=b;
  const color=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
  if(!s||!Number.isInteger(s.template)||!templates[s.template]||!Array.isArray(s.photos)||s.photos.length>60||!Array.isArray(s.panels)||s.panels.length!==templates[s.template].polys.length||!Array.isArray(s.bubbles)||s.bubbles.length>24)throw new Error('無效作品');
  const ids=new Set();
  for(const p of s.photos){
    if(!p||typeof p.id!=='string'||ids.has(p.id)||typeof p.name!=='string'||typeof p.src!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(p.src))throw new Error('無效照片');
    ids.add(p.id);
  }
  const panels=s.panels.map(p=>{const frame={...newPanel(),...p};if(p.effectX===undefined&&p.effectY===undefined)[frame.effectX,frame.effectY]=effectPositions[p.effectFocus] || [50,50];return frame;});
  for(const p of panels){
    if(p.photo!==null&&!ids.has(p.photo)||!finite(p.zoom,1,3)||!finite(p.x,-10000,10000)||!finite(p.y,-10000,10000))throw new Error('無效分格');
    if(!effectTypes.includes(p.effect)||!finite(p.effectStrength,5,100)||!color(p.effectColor)||!['center','top','bottom','left','right','custom'].includes(p.effectFocus)||!Object.entries(effectRanges).every(([id,[min,max]])=>finite(p[id],min,max)))throw new Error('無效特效');
  }
  const bubbles=s.bubbles.map(b=>({rotate:0,...b})),bids=new Set();
  for(const b of bubbles){
    if(typeof b.id!=='string'||bids.has(b.id)||!['speech','thought','caption','burst','sticker'].includes(b.kind)||typeof b.text!=='string'||b.text.length>180||!finite(b.x,0,1)||!finite(b.y,0,1)||!finite(b.width,160,650)||!finite(b.font,18,64)||!finite(b.rotate,-35,35)||!color(b.color)||!color(b.fill))throw new Error('無效文字');
    bids.add(b.id);
  }
  if(!borderTypes.some(b=>b[0]===s.border)||!finite(s.borderWidth,1,14)||!finite(s.gap,6,40)||!color(s.ink)||!color(s.paper)||!Object.hasOwn(pageRatios,s.ratio)||typeof s.title!=='string'||s.title.length>60)throw new Error('無效設定');
  return{...s,panels,bubbles};
}
$('projectFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>120*1024*1024)throw new Error('過大');const next=validateProject(JSON.parse(await file.text())),loaded=await Promise.all(next.photos.map(async p=>[p.id,await loadImage(p.src)]));if(!confirm('開啟作品會取代目前畫布。尚未儲存的內容可先按「取消」並儲存作品。要繼續嗎？'))return;loaded.forEach(([id,img])=>photoCache.set(id,img));state=next;selected=0;selectedBubble=null;commit();syncAll();toast('作品已開啟，可以接著創作了！');}catch{toast('無法開啟作品。請使用本工具儲存的 .puti.json 檔案。');}finally{e.target.value='';}};
function demoPhoto(i){const c=document.createElement('canvas');c.width=1000;c.height=750;const g=c.getContext('2d'),palettes=[['#bfdce3','#5b8f84','#e9d6a8'],['#ecd4be','#bf8663','#f8e9c3'],['#c9cedf','#666b92','#ebc6b0']],[sky,hill,sand]=palettes[i%3];g.fillStyle=sky;g.fillRect(0,0,1000,750);g.fillStyle='#fff8df';g.beginPath();g.arc(760,150,75,0,Math.PI*2);g.fill();g.fillStyle=hill;g.beginPath();g.moveTo(0,480);g.lineTo(200,200+i*30);g.lineTo(480,460);g.lineTo(670,270);g.lineTo(1000,540);g.lineTo(1000,750);g.lineTo(0,750);g.fill();g.fillStyle=sand;g.beginPath();g.moveTo(0,600);g.bezierCurveTo(300,470,550,750,1000,560);g.lineTo(1000,750);g.lineTo(0,750);g.fill();g.strokeStyle='#ffffff60';g.lineWidth=5;for(let j=0;j<5;j++){g.beginPath();g.moveTo(100+j*150,650+j*7);g.lineTo(170+j*150,650+j*7);g.stroke();}g.fillStyle='#ffffffb0';g.font='500 30px sans-serif';g.fillText(['A LITTLE ADVENTURE','A WARM AFTERNOON','THE JOURNEY CONTINUES'][i%3],45,700);return c.toDataURL('image/png');}
$('demo').onclick=async()=>{const demoIds=[];for(let i=0;i<3;i++){let p=state.photos.find(p=>p.name==='示範插畫 '+(i+1));if(!p){if(state.photos.length>=60)break;p={id:uid(),name:'示範插畫 '+(i+1),src:demoPhoto(i)};state.photos.push(p);photoCache.set(p.id,await loadImage(p.src));}demoIds.push(p.id);}if(!demoIds.length){toast('照片庫已達上限。');return;}let n=0;state.panels.forEach((p,i)=>{if(!p.photo){state.panels[i]={...newPanel(),...p,photo:demoIds[i%demoIds.length],zoom:1,x:0,y:0};n++;}});commit();syncAll();toast(n?'示範插畫已加入，試試拖動、縮放與加對白！':'示範插畫已加入照片庫，可拖入任一分格。');};
document.fonts.ready.then(render);commit();syncAll();
