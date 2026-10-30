import { useState } from 'react';
import { I, Arrow } from '../lib/icons';
import { useNavigate, Link } from 'react-router-dom';
import { login, errorMessage, getUser } from '../lib/api';
import useAuth from '../lib/useAuth';

export default function Login() {
  const [id, setId] = useState(''), [pw, setPw] = useState(''), [remember, setRemember] = useState(false), [show, setShow] = useState(false), [busy, setBusy] = useState(false), [sh, setSh] = useState(false), [st, setSt] = useState({});
  const bad = t => { setSt({ k: 'err', t }); setSh(true); setTimeout(() => setSh(false), 450); };

  const navigate = useNavigate();
  const { authed } = useAuth();
  const u = getUser();
  const name = u?.full_name ?? u?.name ?? [u?.first_name, u?.last_name].filter(Boolean).join(' ');

  async function go(e) {
    e.preventDefault();
    if (!id.trim() || !pw) return bad('Renseignez votre identifiant et votre mot de passe.');
    setBusy(true); setSt({});
   try { await login(id.trim(), pw, remember); navigate('/espace'); } catch (x) { bad(errorMessage(x)); }
    setBusy(false);
  }

  if (authed) return (
    <div className="cx in" style={{ '--d': 5 }} id="connexion">
      <div className="card">
        <div className="ct"><div><h2>{name ? `Bonjour, ${name}` : 'Vous êtes connecté'}</h2><p className="sub">Accédez à votre compte LT Finance.</p></div><span style={{ color: '#1045c8' }}><I n="user" s={24} /></span></div>
        <div className="acts">
          <Link className="btn b1" to="/espace">Accéder à mon espace <Arrow /></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cx in" style={{ '--d': 5 }} id="connexion">
      <form className={'card' + (sh ? ' shake' : '')} onSubmit={go} noValidate>
        <div className="ct"><div><h2>Espace client</h2><p className="sub">Accédez à votre compte LT Finance.</p></div><span style={{ color: '#1045c8' }}><I n="user" s={24} /></span></div>
        <div className="flds">
          <div className="fld"><label htmlFor="lid">Identifiant ou adresse e-mail</label><input id="lid" autoComplete="username" placeholder="Votre identifiant" value={id} onChange={e => setId(e.target.value)} /></div>
          <div className="fld"><label htmlFor="lpw">Mot de passe</label><input id="lpw" type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••••" value={pw} onChange={e => setPw(e.target.value)} />
            <button type="button" className="eye" onClick={() => setShow(!show)} aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}><I n="eye" s={18} /></button></div>
          <div className="opts"><label className="chk"><input  type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />Se souvenir de moi</label><a href="#connexion">Mot de passe oublié ?</a></div>
          <Link to="/activation" className="actlink">Activer mon accès en ligne</Link>
        </div>
        <div className="acts">
          <button className="btn b1" disabled={busy}>{busy ? <span className="spin" /> : <>Se connecter <Arrow /></>}</button>
          {st.t && <div className="msg" role="status"><span className={st.k}>{st.t}</span></div>}
          <div className="sep">Nouveau chez LT Finance ?</div>
          <button type="button" className="btn b2">Ouvrir un compte</button>
        </div>
      </form>
    </div>
  );
}
