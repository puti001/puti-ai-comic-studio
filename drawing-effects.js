'use strict';

// Geometry stays in page coordinates, so previews and exports draw the same pattern.
function drawSpeedLines(c,g,p){
  if(!p.effect || p.effect==='none')return;
  const density=(p.effectDensity ?? 50)/100,angle=(p.effectAngle ?? -9)*Math.PI/180;
  const x=g.x+g.w*(p.effectX ?? 50)/100,y=g.y+g.h*(p.effectY ?? 50)/100;
  const radius=Math.hypot(g.w,g.h),width=p.effectWidth ?? 2;
  const noise=i=>(Math.sin(i*12.9898+78.233)*43758.5453)%1;
  c.save();c.globalAlpha=(p.effectStrength ?? 45)/100*.72;
  c.fillStyle=c.strokeStyle=p.effectColor || '#202630';c.lineCap='round';
  c.translate(x,y);c.rotate(angle);
  if(p.effect==='radial'||p.effect==='burst'){
    const count=Math.round(16+density*164),inner=(p.effectSpace ?? 24)/100*Math.min(g.w,g.h);
    for(let i=0;i<count;i++){
      const theta=i*Math.PI*2/count+.01*noise(i);
      const spread=width/radius*(p.effect==='burst'?1.8:.7)*(1+(i%4)*.3);
      const from=inner*(p.effect==='burst'?(i%2?.6:1.35):(.85+.3*Math.abs(noise(i))));
      c.beginPath();c.moveTo(Math.cos(theta)*from,Math.sin(theta)*from);
      c.lineTo(Math.cos(theta-spread)*radius,Math.sin(theta-spread)*radius);
      c.lineTo(Math.cos(theta+spread)*radius,Math.sin(theta+spread)*radius);c.closePath();c.fill();
    }
  }else if(p.effect==='motion'||p.effect==='rain'){
    const count=Math.round(10+density*110),length=radius*(p.effectLength ?? 70)/100;
    for(let i=0;i<count;i++){
      const yy=-radius+i*radius*2/count;
      const start=-length*.7+noise(i)*radius*.32;
      c.lineWidth=width*(.45+(i%5)*.22);c.beginPath();
      if(p.effect==='rain'){
        c.setLineDash([length*(.05+(i%4)*.018),length*.13]);c.lineDashOffset=noise(i)*length;
        c.moveTo(-radius,yy);c.lineTo(radius,yy);
      }else{c.moveTo(start,yy);c.lineTo(start+length*(.65+(i%4)*.12),yy);}
      c.stroke();
    }
  }else if(p.effect==='spiral'){
    const count=Math.round(4+density*32),inner=(p.effectSpace ?? 24)/100*Math.min(g.w,g.h);
    for(let i=0;i<count;i++){
      c.lineWidth=width*(.6+(i%3)*.3);c.beginPath();
      for(let j=0;j<=64;j++){const t=j/64,r=inner+(radius-inner)*t,theta=i*Math.PI*2/count+t*2.4;const xx=Math.cos(theta)*r,yy=Math.sin(theta)*r;if(j)c.lineTo(xx,yy);else c.moveTo(xx,yy);}
      c.stroke();
    }
  }else if(p.effect==='dots'){
    const spacing=radius/(7+density*30),dot=width*.9+spacing*.055;
    for(let row=-40;row<=40;row++)for(let col=-40;col<=40;col++){
      const xx=col*spacing+(row%2)*spacing/2,yy=row*spacing*.866;
      if(Math.abs(xx)>radius||Math.abs(yy)>radius)continue;
      c.beginPath();c.arc(xx,yy,dot,0,Math.PI*2);c.fill();
    }
  }
  c.restore();
}

