'use strict';

function drawSpeedLines(c,g,p){
  if(!p.effect || p.effect==='none') return;
  c.save();
  c.globalAlpha=(p.effectStrength ?? 45)/100*.62;
  c.fillStyle=c.strokeStyle=p.effectColor || '#202630';
  if(p.effect==='radial'){
    const positions={center:[.5,.5],top:[.5,.25],bottom:[.5,.75],left:[.25,.5],right:[.75,.5]};
    const [fx,fy]=positions[p.effectFocus] || positions.center;
    const x=g.x+g.w*fx,y=g.y+g.h*fy,r=Math.hypot(g.w,g.h);
    for(let i=0;i<88;i++){
      const angle=i*Math.PI*2/88+.005*Math.sin(i*13),spread=.004+(i%5)*.002;
      const inner=(.13+.1*(Math.sin(i*7)+1)/2)*Math.min(g.w,g.h);
      c.beginPath();c.moveTo(x+Math.cos(angle)*inner,y+Math.sin(angle)*inner);
      c.lineTo(x+Math.cos(angle-spread)*r,y+Math.sin(angle-spread)*r);
      c.lineTo(x+Math.cos(angle+spread)*r,y+Math.sin(angle+spread)*r);
      c.closePath();c.fill();
    }
  }else{
    for(let i=0;i<58;i++){
      const y=g.y-50+i*(g.h+100)/58,from=g.x+(.02+(i%7)*.04)*g.w;
      const length=g.w*(.35+(i%6)*.11);
      c.lineWidth=.8+(i%5)*.65;c.beginPath();c.moveTo(from,y);
      c.lineTo(from+length,y-length*.16);c.stroke();
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
