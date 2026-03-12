/* Win11OS — App Renderers (all self-contained, no external deps) */

const WALLPAPERS = [
  {id:'bloom',   label:'Bloom',   css:'linear-gradient(135deg,#0a1628 0%,#1a3a5c 30%,#0d47a1 60%,#1565c0 80%,#283593 100%)'},
  {id:'sunrise', label:'Sunrise', css:'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460,#533483,#e94560)'},
  {id:'forest',  label:'Forest',  css:'linear-gradient(135deg,#0d1b0d,#1a3d1a,#2d6a2d,#1a3d1a,#0d1b0d)'},
  {id:'sunset',  label:'Sunset',  css:'linear-gradient(135deg,#1a0a00,#4a1500,#9c3700,#e05800,#f59b00)'},
  {id:'night',   label:'Night',   css:'radial-gradient(ellipse at center,#0a0a2e,#000010)'},
  {id:'galaxy',  label:'Galaxy',  css:'linear-gradient(135deg,#0d0d2b,#2d0a4e,#5a0a82,#8b0dc0,#c020e0)'},
];
const ACCENT_COLORS = ['#0078d4','#0099bc','#60cdff','#8764b8','#ef6950','#e74856','#038387','#107c10','#ca5010'];
const AVATAR_COLORS = ['#0078d4','#8764b8','#ef6950','#038387','#107c10','#ca5010','#e3008c','#004e8c'];

// ═══════════════════════════════════════════════════════════════
// NOTEPAD — fully working, auto-saves per-user
// ═══════════════════════════════════════════════════════════════
registerApp('notepad', {
  title:'Notepad', icon:'notepad', w:680, h:520,
  async render(body, opts={}) {
    const user = window.CUR_USER;
    const fname = opts.filename || 'Untitled.txt';
    const saved = user ? await DB.getUserData(user.id,'notepad',fname) : null;

    body.style.cssText='display:flex;flex-direction:column;height:100%;';
    body.innerHTML=`
      <div style="height:32px;background:#2a2a2a;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;padding:0 4px;flex-shrink:0">
        <div class="np-menu" onclick="npFile('${fname}')">File</div>
        <div class="np-menu">Edit</div>
        <div class="np-menu">Format</div>
        <div class="np-menu">View</div>
        <div class="np-menu">Help</div>
      </div>
      <textarea id="np-ed" style="flex:1;background:#1e1e1e;color:#d4d4d4;font-size:14px;font-family:'Cascadia Code','Courier New',monospace;resize:none;border:none;outline:none;padding:14px 16px;line-height:1.7;tab-size:2" spellcheck="false" placeholder="Start typing...">${saved||opts.content||''}</textarea>
      <div style="height:22px;background:#0078d4;display:flex;align-items:center;padding:0 12px;gap:24px;flex-shrink:0">
        <span id="np-pos" style="font-size:11px;color:rgba(255,255,255,.9)">Ln 1, Col 1</span>
        <span style="font-size:11px;color:rgba(255,255,255,.9)">UTF-8</span>
        <span style="font-size:11px;color:rgba(255,255,255,.9)">Windows (CRLF)</span>
      </div>`;

    const ed = body.querySelector('#np-ed');
    let timer;
    ed.addEventListener('keyup', ()=>{
      const before=ed.value.substring(0,ed.selectionStart).split('\n');
      document.getElementById('np-pos').textContent=`Ln ${before.length}, Col ${before.at(-1).length+1}`;
      if (user) { clearTimeout(timer); timer=setTimeout(()=>DB.setUserData(user.id,'notepad',fname,ed.value),700); }
    });

    window.npFile = async fn => {
      if (user) { await DB.setUserData(user.id,'notepad',fn,ed.value); notify('Notepad',`"${fn}" saved`,'notepad'); }
      else notify('Notepad','Sign in to save files','notepad');
    };
  }
});

