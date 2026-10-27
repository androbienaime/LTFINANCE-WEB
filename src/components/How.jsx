import { Arrow } from '../lib/icons';

export default function How() {
  const S = [['01', 'Faites connaissance.', 'Découvrez les solutions et échangez avec notre équipe pour comprendre les conditions et les démarches.'], ['02', 'Choisissez votre cap.', 'Précisez votre objectif et préparez les informations nécessaires à votre demande d’ouverture de compte.'], ['03', 'Avancez à votre rythme.', 'Une fois votre compte ouvert selon les conditions applicables, commencez à épargner et suivez votre progression.']];
  return (
    <section className="how" id="parcours"><div className="c">
      <div className="shd rv"><div className="stack" style={{ gap: 16 }}><div className="kick l">04 / Comment ça marche ?</div><h2>Les grandes réalisations commencent simplement.</h2></div><svg className="curve" width="200" height="96" viewBox="0 0 200 96" aria-hidden="true"><path d="M0 90C40 90 40 10 90 10s50 70 110 70" fill="none" stroke="#e8b73d" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" /></svg></div>
      <div className="stp">{S.map(([n, t, d]) => <div key={n}><i>{n}</i><h3>{t}</h3><p>{d}</p></div>)}</div>
      <a className="btn b1" href="#connexion">Ouvrir un compte <Arrow /></a>
    </div></section>
  );
}
