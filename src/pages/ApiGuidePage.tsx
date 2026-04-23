import { useState } from "react";
import { ExternalLink, CheckCircle2, AlertCircle, DollarSign, Zap } from "lucide-react";

interface ApiCard {
  name: string;
  description: string;
  free: boolean;
  price: string;
  url: string;
  signupUrl: string;
  use_case: string;
  steps: string[];
  envVar: string;
  example: string;
}

const instagramApis: ApiCard[] = [
  {
    name: "Apify — Instagram Scraper",
    description:
      "Plateforme cloud de scraping. L'actor 'instagram-scraper' récupère les posts, captions, images et métadonnées d'un profil public.",
    free: false,
    price: "$49/mois (plan Starter) + ~$5/mois pour l'actor",
    url: "https://apify.com/apify/instagram-scraper",
    signupUrl: "https://console.apify.com/sign-up",
    use_case: "Synchronisation automatique des nouvelles recettes @souka_yanel",
    steps: [
      "Créer un compte sur apify.com",
      "Obtenir la clé API dans Settings > Integrations",
      "Configurer l'actor 'apify/instagram-scraper' avec username='souka_yanel'",
      "Planifier un run quotidien via Apify Scheduler",
      "Récupérer les nouvelles captions via webhook ou polling dataset",
    ],
    envVar: "VITE_APIFY_TOKEN",
    example: `import ApifyClient from 'apify-client';

const client = new ApifyClient({ token: import.meta.env.VITE_APIFY_TOKEN });

const run = await client.actor("apify/instagram-scraper").call({
  usernames: ["souka_yanel"],
  resultsType: "posts",
  resultsLimit: 20,
});

const { items } = await client.dataset(run.defaultDatasetId).listItems();
// items[0].caption contient le texte de la recette`,
  },
  {
    name: "SociaVault API",
    description:
      "API REST dédiée aux données publiques Instagram. Retourne profils, posts, reels sans authentification OAuth.",
    free: false,
    price: "Dès $19/mois (500 requêtes)",
    url: "https://sociavault.com",
    signupUrl: "https://sociavault.com/signup",
    use_case: "Récupération des posts et captions en temps réel",
    steps: [
      "Créer un compte sur sociavault.com",
      "Copier votre API key dans le dashboard",
      "GET /v1/scrape/instagram/posts?handle=souka_yanel",
      "Parser les captions des posts retournés",
    ],
    envVar: "VITE_SOCIAVAULT_KEY",
    example: `const resp = await fetch(
  "https://api.sociavault.com/v1/scrape/instagram/posts?handle=souka_yanel&count=20",
  { headers: { "x-api-key": import.meta.env.VITE_SOCIAVAULT_KEY } }
);
const { data } = await resp.json();

// data[0].caption => texte de la recette avec ingrédients
// data[0].thumbnail_url => image de la recette`,
  },
];

const priceApis: ApiCard[] = [
  {
    name: "Open Prices — Open Food Facts ✅ GRATUIT",
    description:
      "Base de données communautaire et open-source des prix de produits alimentaires. API REST publique, aucune clé requise.",
    free: true,
    price: "100% gratuit — Licence AGPL",
    url: "https://prices.openfoodfacts.org",
    signupUrl: "https://prices.openfoodfacts.org/api/docs",
    use_case: "Comparaison de prix multi-enseignes en France — DÉJÀ INTÉGRÉ dans cette app",
    steps: [
      "Aucune inscription requise",
      "GET https://prices.openfoodfacts.org/api/v1/prices?product_name__icontains=pois+chiches&country=FR",
      "Les prix couvrent : Leclerc, Carrefour, Lidl, Aldi, Monoprix, etc.",
      "Contribuer en ajoutant des prix via l'app Open Food Facts",
    ],
    envVar: "(aucune clé requise)",
    example: `// Aucune clé API nécessaire !
const res = await fetch(
  "https://prices.openfoodfacts.org/api/v1/prices" +
  "?product_name__icontains=pois+chiches" +
  "&country=FR&size=20&order_by=price"
);
const { items } = await res.json();

// items[0].price => prix le plus bas
// items[0].location.osm_name => nom du magasin`,
  },
  {
    name: "Piloterr — API Multi-Retailers France",
    description:
      "API spécialisée dans le retail français : Leclerc, Carrefour, Auchan, Intermarché. Données normalisées cross-retailers par code EAN.",
    free: false,
    price: "49 €/mois (5 000 produits) — 499 €/mois (illimité)",
    url: "https://piloterr.com",
    signupUrl: "https://piloterr.com/register",
    use_case: "Comparaison précise inter-enseignes avec historique des prix",
    steps: [
      "Créer un compte sur piloterr.com",
      "Obtenir la clé API dans votre dashboard",
      "GET /v2/products/carrefour?search=pois+chiches",
      "Normaliser les résultats par EAN pour comparer entre enseignes",
    ],
    envVar: "VITE_PILOTERR_KEY",
    example: `const res = await fetch(
  "https://api.piloterr.com/v2/products/carrefour?search=pois+chiches",
  { headers: { "x-api-key": import.meta.env.VITE_PILOTERR_KEY } }
);
const products = await res.json();

// Comparer avec Leclerc :
const resLeclerc = await fetch(
  "https://api.piloterr.com/v2/products/leclerc?search=pois+chiches",
  { headers: { "x-api-key": import.meta.env.VITE_PILOTERR_KEY } }
);`,
  },
  {
    name: "Open Food Facts — Base produits",
    description:
      "Base de données ouverte de 3+ millions de produits alimentaires avec Nutri-Score, composition, codes EAN. Gratuite.",
    free: true,
    price: "100% gratuit",
    url: "https://world.openfoodfacts.org",
    signupUrl: "https://world.openfoodfacts.org/api",
    use_case: "Enrichir les ingrédients avec Nutri-Score et informations nutritionnelles",
    steps: [
      "Aucune inscription requise",
      "GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=pois+chiches&search_simple=1&json=1",
      "Ou par code EAN : GET https://world.openfoodfacts.org/api/v2/product/3256225476558",
      "Lier les ingrédients aux produits pour obtenir Nutri-Score et macros",
    ],
    envVar: "(aucune clé requise)",
    example: `// Recherche par nom
const res = await fetch(
  "https://world.openfoodfacts.org/cgi/search.pl" +
  "?search_terms=pois+chiches&search_simple=1&json=1&page_size=5"
);
const { products } = await res.json();

// products[0].nutriscore_grade => "a", "b", "c"...
// products[0].nutriments => { proteins_100g, fat_100g, ... }`,
  },
];

