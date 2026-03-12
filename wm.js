/* Win11OS — Window Manager */

const APP_REGISTRY = {}; // id → definition
function registerApp(id, def) { APP_REGISTRY[id] = def; }

const WM = {
  _z: 200,
  _wins: {},

  open(id, opts={}) {
    // If already open, focus (or restore)
    if (WM._wins[id]) {
      const w = WM._wins[id];
      w.el.classList.remove('minimized');
      WM.focus(id);
      return;
    }
    const def = APP_REGISTRY[id];
    if (!def) { console.warn('No app:', id); return; }

    const W = Math.min(def.w||800, window.innerWidth-60);
    const H = Math.min(def.h||560, window.innerHeight-80);
    const n = Object.keys(WM._wins).length;
    const x = Math.max(10, (window.innerWidth-W)/2 + n*22);
    const y = Math.max(0,  (window.innerHeight-48-H)/2 + n*22);

    const el = document.createElement('div');
    el.className = 'win';
    el.id = 'win-'+id;
    el.style.cssText = `left:${x}px;top:${y}px;width:${W}px;height:${H}px;z-index:${++WM._z}`;
    el.innerHTML = `
      <div class="win-tb" id="wtb-${id}">
        <span class="win-ico">${icon(def.icon,16)}</span>
        <span class="win-title" id="wtitle-${id}">${opts.title||def.title}</span>
        <div class="win-ctrls">
          <div class="wctrl" onclick="WM.minimize('${id}')" title="Minimize"><svg viewBox="0 0 10 1" width="10"><rect width="10" height="1" fill="rgba(255,255,255,.8)"/></svg></div>
          <div class="wctrl" onclick="WM.toggleMax('${id}')" title="Maximize"><svg viewBox="0 0 10 10" width="10" height="10"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1"/></svg></div>
          <div class="wctrl close" onclick="WM.close('${id}')" title="Close"><svg viewBox="0 0 10 10" width="10" height="10"><line x1="1" y1="1" x2="9" y2="9" stroke="rgba(255,255,255,.8)" stroke-width="1.4"/><line x1="9" y1="1" x2="1" y2="9" stroke="rgba(255,255,255,.8)" stroke-width="1.4"/></svg></div>
        </div>
      </div>
      <div class="win-body" id="wb-${id}"></div>
      <div class="rsz rsz-e" onmousedown="WM._rsz(event,'${id}','e')"></div>
      <div class="rsz rsz-s" onmousedown="WM._rsz(event,'${id}','s')"></div>
      <div class="rsz rsz-se" onmousedown="WM._rsz(event,'${id}','se')"></div>`;

    document.body.appendChild(el);
    WM._wins[id] = {el, max:false, prev:null};

    WM._drag(document.getElementById('wtb-'+id), el, id);
    el.addEventListener('mousedown', ()=>WM.focus(id), true);

    // Render app content
    const body = document.getElementById('wb-'+id);
    Promise.resolve(def.render(body, opts)).catch(e=>console.error('App render error:',e));

    Taskbar.add(id, def, opts.title);
    WM.focus(id);
    closeMenus();
  },

  focus(id) {
    Object.values(WM._wins).forEach(w=>w.el.classList.remove('win-focused'));
    if (WM._wins[id]) { WM._wins[id].el.style.zIndex=++WM._z; WM._wins[id].el.classList.add('win-focused'); }
    Taskbar.setActive(id);
  },

  minimize(id) {
    if (!WM._wins[id]) return;
    WM._wins[id].el.classList.add('minimized');
    Taskbar.setActive(null);
  },

  toggleMax(id) {
    if (!WM._wins[id]) return;
    const w = WM._wins[id];
    if (w.max) {
      w.el.classList.remove('win-max');
      if (w.prev) { const r=w.prev; Object.assign(w.el.style,{left:r.l+'px',top:r.t+'px',width:r.w+'px',height:r.h+'px'}); }
      w.max = false;
    } else {
      w.prev = {l:w.el.offsetLeft, t:w.el.offsetTop, w:w.el.offsetWidth, h:w.el.offsetHeight};
      w.el.classList.add('win-max');
      w.max = true;
    }
  },

  close(id) {
    if (!WM._wins[id]) return;
    WM._wins[id].el.remove();
    delete WM._wins[id];
    Taskbar.remove(id);
  },

  _drag(handle, el, id) {
    let ox,oy,sx,sy,on=false;
    handle.addEventListener('mousedown', e=>{
      if (e.target.closest('.wctrl')) return;
      on=true; sx=e.clientX; sy=e.clientY; ox=el.offsetLeft; oy=el.offsetTop;
      if (WM._wins[id].max) {
        const ratio = e.clientX/window.innerWidth;
        const pw = WM._wins[id].prev?.w||800;
        el.classList.remove('win-max'); WM._wins[id].max=false;
        ox = Math.round(e.clientX - pw*ratio); oy=0;
        el.style.width=pw+'px'; el.style.height=(WM._wins[id].prev?.h||560)+'px';
        sx=e.clientX; sy=e.clientY;
      }
      e.preventDefault();
    });
    document.addEventListener('mousemove', e=>{
      if (!on) return;
      let nx=ox+(e.clientX-sx), ny=oy+(e.clientY-sy);
      nx=Math.max(-el.offsetWidth+100, Math.min(nx, window.innerWidth-100));
      ny=Math.max(0, Math.min(ny, window.innerHeight-60));
      el.style.left=nx+'px'; el.style.top=ny+'px';
    });
    document.addEventListener('mouseup', ()=>{on=false;});
    // Double-click to maximize
    handle.addEventListener('dblclick', e=>{ if(!e.target.closest('.wctrl')) WM.toggleMax(id); });
  },

  _rsz(e, id, dir) {
    e.preventDefault(); e.stopPropagation();
    const el=WM._wins[id].el, sx=e.clientX, sy=e.clientY, sw=el.offsetWidth, sh=el.offsetHeight;
    const mv=ev=>{ if(dir==='e'||dir==='se')el.style.width=Math.max(320,sw+ev.clientX-sx)+'px'; if(dir==='s'||dir==='se')el.style.height=Math.max(200,sh+ev.clientY-sy)+'px'; };
    const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
  },

  taskbarClick(id) {
    if (!WM._wins[id]) { WM.open(id); return; }
    const w = WM._wins[id];
    if (w.el.classList.contains('minimized'))  { w.el.classList.remove('minimized'); WM.focus(id); }
    else if (w.el.classList.contains('win-focused')) WM.minimize(id);
    else WM.focus(id);
  }
};