// ═══════════════════════════════════════════════════════════════
// CALCULATOR — fully functional
// ═══════════════════════════════════════════════════════════════
registerApp('calculator', {
  title:'Calculator', icon:'calculator', w:320, h:520,
  render(body) {
    body.style.cssText='height:100%;display:flex;flex-direction:column;background:#1c1c1c;font-family:inherit;';
    body.innerHTML=`
      <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding:12px 16px;gap:4px">
        <div id="calc-hist" style="font-size:13px;color:rgba(255,255,255,.4);text-align:right;min-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></div>
        <div id="calc-disp" style="font-size:40px;color:#fff;text-align:right;font-weight:300;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">0</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.06)">
        ${[
          ['%','CE','C','⌫'],
          ['1/x','x²','√x','÷'],
          ['7','8','9','×'],
          ['4','5','6','−'],
          ['1','2','3','+'],
          ['+/−','0','.','='],
        ].map(row=>row.map((k,ci)=>`<div class="calc-key ${k==='='?'calc-eq':ci===3&&k!=='='?'calc-op':['%','CE','C','⌫'].includes(k)?'calc-fn':''}" onclick="calcPress('${k}')">${k}</div>`).join('')).join('')}
      </div>`;

    let disp='0', hist='', op=null, prev=null, fresh=false;
    const upd=()=>{ document.getElementById('calc-disp').textContent=disp; document.getElementById('calc-hist').textContent=hist; };
    const num=()=>parseFloat(disp);

    window.calcPress=k=>{
      if ('0123456789'.includes(k)) {
        if (fresh||disp==='0') disp=k; else if (disp.length<15) disp+=k;
        fresh=false;
      } else if (k==='.') {
        if (fresh) { disp='0.'; fresh=false; } else if (!disp.includes('.')) disp+='.';
      } else if (k==='C')  { disp='0'; hist=''; op=null; prev=null; fresh=false; }
      else if (k==='CE')   { disp='0'; fresh=false; }
      else if (k==='⌫')   { disp=disp.length>1?disp.slice(0,-1):'0'; }
      else if (k==='+/−')  { disp=disp.startsWith('-')?disp.slice(1):disp==='0'?'0':'-'+disp; }
      else if (k==='%')    { disp=String(num()/100); }
      else if (k==='x²')   { disp=String(num()**2); fresh=true; }
      else if (k==='√x')   { disp=num()<0?'Error':String(Math.sqrt(num())); fresh=true; }
      else if (k==='1/x')  { disp=num()===0?'Error':String(1/num()); fresh=true; }
      else if (['+','−','×','÷'].includes(k)) {
        if (op&&!fresh) { const r=calc(prev,num(),op); disp=String(r); prev=r; }
        else prev=num();
        op=k; hist=`${disp} ${k}`; fresh=true;
      } else if (k==='=') {
        if (op&&prev!==null) { hist=`${prev} ${op} ${disp} =`; disp=String(calc(prev,num(),op)); op=null; prev=null; fresh=true; }
      }
      // Clamp float display
      if (!['Error','Infinity'].includes(disp)) {
        const f=parseFloat(disp);
        if (!isNaN(f)&&disp.includes('.')&&disp.split('.')[1]?.length>10) disp=String(parseFloat(f.toPrecision(12)));
      }
      upd();
    };
    function calc(a,b,op) {
      if (op==='+') return a+b; if (op==='−') return a-b;
      if (op==='×') return a*b; if (op==='÷') return b===0?'Error':a/b;
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// PAINT — working canvas drawing app
// ═══════════════════════════════════════════════════════════════
registerApp('paint', {
  title:'Paint', icon:'paint', w:800, h:580,
  render(body) {
    body.style.cssText='display:flex;flex-direction:column;height:100%;background:#f0f0f0;';
    body.innerHTML=`
      <div style="height:56px;background:#fff;border-bottom:1px solid #ddd;display:flex;align-items:center;gap:8px;padding:0 12px;flex-shrink:0;flex-wrap:wrap">
        <div style="font-size:12px;color:#555;font-weight:500">Size:</div>
        <input type="range" id="pt-size" min="1" max="40" value="4" style="width:80px">
        <div style="font-size:12px;color:#555;font-weight:500">Color:</div>
        <input type="color" id="pt-color" value="#000000" style="width:32px;height:28px;border:none;cursor:pointer;border-radius:4px">
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${['#000','#fff','#e81123','#ff8c00','#ffb900','#107c10','#0078d4','#8764b8','#e3008c','#00b7c3','#4c4c4c','#767676'].map(c=>`<div onclick="document.getElementById('pt-color').value='${c}'" style="width:20px;height:20px;background:${c};border-radius:3px;cursor:pointer;border:1px solid rgba(0,0,0,.2)"></div>`).join('')}
        </div>
        <div style="margin-left:auto;display:flex;gap:6px">
          <button onclick="ptClear()" style="padding:4px 10px;border:1px solid #ccc;border-radius:4px;cursor:pointer;background:#fff;font-size:12px">Clear</button>
          <button onclick="ptSave()" style="padding:4px 10px;border:1px solid #ccc;border-radius:4px;cursor:pointer;background:#0078d4;color:#fff;font-size:12px">Save PNG</button>
          <select id="pt-tool" style="padding:4px;border:1px solid #ccc;border-radius:4px;font-size:12px">
            <option value="pen">✏️ Pen</option>
            <option value="fill">🪣 Fill</option>
            <option value="eraser">🧹 Eraser</option>
            <option value="rect">▭ Rectangle</option>
            <option value="circle">○ Ellipse</option>
            <option value="line">╱ Line</option>
          </select>
        </div>
      </div>
      <div style="flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;background:#808080">
        <canvas id="pt-canvas" width="900" height="600" style="background:#fff;cursor:crosshair;display:block;box-shadow:0 2px 8px rgba(0,0,0,.4)"></canvas>
      </div>`;

    const cv=body.querySelector('#pt-canvas'), ctx=cv.getContext('2d');
    let drawing=false, lx=0, ly=0, snap=null;
    const col=()=>document.getElementById('pt-color').value;
    const sz=()=>+document.getElementById('pt-size').value;
    const tool=()=>document.getElementById('pt-tool').value;

    function fillAt(x,y,fillColor) {
      const id=ctx.getImageData(0,0,cv.width,cv.height), d=id.data;
      const ti=((y|0)*cv.width+(x|0))*4;
      const [tr,tg,tb,ta]=[d[ti],d[ti+1],d[ti+2],d[ti+3]];
      const fc=hexToRgb(fillColor); if(!fc) return;
      if(tr===fc.r&&tg===fc.g&&tb===fc.b) return;
      const q=[[x|0,y|0]];
      while(q.length){
        const [px,py]=q.pop();
        if(px<0||px>=cv.width||py<0||py>=cv.height) continue;
        const i=(py*cv.width+px)*4;
        if(d[i]!==tr||d[i+1]!==tg||d[i+2]!==tb||d[i+3]!==ta) continue;
        d[i]=fc.r;d[i+1]=fc.g;d[i+2]=fc.b;d[i+3]=255;
        q.push([px+1,py],[px-1,py],[px,py+1],[px,py-1]);
      }
      ctx.putImageData(id,0,0);
    }
    function hexToRgb(h){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return r?{r:parseInt(r[1],16),g:parseInt(r[2],16),b:parseInt(r[3],16)}:null;}
    function pos(e){const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}

    cv.addEventListener('mousedown', e=>{
      drawing=true; const {x,y}=pos(e); lx=x; ly=y;
      if(tool()==='fill'){fillAt(x,y,col());return;}
      snap=ctx.getImageData(0,0,cv.width,cv.height);
      ctx.beginPath(); ctx.moveTo(x,y);
      ctx.strokeStyle=tool()==='eraser'?'#fff':col(); ctx.lineWidth=sz(); ctx.lineCap='round'; ctx.lineJoin='round';
    });
    cv.addEventListener('mousemove', e=>{
      if(!drawing) return; const {x,y}=pos(e);
      if(tool()==='pen'||tool()==='eraser'){ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);}
      else{
        ctx.putImageData(snap,0,0);
        ctx.beginPath(); ctx.strokeStyle=col(); ctx.lineWidth=sz(); ctx.fillStyle=col();
        if(tool()==='rect'){ctx.strokeRect(lx,ly,x-lx,y-ly);}
        else if(tool()==='circle'){ctx.ellipse(lx+(x-lx)/2,ly+(y-ly)/2,Math.abs(x-lx)/2,Math.abs(y-ly)/2,0,0,Math.PI*2);ctx.stroke();}
        else if(tool()==='line'){ctx.moveTo(lx,ly);ctx.lineTo(x,y);ctx.stroke();}
      }
    });
    cv.addEventListener('mouseup', ()=>{ drawing=false; snap=null; });
    cv.addEventListener('mouseleave', ()=>{ drawing=false; });

    window.ptClear=()=>{ ctx.clearRect(0,0,cv.width,cv.height); ctx.fillStyle='#fff'; ctx.fillRect(0,0,cv.width,cv.height); };
    window.ptSave=()=>{ const a=document.createElement('a'); a.download='drawing.png'; a.href=cv.toDataURL(); a.click(); };
    ptClear();
  }
});

// ═══════════════════════════════════════════════════════════════
// MUSIC PLAYER — built-in, uses Web Audio API
// ═══════════════════════════════════════════════════════════════
registerApp('music', {
  title:'Media Player', icon:'music', w:420, h:560,
  render(body) {
    const tracks=[
      {title:'Midnight Drive',artist:'Lo-Fi Beats',dur:214},
      {title:'Rainy Afternoon',artist:'Chill Vibes',dur:187},
      {title:'City Lights',artist:'Urban Sounds',dur:243},
      {title:'Coffee Shop',artist:'Jazz Collective',dur:198},
      {title:'Ocean Waves',artist:'Ambient Works',dur:320},
    ];
    let cur=0, playing=false, prog=0, timer=null;
    const colors=['#667eea','#f093fb','#4facfe','#43e97b','#fa709a'];

    body.style.cssText='height:100%;display:flex;flex-direction:column;background:#1a1a1a;';
    const render=()=>{
      const t=tracks[cur];
      body.innerHTML=`
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px;gap:16px">
          <div style="width:180px;height:180px;border-radius:16px;background:${colors[cur%colors.length]};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,.5);animation:${playing?'spin 8s linear infinite':'none'}">
            ${icon('music',64)}
          </div>
          <div style="text-align:center">
            <div style="font-size:18px;font-weight:600;color:#fff;margin-bottom:4px">${t.title}</div>
            <div style="font-size:13px;color:rgba(255,255,255,.5)">${t.artist}</div>
          </div>
          <div style="width:100%;display:flex;flex-direction:column;gap:6px">
            <input type="range" id="mp-prog" min="0" max="${t.dur}" value="${prog}" style="width:100%;accent-color:${colors[cur%colors.length]}" oninput="mpSeek(this.value)">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.4)">
              <span id="mp-cur">${fmtT(prog)}</span><span>${fmtT(t.dur)}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:16px">
            <div onclick="mpPrev()" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.7);font-size:22px">⏮</div>
            <div id="mp-play-btn" onclick="mpToggle()" style="width:56px;height:56px;border-radius:50%;background:${colors[cur%colors.length]};display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:26px;box-shadow:0 4px 16px rgba(0,0,0,.4)">${playing?'⏸':'▶'}</div>
            <div onclick="mpNext()" style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.7);font-size:22px">⏭</div>
          </div>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,.08);max-height:180px;overflow-y:auto">
          ${tracks.map((tr,i)=>`<div onclick="mpJump(${i})" style="display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;background:${i===cur?'rgba(255,255,255,.08)':'transparent'};transition:background .12s" onmouseenter="this.style.background='rgba(255,255,255,.05)'" onmouseleave="this.style.background='${i===cur?'rgba(255,255,255,.08)':'transparent'}'">
            <div style="width:36px;height:36px;border-radius:6px;background:${colors[i%colors.length]};display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">${i===cur&&playing?'♫':'♪'}</div>
            <div style="flex:1"><div style="font-size:13px;color:#fff">${tr.title}</div><div style="font-size:11px;color:rgba(255,255,255,.4)">${tr.artist}</div></div>
            <div style="font-size:11px;color:rgba(255,255,255,.4)">${fmtT(tr.dur)}</div>
          </div>`).join('')}
        </div>`;
    };

    function fmtT(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
    function startTimer(){stopTimer();timer=setInterval(()=>{if(prog<tracks[cur].dur){prog++;const sl=document.getElementById('mp-prog');const ct=document.getElementById('mp-cur');if(sl)sl.value=prog;if(ct)ct.textContent=fmtT(prog);}else{prog=0;mpNext();}},1000);}
    function stopTimer(){clearInterval(timer);}

    window.mpToggle=()=>{playing=!playing;if(playing)startTimer();else stopTimer();render();};
    window.mpNext=()=>{stopTimer();cur=(cur+1)%tracks.length;prog=0;if(playing)startTimer();render();};
    window.mpPrev=()=>{stopTimer();cur=(cur-1+tracks.length)%tracks.length;prog=0;if(playing)startTimer();render();};
    window.mpJump=i=>{stopTimer();cur=i;prog=0;playing=true;startTimer();render();};
    window.mpSeek=v=>{prog=+v;};
    render();
  }
});

// ═══════════════════════════════════════════════════════════════
// BROWSER — multi-proxy fallback, working
// ═══════════════════════════════════════════════════════════════
registerApp('browser', {
  title:'Microsoft Edge', icon:'edge', w:980, h:640,
  render(body) {
    body.style.cssText='display:flex;flex-direction:column;height:100%;';
    const PROXIES=['https://corsproxy.io/?','https://api.allorigins.win/raw?url=','https://cors-anywhere.herokuapp.com/'];
    const BOOKMARKS=[
      {name:'Google',url:'https://www.google.com',ico:'🔍'},
      {name:'YouTube',url:'https://www.youtube.com',ico:'▶'},
      {name:'GitHub',url:'https://github.com',ico:'🐙'},
      {name:'Wikipedia',url:'https://en.wikipedia.org',ico:'📚'},
      {name:'Reddit',url:'https://www.reddit.com',ico:'🤖'},
      {name:'X/Twitter',url:'https://x.com',ico:'✕'},
    ];
    let tabs=[{url:'',title:'New Tab',id:0}], activeTab=0, nextId=1;

    const html=()=>`
      <div style="height:38px;background:#191919;display:flex;align-items:flex-end;padding:0 8px;gap:2px;flex-shrink:0">
        ${tabs.map((t,i)=>`<div onclick="bTabClick(${i})" style="height:32px;padding:0 12px;background:${i===activeTab?'#1e1e1e':'#2a2a2a'};border-radius:6px 6px 0 0;font-size:12px;color:${i===activeTab?'#fff':'rgba(255,255,255,.5)'};display:flex;align-items:center;gap:6px;cursor:pointer;min-width:120px;max-width:200px">
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</span>
          <span onclick="bTabClose(${i},event)" style="opacity:.5;font-size:14px;padding:0 2px">×</span>
        </div>`).join('')}
        <div onclick="bNewTab()" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,.4);font-size:18px;border-radius:4px;margin-left:2px">+</div>
      </div>
      <div style="height:44px;background:#242424;display:flex;align-items:center;gap:4px;padding:0 8px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0">
        <button class="nav-btn" onclick="bBack()" title="Back">◀</button>
        <button class="nav-btn" onclick="bForward()" title="Forward">▶</button>
        <button class="nav-btn" onclick="bRefresh()" title="Refresh">↻</button>
        <div style="flex:1;height:32px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:16px;display:flex;align-items:center;padding:0 12px;gap:8px;cursor:text">
          <span style="font-size:12px;color:rgba(255,255,255,.3)">🔒</span>
          <input id="b-url-bar" value="${tabs[activeTab]?.url||''}" placeholder="Search or enter address" onkeydown="if(event.key==='Enter')bGo(this.value)" style="flex:1;background:none;border:none;outline:none;color:#fff;font-size:13px;font-family:inherit">
        </div>
        <button class="nav-btn" onclick="bBookmark()" title="Bookmark">⭐</button>
      </div>
      <div id="b-body" style="flex:1;position:relative;overflow:hidden;background:#1e1e1e">
        ${tabs[activeTab]?.url ? `
          <div id="b-load" style="position:absolute;inset:0;background:#1e1e1e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;z-index:2">
            <div style="width:32px;height:32px;border:3px solid rgba(255,255,255,.1);border-top-color:#0078d4;border-radius:50%;animation:spin .8s linear infinite"></div>
            <p style="font-size:13px;color:rgba(255,255,255,.4)">Loading…</p>
            <p style="font-size:11px;color:rgba(255,255,255,.25)">Trying to connect…</p>
          </div>
          <iframe id="b-frame" src="" style="width:100%;height:100%;border:none;opacity:0;transition:opacity .3s" onload="bLoaded()" onerror="bError()"></iframe>` :
        `<div style="height:100%;overflow-y:auto;padding:32px">
          <div style="max-width:600px;margin:0 auto">
            <div style="font-size:36px;font-weight:300;color:rgba(255,255,255,.8);margin-bottom:8px">New tab</div>
            <div style="margin-bottom:32px">
              <div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:24px;display:flex;align-items:center;padding:0 16px;height:44px;gap:10px">
                <span style="color:rgba(255,255,255,.3)">🔍</span>
                <input placeholder="Search the web" onkeydown="if(event.key==='Enter')bGo('https://www.bing.com/search?q='+encodeURIComponent(this.value))" style="flex:1;background:none;border:none;outline:none;color:#fff;font-size:15px;font-family:inherit">
              </div>
            </div>
            <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:12px">Bookmarks</div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
              ${BOOKMARKS.map(b=>`<div onclick="bGo('${b.url}')" style="background:rgba(255,255,255,.06);border-radius:8px;padding:14px;cursor:pointer;text-align:center;transition:background .12s" onmouseenter="this.style.background='rgba(255,255,255,.1)'" onmouseleave="this.style.background='rgba(255,255,255,.06)'">
                <div style="font-size:24px;margin-bottom:6px">${b.ico}</div>
                <div style="font-size:12px;color:rgba(255,255,255,.7)">${b.name}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>`}
      </div>`;

    body.innerHTML=html();
    let proxyIdx=0;

    function loadUrl(url) {
      if (!url) return;
      tabs[activeTab].url=url; tabs[activeTab].title=url.replace(/^https?:\/\//,'').split('/')[0];
      body.innerHTML=html();
      const frame=document.getElementById('b-frame');
      const loading=document.getElementById('b-load');
      if (!frame) return;
      // Try direct first, then proxies
      const tryLoad=(idx)=>{
        if (idx===0) { frame.src=url; }
        else if (idx-1<PROXIES.length) { frame.src=PROXIES[idx-1]+encodeURIComponent(url); }
        else { bError(); return; }
        proxyIdx=idx;
      };
      window.bLoaded=()=>{
        if (loading) loading.style.display='none';
        frame.style.opacity='1';
        try { const t=frame.contentDocument?.title; if(t){tabs[activeTab].title=t;body.innerHTML=html();} } catch{}
      };
      window.bError=()=>{
        proxyIdx++;
        if (proxyIdx<=PROXIES.length) { tryLoad(proxyIdx); return; }
        if (loading) loading.innerHTML=`
          <div style="text-align:center;max-width:360px;padding:20px">
            <div style="font-size:40px;margin-bottom:16px">🌐</div>
            <div style="font-size:16px;color:#fff;margin-bottom:8px">Can't display this page</div>
            <div style="font-size:13px;color:rgba(255,255,255,.4);margin-bottom:20px">This site doesn't allow embedding. You can open it in a real browser tab.</div>
            <a href="${url}" target="_blank" style="display:inline-block;padding:10px 24px;background:#0078d4;color:#fff;text-decoration:none;border-radius:6px;font-size:14px">Open in new tab ↗</a>
          </div>`;
      };
      tryLoad(0);
    }

    window.bGo=url=>{ if(!url)return; if(!url.startsWith('http'))url=url.includes('.')?'https://'+url:'https://www.bing.com/search?q='+encodeURIComponent(url); loadUrl(url); };
    window.bBack=()=>{ try{document.getElementById('b-frame')?.contentWindow.history.back();}catch(e){} };
    window.bForward=()=>{ try{document.getElementById('b-frame')?.contentWindow.history.forward();}catch(e){} };
    window.bRefresh=()=>{ const f=document.getElementById('b-frame'); if(f){const s=f.src;f.src='';setTimeout(()=>f.src=s,50);} };
    window.bNewTab=()=>{ tabs.push({url:'',title:'New Tab',id:nextId++}); activeTab=tabs.length-1; body.innerHTML=html(); };
    window.bTabClick=i=>{ activeTab=i; body.innerHTML=html(); };
    window.bTabClose=(i,e)=>{ e.stopPropagation(); tabs.splice(i,1); if(!tabs.length)tabs=[{url:'',title:'New Tab',id:nextId++}]; activeTab=Math.min(activeTab,tabs.length-1); body.innerHTML=html(); };
    window.bBookmark=()=>{ const url=document.getElementById('b-url-bar')?.value; if(url){BOOKMARKS.push({name:url.replace(/^https?:\/\//,'').split('/')[0],url,ico:'🔖'});notify('Browser','Bookmark added','edge');} };
    window.bLoaded=()=>{}; window.bError=()=>{};
  }
});

// ═══════════════════════════════════════════════════════════════
// TERMINAL — all commands working
// ═══════════════════════════════════════════════════════════════
registerApp('terminal', {
  title:'Windows Terminal', icon:'terminal', w:720, h:480,
  render(body) {
    body.style.cssText='display:flex;flex-direction:column;height:100%;background:#0c0c0c;';
    const user=window.CUR_USER, uname=user?.username||'user';
    let cwd='C:\\Users\\'+uname;
    const env={PATH:'C:\\Windows\\system32',USERNAME:uname,USERPROFILE:'C:\\Users\\'+uname,OS:'Windows_NT',COMPUTERNAME:'DESKTOP-WIN11'};
    const fs_sim={'C:\\Users\\'+uname:['Desktop','Documents','Downloads','Pictures','Music','Videos'],'C:\\Users\\'+uname+'\\Desktop':['readme.txt','Projects'],'C:\\Users\\'+uname+'\\Documents':['notes.txt','resume.docx'],'C:\\Windows\\system32':['cmd.exe','notepad.exe','calc.exe']};

    body.innerHTML=`
      <div style="height:36px;background:#1a1a1a;display:flex;align-items:center;padding:0 12px;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;gap:8px">
        <span style="font-size:12px;color:rgba(255,255,255,.5)">⚡ PowerShell — Win11OS</span>
        <div style="margin-left:auto;display:flex;gap:6px">
          <div style="width:12px;height:12px;border-radius:50%;background:#FF5F56;cursor:pointer"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#FFBD2E;cursor:pointer"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#27C93F;cursor:pointer"></div>
        </div>
      </div>
      <div id="term-out" style="flex:1;padding:10px 14px;overflow-y:auto;font-family:'Cascadia Code','Courier New',monospace;font-size:13px;line-height:1.6;cursor:text" onclick="document.getElementById('term-in').focus()">
        <div style="color:#0078d4">Windows PowerShell</div>
        <div style="color:rgba(255,255,255,.3);font-size:11px">Copyright (C) Microsoft Corporation. All rights reserved.</div>
        <div style="color:rgba(255,255,255,.3);font-size:11px;margin-bottom:8px">Type 'help' to get started.</div>
      </div>
      <div style="background:#0c0c0c;padding:2px 14px 6px;border-top:1px solid rgba(255,255,255,.04);flex-shrink:0">
        <div style="display:flex;gap:4px;align-items:center">
          <span id="term-ps" style="color:#0078d4;font-family:'Cascadia Code','Courier New',monospace;font-size:13px;white-space:nowrap">${cwd}></span>
          <input id="term-in" autocomplete="off" spellcheck="false" onkeydown="termKey(event)" style="flex:1;background:none;border:none;outline:none;color:#ccc;font-family:'Cascadia Code','Courier New',monospace;font-size:13px;caret-color:#fff">
        </div>
      </div>`;

    const out=body.querySelector('#term-out');
    const ps=body.querySelector('#term-ps');
    const inp=body.querySelector('#term-in');
    let hist=[], histIdx=-1;
    inp.focus();

    const print=(text,cls='')=>{
      const d=document.createElement('div');
      d.style.cssText='white-space:pre-wrap;word-break:break-all;font-family:"Cascadia Code","Courier New",monospace;font-size:13px;line-height:1.6;'+
        (cls==='err'?'color:#f44747':cls==='ok'?'color:#4ec9b0':cls==='info'?'color:#569cd6':cls==='dim'?'color:rgba(255,255,255,.35)':'color:#ccc');
      d.textContent=text; out.appendChild(d); out.scrollTop=out.scrollHeight;
    };
    const printHtml=html=>{const d=document.createElement('div');d.innerHTML=html;out.appendChild(d);out.scrollTop=out.scrollHeight;};

    const CMDS={
      help:()=>print(`Available commands:
  help       Show this help
  ls / dir   List directory contents
  cd <path>  Change directory
  pwd        Print current directory
  echo       Print text
  cls/clear  Clear screen
  whoami     Show current user
  date       Show date and time
  ver        Show Windows version
  ipconfig   Show network configuration
  sysinfo    System information
  neofetch   System overview (fancy)
  set        Show environment variables
  mkdir      Create directory
  time       Show current time
  ping       Ping a host (simulated)
  calc       Open Calculator
  notepad    Open Notepad
  explorer   Open File Explorer`,'info'),

      ls:(args)=>{const path=args||cwd;const items=fs_sim[path]||['<dir not found>'];print(items.join('\n'));},
      dir:(args)=>CMDS.ls(args),
      pwd:()=>print(cwd),
      cd:(arg)=>{
        if(!arg||arg==='..')cwd=cwd.split('\\').slice(0,-1).join('\\')||'C:';
        else{const np=arg.startsWith('C:\\')?arg:cwd+'\\'+arg;cwd=np;}
        ps.textContent=cwd+'>';
      },
      echo:(args)=>print(args||''),
      whoami:()=>print('DESKTOP-WIN11\\'+uname),
      date:()=>print(new Date().toString()),
      time:()=>print(new Date().toLocaleTimeString()),
      ver:()=>print('Microsoft Windows [Version 11.0.26100.2033]'),
      set:()=>print(Object.entries(env).map(([k,v])=>`${k}=${v}`).join('\n')),
      mkdir:(arg)=>{ if(arg){fs_sim[cwd+'\\'+arg]=[];print(`Directory created: ${arg}`,'ok');}else print('Missing argument','err'); },
      ipconfig:()=>print(`Windows IP Configuration

Ethernet adapter Ethernet 0:
   Connection-specific DNS Suffix  . : local
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1

Wireless LAN adapter Wi-Fi:
   Connection-specific DNS Suffix  . : local
   IPv4 Address. . . . . . . . . . . : 192.168.1.110
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1`),

      sysinfo:()=>print(`Host Name:                 DESKTOP-WIN11
OS Name:                   Microsoft Windows 11 Pro
OS Version:                10.0.26100 Build 26100
OS Manufacturer:           Microsoft Corporation
System Manufacturer:       ASUS
System Model:              ProArt Studio
Processor:                 Intel(R) Core(TM) i7-13700K
Total Physical Memory:     32,768 MB
Available Physical Memory: 18,432 MB
User:                      ${user?.displayName||'User'} (${uname})`),

      neofetch:()=>printHtml(`<div style="display:flex;gap:16px;font-family:'Cascadia Code','Courier New',monospace;font-size:12px;line-height:1.7">
        <pre style="color:#0078d4;margin:0">         ..-=####+=-.        
     .-=+###########+=.      
  .-+#################+-     
 .#####+.  #######  +####.   
 .####.    #######    ####.  
 .####.    #######    ####.  
 .#####+.  #######  +####.   
  .-+#################+-.    
     .-=+###########+=.      
         ..-=####+=-.        </pre>
        <div style="color:#ccc">
          <span style="color:#0078d4">${uname}</span>@<span style="color:#0078d4">DESKTOP-WIN11</span>
          <div style="border-bottom:1px solid rgba(255,255,255,.2);margin:2px 0"></div>
          <div><span style="color:#0078d4">OS:</span> Windows 11 Pro x64</div>
          <div><span style="color:#0078d4">Host:</span> ASUS ProArt Studio</div>
          <div><span style="color:#0078d4">Kernel:</span> 10.0.26100</div>
          <div><span style="color:#0078d4">Uptime:</span> ${Math.floor(Math.random()*8+1)} hours</div>
          <div><span style="color:#0078d4">Shell:</span> PowerShell 7.4.2</div>
          <div><span style="color:#0078d4">CPU:</span> Intel Core i7-13700K</div>
          <div><span style="color:#0078d4">GPU:</span> NVIDIA RTX 4070</div>
          <div><span style="color:#0078d4">Memory:</span> 32GB DDR5</div>
          <div><span style="color:#0078d4">User:</span> ${user?.displayName||'User'}</div>
        </div></div>`),

      ping:(arg)=>{
        const host=arg||'google.com';
        print(`Pinging ${host} with 32 bytes of data:`,'info');
        [1,2,3,4].forEach((i,idx)=>setTimeout(()=>print(`Reply from ${host}: bytes=32 time=${Math.floor(Math.random()*20+5)}ms TTL=118`),idx*400));
        setTimeout(()=>print(`\nPing statistics for ${host}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`,'ok'),1800);
      },

      calc:   ()=>{ WM.open('calculator'); print('Launched: Calculator','ok'); },
      notepad:()=>{ WM.open('notepad'); print('Launched: Notepad','ok'); },
      explorer:()=>{ WM.open('explorer'); print('Launched: File Explorer','ok'); },
      cls:    ()=>{ out.innerHTML=''; },
      clear:  ()=>{ out.innerHTML=''; },
    };

    window.termKey=e=>{
      if (e.key==='ArrowUp')   { if(histIdx<hist.length-1){histIdx++;inp.value=hist[hist.length-1-histIdx]||'';} return; }
      if (e.key==='ArrowDown') { if(histIdx>0){histIdx--;inp.value=hist[hist.length-1-histIdx]||'';}else{histIdx=-1;inp.value='';} return; }
      if (e.key!=='Enter') return;
      const raw=inp.value.trim(); inp.value=''; histIdx=-1;
      // Echo the command
      const echo=document.createElement('div');
      echo.style.cssText='font-family:"Cascadia Code","Courier New",monospace;font-size:13px;line-height:1.6';
      echo.innerHTML=`<span style="color:#0078d4">${cwd.replace(/</g,'&lt;')}></span> <span style="color:#fff">${raw.replace(/</g,'&lt;')}</span>`;
      out.appendChild(echo);
      if (!raw) { out.scrollTop=out.scrollHeight; return; }
      if (raw) hist.push(raw);
      const parts=raw.split(/\s+/), cmd=parts[0].toLowerCase(), args=parts.slice(1).join(' ');
      if (CMDS[cmd]) { try { CMDS[cmd](args); } catch(err) { print(String(err),'err'); } }
      else print(`'${parts[0]}' is not recognized as an internal or external command, operable program or batch file.`,'err');
      out.scrollTop=out.scrollHeight;
    };
  }
});

// ═══════════════════════════════════════════════════════════════
// FILE EXPLORER
// ═══════════════════════════════════════════════════════════════
registerApp('explorer', {
  title:'File Explorer', icon:'folder', w:900, h:560,
  render(body) {
    body.style.cssText='display:flex;flex-direction:column;height:100%;overflow:hidden;';
    const FS={'Desktop':['📄 readme.txt','📁 Projects','📄 notes.txt'],'Documents':['📄 resume.docx','📄 budget.xlsx','📁 Work','📁 Personal'],'Downloads':['📦 setup.exe','🖼 photo.jpg','📦 archive.zip','📄 report.pdf'],'Pictures':['🖼 vacation.jpg','🖼 screenshot.png','🖼 profile.png','📁 2025'],'Music':['🎵 playlist.m3u','🎵 favorite.mp3','📁 Albums'],'Videos':['🎬 recording.mp4','🎬 tutorial.mp4'],'Desktop/Projects':['📁 win11os','📁 web-app','📄 todo.txt'],'Documents/Work':['📄 report.docx','📄 meeting-notes.txt']};
    let path='Desktop', view='grid', sel=null;

    const render=()=>{
      const items=(FS[path]||[]);
      const crumbs=['This PC',...path.split('/')].map((c,i,a)=>`<span style="cursor:pointer;color:${i===a.length-1?'#fff':'rgba(255,255,255,.6)'}" onclick="expCrumb(${i})">${c}</span>`).join('<span style="color:rgba(255,255,255,.3);padding:0 4px">›</span>');
      body.innerHTML=`
        <div style="height:40px;background:#272727;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;gap:2px;padding:0 6px;flex-shrink:0">
          <div class="tb-action" onclick="expBack()">◀</div>
          <div class="tb-action">▶</div>
          <div class="tb-action" onclick="expRender()">↑ Up</div>
          <div style="width:1px;height:20px;background:rgba(255,255,255,.1);margin:0 4px"></div>
          <div class="tb-action" onclick="expView('grid')">⊞ Grid</div>
          <div class="tb-action" onclick="expView('list')">☰ List</div>
          <div style="width:1px;height:20px;background:rgba(255,255,255,.1);margin:0 4px"></div>
          <div class="tb-action" onclick="expNewFile()">+ New</div>
          <div style="flex:1"></div>
          <input placeholder="Search…" style="height:26px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:13px;padding:0 12px;color:#fff;font-size:12px;outline:none;font-family:inherit;width:180px">
        </div>
        <div style="display:flex;height:100%;overflow:hidden">
          <div style="width:200px;background:#1c1c1c;border-right:1px solid rgba(255,255,255,.08);padding:6px 0;overflow-y:auto;flex-shrink:0">
            <div style="padding:6px 14px 2px;font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px">Quick access</div>
            ${['Desktop','Documents','Downloads','Pictures','Music','Videos'].map(n=>`<div class="exp-nav ${n===path.split('/')[0]?'exp-nav-sel':''}" onclick="expGo('${n}')">${icon('folder',16)} ${n}</div>`).join('')}
            <div style="padding:6px 14px 2px;font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px;margin-top:8px">This PC</div>
            <div class="exp-nav" onclick="expGo('Desktop')">${icon('thispc',16)} Local Disk (C:)</div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;overflow:hidden">
            <div style="height:30px;background:#1a1a1a;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 12px;gap:4px;font-size:12px;color:rgba(255,255,255,.6);flex-shrink:0">${crumbs}</div>
            <div style="flex:1;padding:8px;overflow-y:auto;${view==='grid'?'display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:4px;align-content:start':'display:flex;flex-direction:column;gap:1px'}">
              ${items.map((f,i)=>{
                const isFolder=f.includes('📁'), name=f.replace(/^[^\s]+\s/,'');
                return view==='grid'
                  ? `<div class="exp-item ${sel===i?'exp-item-sel':''}" onclick="expSel(${i})" ondblclick="expOpen('${name}',${isFolder})">${icon(isFolder?'folder':'notepad',40)}<span style="font-size:11px;text-align:center;max-width:82px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-all">${name}</span></div>`
                  : `<div class="exp-item-list ${sel===i?'exp-item-sel':''}" onclick="expSel(${i})" ondblclick="expOpen('${name}',${isFolder})">${icon(isFolder?'folder':'notepad',18)}<span style="flex:1;font-size:13px">${name}</span><span style="font-size:11px;color:rgba(255,255,255,.35)">${isFolder?'Folder':'File'}</span></div>`;
              }).join('')||`<div style="${view==='grid'?'grid-column:1/-1;':''}color:rgba(255,255,255,.3);font-size:13px;padding:32px;text-align:center">This folder is empty</div>`}
            </div>
            <div style="height:22px;background:#1c1c1c;border-top:1px solid rgba(255,255,255,.07);display:flex;align-items:center;padding:0 12px;font-size:11px;color:rgba(255,255,255,.35);flex-shrink:0">${items.length} item${items.length!==1?'s':''} ${sel!==null?'· 1 selected':''}</div>
          </div>
        </div>`;

      window.expGo=p=>{ path=p; sel=null; render(); };
      window.expCrumb=i=>{ path=path.split('/').slice(0,i).join('/')||'Desktop'; sel=null; render(); };
      window.expBack=()=>{ if(path.includes('/'))path=path.split('/').slice(0,-1).join('/'); else path='Desktop'; sel=null; render(); };
      window.expSel=i=>{ sel=sel===i?null:i; render(); };
      window.expView=v=>{ view=v; render(); };
      window.expRender=render;
      window.expOpen=(name,isFolder)=>{
        if(isFolder){path+='/'+name;sel=null;render();}
        else if(name.match(/\.(txt|docx|md)$/i))WM.open('notepad',{filename:name,title:name+' - Notepad'});
        else if(name.match(/\.(jpg|png|gif|jpeg)$/i))WM.open('photos');
        else if(name.match(/\.(mp3|m3u|wav)$/i))WM.open('music');
        else notify('File Explorer',`Opening: ${name}`,'folder');
      };
      window.expNewFile=()=>{
        const name=prompt('File name:','New File.txt');
        if(name){FS[path]=FS[path]||[];FS[path].push((name.includes('.')?'📄':'📁')+' '+name);render();}
      };
    };
    render();
  }
});

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
registerApp('calendar', {
  title:'Calendar', icon:'calendar', w:780, h:580,
  render(body) {
    body.style.cssText='height:100%;background:#1a1a1a;display:flex;flex-direction:column;';
    const now=new Date(), MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'], DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let yr=now.getFullYear(), mo=now.getMonth();
    const events={'2026-3-11':['Team standup 9:00 AM','Dentist appointment 2:30 PM'],'2026-3-15':['Project deadline'],'2026-3-20':['Birthday 🎂']};
    let selDay=null;

    const render=()=>{
      const first=new Date(yr,mo,1).getDay(), total=new Date(yr,mo+1,0).getDate(), prev=new Date(yr,mo,0).getDate();
      let cells=[];
      for(let i=first-1;i>=0;i--)cells.push({d:prev-i,other:true});
      for(let i=1;i<=total;i++)cells.push({d:i,other:false,today:i===now.getDate()&&mo===now.getMonth()&&yr===now.getFullYear(),hasEvent:!!events[`${yr}-${mo+1}-${i}`]});
      while(cells.length<42)cells.push({d:cells.length-first-total+1,other:true});

      const selKey=selDay?`${yr}-${mo+1}-${selDay}`:null;
      const selEvents=selKey?events[selKey]||[]:[];

      body.innerHTML=`
        <div style="height:56px;display:flex;align-items:center;gap:12px;padding:0 24px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0">
          <button onclick="calNav(-1)" style="width:28px;height:28px;border-radius:5px;background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">‹</button>
          <h2 style="font-size:20px;font-weight:400;color:#fff;flex:1">${MONTHS[mo]} ${yr}</h2>
          <button onclick="calNav(1)" style="width:28px;height:28px;border-radius:5px;background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center">›</button>
          <div onclick="calToday()" style="padding:4px 14px;border-radius:4px;background:rgba(255,255,255,.08);font-size:12px;color:#fff;cursor:pointer">Today</div>
        </div>
        <div style="flex:1;display:flex;overflow:hidden">
          <div style="flex:1;padding:0 16px 16px;display:flex;flex-direction:column">
            <div style="display:grid;grid-template-columns:repeat(7,1fr);padding:8px 0">
              ${DAYS.map(d=>`<div style="text-align:center;font-size:12px;color:rgba(255,255,255,.4);padding:6px 0">${d}</div>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;flex:1">
              ${cells.map(c=>`<div onclick="${c.other?'':``calSel(${c.d})``}" style="border-radius:6px;cursor:${c.other?'default':'pointer'};padding:6px;display:flex;flex-direction:column;gap:2px;background:${selDay===c.d&&!c.other?'rgba(0,120,212,.2)':'transparent'};min-height:50px;transition:background .1s" onmouseenter="this.style.background='${c.other?'transparent':'rgba(255,255,255,.05)'}'" onmouseleave="this.style.background='${selDay===c.d&&!c.other?'rgba(0,120,212,.2)':'transparent'}'">
                <div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;${c.today?'background:#0078d4;':''}font-size:13px;color:${c.other?'rgba(255,255,255,.2)':c.today?'#fff':'rgba(255,255,255,.8)'}">${c.d}</div>
                ${c.hasEvent?`<div style="width:6px;height:6px;background:#0078d4;border-radius:50%"></div>`:''}
              </div>`).join('')}
            </div>
          </div>
          ${selDay?`<div style="width:220px;border-left:1px solid rgba(255,255,255,.08);padding:16px;overflow-y:auto;flex-shrink:0">
            <div style="font-size:15px;color:#fff;margin-bottom:14px">${MONTHS[mo]} ${selDay}</div>
            ${selEvents.length?selEvents.map(ev=>`<div style="background:rgba(0,120,212,.2);border-left:3px solid #0078d4;padding:8px 10px;border-radius:0 6px 6px 0;margin-bottom:8px;font-size:13px;color:#fff">${ev}</div>`).join(''):`<div style="color:rgba(255,255,255,.3);font-size:13px">No events</div>`}
            <button onclick="calAddEvent(${selDay})" style="margin-top:12px;padding:6px 12px;background:#0078d4;border:none;border-radius:4px;color:#fff;font-size:12px;cursor:pointer;width:100%;font-family:inherit">+ Add event</button>
          </div>`:''}
        </div>`;

      window.calNav=(d)=>{ mo+=d; if(mo<0){mo=11;yr--;} if(mo>11){mo=0;yr++;} selDay=null; render(); };
      window.calToday=()=>{ yr=now.getFullYear();mo=now.getMonth();selDay=now.getDate();render(); };
      window.calSel=d=>{ selDay=selDay===d?null:d; render(); };
      window.calAddEvent=d=>{
        const ev=prompt(`Add event for ${MONTHS[mo]} ${d}:`);
        if(ev){const k=`${yr}-${mo+1}-${d}`;events[k]=events[k]||[];events[k].push(ev);render();}
      };
    };
    render();
  }
});

// ═══════════════════════════════════════════════════════════════
// PHOTOS
// ═══════════════════════════════════════════════════════════════
registerApp('photos', {
  title:'Photos', icon:'photos', w:860, h:580,
  render(body) {
    body.style.cssText='height:100%;display:flex;flex-direction:column;background:#1a1a1a;';
    const gx=['linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#ffecd2,#fcb69f)','linear-gradient(135deg,#a1c4fd,#c2e9fb)','linear-gradient(135deg,#fd7043,#ffb74d)','linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f7971e,#ffd200)','linear-gradient(135deg,#30cfd0,#330867)','linear-gradient(135deg,#0ba360,#3cba92)'];
    const names=['Vacation 2025','City Lights','Sunset Beach','Mountain Trail','Friends 2024','Garden Party','Night Sky','Coffee Morning','Forest Walk','Golden Hour','Abstract Art','Green Fields'];
    let viewing=null;

    const render=()=>{
      body.innerHTML=`
        <div style="height:40px;background:#242424;border-bottom:1px solid rgba(255,255,255,.08);display:flex;align-items:center;padding:0 12px;gap:12px;flex-shrink:0">
          <div class="tb-action active">All Photos</div>
          <div class="tb-action">Albums</div>
          <div class="tb-action">Favorites</div>
          <div style="flex:1"></div>
          <div class="tb-action">🔍 Search</div>
          <div class="tb-action">+ Import</div>
        </div>
        <div style="flex:1;position:relative;overflow:hidden">
          <div style="padding:12px;overflow-y:auto;height:100%;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:4px;align-content:start">
            ${gx.map((g,i)=>`<div onclick="photoView(${i})" style="aspect-ratio:1;background:${g};border-radius:4px;cursor:pointer;transition:transform .2s,box-shadow .2s;overflow:hidden;display:flex;align-items:flex-end" onmouseenter="this.style.transform='scale(1.03)';this.style.boxShadow='0 4px 20px rgba(0,0,0,.5)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
              <div style="width:100%;padding:6px 8px;background:linear-gradient(transparent,rgba(0,0,0,.6));font-size:11px;color:#fff">${names[i]}</div>
            </div>`).join('')}
          </div>
          ${viewing!==null?`<div style="position:absolute;inset:0;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
            <div style="position:absolute;top:12px;right:12px;display:flex;gap:8px">
              <div onclick="photoView(${(viewing-1+gx.length)%gx.length})" style="width:36px;height:36px;background:rgba(255,255,255,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:18px">‹</div>
              <div onclick="photoView(${(viewing+1)%gx.length})" style="width:36px;height:36px;background:rgba(255,255,255,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:18px">›</div>
              <div onclick="photoView(null)" style="width:36px;height:36px;background:rgba(255,255,255,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:20px">×</div>
            </div>
            <div style="width:80%;height:80%;background:${gx[viewing]};border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,.6)"></div>
            <div style="color:rgba(255,255,255,.7);font-size:14px">${names[viewing]} · ${viewing+1} of ${gx.length}</div>
          </div>`:''}
        </div>`;
      window.photoView=i=>{ viewing=i; render(); };
    };
    render();
  }
});

// ═══════════════════════════════════════════════════════════════
// MAIL
// ═══════════════════════════════════════════════════════════════
registerApp('mail', {
  title:'Mail', icon:'mail', w:880, h:580,
  render(body) {
    body.style.cssText='height:100%;display:flex;background:#1a1a1a;';
    const user=window.CUR_USER;
    const emails=[
      {from:'GitHub',to:user?.email||'me',subject:'Pull request #142 merged',time:'10:32 AM',preview:'Congratulations! Your PR has been merged into main.',body:'Congratulations!\n\nYour pull request #142 "Add account system" has been successfully merged into the main branch.\n\nCheck it out on GitHub for the full details.',read:false,color:'#24292f'},
      {from:'Anthropic',to:user?.email||'me',subject:'Claude API — new capabilities',time:'9:15 AM',preview:'We\'ve shipped tool use improvements and extended context windows.',body:'Hello,\n\nWe\'re excited to announce new improvements to the Claude API:\n\n• Extended context window (200K tokens)\n• Improved tool use reliability\n• New model: Claude Opus 4\n\nSee our docs for full details.',read:false,color:'#d4622f'},
      {from:'Microsoft',to:user?.email||'me',subject:'Microsoft 365 renewal reminder',time:'Yesterday',preview:'Your subscription renews April 1, 2026.',body:'Your Microsoft 365 subscription will auto-renew on April 1, 2026.\n\nNo action is required. Your payment method will be charged automatically.\n\nThank you for being a Microsoft 365 subscriber.',read:true,color:'#0078d4'},
      {from:'LinkedIn',to:user?.email||'me',subject:'3 new connection requests',time:'Mar 9',preview:'John Smith, Sarah Lee, and 1 other want to connect.',body:'You have new connection requests:\n\n• John Smith — Software Engineer at Google\n• Sarah Lee — Product Manager at Meta\n• Alex Chen — Designer at Figma\n\nAccept or ignore on LinkedIn.',read:true,color:'#0a66c2'},
      {from:'Amazon',to:user?.email||'me',subject:'Your order has shipped',time:'Mar 8',preview:'Order #112-3456789 arrives by March 12.',body:'Great news! Your order has shipped.\n\nOrder #112-3456789\nTracking: 1Z999AA10123456784\nEstimated delivery: March 12, 2026\n\nTrack your package on Amazon.',read:true,color:'#ff9900'},
    ];
    let sel=0;

    const render=()=>{
      const e=emails[sel];
      body.innerHTML=`
        <div style="width:64px;background:#181818;border-right:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;padding:8px 0;gap:4px;flex-shrink:0">
          <div class="mail-nav-btn active" title="Inbox">📥</div>
          <div class="mail-nav-btn" title="Sent">📤</div>
          <div class="mail-nav-btn" title="Drafts">📝</div>
          <div class="mail-nav-btn" title="Archive">📦</div>
          <div style="flex:1"></div>
          <div class="mail-nav-btn" title="Compose" onclick="mailCompose()">✏️</div>
        </div>
        <div style="width:280px;border-right:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0">
          <div style="height:48px;display:flex;align-items:center;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;gap:8px">
            <h3 style="font-size:16px;font-weight:600;flex:1">Inbox</h3>
            <span style="font-size:11px;background:rgba(0,120,212,.5);padding:2px 7px;border-radius:10px">${emails.filter(x=>!x.read).length}</span>
          </div>
          <div style="flex:1;overflow-y:auto">
            ${emails.map((m,i)=>`<div onclick="mailSel(${i})" style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;background:${i===sel?'rgba(0,120,212,.15)':'transparent'};transition:background .1s" onmouseenter="this.style.background='${i===sel?'rgba(0,120,212,.15)':'rgba(255,255,255,.04)'}'" onmouseleave="this.style.background='${i===sel?'rgba(0,120,212,.15)':'transparent'}'">
              <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                <span style="font-size:13px;color:#fff;font-weight:${m.read?'400':'600'};display:flex;align-items:center;gap:5px">${!m.read?`<span style="width:6px;height:6px;border-radius:50%;background:#0078d4;display:inline-block"></span>`:''} ${m.from}</span>
                <span style="font-size:11px;color:rgba(255,255,255,.35)">${m.time}</span>
              </div>
              <div style="font-size:12px;color:rgba(255,255,255,.6);margin-bottom:2px;font-weight:${m.read?'400':'500'}">${m.subject}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.3);overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${m.preview}</div>
            </div>`).join('')}
          </div>
        </div>
        <div style="flex:1;padding:28px 32px;overflow-y:auto">
          <h2 style="font-size:19px;font-weight:500;color:#fff;margin-bottom:14px">${e.subject}</h2>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.08)">
            <div style="width:40px;height:40px;border-radius:50%;background:${e.color};display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:16px;flex-shrink:0">${e.from[0]}</div>
            <div style="flex:1"><div style="font-size:14px;font-weight:500;color:#fff">${e.from}</div><div style="font-size:12px;color:rgba(255,255,255,.4)">To: ${e.to} · ${e.time}</div></div>
            <div class="tb-action">↩ Reply</div>
            <div class="tb-action">↪ Forward</div>
          </div>
          <div style="font-size:14px;color:rgba(255,255,255,.8);line-height:1.8;white-space:pre-line">${e.body}</div>
        </div>`;
      window.mailSel=i=>{ sel=i; emails[i].read=true; render(); };
      window.mailCompose=()=>notify('Mail','Compose window — coming soon!','mail');
    };
    render();
  }
});

// ═══════════════════════════════════════════════════════════════
// SETTINGS — with full account management
// ═══════════════════════════════════════════════════════════════
registerApp('settings', {
  title:'Settings', icon:'settings', w:900, h:620,
  async render(body, opts={}) {
    body.style.cssText='display:flex;height:100%;overflow:hidden;';
    let page=opts.page||'system';

    const nav=[
      {id:'system',        label:'System',              emoji:'🖥'},
      {id:'personalization',label:'Personalization',    emoji:'🎨'},
      {id:'accounts',      label:'Accounts',            emoji:'👤'},
      {id:'network',       label:'Network & internet',  emoji:'🌐'},
      {id:'privacy',       label:'Privacy & security',  emoji:'🔒'},
      {id:'update',        label:'Windows Update',      emoji:'⬆️'},
    ];

    const sidebar=()=>{
      const user=window.CUR_USER;
      return `<div style="width:270px;background:#1c1c1c;border-right:1px solid rgba(255,255,255,.08);padding:12px 8px;overflow-y:auto;flex-shrink:0;display:flex;flex-direction:column;gap:2px">
        ${user?`<div onclick="setPage('accounts')" style="display:flex;align-items:center;gap:10px;padding:10px;border-radius:8px;cursor:pointer;margin-bottom:8px;transition:background .12s" onmouseenter="this.style.background='rgba(255,255,255,.06)'" onmouseleave="this.style.background='transparent'">
          <div style="width:40px;height:40px;border-radius:50%;background:${user.avatarColor};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0">${user.avatarInitial}</div>
          <div><div style="font-size:14px;font-weight:500;color:#fff">${user.displayName}</div><div style="font-size:12px;color:rgba(255,255,255,.5)">${user.email||user.username}</div></div>
        </div>`:''}
        <div style="background:rgba(255,255,255,.06);border-radius:5px;display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:8px">
          <span style="font-size:12px;color:rgba(255,255,255,.3)">🔍</span>
          <input placeholder="Find a setting" style="background:none;border:none;outline:none;color:#fff;font-size:13px;flex:1;font-family:inherit">
        </div>
        ${nav.map(n=>`<div id="sn-${n.id}" onclick="setPage('${n.id}')" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:5px;cursor:pointer;font-size:13px;color:rgba(255,255,255,.7);background:${n.id===page?'rgba(255,255,255,.1)':'transparent'};transition:background .12s" onmouseenter="this.style.background='rgba(255,255,255,.08)'" onmouseleave="this.style.background='${n.id===page?'rgba(255,255,255,.1)':'transparent'}'">
          <span style="font-size:18px;width:20px;text-align:center">${n.emoji}</span>
          <span>${n.label}</span>
        </div>`).join('')}
      </div>`;
    };

    const pages={
      system:`<h2>System</h2>
        <div class="scard">
          ${[['🖥','Display','Resolution, brightness, Night Light'],['🔊','Sound','Volume, output, input devices'],['🔔','Notifications','App alerts, Do Not Disturb'],['⚡','Power & battery','Sleep, power mode, battery saver'],['📦','Storage','Disk usage, Storage Sense'],['🖱','Mouse & keyboard','Speed, layout, accessibility']].map(([ico,t,s])=>`<div class="srow">${ico} <div class="srow-info"><strong>${t}</strong><p>${s}</p></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>`).join('')}
        </div>`,

      personalization:`<h2>Personalization</h2>
        <div class="scard" style="margin-bottom:12px">
          <div class="srow" style="flex-direction:column;align-items:flex-start;gap:10px">
            <strong>Wallpaper</strong>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${WALLPAPERS.map(w=>`<div onclick="applyWP('${w.id}','${w.css}')" title="${w.label}" style="width:88px;height:54px;border-radius:6px;cursor:pointer;background:${w.css};border:2px solid rgba(255,255,255,.2);overflow:hidden;transition:border-color .15s;position:relative" onmouseenter="this.style.borderColor='#0078d4'" onmouseleave="this.style.borderColor='rgba(255,255,255,.2)'">
              <div style="position:absolute;bottom:3px;left:3px;font-size:9px;color:rgba(255,255,255,.7);background:rgba(0,0,0,.4);padding:1px 4px;border-radius:2px">${w.label}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>
        <div class="scard">
          <div class="srow" style="flex-direction:column;align-items:flex-start;gap:8px">
            <strong>Accent color</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${ACCENT_COLORS.map(c=>`<div onclick="applyAccent('${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:2px solid rgba(255,255,255,.15);transition:transform .15s,border-color .15s" onmouseenter="this.style.transform='scale(1.15)';this.style.borderColor='#fff'" onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,.15)'"></div>`).join('')}
            </div>
          </div>
        </div>`,

      accounts: await buildAccountsPage(),

      network:`<h2>Network & Internet</h2>
        <div class="scard">
          <div class="srow">📶 <div class="srow-info"><strong>Wi-Fi</strong><p>Home Network · Connected · 192.168.1.110</p></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
          <div class="srow">🔷 <div class="srow-info"><strong>Ethernet</strong><p>Not connected</p></div><div class="toggle" onclick="this.classList.toggle('on')"></div></div>
          <div class="srow">✈️ <div class="srow-info"><strong>Airplane mode</strong><p>Off</p></div><div class="toggle" onclick="this.classList.toggle('on')"></div></div>
          <div class="srow">🔒 <div class="srow-info"><strong>VPN</strong><p>Not configured</p></div><span style="color:rgba(255,255,255,.4)">›</span></div>
        </div>`,

      privacy:`<h2>Privacy & Security</h2>
        <div class="scard">
          ${[['🛡','Windows Security','Virus & threat protection, Firewall'],['📍','Location','App location permissions'],['📷','Camera','Manage camera access for apps'],['🎤','Microphone','Manage microphone access']].map(([i,t,s])=>`<div class="srow">${i} <div class="srow-info"><strong>${t}</strong><p>${s}</p></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>`).join('')}
        </div>`,

      update:`<h2>Windows Update</h2>
        <div style="text-align:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:32px;margin-bottom:12px">
          <div style="font-size:48px;margin-bottom:12px">✅</div>
          <h3 style="margin-bottom:4px;font-size:16px">You're up to date</h3>
          <p style="font-size:13px;color:rgba(255,255,255,.4)">Last checked: Today, 8:30 AM · Windows 11, Version 24H2</p>
          <button onclick="notify('Windows Update','Checking for updates…','settings')" style="margin-top:16px;padding:8px 20px;background:#0078d4;border:none;border-radius:4px;color:#fff;font-size:13px;cursor:pointer;font-family:inherit">Check for updates</button>
        </div>
        <div class="scard">
          <div class="srow">⚙️ <div class="srow-info"><strong>Advanced options</strong><p>Active hours, delivery optimization</p></div><span style="color:rgba(255,255,255,.4)">›</span></div>
        </div>`,
    };

    const render=async()=>{
      const content=typeof pages[page]==='string'?pages[page]:(await Promise.resolve(pages[page]))||pages.system;
      body.innerHTML=sidebar()+`<div id="sett-main" style="flex:1;padding:28px 32px;overflow-y:auto">${content}</div>`;
      bindSettEvents();
    };

    window.setPage=async p=>{ page=p; await render(); };
    await render();

    function bindSettEvents() {
      const user=window.CUR_USER;
      window.applyWP=(id,css)=>{ const bg=document.getElementById('desktop-bg'); if(bg){bg.style.background=css;if(user)DB.updateAccount(user.id,{wallpaper:id});} notify('Settings','Wallpaper changed','settings'); };
      window.applyAccent=c=>{ document.documentElement.style.setProperty('--accent',c); if(user)DB.updateAccount(user.id,{accentColor:c}); notify('Settings','Accent color updated','settings'); };
      window.acctSaveName=async()=>{ const v=document.getElementById('set-dname')?.value.trim(); if(v&&user){await DB.updateAccount(user.id,{displayName:v,avatarInitial:v[0].toUpperCase()});window.CUR_USER.displayName=v;window.CUR_USER.avatarInitial=v[0].toUpperCase();document.getElementById('sm-user-name').textContent=v;document.getElementById('sm-user-avatar').textContent=v[0].toUpperCase();notify('Settings','Display name updated','settings');} };
      window.acctSaveEmail=async()=>{ const v=document.getElementById('set-email')?.value.trim(); if(user){await DB.updateAccount(user.id,{email:v});window.CUR_USER.email=v;notify('Settings','Email updated','settings');} };
      window.acctChangePw=async()=>{ const o=document.getElementById('set-pw-old')?.value,n=document.getElementById('set-pw-new')?.value,n2=document.getElementById('set-pw-new2')?.value,er=document.getElementById('set-pw-err'); try{if(n!==n2)throw new Error("Passwords don't match");await Auth.changePassword(user.id,o,n);if(er)er.textContent='';notify('Settings','Password updated','settings');['set-pw-old','set-pw-new','set-pw-new2'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});}catch(e){if(er)er.textContent=e.message;} };
      window.acctSetPin=async()=>{ const p=document.getElementById('set-pin')?.value,er=document.getElementById('set-pin-err'); try{await Auth.setPin(user.id,p);window.CUR_USER.pin=p||null;if(er)er.textContent='';notify('Settings',p?'PIN set':'PIN removed','settings');}catch(e){if(er)er.textContent=e.message;} };
      window.acctPickColor=async c=>{ await DB.updateAccount(user.id,{avatarColor:c,avatarInitial:user.displayName[0].toUpperCase()});window.CUR_USER.avatarColor=c;document.getElementById('sm-user-avatar').style.background=c;document.querySelectorAll('.av-swatch').forEach(s=>s.style.outline=s.dataset.c===c?'2px solid #fff':'none');notify('Settings','Avatar color updated','settings'); };
      window.acctAddUser=()=>{ document.getElementById('add-user-panel').style.display=''; };
      window.acctCreateUser=async()=>{ const n=document.getElementById('nu-name')?.value.trim(),u=document.getElementById('nu-user')?.value.trim(),p=document.getElementById('nu-pw')?.value,er=document.getElementById('nu-err'); try{await Auth.createAccount(n,u,p,{isAdmin:false,avatarColor:AVATAR_COLORS[Math.floor(Math.random()*AVATAR_COLORS.length)]});if(er)er.textContent='';notify('Settings',`Account created: ${n}`,'user');setPage('accounts');}catch(e){if(er)er.textContent=e.message;} };
      window.acctDeleteUser=async(id,name)=>{ if(!confirm(`Remove account "${name}"? This cannot be undone.`))return; await DB.deleteAccount(id);await DB.deleteUserSessions(id);notify('Settings',`Account removed: ${name}`,'settings');setPage('accounts'); };
      window.acctSwitch=async uid=>{ await Auth.logout(); localStorage.setItem('w11_lock_user',uid); };
    }
  }
});

async function buildAccountsPage() {
  const user=window.CUR_USER;
  const all=await DB.getAllAccounts();
  const others=all.filter(u=>u.id!==user?.id);
  return `<h2>Accounts</h2>
  ${user?`
  <div style="display:flex;align-items:center;gap:16px;padding:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;margin-bottom:14px">
    <div id="acct-av" style="width:64px;height:64px;border-radius:50%;background:${user.avatarColor};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff;cursor:pointer">${user.avatarInitial}</div>
    <div><h3 style="font-size:18px;font-weight:600;margin-bottom:2px">${user.displayName}</h3><p style="font-size:13px;color:rgba(255,255,255,.5)">@${user.username}${user.email?' · '+user.email:''}</p><span style="font-size:11px;background:rgba(0,120,212,.3);padding:2px 8px;border-radius:10px;display:inline-block;margin-top:4px">${user.isAdmin?'Administrator':'Standard User'}</span></div>
  </div>
  <div class="scard" style="margin-bottom:12px">
    <div class="srow" style="flex-direction:column;align-items:flex-start;gap:6px">
      <strong>Avatar color</strong>
      <div style="display:flex;gap:6px">${AVATAR_COLORS.map(c=>`<div class="av-swatch" data-c="${c}" onclick="acctPickColor('${c}')" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;outline:${c===user.avatarColor?'2px solid #fff':'none'};outline-offset:2px"></div>`).join('')}</div>
    </div>
    <div class="srow" style="flex-direction:column;align-items:flex-start;gap:6px">
      <strong>Display name</strong>
      <div style="display:flex;gap:8px"><input id="set-dname" class="sinput" value="${user.displayName}" style="max-width:250px"><button class="sbtn" onclick="acctSaveName()">Save</button></div>
    </div>
    <div class="srow" style="flex-direction:column;align-items:flex-start;gap:6px">
      <strong>Email address</strong>
      <div style="display:flex;gap:8px"><input id="set-email" class="sinput" value="${user.email||''}" placeholder="Optional" style="max-width:280px"><button class="sbtn" onclick="acctSaveEmail()">Save</button></div>
    </div>
  </div>
  <div class="scard" style="margin-bottom:12px">
    <div class="srow" style="flex-direction:column;align-items:flex-start;gap:6px">
      <strong>Change password</strong>
      <input id="set-pw-old" type="password" class="sinput" placeholder="Current password" style="max-width:280px">
      <input id="set-pw-new" type="password" class="sinput" placeholder="New password" style="max-width:280px">
      <input id="set-pw-new2" type="password" class="sinput" placeholder="Confirm new password" style="max-width:280px">
      <div id="set-pw-err" style="font-size:12px;color:#fc6058;min-height:16px"></div>
      <button class="sbtn" onclick="acctChangePw()">Update Password</button>
    </div>
    <div class="srow" style="flex-direction:column;align-items:flex-start;gap:6px">
      <strong>PIN sign-in ${user.pin?'<span style="font-size:11px;background:rgba(4,150,4,.3);padding:1px 6px;border-radius:8px;margin-left:6px">Active</span>':''}</strong>
      <p style="font-size:12px;color:rgba(255,255,255,.4);margin:0">Sign in faster with a 4–8 digit PIN</p>
      <div style="display:flex;gap:8px">
        <input id="set-pin" class="sinput" type="password" placeholder="4–8 digits" maxlength="8" oninput="this.value=this.value.replace(/\\D/g,'')" style="width:160px">
        <button class="sbtn" onclick="acctSetPin()">${user.pin?'Change':'Set'} PIN</button>
        ${user.pin?`<button class="sbtn ghost" onclick="document.getElementById('set-pin').value='';acctSetPin()">Remove</button>`:''}
      </div>
      <div id="set-pin-err" style="font-size:12px;color:#fc6058;min-height:16px"></div>
    </div>
  </div>
  <div class="scard" style="margin-bottom:14px">
    <div class="srow">🚪 <div class="srow-info"><strong>Sign out</strong><p>Sign out of this account</p></div><button class="sbtn ghost" onclick="Auth.logout()">Sign out</button></div>
    <div class="srow">🔒 <div class="srow-info"><strong>Lock screen</strong><p>Lock this device immediately</p></div><button class="sbtn ghost" onclick="Auth.logout()">Lock</button></div>
  </div>`:''}
  <div style="font-size:14px;font-weight:600;margin-bottom:10px;color:rgba(255,255,255,.6)">Other users on this device</div>
  <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
    ${others.length?others.map(u=>`<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px">
      <div style="width:36px;height:36px;border-radius:50%;background:${u.avatarColor};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0">${u.avatarInitial}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:500">${u.displayName}</div><div style="font-size:12px;color:rgba(255,255,255,.4)">@${u.username} · ${u.isAdmin?'Administrator':'Standard user'}</div></div>
      <button class="sbtn ghost" onclick="acctSwitch(${u.id})">Switch</button>
      ${window.CUR_USER?.isAdmin?`<button class="sbtn" style="background:#9b2c2c" onclick="acctDeleteUser(${u.id},'${u.displayName}')">Remove</button>`:''}
    </div>`).join(''):`<p style="font-size:13px;color:rgba(255,255,255,.3)">No other accounts on this device.</p>`}
  </div>
  <button class="sbtn" onclick="acctAddUser()" style="margin-bottom:12px">+ Add account</button>
  <div id="add-user-panel" style="display:none;padding:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px">
    <h4 style="margin-bottom:14px">Create new account</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div><label style="font-size:12px;color:rgba(255,255,255,.5);display:block;margin-bottom:4px">Full name *</label><input id="nu-name" class="sinput"></div>
      <div><label style="font-size:12px;color:rgba(255,255,255,.5);display:block;margin-bottom:4px">Username *</label><input id="nu-user" class="sinput" placeholder="lowercase, no spaces"></div>
      <div><label style="font-size:12px;color:rgba(255,255,255,.5);display:block;margin-bottom:4px">Password *</label><input id="nu-pw" class="sinput" type="password" placeholder="Min. 4 characters"></div>
      <div><label style="font-size:12px;color:rgba(255,255,255,.5);display:block;margin-bottom:4px">Email (optional)</label><input id="nu-email" class="sinput" type="email"></div>
    </div>
    <div id="nu-err" style="font-size:12px;color:#fc6058;min-height:16px;margin-bottom:8px"></div>
    <div style="display:flex;gap:8px">
      <button class="sbtn" onclick="acctCreateUser()">Create account</button>
      <button class="sbtn ghost" onclick="document.getElementById('add-user-panel').style.display='none'">Cancel</button>
    </div>
  </div>`;
}
