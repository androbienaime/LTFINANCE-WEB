import { useEffect, useRef, useState } from 'react';

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const fmt = (n) => nf.format(n);
const parse = (d) => { const x = d ? new Date(d) : null; return x && !isNaN(x) ? x : null; };
const short = (d) => { const x = parse(d); return x ? x.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : ''; };
const long = (d) => { const x = parse(d); return x ? x.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date non renseignée'; };

/** Grille des cases d'un compte livret + calculateur (le client choisit des cases et voit le total). */
export default function CaseGrid({ account, onClose }) {
  const g = account.cases;
  const paid = new Set(g?.paid ?? []);
  const max = g?.max ?? 0, price = g?.price ?? 0;
  const cur = account.currency;
  const closeRef = useRef(null);

  const [sel, setSel] = useState([]);          // numéros de cases choisies
  const [manual, setManual] = useState(''), [target, setTarget] = useState(''), [msg, setMsg] = useState('');
  const selSet = new Set(sel);
  const amount = (n) => +(n * price).toFixed(2);
  const total = sel.reduce((s, n) => s + n * price, 0);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, []);

  if (!g) {
    return (
      <div className="cg-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="cg" role="dialog" aria-modal="true" aria-label={`Grille des cases : ${account.name}`}>
          <header><div><h3>{account.name}</h3><small>N° {account.code}</small></div><button ref={closeRef} className="cg-x" onClick={onClose} aria-label="Fermer">×</button></header>
          <div className="cg-body"><p className="cg-warn">{account.casesState === 'loading' ? 'Chargement de la grille…' : 'La grille de ce compte est indisponible pour le moment.'}</p></div>
        </div>
      </div>
    );
  }

  /* ---------- Calculateur ---------- */
  const toggle = (n) => {
    if (paid.has(n)) return;
    setMsg('');
    setSel((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  };
  const addCases = (nums) => setSel((p) => { const s = new Set(p); nums.forEach((n) => { if (n >= 1 && n <= max && !paid.has(n)) s.add(n); }); return [...s]; });

  const addManual = (e) => {
    e.preventDefault();
    const nums = [];
    manual.split(/[,;\s]+/).filter(Boolean).forEach((tok) => {
      if (tok.includes('-')) {
        const [a, b] = tok.split('-').map((v) => parseInt(v, 10));
        if (!isNaN(a) && !isNaN(b) && a <= b) for (let n = Math.max(a, 1); n <= Math.min(b, max); n++) nums.push(n);
      } else { const n = parseInt(tok, 10); if (!isNaN(n)) nums.push(n); }
    });
    const ok = nums.filter((n) => n >= 1 && n <= max && !paid.has(n) && !selSet.has(n));
    setMsg(ok.length ? '' : 'Aucune case valide ou disponible dans cette saisie.');
    addCases(ok);
    setManual('');
  };

  // Propose des cases dont la somme se rapproche du montant visé (sous-ensemble, en privilégiant les grandes cases)
  const generate = (e) => {
    e.preventDefault();
    const wanted = Number(String(target).replace(',', '.'));
    if (!wanted || wanted <= 0) return setMsg('Saisissez un montant supérieur à 0.');
    const units = Math.floor(wanted / price + 1e-9);
    const taken = new Set([...paid, ...sel]);
    const cand = [];
    for (let n = Math.min(max, units); n >= 1; n--) if (!taken.has(n)) cand.push(n);
    const dp = new Int32Array(units + 1).fill(-1);
    dp[0] = -2;
    cand.forEach((n, i) => { for (let s = units; s >= n; s--) if (dp[s] === -1 && dp[s - n] !== -1) dp[s] = i; });
    let best = units;
    while (best > 0 && dp[best] === -1) best--;
    const picked = [];
    for (let s = best; s > 0; s -= cand[dp[s]]) picked.push(cand[dp[s]]);
    if (!picked.length) return setMsg('Aucune case disponible ne permet d’atteindre ce montant.');
    addCases(picked);
    setTarget('');
    setMsg(Math.abs(best * price - wanted) < 1e-6
      ? `${picked.length} case(s) ajoutée(s) pour ${fmt(wanted)} ${cur}.`
      : `Montant le plus proche : ${fmt(best * price)} ${cur} avec ${picked.length} case(s).`);
  };

  const reset = () => { setSel([]); setMsg(''); };

  const stats = [
    ['Cases payées', `${g.paid.length} / ${g.max}`],
    ['Montant épargné', `${fmt(g.saved)} ${cur}`],
    ['Cases restantes', g.left],
    ['Reste à épargner', `${fmt(Math.max(0, g.totalValue - g.saved))} ${cur}`],
  ];
  const sorted = [...sel].sort((a, b) => a - b);

  return (
    <div className="cg-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="cg" role="dialog" aria-modal="true" aria-label={`Grille des cases : ${account.name}`}>
        <header>
          <div><h3>{account.name}</h3><small>N° {account.code} · {g.duration} mois · la case n vaut n × {fmt(g.price)} {cur}</small></div>
          <button ref={closeRef} className="cg-x" onClick={onClose} aria-label="Fermer">×</button>
        </header>

        <div className="cg-body">
          {account.casesState === 'error' && <p className="cg-warn">Les cases payées n’ont pas pu être chargées : la grille ci-dessous est incomplète.</p>}
          <div className="cg-sum">{stats.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}</div>
          <div className="cg-bar" role="progressbar" aria-valuenow={g.pct} aria-valuemin="0" aria-valuemax="100"><i style={{ width: g.pct + '%' }} /></div>
{/* 
          <section className="cg-calc">
            <h4>Calculateur de cases</h4>
            <p className="hint">Touchez des cases libres dans la grille, saisissez des numéros, ou entrez un montant visé : le total se calcule tout seul. Calcul indicatif, il ne déclenche aucun paiement.</p>
            <div className="cg-tools">
              <form onSubmit={addManual}>
                <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Numéros : 12, 5-10…" aria-label="Numéros de cases" />
                <button className="btn b2 sm">Ajouter</button>
              </form>
              <form onSubmit={generate}>
                <input value={target} onChange={(e) => setTarget(e.target.value)} inputMode="decimal" placeholder={`Montant visé (${cur})`} aria-label="Montant visé" />
                <button className="btn b1 sm">Proposer des cases</button>
              </form>
            </div>
            {msg && <p className="cg-msg" role="status">{msg}</p>}
            {sorted.length > 0 && (
              <ul className="cg-chips" aria-label="Cases choisies">
                {sorted.map((n) => <li key={n}><button onClick={() => toggle(n)} aria-label={`Retirer la case ${n}`}>{n} <span>({fmt(amount(n))})</span> ×</button></li>)}
              </ul>
            )}
          </section> */}

          <p className="cg-leg"><span className="on" /> Payée <span className="sel" /> Choisie <span /> Libre</p>
          <div className="cg-months">
            {Array.from({ length: g.duration }, (_, i) => i + 1).map((m) => {
              const start = (m - 1) * 30 + 1;
              const cases = Array.from({ length: 30 }, (_, i) => start + i);
              const done = cases.filter((n) => paid.has(n)).length;
              return (
                <section key={m} className="cg-m">
                  <div className="mh"><b>Mois {m}</b><small>Cases {start}–{start + 29} · {done}/30</small></div>
                  <ul className="cg-g">
                    {cases.map((n) => {
                      const isPaid = paid.has(n), isSel = selSet.has(n);
                      return (
                        <li key={n}>
                          <button type="button" className={'cg-c' + (isPaid ? ' on' : isSel ? ' sel' : '')} disabled={isPaid} aria-pressed={isPaid ? undefined : isSel}
                            onClick={() => toggle(n)}
                            title={`Case ${n} · ${fmt(amount(n))} ${cur}${isPaid ? ' · payée le ' + long(g.dates[n]) : ''}`}
                            aria-label={`Case ${n}, ${fmt(amount(n))} ${cur}, ${isPaid ? 'payée le ' + long(g.dates[n]) : isSel ? 'choisie' : 'libre'}`}>
                            <b>{n}</b><i>({amount(n)})</i>
                            {isPaid && short(g.dates[n]) && <em>{short(g.dates[n])}</em>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          {g.paidList.length > 0 && (
            <section className="cg-pay">
              <h4>Paiements effectués</h4>
              <ul>
                {[...g.paidList].sort((a, b) => (parse(b.date) ?? 0) - (parse(a.date) ?? 0) || b.n - a.n).map((p) => (
                  <li key={p.n}><span className="n">Case {p.n}</span><span className="d">{long(p.date)}</span><strong>{fmt(amount(p.n))} {cur}</strong></li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {sel.length > 0 && (
          <footer className="cg-foot">
            <div><small>{sel.length} case{sel.length > 1 ? 's' : ''} choisie{sel.length > 1 ? 's' : ''}</small><b>Total : {fmt(total)} {cur}</b></div>
            <button className="btn b2 sm" onClick={reset}>Réinitialiser</button>
          </footer>
        )}
      </div>
    </div>
  );
}
