import { useEffect, useMemo, useState } from 'react';
import Brand from '../components/Brand';
import { I } from '../lib/icons';
import { get, logout, errorMessage } from '../lib/api';

/* ---------- Normalisation (tolérante : adaptez les noms de champs à votre API) ---------- */
const asList = (r) => (Array.isArray(r) ? r : r?.data?.data ?? r?.data ?? r?.accounts ?? []);
const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] != null) return o[k]; };
const txt = (v) => (v && typeof v === 'object' ? v.name ?? v.label ?? v.code ?? '' : v ?? '');

const normAccount = (a) => {
  const act = pick(a, 'is_active', 'active');
  return {
    code: String(pick(a, 'account_code', 'code', 'number', 'reference', 'id') ?? ''),
    name: txt(pick(a, 'name', 'label', 'account_name', 'type')) || 'Compte',
    balance: Number(pick(a, 'balance', 'solde', 'current_balance', 'available_balance') ?? 0),
    currency: txt(pick(a, 'currency_code', 'currency')) || 'HTG',
    active: !(act === 0 || act === false || act === '0'),
  };
};

const normTx = (t, i) => {
  const kind = String(txt(pick(t, 'type', 'transaction_type', 'direction'))).toLowerCase();
  const raw = Number(pick(t, 'amount', 'montant') ?? 0);
  return {
    id: pick(t, 'id', 'reference') ?? i,
    date: pick(t, 'created_at', 'date', 'transaction_date'),
    label: txt(pick(t, 'description', 'label', 'type', 'reference')) || 'Opération',
    amount: Math.abs(raw),
    debit: /withdraw|retrait|debit|sortie|out/.test(kind) || raw < 0,
  };
};

const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const money = (n) => nf.format(n);
const day = (d) => {
  const x = d ? new Date(d) : null;
  return x && !isNaN(x) ? x.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
};

export default function Espace() {
  const [accounts, setAccounts] = useState(null), [err, setErr] = useState('');
  const [sel, setSel] = useState(null);
  const [tx, setTx] = useState(null), [txErr, setTxErr] = useState('');

  useEffect(() => {
    get('/customer/accounts')
      .then((r) => {
        if (import.meta.env.DEV) console.info('[API] accounts', r); // voir la forme réelle de la réponse
        const list = asList(r).map(normAccount);
        setAccounts(list);
        const first = list.find((a) => a.active);
        if (first) setSel(first.code);
      })
      .catch((e) => setErr(errorMessage(e)));
  }, []);

  useEffect(() => {
    if (!sel) return;
    let off = false;
    setTx(null); setTxErr('');
    get(`/customer/accounts/${encodeURIComponent(sel)}/transactions`)
      .then((r) => {
        if (import.meta.env.DEV) console.info('[API] transactions', r);
        if (!off) setTx(asList(r).map(normTx));
      })
      .catch((e) => { if (!off) setTxErr(errorMessage(e)); });
    return () => { off = true; };
  }, [sel]);

  const actives = accounts?.filter((a) => a.active) ?? [];
  const history = accounts?.filter((a) => !a.active) ?? [];
  const totals = useMemo(() => {
    const m = {};
    actives.forEach((a) => { m[a.currency] = (m[a.currency] || 0) + a.balance; });
    return Object.entries(m);
  }, [accounts]);
  const current = actives.find((a) => a.code === sel);
  const loading = accounts === null && !err;

  return (
    <div className="db">
      <header className="db-top">
        <div className="c db-bar">
          <Brand />
          <button className="btn b2 sm" onClick={logout}>Se déconnecter</button>
        </div>
      </header>

      <section className="db-hero">
        <div className="c">
          <div className="kick l">Mon espace</div>
          <h1>Vos comptes, en un coup d’œil.</h1>
          <div className="db-totals">
            {loading && <div className="db-sk" style={{ width: 220, height: 56 }} />}
            {totals.map(([cur, v]) => (
              <div key={cur}><small>Solde total · {cur}</small><b>{money(v)}</b></div>
            ))}
          </div>
        </div>
      </section>

      <main className="c db-main">
        {err && <div className="db-err" role="alert">{err}</div>}

        <h2 className="db-h">Mes comptes actifs <span>{actives.length}</span></h2>
        <div className="db-grid">
          {loading && [0, 1, 2].map((i) => <div key={i} className="db-sk" style={{ height: 190 }} />)}
          {accounts && !actives.length && <p className="db-empty">Aucun compte actif pour le moment.</p>}
          {actives.map((a) => (
            <button key={a.code} className={'db-card' + (sel === a.code ? ' on' : '')} onClick={() => setSel(a.code)} aria-pressed={sel === a.code}>
              <span className="top"><span className="ibox"><I n="wallet" s={22} /></span><i className="chip ok">Actif</i></span>
              <span><h3>{a.name}</h3><span className="code">N° {a.code}</span></span>
              <span className="bal"><small>Solde</small><b>{money(a.balance)} <em>{a.currency}</em></b></span>
              <span className="more">Voir les mouvements <I n="arr" s={16} /></span>
            </button>
          ))}
        </div>

        <h2 className="db-h">Historique des comptes <span>{history.length}</span></h2>
        {accounts && !history.length && <p className="db-empty">Aucun ancien compte.</p>}
        <ul className="db-list">
          {history.map((a) => (
            <li key={a.code}>
              <span className="ibox off"><I n="wallet" s={20} /></span>
              <div><b>{a.name}</b><small>N° {a.code}</small></div>
              <i className="chip off">Inactif</i>
              <strong>{money(a.balance)} {a.currency}</strong>
            </li>
          ))}
        </ul>

        <h2 className="db-h">Derniers mouvements{current && <em> · {current.name}</em>}</h2>
        {!sel && accounts && <p className="db-empty">Sélectionnez un compte actif pour voir ses mouvements.</p>}
        {txErr && <div className="db-err" role="alert">{txErr}</div>}
        {sel && !tx && !txErr && [0, 1, 2].map((i) => <div key={i} className="db-sk" style={{ height: 64, marginBottom: 8 }} />)}
        {tx && !tx.length && <p className="db-empty">Aucun mouvement sur ce compte.</p>}
        <ul className="db-list tx">
          {tx?.map((t) => (
            <li key={t.id}>
              <span className={'ibox ' + (t.debit ? 'out' : 'in')}><I n={t.debit ? 'arr' : 'dl'} s={18} /></span>
              <div><b>{t.label}</b><small>{day(t.date)}</small></div>
              <strong className={t.debit ? 'neg' : 'pos'}>{t.debit ? '−' : '+'} {money(t.amount)} {current?.currency}</strong>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}