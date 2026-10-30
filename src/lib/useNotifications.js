import { useCallback, useEffect, useRef, useState } from 'react';
import { get, post, errorMessage } from './api';

const READ_KEY = 'ltf_notif_read';
const POLL_MS = 30000; // vérifie les nouvelles notifications toutes les 30 s

/* ---------- Normalisation (tolérante : adaptez les noms de champs à votre API) ---------- */
const asList = (r) => (Array.isArray(r) ? r : r?.data?.data ?? r?.data ?? r?.notifications ?? []);

export const normNotif = (n, i) => {
  const d = n?.data && typeof n.data === 'object' ? n.data : {};
  const title = d.title ?? n.title ?? d.subject ?? n.subject ?? '';
  const message = d.message ?? n.message ?? d.body ?? n.body ?? '';
  const probe = `${d.type ?? ''} ${n.type ?? ''} ${d.transaction_type ?? ''} ${title}`.toLowerCase();
  const kind = /withdraw|retrait|debit/.test(probe) ? 'ret' : /transfer|transfert/.test(probe) ? 'tra' : /deposit|depot|dépôt|credit/.test(probe) ? 'dep' : 'info';
  return {
    id: String(n.id ?? n.uuid ?? n.reference ?? `${n.created_at}-${i}`),
    title: title || { dep: 'Dépôt confirmé', ret: 'Retrait confirmé', tra: 'Transfert confirmé' }[kind] || 'Notification',
    message,
    kind,
    date: n.created_at ?? d.created_at ?? n.date,
    serverRead: n.read_at != null || n.is_read === true || n.is_read === 1 || n.read === true,
  };
};

/**
 * Notifications du client : chargement, relève régulière, compteur de non lues.
 * onNew(liste) est appelé quand de nouvelles notifications arrivent (ex. recharger soldes et transactions).
 * Le « lu » est mémorisé dans le navigateur ; à relier à votre API si elle propose un marquage serveur.
 */
export default function useNotifications({ onNew } = {}) {
  const [items, setItems] = useState(null), [error, setError] = useState(''), [fresh, setFresh] = useState(null);
  const [serverUnread, setServerUnread] = useState(null); // nombre exact de non lues (au-delà des 20 affichées)
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); }
  });
  const seen = useRef(null);
  const onNewRef = useRef(onNew);
  onNewRef.current = onNew;

  const load = useCallback(async () => {
    try {
      const [r, c] = await Promise.all([
        get('/customer/notifications'),
        get('/customer/notifications/unread-count').catch(() => null),
      ]);
      setServerUnread(typeof c?.unread_count === 'number' ? c.unread_count : null);
      if (import.meta.env.DEV) console.info('[API] notifications', r);
      const list = asList(r).map(normNotif);
      if (seen.current) {
        const added = list.filter((n) => !seen.current.has(n.id));
        if (added.length) { setFresh(added[0]); onNewRef.current?.(added); }
      }
      seen.current = new Set(list.map((n) => n.id));
      setItems(list); setError('');
    } catch (e) { setError(errorMessage(e)); }
  }, []);

  useEffect(() => {
    load();
    const visible = () => document.visibilityState === 'visible';
    const t = setInterval(() => { if (visible()) load(); }, POLL_MS);
    const onVis = () => { if (visible()) load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, [load]);

  const persist = (s) => { try { localStorage.setItem(READ_KEY, JSON.stringify([...s].slice(-300))); } catch { /* ignoré */ } };
  const isRead = (n) => n.serverRead || readIds.has(n.id);
  // « Lu » : enregistré côté serveur (read_at) ET mémorisé localement (reste utile si la route échoue)
  const markRead = (id) => {
    const n = (items || []).find((x) => x.id === id);
    if (n && isRead(n)) return; // déjà lu : rien à envoyer
    setReadIds((p) => { const s = new Set(p).add(id); persist(s); return s; });
    setServerUnread((u) => (u == null ? u : Math.max(0, u - 1)));
    post(`/customer/notifications/${encodeURIComponent(id)}/read`).then(load).catch(() => {});
  };
  const markAllRead = () => {
    setReadIds((p) => { const s = new Set(p); (items || []).forEach((n) => s.add(n.id)); persist(s); return s; });
    setServerUnread((u) => (u == null ? u : 0));
    post('/customer/notifications/read-all').then(load).catch(() => {});
  };
  const unread = serverUnread ?? (items ?? []).filter((n) => !isRead(n)).length;

  return { items, error, unread, isRead, markRead, markAllRead, fresh, clearFresh: () => setFresh(null), reload: load };
}