function buildBubbleGeometry(c,b){
  let font=b.font;
  const padding=b.kind==='burst'?b.width*.2:20;
  const verticalPad=b.kind==='burst'?54:32;
  let lines,h;
  do{
    c.font=`${b.kind==='sticker'?'italic 900':'700'} ${font}px "Microsoft JhengHei","PingFang TC",sans-serif`;
    lines=wrapText(c,b.text,b.width-padding*2);
    h=Math.max(font*1.5+verticalPad,lines.length*font*1.4+verticalPad);
    if(h<=canvas.height-70 || font<=14) break;
    font--;
  }while(true);
  const angle=(b.rotate || 0)*Math.PI/180;
  const extra=b.kind==='speech'||b.kind==='thought'?32:0;
  const extentW=Math.abs(b.width*Math.cos(angle))+Math.abs((h+extra)*Math.sin(angle));
  const extentH=Math.abs(b.width*Math.sin(angle))+Math.abs((h+extra)*Math.cos(angle));
  const cx=clamp(b.x*canvas.width+b.width/2,extentW/2+8,canvas.width-extentW/2-8);
  const cy=clamp(b.y*canvas.height+h/2,extentH/2+8,canvas.height-extentH/2-8);
  return{x:cx-b.width/2,y:cy-h/2,cx,cy,w:b.width,h,lines,font,verticalPad,angle};
}

function bubbleHit(pt,b){
  const g=bubbleGeometry(ctx,b),dx=pt.x-g.cx,dy=pt.y-g.cy;
  const x=dx*Math.cos(g.angle)+dy*Math.sin(g.angle);
  const y=-dx*Math.sin(g.angle)+dy*Math.cos(g.angle);
  return Math.abs(x)<=g.w/2&&Math.abs(y)<=g.h/2;
}

function paintBubble(c,b,active){
  c.save();
  const g=bubbleGeometry(c,b),x=-g.w/2,y=-g.h/2;
  c.translate(g.cx,g.cy);c.rotate(g.angle);
  c.fillStyle=b.fill;c.strokeStyle=b.kind==='sticker'?'#202630':b.color;
  c.lineWidth=b.kind==='burst'||b.kind==='sticker'?4:3;c.lineJoin='round';
  c.beginPath();
  if(b.kind==='burst'){
    for(let i=0;i<28;i++){
      const angle=-Math.PI/2+i*Math.PI*2/28;
      const radius=i%2?.73:1;
      const px=Math.cos(angle)*g.w/2*radius,py=Math.sin(angle)*g.h/2*radius;
      if(i)c.lineTo(px,py);else c.moveTo(px,py);
    }
    c.closePath();
  }else if(b.kind==='caption')c.rect(x,y,g.w,g.h);
  else c.roundRect(x,y,g.w,g.h,b.kind==='thought'?Math.min(g.h/2,45):b.kind==='sticker'?10:24);
  if(b.kind==='sticker'){
    c.shadowColor='#202630';c.shadowOffsetX=5;c.shadowOffsetY=5;
    c.fill();c.shadowOffsetX=0;c.shadowOffsetY=0;c.stroke();
  }else{c.fill();c.stroke();}
  if(b.kind==='speech'){
    c.beginPath();c.moveTo(x+g.w*.28,y+g.h-2);c.lineTo(x+g.w*.22,y+g.h+28);
    c.lineTo(x+g.w*.4,y+g.h-2);c.fill();c.stroke();
    c.strokeStyle=b.fill;c.lineWidth=4;c.beginPath();c.moveTo(x+g.w*.28+2,y+g.h-1);
    c.lineTo(x+g.w*.4-2,y+g.h-1);c.stroke();
  }
  if(b.kind==='thought')for(const[r,dx,dy]of[[8,24,14],[4,12,31]]){
    c.beginPath();c.arc(x+dx,y+g.h+dy,r,0,Math.PI*2);c.fill();c.stroke();
  }
  c.fillStyle=b.color;c.textAlign='center';c.textBaseline='top';
  c.font=`${b.kind==='sticker'?'italic 900':'700'} ${g.font}px "Microsoft JhengHei","PingFang TC",sans-serif`;
  const top=y+(g.h-g.lines.length*g.font*1.4)/2+g.font*.08;
  g.lines.forEach((line,i)=>c.fillText(line,0,top+i*g.font*1.4));
  if(active){c.strokeStyle='#ef7649';c.lineWidth=2;c.setLineDash([7,5]);c.strokeRect(x-6,y-6,g.w+12,g.h+12);}
  c.restore();return g;
}
