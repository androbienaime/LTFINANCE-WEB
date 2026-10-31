import { useEffect, useRef } from 'react';
import '../styles/idle.css';

export default function IdleWarning({ secondsLeft, onStay, onLogout }) {
  const btn = useRef(null);
  const open = secondsLeft != null;

  useEffect(() => { if (open) btn.current?.focus(); }, [open]);
  if (!open) return null;

  return (
    <div className="idle-ov" role="alertdialog" aria-modal="true" aria-labelledby="idle-t" aria-describedby="idle-d">
      <div className="idle-box">
        <h3 id="idle-t">Toujours là ?</h3>
        <p id="idle-d">
          Par sécurité, vous allez être déconnecté dans <b>{secondsLeft} s</b> en raison de votre inactivité.
        </p>
        <div className="idle-act">
          <button className="btn b1" ref={btn} onClick={onStay}>Rester connecté</button>
          <button className="btn b2" onClick={onLogout}>Se déconnecter</button>
        </div>
      </div>
    </div>
  );
}