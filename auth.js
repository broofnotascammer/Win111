/* Win11OS — Auth Layer */
const Auth = {
  async hash(pw) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  },
  async verify(pw, hash) { return (await Auth.hash(pw)) === hash; },

  saveSession(token, uid) { localStorage.setItem('w11_sess', JSON.stringify({token, uid})); },
  loadSession()           { try { return JSON.parse(localStorage.getItem('w11_sess')); } catch { return null; } },
  clearSession()          { localStorage.removeItem('w11_sess'); },

  async login(username, password) {
    const acct = await DB.getByUsername(username.toLowerCase().trim());
    if (!acct) throw new Error('Account not found');
    if (!(await Auth.verify(password, acct.passwordHash))) throw new Error('Incorrect password');
    await DB.touchLogin(acct.id);
    const token = await DB.createSession(acct.id);
    Auth.saveSession(token, acct.id);
    return acct;
  },
  async loginPin(uid, pin) {
    const acct = await DB.getAccount(uid);
    if (!acct) throw new Error('Account not found');
    if (!acct.pin) throw new Error('No PIN set');
    if (acct.pin !== pin) throw new Error('Incorrect PIN');
    await DB.touchLogin(acct.id);
    const token = await DB.createSession(acct.id);
    Auth.saveSession(token, acct.id);
    return acct;
  },
  async logout() {
    const s = Auth.loadSession();
    if (s?.token) await DB.deleteSession(s.token);
    Auth.clearSession();
    location.href = 'index.html';
  },
  async getCurrentUser() {
    const s = Auth.loadSession();
    if (!s) return null;
    const dbSess = await DB.getSession(s.token);
    if (!dbSess) { Auth.clearSession(); return null; }
    return DB.getAccount(s.uid);
  },
  async requireAuth() {
    const u = await Auth.getCurrentUser();
    if (!u) { location.href = 'index.html'; return null; }
    return u;
  },
  async createAccount(displayName, username, password, opts={}) {
    const exists = await DB.getByUsername(username.toLowerCase().trim());
    if (exists) throw new Error('Username already taken');
    if (password.length < 4) throw new Error('Password must be at least 4 characters');
    const passwordHash = await Auth.hash(password);
    return DB.createAccount({ displayName, username: username.toLowerCase().trim(), passwordHash, ...opts });
  },
  async changePassword(uid, oldPw, newPw) {
    const acct = await DB.getAccount(uid);
    if (!(await Auth.verify(oldPw, acct.passwordHash))) throw new Error('Current password is incorrect');
    if (newPw.length < 4) throw new Error('Password too short');
    return DB.updateAccount(uid, { passwordHash: await Auth.hash(newPw) });
  },
  async setPin(uid, pin) {
    if (pin && (!/^\d{4,8}$/.test(pin))) throw new Error('PIN must be 4–8 digits');
    return DB.updateAccount(uid, { pin: pin || null });
  }
};
