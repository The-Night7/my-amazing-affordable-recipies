# 🥗 Recettes Souka — Application React TSX

Application web complète listant les recettes healthy de **[@souka_yanel](https://www.instagram.com/souka_yanel/)** avec comparateur de prix en supermarché.

## ✨ Fonctionnalités

- **13 recettes** extraites des posts Instagram/TikTok/Threads de @souka_yanel
- **Filtrage** par catégorie et recherche par nom/ingrédient
- **Détail complet** de chaque recette : ingrédients cochables, instructions étape par étape
- **Comparateur de prix** via l'API gratuite Open Prices (Open Food Facts)
- **Guide des APIs** pour étendre l'application (Apify, SociaVault, Piloterr)

## 🚀 Lancement

```bash
# Installer les dépendances
npm install

# Développement (hot reload)
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

## 📁 Structure du projet

```
src/
├── data/
│   └── recipes.ts          # 13 recettes en JSON TypeScript
├── components/
│   ├── Navbar.tsx           # Barre de navigation
│   ├── RecipeCard.tsx       # Carte recette dans la grille
│   └── PriceTable.tsx       # Tableau comparatif des prix
├── hooks/
│   └── useOpenPrices.ts     # Hook React pour l'API Open Prices
├── pages/
│   ├── HomePage.tsx         # Grille de recettes avec filtres
│   ├── RecipePage.tsx       # Détail recette + comparateur prix
│   └── ApiGuidePage.tsx     # Guide d'intégration des APIs
├── App.tsx                  # Routeur principal
└── App.css                  # Styles complets
```

## 🔌 APIs utilisées

### Gratuite & Intégrée
- **[Open Prices](https://prices.openfoodfacts.org/api/docs)** (Open Food Facts) — Comparaison de prix en supermarché. Aucune clé requise.

### Optionnelles (voir Guide APIs dans l'app)

Pour automatiser la récupération des nouvelles recettes Instagram :
- **[Apify Instagram Scraper](https://apify.com/apify/instagram-scraper)** — $49/mois
- **[SociaVault API](https://sociavault.com)** — $19/mois

Pour des prix plus précis :
- **[Piloterr](https://piloterr.com)** — 49 €/mois (Leclerc, Carrefour, Auchan, Intermarché)

### Configuration (optionnel)

Créer un fichier `.env` à la racine :

```env
VITE_APIFY_TOKEN=your_token_here
VITE_SOCIAVAULT_KEY=your_key_here
VITE_PILOTERR_KEY=your_key_here
# Open Prices = pas de clé requise
```

## 🥘 Recettes incluses

| Recette | Catégorie | Source |
|---|---|---|
| Salade Pois Chiches Healthy | Salade | TikTok |
| Lunch Box Roquette Avocat | Salade | Instagram |
| Salade Roquette Saumon Fumé | Salade | TikTok |
| Salade Chan Tan (Feta, Olives) | Salade | Threads |
| Dîner Express Courgette Lait de Coco | Plat | TikTok |
| Protein Lemon Balls 🍋 | Snack | TikTok |
| Energy Balls Anti-Gaspille | Snack | TikTok |
| Crêpes Healthy au Skyr & Banane | Petit déj | TikTok |
| Bowl Cake Chocolat (5 min) | Petit déj | TikTok |
| Gâteau Noix de Coco Sans Gluten | Dessert | Instagram |
| Biscuits Amandes Anis & Sésame | Dessert | Instagram |
| Donuts Poulet & Légumes | Plat | TikTok |
| Harcha Healthy Sans Gluten | Petit déj | TikTok |

## 🛒 Magasins couverts (via Open Prices)

E.Leclerc · Carrefour · Intermarché · Lidl · Aldi · Monoprix · Super U

## 🏗️ Stack technique

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **React Router DOM** (navigation)
- **Lucide React** (icônes)
- **Open Prices API** (prix alimentaires)

## 📄 Licence

Ce projet est à usage personnel. Les recettes appartiennent à **Soukaina (@souka_yanel)** — merci de la suivre et de la soutenir !
