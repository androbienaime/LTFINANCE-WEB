import heroImg from '../assets/images/hero.jpg';
import { I, Arrow } from '../lib/icons';
import Login from './Login';

export default function Hero() {
  return (
    <section className="hero">
      <div className="photo" style={{ '--hero-img': `url(${heroImg})` }} /><div className="veil" />
      <div className="c hin">
        <div className="prom">
          <div className="kick l in" style={{ '--d': 0 }}>Ancrés en Haïti. Tournés vers vous.</div>
          <h1 className="in" style={{ '--d': 1 }}>Des solutions simples pour de <em>grandes réalisations.</em></h1>
          <p className="hlead in" style={{ '--d': 2 }}>LT Finance vous accompagne dans l’épargne, l’éducation financière et la réalisation de vos projets, grâce à des outils modernes, accessibles et adaptés à vos ambitions.</p>
          <div className="cta in" style={{ '--d': 3 }}><a className="btn b1" href="#solutions">Découvrir nos solutions <Arrow /></a><a className="play" href="#parcours"><I n="play" />Comment ça marche ?</a></div>
          <div className="sig in" style={{ '--d': 4 }}>Le partenaire de vos ambitions.</div>
        </div>
        <Login />
      </div>
      <div className="c dom"><span><i>01</i>Épargner</span><span><i>02</i>Apprendre</span><span><i>03</i>Réaliser</span></div>
    </section>
  );
}
