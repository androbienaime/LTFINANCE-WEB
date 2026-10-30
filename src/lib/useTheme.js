import { useEffect, useState } from 'react';

const KEY = 'ltf_theme';
const initial = () => {
  try { const s = localStorage.getItem(KEY); if (s === 'light' || s === 'dark') return s; } catch { /* stockage indisponible */ }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

/** Thème clair/sombre : choix enregistré dans localStorage, partagé entre l'accueil et l'espace client. */
export default function useTheme() {
  const [theme, set] = useState(initial);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  useEffect(() => {
    const sync = () => set(initial());
    window.addEventListener('storage', sync); // synchronise aussi les autres onglets
    return () => window.removeEventListener('storage', sync);
  }, []);
  const setTheme = (t) => { try { localStorage.setItem(KEY, t); } catch { /* ignoré */ } set(t); };
  return { theme, setTheme };
}
