// src/lib/api.js
/**
 * Client API LT Finance → Laravel.
 * - Mode démo : si VITE_API_URL est vide, les appels sont simulés (aucun réseau).
 * - Auth : jeton « Bearer » en sessionStorage (ou localStorage si « Se souvenir de moi »).
 */
const RAW = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const BASE = RAW && !/^https?:\/\//i.test(RAW) ? `http://${RAW}` : RAW; // ajoute http:// si oublié

const PATHS = {
  login: import.meta.env.VITE_LOGIN_PATH || '/customer/login',
  activate: import.meta.env.VITE_ACTIVATE_PATH || '/customer/activate',
  contact: import.meta.env.VITE_CONTACT_PATH || '/public/contact',
  newsletter: import.meta.env.VITE_NEWSLETTER_PATH || '/public/newsletter',
};
const TOKEN_KEY = 'ltf_token';
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

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
const clearStorage = () => { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); };
export const setToken = (token, remember = false) => {
  clearStorage();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  notify();
};
export const clearToken = () => { clearStorage(); notify(); };

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
  try { data = JSON.parse(raw); } catch { /* réponse HTML ou vide */ }

  if (!res.ok) {
    if (import.meta.env.DEV) {
      console.error(`[API] ${method} ${BASE + path} → HTTP ${res.status}`, data ?? raw.slice(0, 600));
    }
    if (res.status === 401 && auth) clearToken(); // jeton expiré ou invalide
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

/** Même logique que le script Postman : le jeton est dans data.reference (ou reference). */
const extractToken = (d) =>
  d?.data?.token ?? d?.token ?? d?.data?.access_token ?? d?.access_token ?? d?.data?.reference ?? d?.reference ?? null;

export async function login(identifier, password, remember = false) {
  const data = await request(PATHS.login, {
    method: 'POST',
    body: { identifier, password, device_name: DEVICE_NAME },
  });
  const token = data?.demo ? 'demo' : extractToken(data);
  if (!token) throw new ApiError('Réponse inattendue du serveur : jeton introuvable.', 200);
  setToken(token, remember);
  return data;
}

export async function activate({ activation_code, identifier, password }) {
  const data = await request(PATHS.activate, {
    method: 'POST',
    body: { activation_code, identifier, password },
  });
  const token = data?.demo ? 'demo' : extractToken(data);
  if (token) setToken(token);                 // si l'API renvoie déjà un jeton
  else await login(identifier, password);     // sinon, connexion automatique
  return data;
}

export const logout = () => clearToken();

/** Appels authentifiés : get('/customer/accounts') */
export const get = (path) => request(path, { auth: true });
export const post = (path, body) => request(path, { method: 'POST', body, auth: true });

export const sendContact = (form) =>
  request(PATHS.contact, { method: 'POST', body: { name: form.n, email: form.e, subject: form.s, message: form.m, consent: form.ok } });

export const subscribe = (email) => request(PATHS.newsletter, { method: 'POST', body: { email } });