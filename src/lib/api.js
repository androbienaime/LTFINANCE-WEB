/**
 * Client API LT Finance → Laravel.
 * - Mode démo : si VITE_API_URL est vide, les appels sont simulés (aucun réseau).
 * - Auth : jeton JWT « Bearer » stocké en sessionStorage (ou localStorage si « Se souvenir de moi »).
 * Adaptez les chemins et la forme des réponses à votre API (voir .env.example).
 */
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const PATHS = {
  login: import.meta.env.VITE_LOGIN_PATH || '/customer/login',
  contact: import.meta.env.VITE_CONTACT_PATH || '/public/contact',
  newsletter: import.meta.env.VITE_NEWSLETTER_PATH || '/public/newsletter',
  activateCustomer : import.meta.env.VITE_CUSTOMER_ACTION_PATH || '/customer/activate'
};
const TOKEN_KEY = 'ltf_token';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors; // erreurs de validation Laravel (422)
  }
}

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
export const setToken = (token, remember = false) => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};
export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
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
  let data = null;
  try { data = await res.json(); } catch { /* réponse sans JSON */ }

  if (!res.ok) {
    if (res.status === 401) clearToken();
      const fallback = {
        401: 'Identifiants incorrects.',
        422: 'Certaines informations sont invalides.',
        429: 'Trop de tentatives. Réessayez dans un instant.',
      }[res.status] || 'Une erreur est survenue. Réessayez.';
      throw new ApiError(data?.message || fallback, res.status, data?.errors);

      console.log('API ERROR', res.status, data?.message, data?.errors);
  }
  return data;
}

export async function login(identifiant, motDePasse, remember = false) {
  const data = await request(PATHS.login, { method: 'POST', body: { identifier: identifiant, password: motDePasse } });
  const token = data?.token || data?.access_token || data?.data?.token;
  if (token) setToken(token, remember);
  return data;
}

export async function activate(codeActivation, identifiant, password){
    const data = await request(PATHS.activateCustomer, {method: 'POST', body : { activation_code: codeActivation, identifier: identifiant, password: password} });
    return data;
}

export const logout = () => clearToken();
export const me = () => request('/customer/me', { auth: true }); // exemple de route protégée

export const sendContact = (form) =>
  request(PATHS.contact, { method: 'POST', body: { name: form.n, email: form.e, subject: form.s, message: form.m, consent: form.ok } });

export const subscribe = (email) => request(PATHS.newsletter, { method: 'POST', body: { email } });
