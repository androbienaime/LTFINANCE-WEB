import { I, Curve } from '../lib/icons';

export default function Commit() {
  const E = [['scan', 'La transparence', 'Notre engagement : présenter clairement les conditions et encourager les questions avant de choisir.'], ['acc', 'L’accessibilité', 'Notre engagement : rechercher des parcours lisibles, compréhensibles et adaptés aux usages.'], ['bchk', 'L’apprentissage', 'Notre engagement : rendre les notions financières concrètes et encourager les choix éclairés.'], ['msgs', 'Le soutien humain', 'Notre engagement : privilégier l’écoute et orienter chacun selon ses besoins.']];
  const T = ['Un premier objectif d’épargne', 'De nouvelles habitudes', 'Un projet qui prend forme'];
  return (
    <>
      <section className="eng"><div className="c"><div className="stack rv" style={{ gap: 16 }}><div className="kick">06 / Nos engagements</div><h2>Une relation claire. Une ambition partagée.</h2><p className="lead">Les principes qui guident l’expérience que nous souhaitons construire à vos côtés.</p></div>
        <div className="eg">{E.map(([ic, t, d], i) => <div className="rv" style={{ '--rd': i * .08 + 's' }} key={t}><I n={ic} s={28} /><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
      <section className="sec" id="temoignages"><div className="c"><div className="shd rv"><div className="stack" style={{ gap: 16 }}><div className="kick">07 / Témoignages clients</div><h2>Bientôt, vos parcours auront la parole.</h2><p className="lead">Cet espace accueillera des retours partagés avec l’accord de leurs auteurs. Aucun avis client n’est présenté à ce stade.</p></div><Curve /></div>
        <div className="tm">{T.map((t, i) => <div className="rv" style={{ '--rd': i * .1 + 's' }} key={t}><div className="t"><I n="quote" s={24} /><span>Contenu de démonstration</span></div><h3>{t}</h3><b>Témoignage à venir</b><p>Emplacement réservé à un futur récit. Aucune citation ni identité réelle.</p></div>)}</div></div></section>
    </>
  );
}
