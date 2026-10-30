/**
 * Comptes « à cases » (livret) : tout compte qui renvoie le champ active_case_payments.
 * Une grille = `duration` mois × 30 cases. La case n vaut n × price. `paid` = cases déjà payées, avec leur date.
 * Tolérant sur la forme de active_case_payments : adaptez les noms de champs ci-dessous à votre API si besoin.
 */
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
const pick = (o, ...keys) => { for (const k of keys) if (o?.[k] != null) return o[k]; };

const DURATION_KEYS = ['duration', 'months', 'duration_months', 'nb_months', 'number_of_months'];
const PRICE_KEYS = ['case_price', 'price_per_case', 'unit_price', 'case_amount', 'amount_per_case'];
const NUM_KEYS = ['case_number', 'number', 'case', 'n', 'case_no', 'value', 'tag', 'tag_number', 'tag_no'];
const MULTI_KEYS = ['cases', 'case_numbers', 'numbers'];
const DATE_KEYS = ['paid_at', 'payment_date', 'transaction_date', 'date', 'created_at'];

// cherche une clé simple dans l'objet puis dans ses sous-objets (type de compte, plan…)
const deepPick = (o, keys, depth = 3) => {
  if (!o || typeof o !== 'object' || depth < 0) return undefined;
  for (const k of keys) if (o[k] != null && typeof o[k] !== 'object') return o[k];
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) { const r = deepPick(v, keys, depth - 1); if (r !== undefined) return r; }
  }
};

const dateOf = (c) => pick(c, ...DATE_KEYS) ?? pick(c?.transaction, ...DATE_KEYS);

// transforme une entrée (nombre, objet case, ou paiement couvrant plusieurs cases) en [{ n, date }]
const entries = (c, inherited) => {
  if (c == null) return [];
  if (typeof c !== 'object') { const n = num(c); return n ? [{ n, date: inherited }] : []; }
  const date = dateOf(c) ?? inherited;
  const multi = MULTI_KEYS.map((k) => c[k]).find(Array.isArray);
  if (multi) return multi.flatMap((x) => entries(x, date));
  const n = num(pick(c, ...NUM_KEYS));
  return n ? [{ n, date }] : [];
};

/** Construit la grille à partir de la durée (mois), du prix de base et de la liste des cases payées. */
export function buildCases(duration, price, list) {
  duration = num(duration); price = num(price);
  if (!duration || duration <= 0 || !price || price <= 0) return null;
  const found = Array.isArray(list)
    ? list.flatMap((c) => entries(c))
    : list && typeof list === 'object' && Object.keys(list).every((k) => /^\d+$/.test(k))
      ? Object.entries(list).map(([n, d]) => ({ n: Number(n), date: typeof d === 'string' ? d : undefined })) // { "12": "2026-10-26", … }
      : Object.values(list || {}).flatMap((c) => entries(c));

  const max = duration * 30;
  const byCase = new Map();
  found.forEach(({ n, date }) => { if (n > 0 && n <= max && !byCase.has(n)) byCase.set(n, date ?? null); });
  const paidList = [...byCase].map(([n, date]) => ({ n, date })).sort((x, y) => x.n - y.n);
  const paid = paidList.map((p) => p.n);
  const saved = paid.reduce((s, n) => s + n * price, 0);
  const totalValue = (price * max * (max + 1)) / 2;
  return { duration, price, max, paid, paidList, dates: Object.fromEntries(paidList.map((p) => [p.n, p.date])), saved, totalValue, left: max - paid.length, pct: Math.round((paid.length / max) * 100) };
}

export function normCases(a) {
  const raw = a?.active_case_payments;
  if (raw == null || raw === false) return null;

  const obj = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const duration = num(pick(obj, ...DURATION_KEYS) ?? pick(a, ...DURATION_KEYS) ?? deepPick(a, DURATION_KEYS));
  const price = num(pick(obj, ...PRICE_KEYS, 'price') ?? pick(a, ...PRICE_KEYS, 'price') ?? deepPick(a, PRICE_KEYS));

  if (!duration || duration <= 0 || !price || price <= 0) {
    if (import.meta.env.DEV) console.warn('[cases] grille impossible à construire (duration/price introuvables). active_case_payments =', raw, '| compte =', a);
    return null;
  }

  const list = Array.isArray(raw) ? raw : pick(obj, 'paid', 'paid_cases', 'cases', 'payments', 'items', 'data') ?? pick(a, 'paid_cases') ?? [];
  return buildCases(duration, price, list);
}
