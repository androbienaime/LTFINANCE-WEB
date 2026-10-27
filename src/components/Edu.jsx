import atelier from '../assets/images/atelier.jpg';
import { I, Curve, Arrow } from '../lib/icons';

export default function Edu() {
  const PL = [['users', 'Inclusion financière', 'Comprendre les outils financiers et trouver sa place.'], ['pen', 'Budget', 'Organiser ses revenus et ses dépenses avec méthode.'], ['pig', 'Épargne', 'Préparer un objectif et installer des habitudes durables.'], ['sprout', 'Investissement', 'Découvrir les principes, les risques et les questions à poser.']];
  return (
    <section className="sec" id="education" style={{ paddingTop: 112, paddingBottom: 56 }}><div className="c">
      <div className="edu">
        <div className="rv"><div className="phw ph" style={{ backgroundImage: `url(${atelier})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="chip"><I n="book" /> Des savoirs utiles, au quotidien.</div></div><p className="credit">Visuel d’illustration · Apprendre ensemble, à partir de situations concrètes.</p></div>
        <div className="stack rv" style={{ '--rd': '.12s' }}><div className="kick">03 / Éducation financière</div><h2>L’éducation financière pour tous.</h2><p className="lead">Mieux comprendre aujourd’hui pour faire des choix plus éclairés demain. Des notions accessibles, reliées à votre réalité.</p>
          <div className="pil">{PL.map(([ic, t, d]) => <div key={t}><I n={ic} s={22} /><h3>{t}</h3><p>{d}</p></div>)}</div>
          <a className="btn b1" href="#contact">Découvrir nos formations <Arrow /></a></div>
      </div>
      <div className="mid"><Curve /></div>
    </div></section>
  );
}
