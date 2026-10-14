(() => {
  const bg = document.getElementById('bgCanvas');
  const canvas = document.getElementById('heartCanvas');
  const bctx = bg.getContext('2d');
  const ctx = canvas.getContext('2d');
  const MESSAGE = 'I Love You';
  const SHADES = ['#ff1758', '#ff2a6d', '#ff5285', '#ff789e', '#ffa8c0', '#ffd6e3', '#ffffff'];
  let w, h, dpr, stars = [], particles = [], startTime = performance.now(), pointer = {x:-9999,y:-9999};

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    [bg, canvas].forEach(c => { c.width = Math.floor(w*dpr); c.height = Math.floor(h*dpr); c.style.width = w+'px'; c.style.height = h+'px'; });
    bctx.setTransform(dpr,0,0,dpr,0,0); ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length: Math.max(55, Math.floor(w*h/8500))}, () => ({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.25,a:Math.random()*.7+.15,s:Math.random()*.018+.004}));
    buildParticles();
  }
  function heart(t, scale) {
    return {x:16*Math.pow(Math.sin(t),3)*scale, y:-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*scale};
  }
  function buildParticles() {
    particles = [];
    const scale = Math.min(w/39, h/34, 17);
    const cx=w/2, cy=h/2 + scale*1.3;
    const total=180;
    for(let i=0;i<total;i++) {
      const t=(i/total)*Math.PI*2;
      const p=heart(t,scale);
      particles.push({x:cx+p.x,y:cy+p.y, tx:cx+p.x,ty:cy+p.y, delay:i*22, size:Math.max(8,Math.min(13,scale*.62)), color:SHADES[i%SHADES.length], outline:true, seed:Math.random()*Math.PI*2});
    }
    // Fill the heart with rows of horizontal text particles.
    const step=Math.max(13, scale*1.05);
    const minX=-15.8,maxX=15.8,minY=-12.2,maxY=14.5;
    let row=0;
    for(let yy=minY;yy<=maxY;yy+=step/scale) {
      for(let xx=minX;xx<=maxX;xx+=step/scale) {
        const nx=xx/16, ny=yy/17;
        if(nx*nx + (ny-Math.sqrt(Math.abs(nx))*.15)*(ny-Math.sqrt(Math.abs(nx))*.15) < 1.02) {
          const p={x:cx+xx*scale,y:cy+yy*scale};
          // Exact cardioid test avoids points outside the familiar heart silhouette.
          let inside=false;
          for(let a=0;a<Math.PI*2;a+=.035){const q=heart(a,1); if(Math.abs(q.x-xx)<.22 && Math.abs(q.y-yy)<.22){inside=true;break;}}
          if(!inside && Math.abs(xx)<12 && yy>-9 && yy<12) {
            particles.push({x:p.x,y:p.y,tx:p.x,ty:p.y,delay:4300+Math.max(0,yy+12)*95+Math.random()*400,size:Math.max(7,Math.min(12,scale*.55)),color:SHADES[Math.floor(Math.random()*SHADES.length)],outline:false,seed:Math.random()*Math.PI*2});
          }
        }
      }
      row++;
    }
    startTime=performance.now();
  }
  function drawBackground(now) {
    bctx.clearRect(0,0,w,h); bctx.fillStyle='#000'; bctx.fillRect(0,0,w,h);
    for(const s of stars){const alpha=s.a*(.55+.45*Math.sin(now*s.s+s.x));bctx.beginPath();bctx.fillStyle=`rgba(255,180,205,${alpha})`;bctx.arc(s.x,s.y,s.r,0,Math.PI*2);bctx.fill();}
  }
  function frame(now) {
    drawBackground(now); ctx.clearRect(0,0,w,h);
    const elapsed=now-startTime;
    for(const p of particles) {
      const progress=Math.max(0,Math.min(1,(elapsed-p.delay)/700));
      if(progress<=0) continue;
      const wobble=Math.sin(now*.0015+p.seed)*.7;
      let x=p.x+(p.tx-p.x)*progress, y=p.y+(p.ty-p.y)*progress;
      const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy);
      if(dist<95){const force=(95-dist)/95*17;x+=dx/(dist||1)*force;y+=dy/(dist||1)*force;}
      ctx.save(); ctx.globalAlpha=progress; ctx.font=`${p.outline?'600':'400'} ${p.size}px Outfit, sans-serif`; ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowColor=p.color;ctx.shadowBlur=9;ctx.fillStyle=p.color;
      ctx.fillText(MESSAGE,x,y+wobble);ctx.restore();
    }
    // Soft, subtle heartbeat glow after the heart is formed.
    if(elapsed>7000){const pulse=1+Math.sin(now*.002)*.025;ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle='#ff2a6d';ctx.lineWidth=2;ctx.shadowColor='#ff2a6d';ctx.shadowBlur=25;ctx.beginPath();ctx.ellipse(w/2,h/2,Math.min(w,h)*.22*pulse,Math.min(w,h)*.25*pulse,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
    requestAnimationFrame(frame);
  }
  function setPointer(e){const r=canvas.getBoundingClientRect();pointer.x=e.clientX-r.left;pointer.y=e.clientY-r.top;}
  canvas.addEventListener('pointermove',setPointer);canvas.addEventListener('pointerleave',()=>{pointer.x=-9999;pointer.y=-9999;});
  canvas.addEventListener('pointerdown',()=>{buildParticles();});window.addEventListener('resize',resize);
  resize();requestAnimationFrame(frame);
})();