function ApiCardComponent({ api }: { api: ApiCard }) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className={`api-card ${api.free ? "free" : "paid"}`}>
      <div className="api-card-header">
        <div className="api-card-title-row">
          <h3>{api.name}</h3>
          {api.free ? (
            <span className="free-badge">
              <CheckCircle2 size={14} />
              Gratuit
            </span>
          ) : (
            <span className="paid-badge">
              <DollarSign size={14} />
              Payant
            </span>
          )}
        </div>
        <p className="api-price">{api.price}</p>
        <p className="api-description">{api.description}</p>
        <div className="api-use-case">
          <Zap size={14} />
          <strong>Usage :</strong> {api.use_case}
        </div>
      </div>

      <div className="api-steps">
        <h4>Étapes d'intégration</h4>
        <ol>
          {api.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="api-env">
        <span className="env-label">Variable .env :</span>
        <code className="env-code">{api.envVar}</code>
      </div>

      <div className="api-code-toggle">
        <button onClick={() => setShowCode(!showCode)} className="btn-code-toggle">
          {showCode ? "▼ Masquer" : "▶ Voir"} l'exemple de code
        </button>
        {showCode && (
          <pre className="code-block">
            <code>{api.example}</code>
          </pre>
        )}
      </div>

      <div className="api-links">
        <a href={api.url} target="_blank" rel="noopener noreferrer" className="api-link-btn">
          <ExternalLink size={14} />
          Documentation
        </a>
        <a href={api.signupUrl} target="_blank" rel="noopener noreferrer" className="api-signup-btn">
          {api.free ? "Voir l'API" : "S'inscrire"}
        </a>
      </div>
    </div>
  );
}

export default function ApiGuidePage() {
  return (
    <div className="api-guide-page">
      <h1>🔌 Guide des APIs</h1>
      <p className="api-guide-intro">
        Cette application utilise l'API <strong>Open Prices</strong> (gratuite) pour la
        comparaison de prix. Voici toutes les APIs disponibles pour étendre les
        fonctionnalités, avec coûts et instructions d'intégration.
      </p>

      <div className="env-reminder">
        <AlertCircle size={18} />
        <div>
          <strong>Configuration des clés API</strong>
          <p>
            Créer un fichier <code>.env</code> à la racine du projet :
          </p>
          <pre className="env-block">
{`# .env (ne jamais committer ce fichier)
VITE_APIFY_TOKEN=your_token_here
VITE_SOCIAVAULT_KEY=your_key_here
VITE_PILOTERR_KEY=your_key_here
# Open Prices et Open Food Facts = pas de clé requise`}
          </pre>
        </div>
      </div>

      <section>
        <h2>📸 APIs pour récupérer les recettes Instagram</h2>
        <p>
          Ces APIs automatisent la récupération des nouvelles recettes publiées sur{" "}
          <strong>@souka_yanel</strong>. Sans ces APIs, les recettes sont stockées
          statiquement dans <code>src/data/recipes.ts</code>.
        </p>
        <div className="api-cards-grid">
          {instagramApis.map((api) => (
            <ApiCardComponent key={api.name} api={api} />
          ))}
        </div>
      </section>

      <section>
        <h2>🛒 APIs pour la comparaison de prix</h2>
        <p>
          L'API <strong>Open Prices</strong> est déjà intégrée et gratuite.
          Les autres options offrent des données plus précises ou plus récentes.
        </p>
        <div className="api-cards-grid">
          {priceApis.map((api) => (
            <ApiCardComponent key={api.name} api={api} />
          ))}
        </div>
      </section>

      <section className="budget-summary">
        <h2>💶 Récapitulatif des coûts</h2>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Usage</th>
              <th>Coût/mois</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr className="free-row">
              <td>Open Prices (Open Food Facts)</td>
              <td>Comparaison de prix</td>
              <td>0 €</td>
              <td>✅ Inclus</td>
            </tr>
            <tr className="free-row">
              <td>Open Food Facts (produits)</td>
              <td>Nutri-Score, macros</td>
              <td>0 €</td>
              <td>Optionnel</td>
            </tr>
            <tr>
              <td>Apify (Instagram Scraper)</td>
              <td>Sync automatique recettes</td>
              <td>~54 $/mois</td>
              <td>Optionnel</td>
            </tr>
            <tr>
              <td>SociaVault</td>
              <td>Alternative Instagram API</td>
              <td>19 $/mois</td>
              <td>Optionnel</td>
            </tr>
            <tr>
              <td>Piloterr</td>
              <td>Prix précis multi-retailers FR</td>
              <td>49 €/mois</td>
              <td>Optionnel</td>
            </tr>
            <tr className="total-row">
              <td colSpan={2}><strong>Total minimum (version gratuite)</strong></td>
              <td><strong>0 €/mois</strong></td>
              <td>✅</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
