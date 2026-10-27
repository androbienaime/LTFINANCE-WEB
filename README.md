# LT Finance – Front-end (React + Vite)

Site vitrine + espace client de LT Finance. Il consomme l'API Laravel (projet séparé).

## Démarrage

```bash
npm install
cp .env.example .env     # puis adaptez VITE_API_URL
npm run dev              # http://localhost:5173
```

Sans `VITE_API_URL`, le site tourne en **mode démo** : connexion, contact et newsletter sont simulés.

## Structure

```
src/
  main.jsx            point d'entrée
  App.jsx             assemble les sections, gère le thème clair/sombre
  components/         Header, Menu, Hero, Login, Solutions, Why, Edu, How,
                      Projects, Commit, Faq, Contact, Footer, Dash, Count, Brand
  hooks/useReveal.js  animations d'apparition au scroll
  lib/api.js          client API (JWT Bearer), à adapter à vos routes
  lib/icons.jsx       icônes SVG + courbes décoratives
  lib/nav.js          liens de navigation
  styles/global.css   styles (variables de couleur, thème sombre, responsive)
  assets/images/      logo et photos
```

## API Laravel : ce qu'il faut côté serveur

`src/lib/api.js` attend :

| Usage | Route (modifiable via `.env`) | Corps JSON | Réponse |
|---|---|---|---|
| Connexion client | `POST /customer/login` | `{ login, password }` | `{ token }` ou `{ access_token }` |
| Contact | `POST /public/contact` | `{ name, email, subject, message, consent }` | 200/201 |
| Newsletter | `POST /public/newsletter` | `{ email }` | 200/201 |

Pensez à : validation stricte, `throttle` sur les routes publiques, et messages d'erreur dans `message` (les erreurs 422 sont dans `errors`).

### CORS (Laravel `config/cors.php`)

```php
'paths' => ['api/*'],
'allowed_origins' => ['https://ltfinance.org', 'http://localhost:5173'],
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
'supports_credentials' => false, // jeton Bearer, pas de cookies
```

## Déploiement sur HostGator (sans Node sur le serveur)

1. Créez `.env.production` avec la vraie `VITE_API_URL`.
2. `npm run build` sur votre machine.
3. Envoyez le **contenu** de `dist/` dans `public_html/` (ou le dossier du domaine). Le fichier `.htaccess` (copié depuis `public/`) gère le retour sur `index.html`.
4. API : sous-domaine `api.ltfinance.org` pointant vers le dossier `public` de Laravel.

## À faire ensuite

- Page « Mon espace » (après connexion) : solde, objectifs, mouvements via vos routes `customer/*`.
- Remplacer les liens du pied de page (mentions légales, confidentialité) par les vrais documents.
- Traduction créole (HT) : le bouton existe, les textes ne sont pas encore traduits.
- Ajouter l'option « Se souvenir de moi » (paramètre `remember` de `login()` déjà prêt).
