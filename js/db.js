/**
 * Win11OS - IndexedDB Database Layer
 * Stores all account data persistently on the device.
 */

const DB_NAME    = 'Win11OS';
const DB_VERSION = 1;

let _db = null;

async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;

      // ── accounts ────────────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('accounts')) {
        const accounts = db.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
        accounts.createIndex('username', 'username', { unique: true });
        accounts.createIndex('email',    'email',    { unique: false });
      }

      // ── userData  (per-user key-value store for app state) ──────────────────
      if (!db.objectStoreNames.contains('userData')) {
        const ud = db.createObjectStore('userData', { keyPath: 'id', autoIncrement: true });
        ud.createIndex('lookup', ['userId', 'appId', 'key'], { unique: true });
        ud.createIndex('userId', 'userId');
      }

      // ── sessions ─────────────────────────────────────────────────────────────
      if (!db.objectStoreNames.contains('sessions')) {
        const sess = db.createObjectStore('sessions', { keyPath: 'token' });
        sess.createIndex('userId', 'userId');
      }
    };

    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

// ── Generic helpers ─────────────────────────────────────────────────────────

function tx(store, mode = 'readonly') {
  return _db.transaction(store, mode).objectStore(store);
}

function wrap(req) {
  return new Promise((res, rej) => {
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}

function wrapAll(req) {
  return new Promise((res, rej) => {
    req.onsuccess = e => res(e.target.result || []);
    req.onerror   = e => rej(e.target.error);
  });
}

// ── Accounts ─────────────────────────────────────────────────────────────────

const DB = {

  async getAllAccounts() {
    await openDB();
    return wrapAll(tx('accounts').getAll());
  },

  async getAccount(id) {
    await openDB();
    return wrap(tx('accounts').get(id));
  },

  async getAccountByUsername(username) {
    await openDB();
    return wrap(tx('accounts').index('username').get(username));
  },

  async createAccount(data) {
    await openDB();
    const now = Date.now();
    const record = {
      username:     data.username.toLowerCase().trim(),
      displayName:  data.displayName.trim(),
      email:        data.email || '',
      passwordHash: data.passwordHash,
      pin:          data.pin || null,
      avatarColor:  data.avatarColor || '#0078d4',
      avatarInitial:data.displayName.trim()[0].toUpperCase(),
      isAdmin:      data.isAdmin ?? true,
      createdAt:    now,
      lastLogin:    null,
      preferences:  {
        wallpaper:   'default',
        theme:       'dark',
        accentColor: '#0078d4',
        taskbarPos:  'bottom',
      }
    };
    const id = await wrap(tx('accounts', 'readwrite').add(record));
    return { ...record, id };
  },

  async updateAccount(id, fields) {
    await openDB();
    const store = tx('accounts', 'readwrite');
    const existing = await wrap(store.get(id));
    if (!existing) throw new Error('Account not found');
    const updated = { ...existing, ...fields };
    await wrap(tx('accounts', 'readwrite').put(updated));
    return updated;
  },

  async deleteAccount(id) {
    await openDB();
    return wrap(tx('accounts', 'readwrite').delete(id));
  },

  async touchLastLogin(id) {
    return DB.updateAccount(id, { lastLogin: Date.now() });
  },

  // ── User Data ───────────────────────────────────────────────────────────────

  async getUserData(userId, appId, key) {
    await openDB();
    const result = await wrap(
      tx('userData').index('lookup').get([userId, appId, key])
    );
    return result ? result.value : null;
  },

  async setUserData(userId, appId, key, value) {
    await openDB();
    const store = tx('userData', 'readwrite');
    const existing = await wrap(store.index('lookup').get([userId, appId, key]));
    if (existing) {
      existing.value = value;
      existing.updatedAt = Date.now();
      return wrap(tx('userData', 'readwrite').put(existing));
    } else {
      return wrap(tx('userData', 'readwrite').add({
        userId, appId, key, value, updatedAt: Date.now()
      }));
    }
  },

  async getAllUserData(userId, appId) {
    await openDB();
    const all = await wrapAll(tx('userData').index('userId').getAll(userId));
    const result = {};
    for (const row of all) {
      if (row.appId === appId) result[row.key] = row.value;
    }
    return result;
  },

  // ── Sessions ────────────────────────────────────────────────────────────────

  async createSession(userId) {
    await openDB();
    const token = crypto.randomUUID();
    const session = { token, userId, createdAt: Date.now(), expiresAt: Date.now() + 86400000 * 7 };
    await wrap(tx('sessions', 'readwrite').put(session));
    return token;
  },

  async getSession(token) {
    if (!token) return null;
    await openDB();
    const session = await wrap(tx('sessions').get(token));
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      await wrap(tx('sessions', 'readwrite').delete(token));
      return null;
    }
    return session;
  },

  async deleteSession(token) {
    await openDB();
    return wrap(tx('sessions', 'readwrite').delete(token));
  },

  async deleteUserSessions(userId) {
    await openDB();
    const all = await wrapAll(tx('sessions').index('userId').getAll(userId));
    const store = tx('sessions', 'readwrite');
    for (const s of all) store.delete(s.token);
  },

  async hasAnyAccounts() {
    await openDB();
    const count = await wrap(tx('accounts').count());
    return count > 0;
  }
};
