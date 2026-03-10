/**
 * Win11OS – Window Manager & Taskbar
 */

const WM = (() => {
  let zTop   = 200;
  const wins = {};         // id → { el, maximized, prevRect }
  const APPS = {};         // registered app definitions

  // ── Register ────────────────────────────────────────────────────────────────
  function register(id, def) { APPS[id] = def; }

  // ── Open ────────────────────────────────────────────────────────────────────
  async function open(id, opts = {}) {
    if (wins[id]) {
      if (wins[id].el.classList.contains('minimized')) {
        wins[id].el.classList.remove('minimized');
      }
      focus(id);
      return;
    }
    const def = APPS[id];
    if (!def) { console.warn('Unknown app:', id); return; }

    const W = Math.min(def.w || 800, window.innerWidth - 80);
    const H = Math.min(def.h || 560, window.innerHeight - 100);
    const offset = Object.keys(wins).length * 24;
    const x = Math.max(10, Math.round((window.innerWidth - W) / 2) + offset);
    const y = Math.max(0,  Math.round((window.innerHeight - 48 - H) / 2) + offset);

    const el = document.createElement('div');
    el.className = 'win';
    el.id = 'win-' + id;
    el.style.cssText = `left:${x}px;top:${y}px;width:${W}px;height:${H}px;z-index:${++zTop}`;

    const titleHtml = opts.title || def.title;
    el.innerHTML = `
      <div class="win-titlebar" id="wtb-${id}">
        <div class="win-icon">${icon(def.icon, 16)}</div>
        <div class="win-title">${titleHtml}</div>
        <div class="win-controls">
          <div class="win-ctrl" onclick="WM.minimize('${id}')" title="Minimize">
            <svg viewBox="0 0 10 1" width="10" height="1"><rect width="10" height="1" fill="rgba(255,255,255,.8)"/></svg>
          </div>
          <div class="win-ctrl" onclick="WM.toggleMax('${id}')" title="Maximize/Restore">
            <svg viewBox="0 0 10 10" width="10" height="10"><rect x=".5" y=".5" width="9" height="9" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1"/></svg>
          </div>
          <div class="win-ctrl close" onclick="WM.close('${id}')" title="Close">
            <svg viewBox="0 0 10 10" width="10" height="10">
              <line x1="1" y1="1" x2="9" y2="9" stroke="rgba(255,255,255,.8)" stroke-width="1.4"/>
              <line x1="9" y1="1" x2="1" y2="9" stroke="rgba(255,255,255,.8)" stroke-width="1.4"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="win-content" id="wc-${id}"></div>
      <div class="resize-e" onmousedown="WM._resizeStart(event,'${id}','e')"></div>
      <div class="resize-s" onmousedown="WM._resizeStart(event,'${id}','s')"></div>
      <div class="resize-se" onmousedown="WM._resizeStart(event,'${id}','se')"></div>
    `;

    document.body.appendChild(el);
    wins[id] = { el, maximized: false, prevRect: null };

    // Drag titlebar
    _setupDrag(document.getElementById('wtb-' + id), el, id);
    el.addEventListener('mousedown', () => focus(id), true);

    // Snap on edge drag
    _setupSnap(el, id);

    // Render content
    await def.render(document.getElementById('wc-' + id), opts);

    // Taskbar
    Taskbar.add(id, def, opts.title);
    focus(id);
    closeAllMenus();
  }

  // ── Focus ────────────────────────────────────────────────────────────────────
  function focus(id) {
    Object.values(wins).forEach(w => w.el.classList.remove('focused'));
    if (wins[id]) {
      wins[id].el.style.zIndex = ++zTop;
      wins[id].el.classList.add('focused');
    }
    Taskbar.setActive(id);
  }

  // ── Minimize ────────────────────────────────────────────────────────────────
  function minimize(id) {
    if (!wins[id]) return;
    wins[id].el.classList.add('minimized');
    Taskbar.setActive(null);
  }

  // ── Maximize/Restore ────────────────────────────────────────────────────────
  function toggleMax(id) {
    if (!wins[id]) return;
    const w = wins[id];
    if (w.maximized) {
      w.el.classList.remove('maximized');
      if (w.prevRect) {
        const r = w.prevRect;
        w.el.style.left   = r.left + 'px';
        w.el.style.top    = r.top + 'px';
        w.el.style.width  = r.width + 'px';
        w.el.style.height = r.height + 'px';
      }
      w.maximized = false;
    } else {
      w.prevRect = { left: w.el.offsetLeft, top: w.el.offsetTop, width: w.el.offsetWidth, height: w.el.offsetHeight };
      w.el.classList.add('maximized');
      w.maximized = true;
    }
  }

  // ── Close ────────────────────────────────────────────────────────────────────
  function close(id) {
    if (!wins[id]) return;
    wins[id].el.remove();
    delete wins[id];
    Taskbar.remove(id);
  }

  // ── Drag ────────────────────────────────────────────────────────────────────
  function _setupDrag(handle, el, id) {
    let ox, oy, sx, sy, dragging = false;
    handle.addEventListener('mousedown', e => {
      if (e.target.closest('.win-ctrl')) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      // Un-maximize on drag
      if (wins[id].maximized) {
        const ratio = e.clientX / window.innerWidth;
        const pw = wins[id].prevRect?.width || 800;
        wins[id].el.classList.remove('maximized');
        wins[id].maximized = false;
        ox = Math.round(e.clientX - pw * ratio);
        oy = 0;
        el.style.width  = pw + 'px';
        el.style.height = (wins[id].prevRect?.height || 560) + 'px';
        sx = e.clientX; sy = e.clientY;
      }
      e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      nx = Math.max(-el.offsetWidth + 120, Math.min(nx, window.innerWidth - 120));
      ny = Math.max(0, Math.min(ny, window.innerHeight - 60));
      el.style.left = nx + 'px';
      el.style.top  = ny + 'px';
    });
    document.addEventListener('mouseup', () => { dragging = false; });
  }

  // ── Snap ───────────────────────────────────────────────────────────────────
  function _setupSnap(el, id) {
    // Double-click titlebar → maximize
    el.querySelector('.win-titlebar').addEventListener('dblclick', e => {
      if (e.target.closest('.win-ctrl')) return;
      toggleMax(id);
    });
  }

  // ── Resize ──────────────────────────────────────────────────────────────────
  function _resizeStart(e, id, dir) {
    e.preventDefault(); e.stopPropagation();
    const el = wins[id].el;
    const sx = e.clientX, sy = e.clientY;
    const sw = el.offsetWidth, sh = el.offsetHeight;
    const onMove = ev => {
      if (dir === 'se' || dir === 'e') el.style.width  = Math.max(320, sw + ev.clientX - sx) + 'px';
      if (dir === 'se' || dir === 's') el.style.height = Math.max(200, sh + ev.clientY - sy) + 'px';
    };
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Toggle minimize from taskbar ────────────────────────────────────────────
  function taskbarClick(id) {
    if (!wins[id]) { open(id); return; }
    if (wins[id].el.classList.contains('minimized')) {
      wins[id].el.classList.remove('minimized');
      focus(id);
    } else if (wins[id].el.classList.contains('focused')) {
      minimize(id);
    } else {
      focus(id);
    }
  }

  return { register, open, focus, minimize, toggleMax, close, taskbarClick, _resizeStart, wins };
})();

// ── Taskbar ──────────────────────────────────────────────────────────────────
const Taskbar = (() => {
  const container = () => document.getElementById('taskbar-apps');

  function add(id, def, customTitle) {
    const c = container();
    if (!c || document.querySelector(`.tb-app[data-id="${id}"]`)) return;
    const btn = document.createElement('div');
    btn.className = 'tb-btn tb-app active';
    btn.dataset.id = id;
    btn.title = customTitle || def.title;
    btn.innerHTML = `<div style="width:22px;height:22px;display:flex;align-items:center;justify-content:center">${icon(def.icon, 22)}</div>`;
    btn.addEventListener('click', () => WM.taskbarClick(id));
    c.appendChild(btn);
  }

  function remove(id) {
    document.querySelector(`.tb-app[data-id="${id}"]`)?.remove();
  }

  function setActive(id) {
    document.querySelectorAll('.tb-app').forEach(b => {
      b.classList.toggle('active', b.dataset.id === id);
    });
  }

  return { add, remove, setActive };
})();

// ── Start menu ───────────────────────────────────────────────────────────────
function toggleStartMenu(e) {
  e?.stopPropagation();
  const sm = document.getElementById('start-menu');
  const sb = document.getElementById('start-btn');
  const isOpen = sm.classList.toggle('open');
  sb.classList.toggle('open', isOpen);
  if (isOpen) {
    document.getElementById('quick-settings')?.classList.remove('open');
    document.getElementById('sm-search-input')?.focus();
  }
}

function toggleQuickSettings(e) {
  e?.stopPropagation();
  const qs = document.getElementById('quick-settings');
  const isOpen = qs.classList.toggle('open');
  if (isOpen) {
    document.getElementById('start-menu')?.classList.remove('open');
    document.getElementById('start-btn')?.classList.remove('open');
  }
}

function closeAllMenus(e) {
  if (!e?.target?.closest('#start-menu, #start-btn')) {
    document.getElementById('start-menu')?.classList.remove('open');
    document.getElementById('start-btn')?.classList.remove('open');
  }
  if (!e?.target?.closest('#quick-settings, #tray-zone')) {
    document.getElementById('quick-settings')?.classList.remove('open');
  }
  document.querySelectorAll('.ctx-menu').forEach(m => m.remove());
  document.querySelectorAll('.desktop-icon').forEach(d => d.classList.remove('selected'));
}

// ── Notifications ────────────────────────────────────────────────────────────
function notify(title, body, iconId = 'settings', onClick = null) {
  const c = document.getElementById('notif-container');
  if (!c) return;
  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `
    <div class="notif-icon">${icon(iconId, 20)}</div>
    <div class="notif-body"><h4>${title}</h4><p>${body}</p></div>
    <div class="notif-dismiss">×</div>
  `;
  n.querySelector('.notif-dismiss').onclick = e => { e.stopPropagation(); dismiss(n); };
  if (onClick) n.addEventListener('click', onClick);
  c.appendChild(n);
  setTimeout(() => dismiss(n), 5000);
}

function dismiss(el) {
  el.style.transition = 'all .3s';
  el.style.opacity = '0';
  el.style.transform = 'translateX(340px)';
  setTimeout(() => el.remove(), 300);
}

// ── Clock ────────────────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('tb-clock');
  if (!el) return;
  const now  = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });
  el.innerHTML = `${time}<br>${date}`;
}

