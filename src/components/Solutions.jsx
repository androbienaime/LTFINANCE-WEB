import { I, Curve } from '../lib/icons';

const PRODUCTS = [['wallet', 'Epay Lib', 'Épargnez librement, selon vos possibilités.', 'Une place pour chaque petite avancée.'], ['cal', 'Epay Pwograme', 'Développez une habitude d’épargne quotidienne.', 'Un rendez-vous avec vos ambitions.'], ['up', 'Epay Pwogresif', 'Progressez à votre rythme pendant 60 jours.', 'Un parcours pour garder le cap.'], ['users', 'LT Sòl', 'L’épargne collective fondée sur la solidarité.', 'Avancer ensemble, avec un objectif commun.']];

export default function Solutions() {
  return (
    <section className="sec" id="solutions"><div className="c">
      <div className="shd rv"><div className="stack"><div className="kick">01 / Nos solutions</div><h2>À chaque ambition, son épargne.</h2><p className="lead">Choisissez l’approche qui vous ressemble. Construisez votre avenir, un pas à la fois.</p></div><Curve /></div>
      <div className="grid4">{PRODUCTS.map(([ic, n, p, d], i) => <a key={n} href="#connexion" className="pc rv" style={{ '--rd': i * .1 + 's' }}><div className="top"><div className="ibox"><I n={ic} s={24} /></div><span className="ar"><I n="arr" /></span></div><div className="tx"><h3>{n}</h3><p className="pr">{p}</p><p className="ds">{d}</p></div></a>)}</div>
      <p className="note rv">Les modalités de chaque solution sont à confirmer auprès de LT Finance avant toute souscription.</p>
    </div></section>
  );
}
