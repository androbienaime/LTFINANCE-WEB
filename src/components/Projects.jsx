import entrepreneuriat from '../assets/images/entrepreneuriat.jpg';
import { I } from '../lib/icons';

export default function Projects() {
  const L = [['grad', 'Préparer une formation', 'Mettre de côté pour développer ses compétences.'], ['store', 'Équiper son activité', 'Anticiper l’achat de matériel pour un projet professionnel.'], ['house', 'Construire un projet de vie', 'Donner une direction concrète à son épargne.']];
  return (
    <section className="sec" id="projets" style={{ paddingTop: 112, paddingBottom: 112 }}><div className="c"><div className="prj">
      <div className="stack rv"><div className="kick">05 / Nos projets</div><h2>Votre prochain chapitre se prépare aujourd’hui.</h2><p className="lead">Des pistes pour donner un but à votre épargne. Ces exemples de projets sont prospectifs : ils ne constituent ni une offre de financement ni une promesse de résultat.</p>
        <div style={{ width: '100%' }}>{L.map(([ic, t, d]) => <div className="pj" key={t}><I n={ic} s={24} /><div><h3>{t}</h3><p>{d}</p></div></div>)}</div></div>
      <div className="mis rv" style={{ '--rd': '.12s' }}><div className="ph" style={{ backgroundImage: `url(${entrepreneuriat})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} /><div className="tx"><div className="kick">À propos de nous</div><h3>L’inclusion financière commence par la proximité.</h3><p>LT Finance porte une ambition : rendre l’épargne et l’éducation financière plus accessibles en Haïti, avec une approche qui respecte les réalités et les aspirations de chacun.</p></div></div>
    </div></div></section>
  );
}
