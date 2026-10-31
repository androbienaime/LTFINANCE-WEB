import { useCallback, useEffect, useRef, useState } from 'react';
import { autoLogout, getExpiry, logout, markActivity, sharedActivity } from '../lib/api';
import { hiddenExpired, idleLeft, policyFor } from '../lib/session-policy';
import useAuth from '../lib/useAuth';
import '../styles/session-guard.css';

const EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove', 'scroll'];

/**
 * Déconnexion automatique du site : expiration du jeton, inactivité (avec avertissement), onglet resté masqué.
 * À placer une seule fois, à l'intérieur du routeur (voir App.jsx).
 *  - trusted : appareil de confiance (à brancher plus tard) → délais plus longs
 *  - policy  : remplace les délais (tests)
 */
export default function SessionGuard({ trusted = false, policy: override }) {
  const { authed } = useAuth();
  const policy = override ?? policyFor({ trusted });
  const last = useRef(Date.now());
  const lastWrite = useRef(0);
  const hiddenAt = useRef(null);
  const warning = useRef(false);
  const done = useRef(false);
  const btn = useRef(null);
  const baseTitle = useRef(null);
  const [left, setLeft] = useState(null); // secondes restantes quand l'avertissement est affiché

  const touch = useCallback(() => {
    if (warning.current) return; // pendant l'avertissement, seul le bouton prolonge la session
    const now = Date.now();
    last.current = now;
    if (now - lastWrite.current > 5000) { lastWrite.current = now; markActivity(now); } // partagé entre onglets
  }, []);

  const stay = useCallback(() => { warning.current = false; setLeft(null); touch(); }, [touch]);

  // Expiration + inactivité
  useEffect(() => {
    if (!authed) return undefined;
    done.current = false; warning.current = false; last.current = Date.now(); setLeft(null);
    EVENTS.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const id = setInterval(() => {
      if (done.current) return;
      const now = Date.now();
      const exp = getExpiry();
      if (exp && now > exp) { done.current = true; autoLogout('expired', policy); return; }
      const remaining = idleLeft(Math.max(last.current, sharedActivity()), now, policy);
      if (remaining <= 0) { done.current = true; setLeft(null); autoLogout('idle', policy); return; }
      const warn = remaining <= policy.warnMs;
      warning.current = warn;
      setLeft(warn ? Math.ceil(remaining / 1000) : null);
    }, 1000);
    return () => { clearInterval(id); EVENTS.forEach((e) => window.removeEventListener(e, touch)); };
  }, [authed, policy.idleMs, policy.warnMs, touch]);

  // Onglet resté masqué (veille de l'ordinateur, onglet oublié)
  useEffect(() => {
    if (!authed) return undefined;
    const onVis = () => {
      if (document.visibilityState === 'hidden') { hiddenAt.current = Date.now(); return; }
      const away = hiddenAt.current;
      hiddenAt.current = null;
      if (hiddenExpired(away, Date.now(), policy)) autoLogout('hidden', policy);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [authed, policy.hiddenMs]);

  // Avertissement : focus sur « Rester connecté », Échap = rester connecté
  const open = authed && left !== null;
  useEffect(() => {
    if (!open) return undefined;
    btn.current?.focus();
    const esc = (e) => { if (e.key === 'Escape') stay(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open, stay]);

  // Compte à rebours dans le titre de l'onglet (visible même si l'onglet est en arrière-plan)
  useEffect(() => {
    if (left === null) { if (baseTitle.current !== null) { document.title = baseTitle.current; baseTitle.current = null; } return; }
    if (baseTitle.current === null) baseTitle.current = document.title;
    document.title = `Déconnexion dans ${left} s – LT Finance`;
  }, [left]);
  useEffect(() => () => { if (baseTitle.current !== null) document.title = baseTitle.current; }, []);

  if (!open) return null;
  return (
    <div className="sg-back" role="alertdialog" aria-modal="true" aria-labelledby="sg-t" aria-describedby="sg-d">
      <div className="sg">
        <h2 id="sg-t">Toujours là ?</h2>
        <p id="sg-d">Pour votre sécurité, vous allez être déconnecté dans <b>{left}</b> seconde{left > 1 ? 's' : ''}.</p>
        <div className="sg-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (left * 1000 * 100) / policy.warnMs)}%` }} /></div>
        <div className="sg-acts">
          <button ref={btn} type="button" className="btn b1" onClick={stay}>Rester connecté</button>
          <button type="button" className="btn b2" onClick={() => logout()}>Se déconnecter</button>
        </div>
      </div>
    </div>
  );
}
