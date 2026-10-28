// src/lib/useAuth.js
import { useEffect, useState } from 'react';
import { getToken, logout } from './api';

/** État de connexion partagé : se met à jour à chaque login/logout (et entre onglets). */
export default function useAuth() {
  const [authed, setAuthed] = useState(() => !!getToken());
  useEffect(() => {
    const sync = () => setAuthed(!!getToken());
    window.addEventListener('ltf-auth', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ltf-auth', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return { authed, logout };
}