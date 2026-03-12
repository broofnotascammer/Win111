/* Win11OS — IndexedDB Storage Layer */
const DB_NAME = 'Win11OS', DB_VER = 2;
let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('accounts')) {
        const s = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        s.createIndex('username', 'username', { unique: true });
      }
      if (!db.objectStoreNames.contains('userData')) {
        const s = db.createObjectStore('userData', { keyPath: 'id', autoIncrement: true });
        s.createIndex('lookup', ['userId','appId','key'], { unique: true });
        s.createIndex('byUser', 'userId');
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'token' });
        s.createIndex('byUser', 'userId');
      }
    };
    req.onsuccess = e => { _db = e.target.result; res(_db); };
    req.onerror   = e => rej(e.target.error);
  });
}

function p(req) { return new Promise((res,rej)=>{ req.onsuccess=e=>res(e.target.result); req.onerror=e=>rej(e.target.error); }); }
function pAll(req) { return new Promise((res,rej)=>{ req.onsuccess=e=>res(e.target.result||[]); req.onerror=e=>rej(e.target.error); }); }
function store(name, mode='readonly') { return _db.transaction(name, mode).objectStore(name); }

const DB = {
  async getAllAccounts()    { await openDB(); return pAll(store('accounts').getAll()); },
  async getAccount(id)     { await openDB(); return p(store('accounts').get(id)); },
  async getByUsername(u)   { await openDB(); return p(store('accounts').index('username').get(u)); },
  async createAccount(d)   {
    await openDB();
    const rec = { username:d.username, displayName:d.displayName, email:d.email||'',
      passwordHash:d.passwordHash, pin:d.pin||null, avatarColor:d.avatarColor||'#0078d4',
      avatarInitial:d.displayName[0].toUpperCase(), isAdmin:d.isAdmin??true,
      createdAt:Date.now(), lastLogin:null, wallpaper:'bloom', accentColor:'#0078d4' };
    const id = await p(store('accounts','readwrite').add(rec));
    return {...rec, id};
  },
  async updateAccount(id, fields) {
    await openDB();
    const existing = await p(store('accounts').get(id));
    const updated  = {...existing, ...fields};
    await p(store('accounts','readwrite').put(updated));
    return updated;
  },
  async deleteAccount(id)  { await openDB(); return p(store('accounts','readwrite').delete(id)); },
  async touchLogin(id)     { return DB.updateAccount(id, { lastLogin:Date.now() }); },
  async hasAccounts()      { await openDB(); return (await p(store('accounts').count())) > 0; },

  async getUserData(uid, app, key) {
    await openDB();
    const r = await p(store('userData').index('lookup').get([uid,app,key]));
    return r ? r.value : null;
  },
  async setUserData(uid, app, key, value) {
    await openDB();
    const existing = await p(store('userData').index('lookup').get([uid,app,key]));
    if (existing) { existing.value = value; existing.updatedAt = Date.now(); return p(store('userData','readwrite').put(existing)); }
    return p(store('userData','readwrite').add({ userId:uid, appId:app, key, value, updatedAt:Date.now() }));
  },
  async getAllUserData(uid, app) {
    await openDB();
    const all = await pAll(store('userData').index('byUser').getAll(uid));
    const out = {};
    for (const r of all) if (r.appId === app) out[r.key] = r.value;
    return out;
  },

  async createSession(uid) {
    await openDB();
    const token = crypto.randomUUID();
    await p(store('sessions','readwrite').put({ token, userId:uid, createdAt:Date.now(), expiresAt:Date.now()+86400000*7 }));
    return token;
  },
  async getSession(token) {
    if (!token) return null;
    await openDB();
    const s = await p(store('sessions').get(token));
    if (!s || s.expiresAt < Date.now()) { if(s) store('sessions','readwrite').delete(token); return null; }
    return s;
  },
  async deleteSession(token) { await openDB(); return p(store('sessions','readwrite').delete(token)); },
  async deleteUserSessions(uid) {
    await openDB();
    const all = await pAll(store('sessions').index('byUser').getAll(uid));
    const st = store('sessions','readwrite');
    for (const s of all) st.delete(s.token);
  }
};
