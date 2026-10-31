/**
 * Client API LT Finance → Laravel.
 * - Mode démo : si VITE_API_URL est vide, les appels sont simulés (aucun réseau).
 * - Auth : jeton « Bearer » stocké en sessionStorage (ou localStorage si « Se souvenir de moi »).
 */
import { logoutMessage } from './session-policy';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const PATHS = {
  login: import.meta.env.VITE_LOGIN_PATH || '/customer/login',
  contact: import.meta.env.VITE_CONTACT_PATH || '/public/contact',
  newsletter: import.meta.env.VITE_NEWSLETTER_PATH || '/public/newsletter',
  logout: import.meta.env.VITE_LOGOUT_PATH || '/customer/logout',
};
const TOKEN_KEY = 'ltf_token';
const USER_KEY = 'ltf_user';
const DEVICE_NAME = 'ltfinance-web';

if (import.meta.env.DEV) console.info('[API] base =', BASE || '(vide : mode démo)');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const notify = () => window.dispatchEvent(new Event('ltf-auth'));

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // erreurs de validation Laravel (422)
  }
}

/** Message lisible : première erreur de validation si elle existe, sinon le message général. */
export const errorMessage = (e) => {
  const first = e?.errors && Object.values(e.errors).flat()[0];
  return first || e?.message || 'Une erreur est survenue. Réessayez.';
};

const EXP_KEY = 'ltf_exp';
const clearStorage = () => { for (const st of [sessionStorage, localStorage]) [TOKEN_KEY, USER_KEY, EXP_KEY].forEach((k) => st.removeItem(k)); };
const holder = () => (sessionStorage.getItem(TOKEN_KEY) ? sessionStorage : localStorage.getItem(TOKEN_KEY) ? localStorage : null);

export const getToken = () => {
  const s = holder();
  if (!s) return null;
  const exp = Date.parse(s.getItem(EXP_KEY)); // expires_at renvoyé par l'API
  if (exp && Date.now() > exp) { clearStorage(); setNotice(logoutMessage('expired')); return null; } // session expirée
  return s.getItem(TOKEN_KEY);
};
export const getUser = () => { try { return JSON.parse(holder()?.getItem(USER_KEY)); } catch { return null; } };
export const setToken = (token, remember = false, { expiresAt, user } = {}) => {
  clearStorage();
  clearNotice();
  const s = remember ? localStorage : sessionStorage;
  s.setItem(TOKEN_KEY, token);
  if (expiresAt) s.setItem(EXP_KEY, expiresAt);
  if (user) s.setItem(USER_KEY, JSON.stringify(user));
  notify();
};
export const clearToken = () => { clearStorage(); notify(); };

/* ---------- Déconnexion automatique (voir SessionGuard et session-policy) ---------- */
const NOTICE_KEY = 'ltf_notice';
const ACTIVITY_KEY = 'ltf_activity';

/** Message affiché sur la carte de connexion après une déconnexion automatique. */
export const setNotice = (msg) => { try { sessionStorage.setItem(NOTICE_KEY, msg); } catch { /* ignoré */ } };
export const getNotice = () => { try { return sessionStorage.getItem(NOTICE_KEY) || ''; } catch { return ''; } };
export const clearNotice = () => { try { sessionStorage.removeItem(NOTICE_KEY); } catch { /* ignoré */ } };

/** Dernière activité (ms), partagée entre les onglets : l'activité dans un onglet empêche la déconnexion des autres. */
export const markActivity = (t = Date.now()) => { try { localStorage.setItem(ACTIVITY_KEY, String(t)); } catch { /* ignoré */ } };
export const sharedActivity = () => { try { return Number(localStorage.getItem(ACTIVITY_KEY)) || 0; } catch { return 0; } };

/** Date d'expiration du jeton (ms) ou null (expires_at renvoyé par l'API). */
export const getExpiry = () => {
  const s = holder();
  const e = s ? Date.parse(s.getItem(EXP_KEY)) : NaN;
  return Number.isNaN(e) ? null : e;
};

async function request(path, { method = 'GET', body, auth = false } = {}) {
  if (!BASE) {
    await wait(900); // mode démo
    return { demo: true };
  }
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', 0);
  }
  const raw = await res.text();
  let data = null;
  try { data = JSON.parse(raw); } catch { /* réponse sans JSON (page HTML d'erreur, par ex.) */ }

  if (!res.ok) {
    if (import.meta.env.DEV) {
      // Diagnostic visible dans la console du navigateur (F12 > Console)
      console.error(`[API] ${method} ${BASE + path} → HTTP ${res.status}`, data ?? raw.slice(0, 600));
    }
    if (res.status === 401 && auth) { if (getToken()) setNotice(logoutMessage('unauthorized')); clearToken(); } // jeton expiré ou révoqué
    const fallback = {
      401: 'Identifiant ou mot de passe incorrect.',
      403: 'Accès refusé.',
      422: 'Certaines informations sont invalides.',
      429: 'Trop de tentatives. Réessayez dans un instant.',
    }[res.status] || 'Une erreur est survenue. Réessayez.';
    const detail = import.meta.env.DEV ? ` (HTTP ${res.status} · ${method} ${BASE + path})` : '';
    throw new ApiError((data?.message || fallback) + detail, res.status, data?.errors);
  }
  return data;
}

/** Réponse de connexion : { token, expires_at, customer: { id, name } } */
const extractToken = (d) => d?.token ?? d?.data?.token ?? d?.access_token ?? d?.data?.access_token ?? d?.data?.reference ?? d?.reference ?? null;

function saveSession(data, remember = false) {
  const token = data?.demo ? 'demo' : extractToken(data);
  if (!token) return false;
  const user = data?.customer ?? data?.data?.customer ?? data?.user ?? data?.data?.user;
  setToken(token, remember, { expiresAt: data?.expires_at ?? data?.data?.expires_at, user });
  return true;
}

export async function login(identifier, password, remember = false) {
  const data = await request(PATHS.login, {
    method: 'POST',
    body: { identifier, password, device_name: DEVICE_NAME },
  });
  if (!saveSession(data, remember)) throw new ApiError('Réponse inattendue du serveur : jeton introuvable.', 200);
  return data;
}

export async function activate({ activation_code, identifier, password }) {
  const data = await request(PATHS.activate, {
    method: 'POST',
    body: { activation_code, identifier, password },
  });
  if (!saveSession(data)) await login(identifier, password); // si l'API ne renvoie pas déjà un jeton
  return data;
}

/** Déconnexion voulue : révoque le jeton côté serveur (sans attendre), puis efface la session. */
export const logout = () => {
  if (getToken()) post(PATHS.logout).catch(() => {});
  clearToken();
};

/** Déconnexion automatique (inactivité, onglet masqué, expiration) : même chose + message sur l'écran de connexion. */
export function autoLogout(reason, policy) {
  if ((reason === 'idle' || reason === 'hidden') && getToken()) post(PATHS.logout).catch(() => {});
  setNotice(logoutMessage(reason, policy)); // policy : pour afficher la vraie durée (appareil de confiance…)
  clearToken();
}

/** Appels authentifiés : api.get('/customer/accounts') */
export const get = (path) => request(path, { auth: true });
export const post = (path, body) => request(path, { method: 'POST', body, auth: true });

export const sendContact = (form) =>
  request(PATHS.contact, { method: 'POST', body: { name: form.n, email: form.e, subject: form.s, message: form.m, consent: form.ok } });

export const subscribe = (email) => request(PATHS.newsletter, { method: 'POST', body: { email } });
