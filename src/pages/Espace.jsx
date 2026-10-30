import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Brand from '../components/Brand';
import { I } from '../lib/icons';
import { get, getUser, logout, errorMessage } from '../lib/api';
import useTheme from '../lib/useTheme';
import useNotifications from '../lib/useNotifications';
import NotifPanel from '../components/NotifPanel';
import CaseGrid from '../components/CaseGrid';
import { buildCases } from '../lib/cases';
import '../styles/dashboard.css';

/* ---------- Normalisation (tolérante : adaptez les noms de champs à votre API) ---------- */
const asList = (r) => (Array.isArray(r) ? r : r?.data?.data ?? r?.data ?? r?.accounts ?? []);
const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] != null) return o[k]; };
const cur = (v) => (v && typeof v === 'object' ? v.iso_code ?? v.code ?? v.currency_code ?? v.name ?? '' : v ?? ''); // code ISO (HTG) plutôt que le nom
const txt = (v) => (v && typeof v === 'object' ? v.name ?? v.label ?? v.code ?? '' : v ?? '');

const normAccount = (a) => {
  const act = pick(a, 'is_active', 'active');
  const tp = a?.type_of_account ?? {};
  const isCase = !!(tp.active_case_payments ?? a?.active_case_payments); // compte à cases : type_of_account.active_case_payments
  return {
    code: String(pick(a, 'code', 'account_code', 'number', 'reference', 'id') ?? ''),
    name: tp.name || txt(pick(a, 'name', 'label', 'account_name')) || 'Compte',
    balance: Number(pick(a, 'balance', 'solde', 'current_balance', 'available_balance') ?? 0),
    currency: txt(pick(a, 'currency_code', 'currency')) || 'HTG', // libellé complet (grille, bandeau, historique, transactions)
    iso: cur(pick(a, 'iso_code', 'currency_code', 'currency')) || 'HTG', // code court, réservé aux cartes de compte
    active: !(act === 0 || act === false || act === '0'),
    isCase,
    caseCfg: { duration: tp.duration, price: tp.price },
    cases: null,                          // construit à partir des tags_payments des transactions
    casesState: isCase && !(act === 0 || act === false || act === '0') ? 'loading' : null, // 'loading' | 'ok' | 'error'
  };
};

const isDone = (t) => { const st = String(txt(pick(t, 'status')) || '').toLowerCase(); return !st || /complet|success|confirm|valid/.test(st); };
const tagsOf = (t) => t?.tags_payments ?? t?.tagsPayments ?? [];

const KINDS = { dep: 'Dépôt', ret: 'Retrait', tra: 'Transfert' };
const normTx = (t, i, acc) => {
  const k = String(txt(pick(t, 'type', 'transaction_type'))).toLowerCase();
  const dir = String(txt(pick(t, 'direction'))).toLowerCase();
  const raw = Number(pick(t, 'amount', 'montant') ?? 0);
  const kind = /withdraw|retrait|debit/.test(k) ? 'ret' : /transfer|transfert/.test(k) ? 'tra' : /deposit|depot|dépôt|credit/.test(k) ? 'dep' : '';
  const base = txt(pick(t, 'type_label')) || KINDS[kind] || txt(pick(t, 'description', 'label', 'type')) || 'Opération';
  const st = String(txt(pick(t, 'status')) || '').toLowerCase();
  const done = isDone(t);
  return {
    id: `${acc.code}-${pick(t, 'code', 'id', 'reference') ?? i}`,
    date: pick(t, 'created_at', 'date', 'transaction_date'),
    label: `${base} - ${acc.name}${done ? '' : ` (${st})`}`,
    amount: Math.abs(raw),
    currency: acc.currency,
    kind,
    debit: dir ? /debit|out|sortant/.test(dir) : kind === 'ret' || /out|sortant/.test(k) || raw < 0,
  };
};

const normUser = (u) => u && {
  name: pick(u, 'full_name', 'name') ?? [u.first_name, u.last_name].filter(Boolean).join(' '),
  code: pick(u, 'customer_code', 'code', 'number', 'reference'),
  since: pick(u, 'created_at', 'member_since', 'customer_since'),
  last: pick(u, 'last_login_at', 'last_login'),
};

const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const money = (n) => nf.format(n);
const dateShort = (d) => { const x = d ? new Date(d) : null; return x && !isNaN(x) ? x.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; };
const dateLong = (d) => { const s = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); return s[0].toUpperCase() + s.slice(1); };
const initials = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'LT';

