import { I } from '../lib/icons';
import Dash from './Dash';

export default function Why() {
  const B = [['door', 'Accessibilité financière', 'Des solutions pensées pour différents rythmes de vie et possibilités d’épargne.'], ['chart', 'Suivi de votre épargne', 'Une vision claire de vos mouvements et de vos objectifs.'], ['book', 'Éducation financière', 'Des repères utiles pour mieux comprendre et décider.'], ['hand', 'Accompagnement personnalisé', 'Un échange humain pour vous aider à clarifier votre parcours.']];
  return (
    <section className="why sec" id="apropos"><div className="c">
      <div className="g">
        <div className="stack rv"><div className="kick">02 / Pourquoi LT Finance</div><h2>Plus qu’une épargne, une opportunité pour votre avenir.</h2><p className="lead">Gardez une vue d’ensemble, donnez un sens à chaque effort et avancez avec des repères concrets.</p>
          <div className="ben">{B.map(([ic, t, d]) => <div className="b" key={t}><span className="ib"><I n={ic} /></span><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div>
        <div className="prev rv" style={{ '--rd': '.15s' }}><Dash /><Dash mobile /></div>
      </div>
      <p className="cap" style={{ marginTop: 48 }}>Aperçu illustratif de l’espace client. Montants en gourdes haïtiennes (HTG), objectifs et opérations fictifs.</p>
    </div></section>
  );
}
