/**
 * Règles de déconnexion automatique du site (sans dépendance à React : testable seul).
 *
 * Causes :
 *  - expiration du jeton (expires_at renvoyé par l'API)
 *  - inactivité : aucune action pendant `idleMs` (l'activité d'un autre onglet compte aussi)
 *  - onglet resté masqué ≥ `hiddenMs` (veille de l'ordinateur, onglet oublié)
 *  - jeton refusé par le serveur (401)
 *
 * APPAREILS DE CONFIANCE (à venir) : passer `trusted` à policyFor() (voir <SessionGuard trusted />)
 * et ajuster TRUSTED_POLICY.
 */
const minutes = (n) => n * 60_000;

export const DEFAULT_POLICY = { idleMs: minutes(5), hiddenMs: minutes(15), warnMs: 30_000 };

/** Valeurs provisoires pour les appareils de confiance : à valider quand cette fonctionnalité existera. */
export const TRUSTED_POLICY = { idleMs: minutes(30), hiddenMs: minutes(60), warnMs: 30_000 };

export const policyFor = ({ trusted = false } = {}) => (trusted ? TRUSTED_POLICY : DEFAULT_POLICY);

/** Temps restant (ms) avant la déconnexion pour inactivité ; Infinity si désactivée (idleMs = null). */
export const idleLeft = (lastActivity, now, p) => (p.idleMs == null ? Infinity : p.idleMs - (now - lastActivity));

/** L'onglet est-il resté masqué trop longtemps ? */
export const hiddenExpired = (hiddenAt, now, p) => hiddenAt != null && p.hiddenMs != null && now - hiddenAt >= p.hiddenMs;

export function logoutMessage(reason, p = DEFAULT_POLICY) {
  switch (reason) {
    case 'idle': return `Vous avez été déconnecté après ${Math.round((p.idleMs ?? 0) / 60_000)} minutes d’inactivité.`;
    case 'hidden': return 'Vous avez été déconnecté : la page est restée trop longtemps en arrière-plan.';
    case 'expired': return 'Votre session a expiré. Reconnectez-vous.';
    case 'unauthorized': return 'Votre session n’est plus valide. Reconnectez-vous.';
    default: return '';
  }
}