const NAV = [['home', 'house', 'Tableau de bord'], 
['accounts', 'wallet', 'Mes comptes'], 
// ['dep', 'plus', 'Dépôt'], 
// ['ret', 'upl', 'Retrait'], 
// ['tra', 'swap', 'Transfert'], 
['history', 'clock', 'Mon historique'], ['goals', 'target', 'Mes objectifs'], ['edu', 'book', 'Éducation financière']];
const COLORS = ['#1045c8', '#f0a92e', '#2563eb', '#0f9d8a'];
const ICONS = ['pig', 'cal', 'chart', 'users'];

const Sk = ({ h, w }) => <div className="dx-sk" style={{ height: h, width: w }} />;

function AccountCard({ a, i, hide, onClick }) {
  return (
    <button className="dx-acc" style={{ '--c': COLORS[i % 4] }} onClick={onClick}>
      <span className="ic"><I n={ICONS[i % 4]} s={28} /></span>
      <span className="tx"><b>{a.name}</b><strong>{hide ? '••••••' : money(a.balance)} {a.iso}</strong><small>N° {a.code}</small>{a.casesState === 'loading' && <small>Chargement des cases…</small>}{a.casesState === 'error' && <small className="warn">Cases payées indisponibles</small>}{a.cases && a.casesState === 'ok' && <><span className="mini"><i style={{ width: a.cases.pct + '%' }} /></span><small>{a.cases.paid.length}/{a.cases.max} cases · {a.cases.pct} %</small></>}</span>
      <span className="go"><I n="next" s={16} /></span>
    </button>
  );
}

function TxList({ rows }) {
  return (
    <ul className="dx-tx">
      {rows.map((t) => (
        <li key={t.id}>
          <span className="d">{dateShort(t.date)}</span>
          <span className={'ci ' + (t.kind || (t.debit ? 'ret' : 'dep'))}><I n={t.kind === 'tra' ? 'arr' : t.debit ? 'up2' : 'down'} s={16} /></span>
          <span className="l">{t.label}</span>
          <strong className={t.debit ? 'neg' : 'pos'}>{t.debit ? '-' : '+'} {money(t.amount)} {t.currency}</strong>
          <I n="next" s={16} />
        </li>
      ))}
    </ul>
  );
}

