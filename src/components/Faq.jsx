import { useState } from 'react';
import { I, Arrow } from '../lib/icons';

export default function Faq() {
  const Q = [['Comment choisir ma solution d’épargne ?', 'Commencez par votre objectif, votre horizon et le rythme qui vous convient. Comparez Epay Lib, Epay Pwograme, Epay Pwogresif et LT Sòl, puis demandez à notre équipe les conditions confirmées de chaque solution.'], ['Comment demander l’ouverture d’un compte ?'], ['Quels sont les frais et le montant minimum ?'], ['Comment accéder à l’éducation financière ?'], ['Que faire si j’ai oublié mon mot de passe ?'], ['Où vérifier les conditions et les protections applicables ?']];
  const [o, setO] = useState(0);
  return (
    <section className="why faq-s sec" id="faq"><div className="c"><div className="faq">
      <div className="stack rv"><div className="kick">08 / Questions fréquentes</div><h2>Vos questions, des réponses claires.</h2><p className="lead">Un premier éclairage pour avancer. Pour une situation particulière, notre équipe reste votre point de contact.</p><a className="btn b2" href="#contact">Contacter l’équipe <Arrow /></a></div>
      <div className="rv" style={{ '--rd': '.1s' }}>{Q.map(([q, a], i) => <div className={'ac' + (o === i ? ' o' : '')} key={q}><button onClick={() => setO(o === i ? -1 : i)} aria-expanded={o === i}>{q}<I n={o === i ? 'minus' : 'plus'} /></button><div className="a"><div><p>{a || 'Notre équipe vous communique la réponse confirmée selon votre situation : contactez-nous pour en savoir plus.'}</p></div></div></div>)}</div>
    </div></div></section>
  );
}
