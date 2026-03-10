/**
 * Win11OS - Authentication Layer
 */

const Auth = {

  // ── Crypto ──────────────────────────────────────────────────────────────────

  async hashPassword(password) {
    const enc  = new TextEncoder();
    const buf  = await crypto.subtle.digest('SHA-256', enc.encode(password));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async verifyPassword(password, hash) {
    return (await Auth.hashPassword(password)) === hash;
  },

  // ── Session (localStorage so it survives page navigations) ─────────────────

  SESSION_KEY: 'win11_session',

  saveSession(token, userId) {
    localStorage.setItem(Auth.SESSION_KEY, JSON.stringify({ token, userId }));
  },

  loadSession() {
    try { return JSON.parse(localStorage.getItem(Auth.SESSION_KEY)); }
    catch { return null; }
  },

  clearSession() {
    localStorage.removeItem(Auth.SESSION_KEY);
  },

  // ── Auth flow ───────────────────────────────────────────────────────────────

  async login(username, password) {
    const account = await DB.getAccountByUsername(username);
    if (!account) throw new Error('Account not found');
    const ok = await Auth.verifyPassword(password, account.passwordHash);
    if (!ok) throw new Error('Incorrect password');
    await DB.touchLastLogin(account.id);
    const token = await DB.createSession(account.id);
    Auth.saveSession(token, account.id);
    return account;
  },

  async loginWithPin(userId, pin) {
    const account = await DB.getAccount(userId);
    if (!account) throw new Error('Account not found');
    if (!account.pin) throw new Error('No PIN set');
    if (account.pin !== pin) throw new Error('Incorrect PIN');
    await DB.touchLastLogin(account.id);
    const token = await DB.createSession(account.id);
    Auth.saveSession(token, account.id);
    return account;
  },

  async logout() {
    const sess = Auth.loadSession();
    if (sess?.token) await DB.deleteSession(sess.token);
    Auth.clearSession();
    window.location.href = 'index.html';
  },

  async getCurrentUser() {
    const sess = Auth.loadSession();
    if (!sess) return null;
    const dbSess = await DB.getSession(sess.token);
    if (!dbSess) { Auth.clearSession(); return null; }
    return DB.getAccount(sess.userId);
  },

  async requireAuth() {
    const user = await Auth.getCurrentUser();
    if (!user) window.location.href = 'index.html';
    return user;
  },

  // ── Account management ──────────────────────────────────────────────────────

  async createAccount(displayName, username, password, options = {}) {
    const existing = await DB.getAccountByUsername(username);
    if (existing) throw new Error('Username already taken');
    if (password.length < 4) throw new Error('Password must be at least 4 characters');
    const passwordHash = await Auth.hashPassword(password);
    return DB.createAccount({ displayName, username, passwordHash, ...options });
  },

  async changePassword(userId, oldPassword, newPassword) {
    const account = await DB.getAccount(userId);
    const ok = await Auth.verifyPassword(oldPassword, account.passwordHash);
    if (!ok) throw new Error('Current password is incorrect');
    const passwordHash = await Auth.hashPassword(newPassword);
    return DB.updateAccount(userId, { passwordHash });
  },

  async setPin(userId, pin) {
    if (pin && (pin.length < 4 || !/^\d+$/.test(pin))) throw new Error('PIN must be 4+ digits');
    return DB.updateAccount(userId, { pin: pin || null });
  },

  async switchUser(userId) {
    // Keep current session intact but set the "active user" for the lock screen
    localStorage.setItem('win11_lock_user', String(userId));
    Auth.clearSession();
    window.location.href = 'index.html';
  }
};
