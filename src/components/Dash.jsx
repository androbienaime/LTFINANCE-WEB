import { I } from '../lib/icons';
import Count from './Count';

export default function Dash({ mobile }) {
  return (
    <div className={mobile ? 'dash phone' : 'dash'} aria-label={mobile ? 'Aperçu mobile' : 'Aperçu desktop'}>
      <div className="ab"><b>LT FINANCE</b><div className="ic"><I n="bell" s={16} /><span className="av"><I n="user" s={16} /></span></div></div>
      <div className="bd">
        <div className="ctx"><b>Mon épargne</b><i>Données de démonstration</i></div>
        <div className="bal"><small>Épargne totale · HTG</small><b><Count to={24500} /></b><em>2 objectifs · Un avenir à construire</em></div>
        <div className="og"><h4>Mes objectifs</h4>
          <div className="go"><div className="r">Ma formation<i>60 %</i></div><div className="pg" style={{ '--w': '60%' }}><u /></div><small>15 000 / 25 000 HTG</small></div>
          <div className="go"><div className="r">Mon équipement<i>47.5 %</i></div><div className="pg" style={{ '--w': '47.5%' }}><u /></div><small>9 500 / 20 000 HTG</small></div>
        </div>
        {mobile ? <div className="nv"><I n="house" s={18} /><I n="wallet" s={18} /><I n="chart" s={18} /><I n="user" s={18} /></div> :
          <div className="tr"><div className="h">Derniers mouvements<i>Octobre · Exemple</i></div>
            {[['24 oct.', '+ 2 500 HTG'], ['17 oct.', '+ 1 500 HTG'], ['10 oct.', '+ 500 HTG']].map(([d, m]) => <div className="tx1" key={d}><span className="t"><I n="dl" s={14} /></span><div>Versement Epay Lib<i>{d}</i></div><b>{m}</b></div>)}
            <p>Solde précédent : 20 000 HTG + versements : 4 500 HTG</p></div>}
      </div>
    </div>
  );
}
