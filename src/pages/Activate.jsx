import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Brand from '../components/Brand';
import { activate, errorMessage } from '../lib/api';
import { Arrow } from '../lib/icons';

export default function Activate() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Valeurs venues du lien d'activation : /activation?code=123456&identifier=...
  const codeFromLink = (params.get('code') || '').trim();
  const idFromLink = (params.get('identifier') || '').trim();

  // Un champ pré-rempli par le lien est verrouillé (le code seulement s'il a bien 6 chiffres)
  const [lock, setLock] = useState({ code: /^\d{6}$/.test(codeFromLink), id: !!idFromLink });
  const [f, setF] = useState({ code: codeFromLink, id: idFromLink, pw: '', pw2: '' });
  const [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const anyLocked = lock.code || lock.id;

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!/^\d{6}$/.test(f.code)) return setErr('Le code d’activation contient 6 chiffres.');
    if (!f.id.trim()) return setErr('Indiquez votre identifiant.');
    if (f.pw.length < 8) return setErr('Le mot de passe doit contenir au moins 8 caractères.');
    if (f.pw !== f.pw2) return setErr('Les mots de passe ne sont pas identiques.');
    setBusy(true);
    try {
      await activate({ activation_code: f.code, identifier: f.id.trim(), password: f.pw });
      navigate('/espace', { replace: true });
    } catch (x) { setErr(errorMessage(x)); }
    setBusy(false);
  }

  return (
    <main className="page">
      <form className="card" onSubmit={submit} noValidate>
        <Brand />
        <div>
          <h2>Activer mon accès</h2>
          <p className="sub">{lock.code && lock.id ? 'Lien d’activation reconnu : il ne reste qu’à choisir votre mot de passe.' : 'Saisissez le code reçu et choisissez votre mot de passe.'}</p>
        </div>
        <div className="flds">
          <div className="fld"><label htmlFor="ac">Code d’activation (6 chiffres)</label>
            <input id="ac" inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={f.code} onChange={set('code')} placeholder="000000" disabled={lock.code} autoFocus={!lock.code && lock.id} /></div>
          <div className="fld"><label htmlFor="ai">Identifiant ou adresse e-mail</label>
            <input id="ai" autoComplete="username" value={f.id} onChange={set('id')} disabled={lock.id} /></div>
          <div className="fld"><label htmlFor="ap">Nouveau mot de passe</label>
            <input id="ap" type="password" autoComplete="new-password" value={f.pw} onChange={set('pw')} autoFocus={lock.code && lock.id} /></div>
          <div className="fld"><label htmlFor="ap2">Confirmer le mot de passe</label>
            <input id="ap2" type="password" autoComplete="new-password" value={f.pw2} onChange={set('pw2')} /></div>
        </div>
        {anyLocked && (
          <button type="button" className="actlink" style={{ textAlign: 'left', background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => setLock({ code: false, id: false })}>
            Ce n’est pas le bon code ou identifiant ? Modifier
          </button>
        )}
        {err && <div className="msg" role="alert"><span className="err">{err}</span></div>}
        <div className="acts">
          <button className="btn b1" disabled={busy}>{busy ? <span className="spin" /> : <>Activer mon accès <Arrow /></>}</button>
          <Link to="/" className="actlink" style={{ textAlign: 'center' }}>Retour à l’accueil</Link>
        </div>
      </form>
    </main>
  );
}