export default function Espace() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const user = useMemo(() => normUser(getUser()), []);
  console.log("ME li : " + JSON.stringify(user));
  const [view, setView] = useState('home');
  const [accounts, setAccounts] = useState(null), [tx, setTx] = useState(null), [err, setErr] = useState('');
  const [hide, setHide] = useState(false), [menu, setMenu] = useState(false), [note, setNote] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [tick, setTick] = useState(0), [bellOpen, setBellOpen] = useState(false), [gridFor, setGridFor] = useState(null);
  const notif = useNotifications({ onNew: () => setTick((t) => t + 1) }); // nouvelle notification → recharge comptes et transactions

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!bellOpen) return;
    const out = (e) => { if (!e.target.closest('.dx-bellw')) setBellOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setBellOpen(false); };
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc); };
  }, [bellOpen]);

  useEffect(() => {
    if (!notif.fresh) return;
    flash(`Nouvelle notification : ${notif.fresh.title}`);
    notif.clearFresh();
  }, [notif.fresh]);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const r = await get('/customer/accounts');
        if (import.meta.env.DEV) console.info('[API] accounts', r); // voir la forme réelle de la réponse
        const list = asList(r).map(normAccount);
        if (off) return;
        setAccounts(list);
        const MAX_PAGES = 50;
        const loadAccount = async (a) => {
          const base = `/customer/accounts/${encodeURIComponent(a.code)}/transactions`;
          let rows = [], all = [], failed = false;
          try {
            const first = await get(base);
            if (import.meta.env.DEV) console.info('[API] transactions', a.code, first);
            rows = asList(first); all = rows;
            const last = Math.min(first?.meta?.last_page ?? 1, MAX_PAGES);
            if (a.isCase && last > 1) { // compte à cases : on lit toutes les pages pour avoir toutes les cases payées
              const rest = await Promise.all(Array.from({ length: last - 1 }, (_, i) => get(`${base}?page=${i + 2}`).then(asList).catch(() => { failed = true; return []; })));
              all = rows.concat(...rest);
            }
          } catch { failed = true; }
          if (a.isCase) {
            const paid = all.filter(isDone).flatMap((t) => tagsOf(t).map((p) => (p && typeof p === 'object' ? { ...p, paid_at: t.created_at } : { case_number: p, paid_at: t.created_at })));
            const cases = buildCases(a.caseCfg.duration, a.caseCfg.price, paid);
            if (!off) setAccounts((prev) => prev && prev.map((x) => (x.code === a.code ? { ...x, cases, casesState: failed || !cases ? 'error' : 'ok' } : x)));
          }
          return rows.map((t, i) => normTx(t, i, a));
        };
        const lists = await Promise.all(list.filter((a) => a.active).map(loadAccount));
        if (!off) setTx(lists.flat().sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (e) { if (!off) setErr(errorMessage(e)); }
    })();
    return () => { off = true; };
  }, [tick]);

  useEffect(() => { document.querySelector('.dx-nav button.on')?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' }); }, [view]);

  const gridAcc = accounts?.find((a) => a.code === gridFor);
  const actives = accounts?.filter((a) => a.active) ?? [];
  const history = accounts?.filter((a) => !a.active) ?? [];
  const totals = useMemo(() => {
    const m = {};
    actives.forEach((a) => { m[a.iso] = (m[a.iso] || 0) + a.balance; });   // a.iso au lieu de a.currency
    return Object.entries(m);
  }, [accounts]);
  const total = totals.length ? totals.map(([c, v]) => `${hide ? '••••••' : money(v)} ${c}`).join(' + ') : '0 HTG';
  const loading = accounts === null && !err;

  const flash = (m) => { setNote(m); setTimeout(() => setNote(''), 2600); };
  const go = (k) => {
    if (['home', 'accounts', 'history'].includes(k)) return setView(k);
    if (k === 'edu') return navigate({ pathname: '/', hash: '#education' });
    flash('Cette fonctionnalité sera disponible prochainement.');
  };
  const last = user?.last ? new Date(user.last) : now;

  return (
    <div className="dx">
      <header className="dx-head"><div className="dx-in">
        <Brand />
        <div className="dx-user">
          <div className="theme" role="group" aria-label="Thème">
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')} aria-label="Thème clair"><I n="sun" /></button>
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')} aria-label="Thème sombre"><I n="moon" /></button>
          </div>
          <div className="dx-bellw">
            <button className="bell" aria-label={`Notifications${notif.unread ? `, ${notif.unread} non lues` : ''}`} aria-expanded={bellOpen} onClick={() => { setBellOpen(!bellOpen); setMenu(false); }}>
              <I n="bell" s={22} />{notif.unread > 0 && <i>{notif.unread > 9 ? '9+' : notif.unread}</i>}
            </button>
            {bellOpen && <NotifPanel n={notif} />}
          </div>
          <button className="me" onClick={() => { setMenu(!menu); setBellOpen(false); }} aria-expanded={menu}>
            <span className="av">{initials(user?.name)}</span>
            <span className="nm"><b>{user?.name || 'Mon compte'}</b>{user?.code && <small>{user.code}</small>}</span>
            <I n="chev" s={18} />
          </button>
          {menu && <div className="dx-pop"><button onClick={logout}>Se déconnecter</button></div>}
        </div>
      </div></header>

      <nav className="dx-nav" aria-label="Navigation espace client"><div className="dx-in">
        {NAV.map(([k, ic, t]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}><I n={ic} s={20} />{t}</button>)}
      </div></nav>

      <div className="dx-in dx-page">
        <section className="dx-hero">
          <div className="h1c"><span className="bx"><I n="cal" s={34} /></span><div><small>Date de la dernière connexion</small><b>{dateLong(last)}</b><p><I n="clock" s={16} /> {last.toLocaleTimeString('en-US')}</p></div></div>
          <div className="h2c"><small>Mon épargne totale</small><div className="big"><b>{total}</b><button onClick={() => setHide(!hide)} aria-label={hide ? 'Afficher les soldes' : 'Masquer les soldes'}><I n={hide ? 'eye' : 'eyeoff'} s={22} /></button></div><span className="up">{actives.length} compte{actives.length > 1 ? 's' : ''} actif{actives.length > 1 ? 's' : ''}</span></div>
          <div className="h3c"><span className="bx r"><I n="user" s={34} /></span><div><b>{user?.name || 'Client LT Finance'}</b>{user?.code && <p>{user.code}</p>}{user?.since && <p>Client depuis le {new Date(user.since).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}</div></div>
        </section>

        <div className="dx-body">
          <aside className="dx-side">
            {[...NAV, ['set', 'sliders', 'Paramètres']].map(([k, ic, t]) => <button key={k} className={view === k ? 'on' : ''} onClick={() => go(k)}><I n={ic} s={20} />{t}</button>)}
            <div className="help"><I n="help" s={30} /><div><b>Besoin d’aide ?</b><small>Notre équipe est disponible pour vous accompagner.</small></div><button className="btn b2 sm" onClick={() => navigate({ pathname: '/', hash: '#contact' })}>Nous contacter <I n="arr" s={14} /></button></div>
          </aside>

          <main className="dx-main">
            {err && <div className="dx-err" role="alert">{err}</div>}
            {note && <div className="dx-note" role="status">{note}</div>}

            {(view === 'home' || view === 'accounts') && <>
              <h2>{view === 'home' ? 'Mes comptes d’épargne' : 'Mes comptes actifs'}</h2>
              <div className="dx-accs">
                {loading && [0, 1, 2, 3].map((i) => <Sk key={i} h={104} />)}
                {accounts && !actives.length && <p className="dx-empty">Aucun compte actif pour le moment.</p>}
                {actives.map((a, i) => <AccountCard key={a.code} a={a} i={i} hide={hide} onClick={() => (a.isCase ? setGridFor(a.code) : setView('history'))} />)}
              </div>
            </>}

            {view === 'home' && <>
              <div className="dx-two">
                <section className="dx-card">
                  <div className="hd"><h3>Dernières transactions</h3><button onClick={() => setView('history')}>Voir tout <I n="arr" s={14} /></button></div>
                  {tx === null && !err && [0, 1, 2].map((i) => <Sk key={i} h={44} />)}
                  {tx && !tx.length && <p className="dx-empty">Aucune transaction pour le moment.</p>}
                  {tx && <TxList rows={tx.slice(0, 5)} />}
                </section>
                <section className="dx-card">
                  <div className="hd"><h3>Mon objectif actuel</h3><button onClick={() => go('goals')}>Voir tous <I n="arr" s={14} /></button></div>
                  <div className="dx-goal">
                    <span className="gi"><I n="target" s={34} /></span>
                    <p><b>Aucun objectif défini</b><small>Définissez un objectif pour suivre votre progression.</small></p>
                  </div>
                  <button className="btn b1 wide" onClick={() => go('goals')}>Gérer mes objectifs <I n="arr" s={18} /></button>
                </section>
              </div>
              {/* <div className="dx-quick">
                {[['plus', 'Faire un dépôt', 'Alimenter mon épargne rapidement.', 'dep'], ['arr', 'Faire un retrait', 'Retirer mes fonds en toute sécurité.', 'ret'], ['swap', 'Transférer entre comptes', 'Déplacer mon épargne facilement.', 'tra']].map(([ic, t, d, k]) => (
                  <button key={k} onClick={() => go(k)}><span className="qi"><I n={ic} s={28} /></span><span><b>{t}</b><small>{d}</small></span><span className="go"><I n="next" s={16} /></span></button>
                ))}
              </div> */}
            </>}

            {view === 'history' && <>
              <section className="dx-card">
                <div className="hd"><h3>Toutes les transactions</h3></div>
                {tx === null && !err && [0, 1, 2, 3].map((i) => <Sk key={i} h={44} />)}
                {tx && !tx.length && <p className="dx-empty">Aucune transaction pour le moment.</p>}
                {tx && <TxList rows={tx} />}
              </section>
            </>}

            {(view === 'accounts' || view === 'history') && <section className="dx-card" style={{ marginTop: 20 }}>
              <div className="hd"><h3>Historique des comptes</h3></div>
              {accounts && !history.length && <p className="dx-empty">Aucun ancien compte.</p>}
              <ul className="dx-old">
                {history.map((a) => <li key={a.code}><span className="ic"><I n="wallet" s={20} /></span><div><b>{a.name}</b><small>N° {a.code}</small></div><i>Inactif</i><strong>{hide ? '••••••' : money(a.balance)} {a.currency}</strong></li>)}
              </ul>
            </section>}
          </main>
        </div>
      </div>
      {gridAcc && <CaseGrid account={gridAcc} onClose={() => setGridFor(null)} />}
    </div>
  );
}