/* ─── Taskbar ──────────────────────────────────────────────────────────────── */
const Taskbar = {
  add(id, def, customTitle) {
    const c = document.getElementById('tb-apps');
    if (!c || c.querySelector(`[data-id="${id}"]`)) return;
    const btn = document.createElement('div');
    btn.className='tb-app-btn'; btn.dataset.id=id; btn.title=customTitle||def.title;
    btn.innerHTML=`<div class="tb-app-ico">${icon(def.icon,22)}</div>`;
    btn.addEventListener('click', ()=>WM.taskbarClick(id));
    c.appendChild(btn);
  },
  remove(id) { document.querySelector(`[data-id="${id}"]`)?.remove(); },
  setActive(id) {
    document.querySelectorAll('.tb-app-btn').forEach(b=>b.classList.toggle('active', b.dataset.id===id));
  }
};

/* ─── Menus ────────────────────────────────────────────────────────────────── */
function toggleStart(e) {
  e?.stopPropagation();
  const sm=document.getElementById('start-menu'), sb=document.getElementById('start-btn');
  const open=sm.classList.toggle('open');
  sb.classList.toggle('open',open);
  if (open) { closePanel('quick-settings'); setTimeout(()=>document.getElementById('sm-search')?.focus(),100); }
}

function toggleQS(e) {
  e?.stopPropagation();
  const qs=document.getElementById('quick-settings');
  const open=qs.classList.toggle('open');
  if (open) closePanel('start-menu');
}

function closePanel(id) {
  document.getElementById(id)?.classList.remove('open');
  if (id==='start-menu') document.getElementById('start-btn')?.classList.remove('open');
}

function closeMenus(e) {
  if (!e?.target.closest('#start-menu,#start-btn')) closePanel('start-menu');
  if (!e?.target.closest('#quick-settings,#tray-right')) closePanel('quick-settings');
  document.querySelectorAll('.ctx').forEach(m=>m.remove());
  document.querySelectorAll('.desk-icon.sel').forEach(d=>d.classList.remove('sel'));
}

/* ─── Notifications ─────────────────────────────────────────────────────────── */
function notify(title, body, ico='settings') {
  const c=document.getElementById('notif-area'); if(!c) return;
  const n=document.createElement('div'); n.className='notif';
  n.innerHTML=`<div class="notif-ico">${icon(ico,18)}</div><div class="notif-txt"><strong>${title}</strong><p>${body}</p></div><div class="notif-x" onclick="this.parentElement.remove()">×</div>`;
  c.appendChild(n);
  setTimeout(()=>{ n.style.opacity='0'; n.style.transform='translateX(360px)'; setTimeout(()=>n.remove(),350); }, 4500);
}

/* ─── Clock ─────────────────────────────────────────────────────────────────── */
function tickClock() {
  const el=document.getElementById('tb-clock'); if(!el) return;
  const d=new Date();
  el.innerHTML=`${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}<br>${d.toLocaleDateString([],{month:'numeric',day:'numeric',year:'numeric'})}`;
}

/* ─── Right-click desktop ───────────────────────────────────────────────────── */
function deskCtx(e) {
  e.preventDefault(); closeMenus();
  const m=document.createElement('div'); m.className='ctx';
  m.style.cssText=`left:${Math.min(e.clientX,innerWidth-220)}px;top:${Math.min(e.clientY,innerHeight-220)}px`;
  m.innerHTML=`
    <div class="ctx-row" onclick="closeMenus()">📋 View</div>
    <div class="ctx-row" onclick="closeMenus()">↕️ Sort by</div>
    <div class="ctx-sep"></div>
    <div class="ctx-row" onclick="closeMenus()">🔄 Refresh</div>
    <div class="ctx-row" onclick="WM.open('terminal');closeMenus()">💻 Open in Terminal</div>
    <div class="ctx-sep"></div>
    <div class="ctx-row" onclick="WM.open('settings',{page:'personalization'});closeMenus()">🎨 Personalize</div>
    <div class="ctx-row" onclick="WM.open('settings');closeMenus()">⚙️ Display settings</div>`;
  document.body.appendChild(m);
}
