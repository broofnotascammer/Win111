/**
 * Win11OS – App Renderers
 * Each app is registered with WM.register(id, def)
 */

// ── Shared file system mock ───────────────────────────────────────────────────
const FS = {
  Desktop:   [{name:'readme.txt',type:'file',icon:'notepad'},{name:'Projects',type:'folder',icon:'folder'}],
  Documents: [{name:'notes.txt',type:'file',icon:'notepad'},{name:'resume.docx',type:'file',icon:'notepad'},{name:'Work',type:'folder',icon:'folder'}],
  Downloads: [{name:'setup.exe',type:'file',icon:'store'},{name:'photo.jpg',type:'file',icon:'photos'},{name:'archive.zip',type:'folder',icon:'folder'}],
  Pictures:  [{name:'vacation.jpg',type:'file',icon:'photos'},{name:'screenshot.png',type:'file',icon:'photos'},{name:'profile.png',type:'file',icon:'photos'}],
  Music:     [{name:'playlist.m3u',type:'file',icon:'spotify'},{name:'song.mp3',type:'file',icon:'spotify'}],
  Videos:    [{name:'recording.mp4',type:'file',icon:'photos'}],
};

const WALLPAPERS = ['wallpaper-bloom','wallpaper-sunrise','wallpaper-forest','wallpaper-sunset','wallpaper-night','wallpaper-purple'];
const ACCENT_COLORS = ['#0078d4','#0099bc','#60cdff','#8764b8','#ef6950','#e74856','#038387','#107c10'];
const AVATAR_COLORS = ['#0078d4','#8764b8','#ef6950','#038387','#107c10','#ca5010','#e3008c','#004e8c'];

// ── FILE EXPLORER ─────────────────────────────────────────────────────────────
WM.register('explorer', {
  title: 'File Explorer', icon: 'folder', w: 880, h: 540,
  render(container) {
    container.style.cssText = 'height:100%;overflow:hidden;';
    let currentPath = 'Desktop';
    let viewMode = 'grid';

    const render = () => {
      const files = FS[currentPath] || [];
      container.innerHTML = `
        <div class="explorer-layout">
          <div class="explorer-sidebar" id="exp-sidebar">
            <div class="sidebar-section">Quick access</div>
            ${['Desktop','Documents','Downloads','Pictures','Music','Videos'].map(n => `
              <div class="sidebar-item ${n === currentPath ? 'active' : ''}" onclick="expNav('${n}')">
                <div style="width:16px;height:16px">${icon('folder',16)}</div>
                <span>${n}</span>
              </div>`).join('')}
            <div class="sidebar-section" style="margin-top:8px">This PC</div>
            <div class="sidebar-item" onclick="expNav('Desktop')">
              <div style="width:16px;height:16px">${icon('thispc',16)}</div><span>This PC</span>
            </div>
          </div>
          <div class="explorer-main">
            <div class="toolbar">
              <div class="tb-action" onclick="expNav(currentPath)"><svg viewBox="0 0 24 24">${NAV_ICONS.new}</svg> New</div>
              <div class="tb-sep"></div>
              <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.cut}</svg> Cut</div>
              <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.copy}</svg> Copy</div>
              <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.paste}</svg> Paste</div>
              <div class="tb-sep"></div>
              <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.rename}</svg> Rename</div>
              <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.delete}</svg> Delete</div>
              <div class="tb-sep"></div>
              <div class="tb-action ${viewMode==='grid'?'active':''}" onclick="expSetView('grid')"><svg viewBox="0 0 24 24">${NAV_ICONS.grid}</svg> Grid</div>
              <div class="tb-action ${viewMode==='list'?'active':''}" onclick="expSetView('list')"><svg viewBox="0 0 24 24">${NAV_ICONS.list}</svg> List</div>
            </div>
            <div class="explorer-path">
              <span onclick="expNav('Desktop')">This PC</span>
              <span class="sep">›</span>
              <span style="color:var(--text-primary)">${currentPath}</span>
            </div>
            <div class="explorer-files ${viewMode === 'list' ? 'list-view' : ''}" id="exp-files">
              ${files.length ? files.map(f => viewMode === 'grid'
                ? `<div class="file-item" ondblclick="expOpen('${f.name}','${f.type}','${f.icon}')">
                    <div style="width:40px;height:40px">${icon(f.icon,40)}</div>
                    <span>${f.name}</span>
                   </div>`
                : `<div class="file-item-list" ondblclick="expOpen('${f.name}','${f.type}','${f.icon}')">
                    <div style="width:18px;height:18px">${icon(f.icon,18)}</div>
                    <span>${f.name}</span>
                    <span class="meta">${f.type === 'folder' ? 'Folder' : 'File'}</span>
                   </div>`
              ).join('') : `<div style="grid-column:1/-1;color:var(--text-muted);font-size:13px;padding:32px;text-align:center">This folder is empty</div>`}
            </div>
            <div class="explorer-status">
              <span>${files.length} item${files.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>`;

      window.expNav = p => { currentPath = p; render(); };
      window.expSetView = v => { viewMode = v; render(); };
      window.expOpen = (name, type, icoId) => {
        if (type === 'folder') notify('File Explorer', `Opened: ${name}`, 'folder');
        else if (name.endsWith('.txt') || name.endsWith('.docx')) WM.open('notepad', { filename: name });
        else if (name.match(/\.(jpg|png|gif)$/i)) WM.open('photos');
      };
    };
    render();
  }
});

