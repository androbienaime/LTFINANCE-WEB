import { I } from '../lib/icons';

const ICON = { dep: 'down', ret: 'up2', tra: 'arr', info: 'bell' };

const ago = (d) => {
  const t = d ? new Date(d) : null;
  if (!t || isNaN(t)) return '';
  const s = Math.max(0, (Date.now() - t) / 1000);
  if (s < 60) return 'À l’instant';
  if (s < 3600) return `Il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `Il y a ${Math.floor(s / 3600)} h`;
  return t.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function NotifPanel({ n }) {
  const { items, error, isRead, markRead, markAllRead, unread } = n;
  return (
    <div className="dx-notif" role="dialog" aria-label="Notifications">
      <div className="nh"><b>Notifications</b>{unread > 0 && <button onClick={markAllRead}>Tout marquer comme lu</button>}</div>
      {error && <p className="ne">{error}</p>}
      {items === null && !error && <p className="nm">Chargement…</p>}
      {items && !items.length && <p className="nm">Aucune notification pour le moment.</p>}
      <ul>
        {items?.slice(0, 20).map((x) => (
          <li key={x.id} className={isRead(x) ? '' : 'un'}>
            <button onClick={() => markRead(x.id)}>
              <span className={'ci ' + x.kind}><I n={ICON[x.kind]} s={16} /></span>
              <span className="tx"><b>{x.title}</b>{x.message && <small>{x.message}</small>}<em>{ago(x.date)}</em></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
