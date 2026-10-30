import { useEffect } from 'react';
import Brand from './Brand';
import { NAV } from '../lib/nav';
import { Link } from 'react-router-dom';
import useAuth from '../lib/useAuth';

export default function Menu({ open, onClose }) {
  const { authed, logout } = useAuth();
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k); document.body.style.overflow = open ? 'hidden' : '';
    return () => document.removeEventListener('keydown', k);
  }, [open]);
  const t = open ? 0 : -1;
  return (
    <div className={'menu' + (open ? ' o' : '')} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open}>
      <div className="mt"><Brand /><button className="x" onClick={onClose} aria-label="Fermer le menu" tabIndex={t}>×</button></div>
      <div className="mb">
        <ul className="links">{NAV.map(([n, h], i) => <li key={n}><a href={h} style={{ '--i': i }} onClick={onClose} tabIndex={t}><span>{String(i + 1).padStart(2, '0')}</span>{n}</a></li>)}</ul>
        <div className="side">
          {authed ? (
            <>
              <Link className="btn gold" to="/espace" onClick={onClose} tabIndex={t}>Mon espace</Link>
              <button className="btn" style={{ background: 'transparent', width: 'fit-content' }} onClick={() => { logout(); onClose(); }} tabIndex={t}>Se déconnecter</button>
            </>
          ) : (
            <>
              <a className="btn gold" href="#connexion" onClick={onClose} tabIndex={t}>Ouvrir un compte</a>
              <a className="btn" style={{ background: 'transparent', width: 'fit-content' }} href="#connexion" onClick={onClose} tabIndex={t}>Se connecter</a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