// ── Desktop right-click ──────────────────────────────────────────────────────
function desktopContextMenu(e) {
  e.preventDefault();
  closeAllMenus();
  const m = document.createElement('div');
  m.className = 'ctx-menu';
  m.style.cssText = `left:${clamp(e.clientX,0,window.innerWidth-230)}px;top:${clamp(e.clientY,0,window.innerHeight-240)}px`;
  m.innerHTML = `
    <div class="ctx-item" onclick="closeAllMenus()"><svg viewBox="0 0 24 24">${NAV_ICONS.list}</svg>View</div>
    <div class="ctx-item" onclick="closeAllMenus()"><svg viewBox="0 0 24 24">${NAV_ICONS.sort}</svg>Sort by</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="closeAllMenus()"><svg viewBox="0 0 24 24"><path d="M4 4v16h16V4H4zm8 12l-4-4h3V8h2v4h3l-4 4z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Refresh</div>
    <div class="ctx-item" onclick="WM.open('terminal');closeAllMenus()"><svg viewBox="0 0 24 24">${NAV_ICONS.new}</svg>Open Terminal here</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="WM.open('settings');closeAllMenus()"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>Display settings</div>
    <div class="ctx-item" onclick="WM.open('settings',{page:'personalization'});closeAllMenus()"><svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>Personalize</div>
  `;
  document.body.appendChild(m);
}

// ── Util ─────────────────────────────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }

// Expose globally
window.WM         = WM;
window.Taskbar    = Taskbar;
window.notify     = notify;
window.closeAllMenus = closeAllMenus;
window.toggleStartMenu  = toggleStartMenu;
window.toggleQuickSettings = toggleQuickSettings;
window.desktopContextMenu  = desktopContextMenu;
