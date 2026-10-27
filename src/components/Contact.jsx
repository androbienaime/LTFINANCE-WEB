import { sendContact } from '../lib/api';
import { useState } from 'react';
import { I, Arrow } from '../lib/icons';

export default function Contact() {
  const [f, setF] = useState({ n: '', e: '', s: '', m: '', ok: false }), [st, setSt] = useState({}), [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  async function go(e) {
    e.preventDefault();
    if (!f.n.trim() || !/\S+@\S+\.\S+/.test(f.e) || !f.m.trim()) return setSt({ k: 'err', t: 'Indiquez votre nom, une adresse e-mail valide et votre message.' });
    if (!f.ok) return setSt({ k: 'err', t: 'Cochez la case pour être recontacté(e).' });
    setBusy(true); setSt({});
    try { await sendContact(f); setSt({ k: 'ok', t: 'Demande envoyée. Notre équipe vous recontacte bientôt.' }); } catch (x) { setSt({ k: 'err', t: x.message }); }
    setBusy(false);
  }
  return (
    <section className="sec" id="contact"><div className="c"><div className="ctc">
      <div className="stack rv"><div className="kick">09 / Contact et assistance</div><h2>Parlons de votre prochaine ambition.</h2><p className="lead">Une question sur une solution, une formation ou votre parcours ? Décrivez votre besoin pour que notre équipe puisse vous orienter.</p>
        <div className="addr" style={{ width: '100%' }}><I n="pin" s={24} /><b>515, Rue Lacroix, Trou-du-Nord, Haïti</b><a href="#contact">www.ltfinance.org</a></div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--muted)' }}>Pour votre confidentialité, n’indiquez ni mot de passe ni information financière sensible dans votre message.</p></div>
      <form className="fm rv" style={{ '--rd': '.1s' }} onSubmit={go} noValidate><h3>Comment pouvons-nous vous aider ?</h3>
        <div className="fld"><label htmlFor="cn">Nom complet</label><input id="cn" placeholder="Votre nom" value={f.n} onChange={set('n')} /></div>
        <div className="fld"><label htmlFor="ce">Adresse e-mail</label><input id="ce" type="email" placeholder="vous@exemple.com" value={f.e} onChange={set('e')} /></div>
        <div className="fld"><label htmlFor="cs">Sujet</label><select id="cs" value={f.s} onChange={set('s')}><option value="">Choisir un sujet</option><option>Une solution d’épargne</option><option>Éducation financière</option><option>Ouvrir un compte</option><option>Autre demande</option></select></div>
        <div className="fld"><label htmlFor="cm">Votre message</label><textarea id="cm" placeholder="Parlez-nous de votre besoin…" value={f.m} onChange={set('m')} /></div>
        <label className="chk"><input type="checkbox" checked={f.ok} onChange={set('ok')} /><span style={{ maxWidth: 260 }}>J’accepte d’être recontacté(e) pour cette demande.</span></label>
        <p className="sub2">Les informations saisies sont destinées au traitement de votre demande.</p>
        <button className="btn b1" disabled={busy}>{busy ? <span className="spin" /> : <>Envoyer ma demande <Arrow /></>}</button>
        {st.t && <div className="msg" role="status"><span className={st.k}>{st.t}</span></div>}</form>
    </div></div></section>
  );
}
