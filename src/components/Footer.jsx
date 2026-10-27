import { subscribe } from '../lib/api';
import { useState } from 'react';
import { I, Arrow } from '../lib/icons';
import Brand from './Brand';

export default function Footer({ theme }) {
  const [em, setEm] = useState(''), [m, setM] = useState('');
  async function go(e) { e.preventDefault(); if (!/\S+@\S+\.\S+/.test(em)) return setM('Saisissez une adresse e-mail valide.'); setM(''); await subscribe(em); setM('Merci, votre inscription est enregistrée.'); }
  const C = [['Navigation', ['Accueil', 'Nos projets', 'À propos', 'Témoignages', 'Contact']], ['Nos solutions', ['Epay Lib', 'Epay Pwograme', 'Epay Pwogresif', 'LT Sòl', 'Ouvrir un compte']], ['Ressources', ['Éducation financière', 'Nos formations', 'Questions fréquentes', 'Assistance', 'Espace client']]];
  return (
    <footer className="ft"><div className="c">
      <form className="nl" onSubmit={go} noValidate><div className="stack" style={{ gap: 16 }}><div className="kick l">Restons en lien</div><h2>De petits repères pour de grandes ambitions.</h2><p className="d">Recevez nos contenus pédagogiques et les nouvelles de LT Finance.</p></div>
        <div className="nlf"><label htmlFor="ne">Votre adresse e-mail</label><input id="ne" type="email" placeholder="vous@exemple.com" value={em} onChange={e => setEm(e.target.value)} /><button className="btn b1">M’inscrire à la newsletter <Arrow /></button>{m && <small role="status" style={{ color: 'var(--gold)' }}>{m}</small>}<small>En vous inscrivant, vous acceptez de recevoir ces communications. Désinscription possible à tout moment. Votre adresse est utilisée pour la newsletter.</small></div></form>
      <div className="hr" />
      <div className="fg"><div className="fi"><Brand /><p>515, Rue Lacroix, Trou-du-Nord, Haïti</p><a className="w" href="#top">www.ltfinance.org</a><div className="pf"><span>FR / HT</span><I n={theme === 'dark' ? 'moon' : 'sun'} s={18} /><span>{theme === 'dark' ? 'Sombre' : 'Clair'}</span></div></div>
        <div className="fc">{C.map(([h, l]) => <div key={h}><h4>{h}</h4>{l.map(x => <a href="#top" key={x}>{x}</a>)}</div>)}</div></div>
      <div className="hr" />
      <div className="leg"><span>© LT FINANCE</span><a href="#top">Mentions légales</a><a href="#top">Confidentialité</a><a href="#top">Conditions d’utilisation</a></div>
      <p className="lg2">Liens légaux : emplacements réservés aux documents officiels à valider avant publication.</p>
    </div></footer>
  );
}
