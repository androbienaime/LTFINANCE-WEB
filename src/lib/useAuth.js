import { useEffect, useState } from 'react';
import { getToken, logout } from './api';

/** État de connexion partagé : se met à jour à chaque login/logout, entre onglets, et à l'expiration de la session. */
export default function useAuth() {
  const [authed, setAuthed] = useState(() => !!getToken());
  useEffect(() => {
    const sync = () => setAuthed(!!getToken());
    const timer = setInterval(sync, 30000);
    window.addEventListener('ltf-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener('ltf-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return { authed, logout };
}