// ── BROWSER ───────────────────────────────────────────────────────────────────
WM.register('browser', {
  title: 'Microsoft Edge', icon: 'edge', w: 980, h: 640,
  render(container) {
    container.style.height = '100%';
    let currentUrl = 'https://www.bing.com';

    container.innerHTML = `
      <div class="browser-wrap">
        <div class="browser-tabs">
          <div class="browser-tab active">
            <div class="tab-favicon">${icon('edge',14)}</div>
            <span class="tab-title">New Tab</span>
            <div class="tab-close"><svg viewBox="0 0 10 10" width="8" height="8">${NAV_ICONS.close.replace(/24/g,'10')}</svg></div>
          </div>
          <div class="new-tab-btn" title="New tab">+</div>
        </div>
        <div class="browser-nav">
          <button class="nav-btn" onclick="bNavBack()" title="Back"><svg viewBox="0 0 24 24">${NAV_ICONS.back}</svg></button>
          <button class="nav-btn" onclick="bNavFwd()" title="Forward"><svg viewBox="0 0 24 24">${NAV_ICONS.fwd}</svg></button>
          <button class="nav-btn" onclick="bRefresh()" title="Refresh"><svg viewBox="0 0 24 24">${NAV_ICONS.refresh}</svg></button>
          <div class="url-bar">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" fill="currentColor" opacity=".3"/><path d="M12 4a8 8 0 110 16A8 8 0 0112 4z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
            <input type="text" id="b-url" value="${currentUrl}" onkeydown="if(event.key==='Enter')bNavigate(this.value)">
          </div>
          <button class="nav-btn" title="More"><svg viewBox="0 0 24 24">${NAV_ICONS.more}</svg></button>
        </div>
        <div class="browser-body">
          <div class="browser-loading" id="b-loading">
            <div class="spinner"></div>
            <p>Loading…</p>
          </div>
          <iframe id="b-frame"
            src="https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}"
            style="opacity:0"
            onload="bLoaded()"
            onerror="bError()">
          </iframe>
        </div>
      </div>`;

    window.bNavigate = url => {
      if (!url.startsWith('http')) url = 'https://' + url;
      document.getElementById('b-url').value = url;
      const f = document.getElementById('b-frame');
      const l = document.getElementById('b-loading');
      l.style.display = 'flex'; f.style.opacity = '0';
      f.src = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      document.querySelector('.browser-tab.active .tab-title').textContent = url.replace(/^https?:\/\//,'').split('/')[0];
    };
    window.bLoaded = () => {
      document.getElementById('b-loading').style.display = 'none';
      const f = document.getElementById('b-frame');
      if (f) f.style.opacity = '1';
    };
    window.bError  = () => {
      const l = document.getElementById('b-loading');
      l.innerHTML = `<p style="color:var(--text-muted);text-align:center">Unable to load this page.<br><small>Some sites block embedding.</small></p>`;
    };
    window.bRefresh= () => { const f=document.getElementById('b-frame'); if(f){const s=f.src;f.src='';f.src=s;} };
    window.bNavBack= () => { try{document.getElementById('b-frame').contentWindow.history.back();}catch(e){} };
    window.bNavFwd = () => { try{document.getElementById('b-frame').contentWindow.history.forward();}catch(e){} };
    setTimeout(() => { document.getElementById('b-loading')?.style && (document.getElementById('b-loading').style.display='none'); document.getElementById('b-frame').style.opacity='1'; }, 6000);
  }
});

// ── NOTEPAD ───────────────────────────────────────────────────────────────────
WM.register('notepad', {
  title: 'Notepad', icon: 'notepad', w: 640, h: 500,
  async render(container, opts = {}) {
    container.style.height = '100%';
    const user  = window._currentUser;
    const fname = opts.filename || 'Untitled.txt';
    const saved = user ? await DB.getUserData(user.id, 'notepad', fname) : null;

    container.innerHTML = `
      <div class="notepad-wrap">
        <div class="notepad-menubar">
          <div class="np-menu" onclick="npMenu('File','${fname}')">File</div>
          <div class="np-menu">Edit</div>
          <div class="np-menu">Format</div>
          <div class="np-menu">View</div>
        </div>
        <textarea class="notepad-editor" id="np-editor-${fname.replace(/\W/g,'')}"
          placeholder="Start typing…">${saved || opts.content || ''}</textarea>
        <div class="notepad-statusbar">
          <span id="np-status">Ln 1, Col 1</span>
          <span>100%</span>
          <span>UTF-8</span>
        </div>
      </div>`;

    const ed = container.querySelector('textarea');
    ed.addEventListener('keyup', async e => {
      const lines = ed.value.substr(0, ed.selectionStart).split('\n');
      document.getElementById('np-status').textContent = `Ln ${lines.length}, Col ${lines[lines.length-1].length + 1}`;
      if (user) {
        clearTimeout(ed._saveTimer);
        ed._saveTimer = setTimeout(() => DB.setUserData(user.id, 'notepad', fname, ed.value), 800);
      }
    });

    window.npMenu = async (menu, fn) => {
      if (menu === 'File') {
        if (user) { await DB.setUserData(user.id, 'notepad', fn, ed.value); notify('Notepad', `Saved: ${fn}`, 'notepad'); }
        else notify('Notepad', 'Sign in to save files', 'notepad');
      }
    };
  }
});

// ── TERMINAL ──────────────────────────────────────────────────────────────────
WM.register('terminal', {
  title: 'Windows Terminal', icon: 'terminal', w: 720, h: 460,
  render(container) {
    container.style.height = '100%';
    const user = window._currentUser;
    const uname = user?.username || 'user';
    const dname = user?.displayName || 'User';

    const cmds = {
      help:    `Available commands:\n  help, ls, dir, cd, echo, cls, whoami, date, ver, ipconfig, neofetch, sysinfo`,
      ls:      `Mode      LastWriteTime    Length  Name\n----      -------------    ------  ----\nd-----    3/10/2026 10:32          Desktop\nd-----    3/10/2026 09:11          Documents\nd-----    3/10/2026 08:00          Downloads\nd-----    3/8/2026  14:22          Pictures`,
      dir:     `Desktop   Documents   Downloads   Pictures   Music   Videos`,
      whoami:  `DESKTOP-WIN11\\${uname}`,
      date:    new Date().toString(),
      ver:     'Microsoft Windows [Version 11.0.26100.2033]',
      ipconfig:`Windows IP Configuration\n\nEthernet:\n   IPv4: 192.168.1.105\n   Mask: 255.255.255.0\n   GW:   192.168.1.1`,
      sysinfo: `OS:       Windows 11 Pro\nUser:     ${dname} (${uname})\nHost:     DESKTOP-WIN11\nRAM:      32 GB\nCPU:      Intel Core i7-13700K\nGPU:      NVIDIA RTX 4070\nDisk:     1 TB NVMe SSD`,
      neofetch: `         ..-=####+=-.             ${uname}@DESKTOP-WIN11\n     .-=+###########+=.         ─────────────────────\n  .-+################+-.       OS:       Windows 11 Pro\n #####+#############.####      Host:     ASUS ProArt Studio\n ####  .##########.   ####     Kernel:   10.0.26100\n ####  .##########.   ####     Uptime:   4 hours\n #####+#############.####      Shell:    PowerShell 7.4\n  .-+################+-.       CPU:      i7-13700K\n     .-=+###########+=.         GPU:      RTX 4070\n         ..-=####+=-.           Memory:   32GB DDR5`,
    };

    container.innerHTML = `
      <div class="terminal-wrap">
        <div class="terminal-tab-bar">
          <div class="terminal-tab active">${icon('terminal',14)} PowerShell</div>
          <div style="margin-left:auto;display:flex;gap:4px">
            <div style="width:12px;height:12px;border-radius:50%;background:#FF5F56;cursor:pointer;margin-top:8px"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#FFBD2E;cursor:pointer;margin-top:8px"></div>
            <div style="width:12px;height:12px;border-radius:50%;background:#27C93F;cursor:pointer;margin-top:8px"></div>
          </div>
        </div>
        <div class="terminal-body" id="term-body" onclick="document.getElementById('term-in').focus()">
          <div class="term-out info">Windows PowerShell</div>
          <div class="term-out dim">Copyright (C) Microsoft Corporation. All rights reserved.</div>
          <br>
        </div>
        <div style="background:#0c0c0c;padding:4px 16px;border-top:1px solid rgba(255,255,255,.05);flex-shrink:0">
          <div class="term-line">
            <span class="term-ps">PS C:\\Users\\${uname}></span>&nbsp;
            <input class="term-input-el" id="term-in" autofocus onkeydown="termKey(event,'${uname}')">
          </div>
        </div>
      </div>`;

    window.termKey = (e, un) => {
      if (e.key !== 'Enter') return;
      const inp   = document.getElementById('term-in');
      const val   = inp.value.trim();
      const body  = document.getElementById('term-body');
      inp.value = '';
      const cmdLine = document.createElement('div');
      cmdLine.innerHTML = `<span style="color:#0078d4">PS C:\\Users\\${un}></span> <span style="color:#fff">${val}</span>`;
      body.appendChild(cmdLine);
      if (!val) { body.scrollTop = body.scrollHeight; return; }
      const base = val.split(' ')[0].toLowerCase();
      const args = val.split(' ').slice(1).join(' ');
      let out = '', cls = '';
      if (base === 'cls' || base === 'clear') { body.innerHTML = ''; return; }
      else if (base === 'echo') out = args;
      else if (base === 'cd')   out = '';
      else if (cmds[base])      out = cmds[base];
      else out = `'${val}' is not recognized as an internal or external command.`, cls = 'err';
      if (out) {
        const div = document.createElement('div');
        div.className = `term-out ${cls}`;
        div.style.whiteSpace = 'pre';
        div.textContent = out;
        body.appendChild(div);
      }
      body.scrollTop = body.scrollHeight;
    };
  }
});

// ── CALENDAR ──────────────────────────────────────────────────────────────────
WM.register('calendar', {
  title: 'Calendar', icon: 'calendar', w: 760, h: 560,
  render(container) {
    container.style.height = '100%';
    const now = new Date();
    let year = now.getFullYear(), month = now.getMonth();
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    const renderCal = () => {
      const first = new Date(year, month, 1).getDay();
      const total = new Date(year, month+1, 0).getDate();
      const prev  = new Date(year, month, 0).getDate();
      let days = [];
      for (let i = first-1; i >= 0; i--) days.push({ d: prev-i, other: true });
      for (let i = 1; i <= total; i++) days.push({ d: i, other: false, today: i===now.getDate() && month===now.getMonth() && year===now.getFullYear() });
      while (days.length < 42) days.push({ d: days.length - first - total + 1, other: true });

      container.innerHTML = `
        <div class="cal-layout">
          <div class="cal-sidebar">
            <div class="cal-mini-grid">
              <div class="cal-mini-header">
                <button onclick="calPrev()">‹</button>
                <span>${MONTHS[month].slice(0,3)} ${year}</span>
                <button onclick="calNext()">›</button>
              </div>
              <div class="cal-mini-days">${DAYS.map(d=>`<div class="cal-mini-day">${d}</div>`).join('')}</div>
              <div class="cal-mini-days">${days.map(d=>`<div class="cal-mini-date ${d.today?'today':''} ${d.other?'other':''}">${d.d}</div>`).join('')}</div>
            </div>
          </div>
          <div class="cal-main">
            <div class="cal-header">
              <button class="cal-nav" onclick="calPrev()">‹</button>
              <h2>${MONTHS[month]} ${year}</h2>
              <button class="cal-nav" onclick="calNext()">›</button>
              <div class="cal-today-btn" onclick="calToday()">Today</div>
            </div>
            <div class="cal-grid">
              <div class="cal-weekdays">${DAYS.map(d=>`<div class="cal-weekday">${d}</div>`).join('')}</div>
              <div class="cal-days-grid">${days.map(d=>`<div class="cal-day ${d.today?'today':''} ${d.other?'other':''}"><div class="day-num">${d.d}</div></div>`).join('')}</div>
            </div>
          </div>
        </div>`;

      window.calPrev  = () => { month--; if (month<0){month=11;year--;} renderCal(); };
      window.calNext  = () => { month++; if (month>11){month=0;year++;} renderCal(); };
      window.calToday = () => { year=now.getFullYear(); month=now.getMonth(); renderCal(); };
    };
    renderCal();
  }
});

// ── PHOTOS ────────────────────────────────────────────────────────────────────
WM.register('photos', {
  title: 'Photos', icon: 'photos', w: 860, h: 580,
  render(container) {
    container.style.height = '100%';
    const gradients = [
      'linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)',
      'linear-gradient(135deg,#43e97b,#38f9d7)','linear-gradient(135deg,#fa709a,#fee140)',
      'linear-gradient(135deg,#a18cd1,#fbc2eb)','linear-gradient(135deg,#ffecd2,#fcb69f)',
      'linear-gradient(135deg,#a1c4fd,#c2e9fb)','linear-gradient(135deg,#fd7043,#ffb74d)',
      'linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f7971e,#ffd200)',
      'linear-gradient(135deg,#30cfd0,#330867)','linear-gradient(135deg,#0ba360,#3cba92)',
    ];
    container.innerHTML = `
      <div class="photos-wrap">
        <div class="toolbar">
          <div class="tb-action active">All Photos</div>
          <div class="tb-action">Albums</div>
          <div class="tb-action">Folders</div>
          <div class="tb-sep"></div>
          <div class="tb-action"><svg viewBox="0 0 24 24">${NAV_ICONS.search}</svg> Search</div>
        </div>
        <div class="photos-grid" id="photos-grid">
          ${gradients.map((g,i)=>`<div class="photo-thumb" style="background:${g}" onclick="viewPhoto(${i})"></div>`).join('')}
        </div>
      </div>`;
    window.viewPhoto = i => {
      const viewer = document.createElement('div');
      viewer.className = 'photo-viewer';
      viewer.innerHTML = `<div style="width:80%;height:80%;background:${gradients[i]};border-radius:8px;"></div><div class="photo-viewer-close" onclick="this.parentElement.remove()">×</div>`;
      container.appendChild(viewer);
    };
  }
});

// ── MAIL ──────────────────────────────────────────────────────────────────────
WM.register('mail', {
  title: 'Mail', icon: 'mail', w: 880, h: 580,
  render(container) {
    container.style.height = '100%';
    const user = window._currentUser;
    const emails = [
      { from:'GitHub',    subject:'Pull request #142 merged',         time:'10:32 AM', preview:'Congratulations! Your PR has been merged into main.',       read:false, color:'#24292f' },
      { from:'Anthropic', subject:'Claude API — new capabilities',     time:'9:15 AM',  preview:'We\'ve shipped tool use improvements and extended context.', read:false, color:'#d4622f' },
      { from:'Microsoft', subject:'Microsoft 365 renewal reminder',    time:'Yesterday',preview:'Your subscription renews April 1, 2026. No action needed.',  read:true,  color:'#0078d4' },
      { from:'LinkedIn',  subject:'3 new connection requests',         time:'Mar 9',    preview:'John Smith, Sarah Lee, and 1 other want to connect.',         read:true,  color:'#0a66c2' },
      { from:'Amazon',    subject:'Your order has shipped',            time:'Mar 8',    preview:'Order #112-3456789 arrives by March 12.',                     read:true,  color:'#ff9900' },
    ];
    let sel = 0;

    const render = () => {
      const e = emails[sel];
      container.innerHTML = `
        <div class="mail-layout">
          <div class="mail-nav">
            <div class="mail-nav-btn active" title="Inbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l9-5 9 5v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg></div>
            <div class="mail-nav-btn" title="Sent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg></div>
            <div class="mail-nav-btn" title="Drafts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
            <div class="mail-nav-btn" title="Compose" style="margin-top:auto;margin-bottom:8px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></div>
          </div>
          <div class="mail-list">
            <div class="mail-list-header">
              <h3>Inbox</h3>
              <span class="inbox-count">${emails.filter(x=>!x.read).length}</span>
            </div>
            <div class="mail-items">
              ${emails.map((m,i)=>`
                <div class="mail-item ${i===sel?'selected':''} ${!m.read?'unread':''}" onclick="mailSel(${i})">
                  <div class="mail-from">
                    <span style="display:flex;align-items:center;gap:6px">
                      ${!m.read?'<span class="mail-unread-dot"></span>':''}
                      ${m.from}
                    </span>
                    <span class="mail-time">${m.time}</span>
                  </div>
                  <div class="mail-subject">${m.subject}</div>
                  <div class="mail-preview">${m.preview}</div>
                </div>`).join('')}
            </div>
          </div>
          <div class="mail-content">
            <h2>${e.subject}</h2>
            <div class="mail-sender">
              <div class="sender-avatar" style="background:${e.color}">${e.from[0]}</div>
              <div>
                <div style="font-size:14px;font-weight:500">${e.from}</div>
                <div style="font-size:12px;color:var(--text-muted)">to: ${user?.email || 'me'} · ${e.time}</div>
              </div>
              <div style="margin-left:auto;display:flex;gap:8px">
                <div class="tb-action">Reply</div>
                <div class="tb-action">Forward</div>
              </div>
            </div>
            <div class="mail-body">${e.preview}<br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, nec aliquam nisl nisl sit amet nisl.<br><br>Best regards,<br>${e.from} Team</div>
          </div>
        </div>`;
      window.mailSel = i => { sel = i; emails[i].read = true; render(); };
    };
    render();
  }
});

// ── SETTINGS (full account management) ───────────────────────────────────────
WM.register('settings', {
  title: 'Settings', icon: 'settings', w: 880, h: 600,
  async render(container, opts = {}) {
    container.style.height = '100%';
    const user = window._currentUser;

    const navItems = [
      { id:'system',         label:'System',               emoji:'🖥' },
      { id:'bluetooth',      label:'Bluetooth & devices',  emoji:'📡' },
      { id:'network',        label:'Network & internet',   emoji:'🌐' },
      { id:'personalization',label:'Personalization',      emoji:'🎨' },
      { id:'accounts',       label:'Accounts',             emoji:'👤' },
      { id:'time',           label:'Time & language',      emoji:'🕐' },
      { id:'privacy',        label:'Privacy & security',   emoji:'🔒' },
      { id:'update',         label:'Windows Update',       emoji:'⬆' },
    ];

    let activePage = opts.page || 'system';

    const buildSidebar = () => `
      <div class="settings-sidebar">
        ${user ? `
          <div class="settings-user-card" onclick="setPage('accounts')">
            <div class="settings-user-avatar" style="background:${user.avatarColor}">${user.avatarInitial}</div>
            <div class="settings-user-info">
              <div class="name">${user.displayName}</div>
              <div class="email">${user.email || user.username}</div>
            </div>
          </div>` : ''}
        <div class="settings-search">
          <svg viewBox="0 0 24 24">${NAV_ICONS.search}</svg>
          <input type="text" placeholder="Find a setting" oninput="filterSettings(this.value)">
        </div>
        ${navItems.map(n => `
          <div class="settings-nav-item ${n.id === activePage ? 'active' : ''}" id="sn-${n.id}" onclick="setPage('${n.id}')">
            <span style="font-size:18px;width:18px;text-align:center">${n.emoji}</span>
            <span>${n.label}</span>
          </div>`).join('')}
      </div>`;

    const pages = {
      system: `
        <h2>System</h2>
        <div class="settings-card">
          ${[['🖥','Display','Resolution, brightness, night light'],['🔊','Sound','Volume, input/output devices'],['🔔','Notifications','Do not disturb, app notifications'],['⚡','Power & battery','Sleep, power mode, usage'],['📦','Storage','Disk usage, storage sense'],['🖱','Mouse & keyboard','Speed, accessibility']].map(([ico,t,s])=>`
            <div class="settings-row">
              <div class="settings-row-icon">${ico}</div>
              <div class="settings-row-info"><h4>${t}</h4><p>${s}</p></div>
              <span class="chevron">›</span>
            </div>`).join('')}
        </div>`,

      personalization: `
        <h2>Personalization</h2>
        <div class="settings-card" style="margin-bottom:16px">
          <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:10px">
            <div><h4 style="font-size:14px">Wallpaper</h4><p style="font-size:12px;color:var(--text-muted)">Choose a background for your desktop</p></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${WALLPAPERS.map((w,i)=>`<div onclick="applyWallpaper('${w}')" style="width:80px;height:50px;border-radius:6px;cursor:pointer;border:2px solid ${i===0?'var(--accent)':'transparent'};overflow:hidden"><div class="desktop-bg-preview ${w}" style="width:100%;height:100%;"></div></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="settings-card">
          <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:10px">
            <div><h4 style="font-size:14px">Accent color</h4></div>
            <div class="color-picker">
              ${ACCENT_COLORS.map(c=>`<div class="color-swatch" style="background:${c}" onclick="applyAccent('${c}')"></div>`).join('')}
            </div>
          </div>
        </div>`,

      accounts: await renderAccountsPage(user),

      network: `
        <h2>Network & Internet</h2>
        <div class="settings-card">
          <div class="settings-row"><div class="settings-row-icon">📶</div><div class="settings-row-info"><h4>Wi-Fi</h4><p>Home Network — Connected</p></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="settings-row-icon">🔷</div><div class="settings-row-info"><h4>Ethernet</h4><p>Not connected</p></div><div class="toggle" onclick="this.classList.toggle('on')"></div></div>
          <div class="settings-row"><div class="settings-row-icon">📡</div><div class="settings-row-info"><h4>VPN</h4><p>Not configured</p></div><span class="chevron">›</span></div>
        </div>`,

      privacy: `
        <h2>Privacy & Security</h2>
        <div class="settings-card">
          ${[['🛡','Windows Security','Virus protection, firewall'],['📍','Location','App location permissions'],['📷','Camera','Manage camera access'],['🎤','Microphone','Manage microphone access']].map(([ico,t,s])=>`
            <div class="settings-row"><div class="settings-row-icon">${ico}</div><div class="settings-row-info"><h4>${t}</h4><p>${s}</p></div><div class="toggle on" onclick="this.classList.toggle('on')"></div></div>`).join('')}
        </div>`,

      update: `
        <h2>Windows Update</h2>
        <div style="padding:24px;text-align:center;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:16px">
          <div style="font-size:48px;margin-bottom:12px">✅</div>
          <h3 style="margin-bottom:6px">You're up to date</h3>
          <p style="font-size:13px;color:var(--text-muted)">Last checked: Today, 8:30 AM</p>
        </div>
        <div class="settings-card">
          <div class="settings-row"><div class="settings-row-icon">⚙</div><div class="settings-row-info"><h4>Update settings</h4><p>Active hours, restart options</p></div><span class="chevron">›</span></div>
        </div>`,
    };

    const renderPage = async page => {
      const content = typeof pages[page] === 'function' ? await pages[page]() : (pages[page] || pages.system);
      return `<div class="settings-main">${content}</div>`;
    };

    const fullRender = async () => {
      container.innerHTML = `
        <div class="settings-layout">
          ${buildSidebar()}
          ${await renderPage(activePage)}
        </div>`;

      window.setPage = async p => {
        activePage = p;
        document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.toggle('active', n.id === 'sn-' + p));
        const main = container.querySelector('.settings-main');
        if (main) main.outerHTML = await renderPage(p);
        bindSettingsEvents();
      };
      bindSettingsEvents();
    };

    await fullRender();

    function bindSettingsEvents() {
      window.applyWallpaper = cls => {
        const bg = document.getElementById('desktop-bg');
        if (bg) { bg.className = ''; bg.classList.add(cls); }
        if (user) DB.setUserData(user.id, 'settings', 'wallpaper', cls);
      };
      window.applyAccent = color => {
        document.documentElement.style.setProperty('--accent', color);
        if (user) DB.setUserData(user.id, 'settings', 'accentColor', color);
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.style.background === color));
      };
      window.filterSettings = q => {
        document.querySelectorAll('.settings-nav-item').forEach(n => {
          n.style.display = n.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
        });
      };
    }
  }
});

// ── Account Settings Page Renderer ───────────────────────────────────────────
async function renderAccountsPage(user) {
  const allUsers = await DB.getAllAccounts();

  return `
    <h2>Accounts</h2>
    ${user ? `
      <div class="account-hero">
        <div class="account-avatar-lg" style="background:${user.avatarColor}" id="acct-avatar" onclick="changeAvatar()">${user.avatarInitial}</div>
        <div class="account-hero-info">
          <h3>${user.displayName}</h3>
          <p>${user.username}${user.email ? ' · '+user.email : ''}</p>
          <span class="badge">${user.isAdmin ? 'Administrator' : 'Standard User'}</span>
        </div>
      </div>

      <div class="settings-card" style="margin-bottom:16px">
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:12px">
          <div><h4 style="font-size:14px;margin-bottom:2px">Avatar color</h4></div>
          <div class="color-picker">
            ${AVATAR_COLORS.map(c=>`<div class="color-swatch ${c===user.avatarColor?'selected':''}" style="background:${c}" onclick="changeAvatarColor('${c}')"></div>`).join('')}
          </div>
        </div>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
          <h4 style="font-size:14px">Display name</h4>
          <div style="display:flex;gap:8px;width:100%">
            <input class="settings-input" id="new-displayname" value="${user.displayName}" style="max-width:280px">
            <button class="btn-sm" onclick="saveDisplayName()">Save</button>
          </div>
        </div>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
          <h4 style="font-size:14px">Email address</h4>
          <div style="display:flex;gap:8px;width:100%">
            <input class="settings-input" id="new-email" value="${user.email || ''}" placeholder="Optional" style="max-width:280px">
            <button class="btn-sm" onclick="saveEmail()">Save</button>
          </div>
        </div>
      </div>

      <div class="settings-card" style="margin-bottom:16px">
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
          <h4 style="font-size:14px">Change password</h4>
          <div style="display:flex;flex-direction:column;gap:6px;width:100%;max-width:320px">
            <input class="settings-input" type="password" id="pw-old" placeholder="Current password">
            <input class="settings-input" type="password" id="pw-new" placeholder="New password (min. 4 chars)">
            <input class="settings-input" type="password" id="pw-new2" placeholder="Confirm new password">
            <div id="pw-err" style="font-size:12px;color:#fc6058;min-height:16px"></div>
            <button class="btn-sm" onclick="changePw()" style="width:fit-content">Update Password</button>
          </div>
        </div>
        <div class="settings-row" style="flex-direction:column;align-items:flex-start;gap:8px">
          <h4 style="font-size:14px">PIN sign-in ${user.pin ? '<span style="font-size:11px;background:rgba(107,200,107,.3);padding:1px 6px;border-radius:8px;margin-left:6px">SET</span>' : ''}</h4>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Sign in faster with a 4–8 digit PIN</p>
          <div style="display:flex;gap:8px">
            <input class="settings-input" type="password" id="pin-input" placeholder="4–8 digits" maxlength="8" style="width:160px" oninput="this.value=this.value.replace(/\D/g,'')">
            <button class="btn-sm" onclick="savePin()">Set PIN</button>
            ${user.pin ? `<button class="btn-sm ghost" onclick="removePin()">Remove</button>` : ''}
          </div>
          <div id="pin-err" style="font-size:12px;color:#fc6058;min-height:16px"></div>
        </div>
      </div>` : ''}

    <div style="margin-bottom:8px;font-size:14px;font-weight:600;color:var(--text-secondary)">Other users on this device</div>
    <div class="user-list">
      ${allUsers.filter(u=>u.id !== user?.id).map(u=>`
        <div class="user-list-item">
          <div class="u-avatar" style="background:${u.avatarColor}">${u.avatarInitial}</div>
          <div class="u-info">
            <div class="u-name">${u.displayName}</div>
            <div class="u-type">${u.isAdmin ? 'Administrator' : 'Standard user'} · ${u.username}</div>
          </div>
          <button class="btn-sm ghost" onclick="switchToUser(${u.id})">Switch</button>
          ${user?.isAdmin ? `<button class="btn-sm danger" onclick="deleteUser(${u.id},'${u.displayName}')">Remove</button>` : ''}
        </div>`).join('')}
      ${allUsers.filter(u=>u.id !== user?.id).length === 0 ? '<div style="font-size:13px;color:var(--text-muted)">No other accounts on this device.</div>' : ''}
    </div>

    <button class="btn-sm" style="margin-bottom:24px" onclick="showAddUser()">+ Add another account</button>
    <div id="add-user-form" style="display:none">
      <div class="settings-card" style="padding:16px">
        <h4 style="margin-bottom:14px">Create new account</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Display name *</div>
            <input class="settings-input" id="nu-name" placeholder="Full name">
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Username *</div>
            <input class="settings-input" id="nu-user" placeholder="username">
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Password *</div>
            <input class="settings-input" type="password" id="nu-pw" placeholder="Min. 4 characters">
          </div>
          <div>
            <div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">Email (optional)</div>
            <input class="settings-input" id="nu-email" placeholder="user@example.com">
          </div>
        </div>
        <div style="margin-bottom:12px">
          <div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px">Avatar color</div>
          <div class="color-picker">${AVATAR_COLORS.map((c,i)=>`<div class="color-swatch new-user-color ${i===0?'selected':''}" style="background:${c}" onclick="selectNewUserColor('${c}',this)"></div>`).join('')}</div>
        </div>
        <div id="nu-err" style="font-size:12px;color:#fc6058;min-height:16px;margin-bottom:6px"></div>
        <div style="display:flex;gap:8px">
          <button class="btn-sm" onclick="createNewUser()">Create account</button>
          <button class="btn-sm ghost" onclick="document.getElementById('add-user-form').style.display='none'">Cancel</button>
        </div>
      </div>
    </div>

    ${user ? `
    <div class="settings-card" style="margin-top:16px">
      <div class="settings-row">
        <div class="settings-row-icon">🚪</div>
        <div class="settings-row-info"><h4>Sign out</h4><p>Sign out of this account</p></div>
        <button class="btn-sm ghost" onclick="Auth.logout()">Sign out</button>
      </div>
      <div class="settings-row">
        <div class="settings-row-icon">🔒</div>
        <div class="settings-row-info"><h4>Lock screen</h4><p>Lock this device</p></div>
        <button class="btn-sm ghost" onclick="lockScreen()">Lock</button>
      </div>
    </div>` : ''}
  `;
}

// ── Account action bindings (global) ─────────────────────────────────────────
function bindAccountActions() {
  const user = window._currentUser;
  if (!user) return;

  window.changeAvatarColor = async color => {
    await DB.updateAccount(user.id, { avatarColor: color });
    window._currentUser.avatarColor = color;
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.style.background === color || s.style.background === color.toUpperCase()));
    const av = document.getElementById('acct-avatar');
    if (av) av.style.background = color;
    const smav = document.getElementById('sm-user-avatar');
    if (smav) smav.style.background = color;
    notify('Settings', 'Avatar color updated', 'settings');
  };

  window.saveDisplayName = async () => {
    const val = document.getElementById('new-displayname')?.value.trim();
    if (!val) return;
    await DB.updateAccount(user.id, { displayName: val, avatarInitial: val[0].toUpperCase() });
    window._currentUser.displayName = val;
    window._currentUser.avatarInitial = val[0].toUpperCase();
    document.getElementById('sm-user-name').textContent = val;
    notify('Settings', 'Display name updated', 'settings');
  };

  window.saveEmail = async () => {
    const val = document.getElementById('new-email')?.value.trim();
    await DB.updateAccount(user.id, { email: val });
    window._currentUser.email = val;
    notify('Settings', 'Email updated', 'settings');
  };

  window.changePw = async () => {
    const old = document.getElementById('pw-old')?.value;
    const nw  = document.getElementById('pw-new')?.value;
    const nw2 = document.getElementById('pw-new2')?.value;
    const err = document.getElementById('pw-err');
    try {
      if (nw !== nw2) throw new Error("Passwords don't match");
      if (nw.length < 4) throw new Error('Password must be at least 4 characters');
      await Auth.changePassword(user.id, old, nw);
      if (err) err.textContent = '';
      notify('Settings', 'Password updated successfully', 'settings');
      ['pw-old','pw-new','pw-new2'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
    } catch(e) { if(err) err.textContent = e.message; }
  };

  window.savePin = async () => {
    const pin = document.getElementById('pin-input')?.value;
    const err = document.getElementById('pin-err');
    try {
      await Auth.setPin(user.id, pin);
      window._currentUser.pin = pin || null;
      if (err) err.textContent = '';
      notify('Settings', pin ? 'PIN set successfully' : 'PIN removed', 'settings');
    } catch(e) { if(err) err.textContent = e.message; }
  };

  window.removePin = async () => {
    await Auth.setPin(user.id, '');
    window._currentUser.pin = null;
    notify('Settings', 'PIN removed', 'settings');
  };

  window.showAddUser = () => { document.getElementById('add-user-form').style.display = ''; };

  let newUserColor = AVATAR_COLORS[0];
  window.selectNewUserColor = (c, el) => {
    newUserColor = c;
    document.querySelectorAll('.new-user-color').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
  };

  window.createNewUser = async () => {
    const name  = document.getElementById('nu-name')?.value.trim();
    const uname = document.getElementById('nu-user')?.value.trim();
    const pw    = document.getElementById('nu-pw')?.value;
    const email = document.getElementById('nu-email')?.value.trim();
    const err   = document.getElementById('nu-err');
    try {
      if (!name || !uname) throw new Error('Display name and username are required');
      await Auth.createAccount(name, uname, pw, { avatarColor: newUserColor, email, isAdmin: false });
      if(err) err.textContent = '';
      notify('Settings', `Account created for ${name}`, 'user');
      // Re-render accounts page
      window.setPage('accounts');
    } catch(e) { if(err) err.textContent = e.message; }
  };

  window.deleteUser = async (id, name) => {
    if (!confirm(`Remove account for ${name}? This cannot be undone.`)) return;
    await DB.deleteAccount(id);
    await DB.deleteUserSessions(id);
    notify('Settings', `Account removed: ${name}`, 'settings');
    window.setPage('accounts');
  };

  window.switchToUser = async uid => {
    await Auth.switchUser(uid);
  };

  window.lockScreen = async () => {
    await Auth.logout();
  };
}

// ── Desktop init helper ───────────────────────────────────────────────────────
async function applyUserPreferences(user) {
  if (!user?.preferences) return;
  const prefs = user.preferences;
  // Wallpaper from DB
  const savedWp = await DB.getUserData(user.id, 'settings', 'wallpaper');
  const wp = savedWp || prefs.wallpaper || 'wallpaper-bloom';
  const bg = document.getElementById('desktop-bg');
  if (bg && wp !== 'default') { bg.className = ''; bg.classList.add(wp); }

  // Accent
  const savedAccent = await DB.getUserData(user.id, 'settings', 'accentColor');
  if (savedAccent) document.documentElement.style.setProperty('--accent', savedAccent);
}
