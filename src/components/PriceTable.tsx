import {
  AlertCircle,
  RefreshCw,
  ShoppingCart,
  Store,
  TrendingDown,
} from "lucide-react";
import type { Market } from "../types/market";
import type { PriceEntry, PriceResult } from "../hooks/useOpenPrices";

type PriceTableProps = {
  priceResults: Map<string, PriceResult>;
  loadingAll: boolean;
  onFetch: () => void;
  fetched: boolean;
  selectedMarkets: Market[];
};

type DisplayPriceEntry = PriceEntry & {
  productName?: string;
  product_name?: string;
  product?: string;
  quantity?: string;
  store?: string;
  brand?: string;
  location?: string;
  source?: string;
};

type FlexiblePriceResult = PriceResult & {
  entries?: DisplayPriceEntry[];
  prices?: DisplayPriceEntry[];
  results?: DisplayPriceEntry[];
};

const STORE_COLORS: Record<string, string> = {
  "E.Leclerc": "#0066CC",
  Carrefour: "#004A99",
  Intermarché: "#E30613",
  Lidl: "#0050AA",
  Aldi: "#1E4798",
  Monoprix: "#E31E24",
  Casino: "#FFCC00",
  "Super U": "#E30613",
  Marjane: "#E30613",
  BIM: "#E31E24",
  "Open Prices": "#6B7280",
};

export function PriceTable({
  priceResults,
  loadingAll,
  onFetch,
  fetched,
  selectedMarkets,
}: PriceTableProps) {
  const totalIngredients = priceResults.size;
  const selectedMarketCount = selectedMarkets.length;

  return (
    <section className="price-comparator">
      <div className="price-comparator__hero">
        <div className="price-comparator__icon">
          <ShoppingCart size={24} />
        </div>

        <div className="price-comparator__intro">
          <p className="eyebrow">Comparateur de prix</p>
          <h2>Prix des ingrédients</h2>

          <p>
            Compare les prix disponibles pour les ingrédients de cette recette.
            Les données Open Prices sont indicatives et peuvent ne pas être
            reliées à une enseigne précise.
          </p>
        </div>

        <button
          type="button"
          onClick={onFetch}
          disabled={loadingAll}
          className="price-comparator__button"
        >
          {loadingAll ? (
            <>
              <RefreshCw size={18} className="spin" />
              Recherche...
            </>
          ) : (
            <>
              <TrendingDown size={18} />
              Comparer les prix
            </>
          )}
        </button>
      </div>

      <div className="price-comparator__stats">
        <div className="price-stat">
          <span>{selectedMarketCount}</span>
          <small>
            marché{selectedMarketCount > 1 ? "s" : ""} sélectionné
            {selectedMarketCount > 1 ? "s" : ""}
          </small>
        </div>

        <div className="price-stat">
          <span>{totalIngredients}</span>
          <small>
            ingrédient{totalIngredients > 1 ? "s" : ""} recherché
            {totalIngredients > 1 ? "s" : ""}
          </small>
        </div>

        <div className="price-stat price-stat--soft">
          <span>Open Prices</span>
          <small>source indicative</small>
        </div>
      </div>

      {selectedMarkets.length > 0 && (
        <div className="price-comparator__notice">
          <AlertCircle size={18} />
          <p>
            Les marchés proches servent à affiner la comparaison quand les
            données le permettent. Si aucun prix exact n'est trouvé, l'app
            affiche des prix indicatifs disponibles.
          </p>
        </div>
      )}

      {!fetched && !loadingAll && (
        <div className="price-empty-state">
          <div className="price-empty-state__icon">
            <Store size={28} />
          </div>

          <h3>Aucune recherche lancée</h3>
          <p>
            Clique sur "Comparer les prix" pour récupérer les prix disponibles
            pour les ingrédients de cette recette.
          </p>
        </div>
      )}

      {loadingAll && (
        <div className="price-loading">
          <RefreshCw size={24} className="spin" />
          <p>Recherche des meilleurs prix disponibles...</p>
        </div>
      )}

      {fetched && priceResults.size === 0 && !loadingAll && (
        <div className="price-empty-state">
          <div className="price-empty-state__icon price-empty-state__icon--warning">
            <AlertCircle size={28} />
          </div>

          <h3>Aucun prix trouvé</h3>
          <p>
            Les données disponibles ne contiennent pas encore de prix exploitable
            pour cette recette.
          </p>
        </div>
      )}

      {fetched && priceResults.size > 0 && !loadingAll && (
        <div className="price-comparator__list">
          {Array.from(priceResults.entries()).map(([ingredientName, result]) => {
            const entries = getEntriesFromResult(result);

            const validEntries = entries
              .filter((entry) => isValidPriceEntry(entry))
              .filter((entry) => matchesIngredient(entry, ingredientName))
              .sort((a, b) => getPriceValue(a) - getPriceValue(b));

            const marketEntries = validEntries.filter((entry) =>
              matchesSelectedMarket(entry, selectedMarkets)
            );

            const hasSelectedMarkets = selectedMarkets.length > 0;
            const hasMarketMatches = marketEntries.length > 0;

            const entriesToDisplay =
              hasSelectedMarkets && hasMarketMatches
                ? marketEntries.slice(0, 8)
                : validEntries.slice(0, 8);

            const isFallback =
              hasSelectedMarkets && !hasMarketMatches && validEntries.length > 0;

            const bestPrice = entriesToDisplay[0];
            return (
              <article
                key={ingredientName}
                className="price-ingredient-card"
              >
                <header className="price-ingredient-card__header">
                  <div>
                    <p className="eyebrow">Ingrédient</p>
                    <h3>{ingredientName}</h3>
                  </div>

                  {bestPrice && (
                    <div className="best-price-pill">
                      <span>Meilleur prix</span>
                      <strong>{formatPrice(bestPrice)}</strong>
                    </div>
                  )}
                </header>

                {isFallback && (
                  <div className="price-fallback">
                    <AlertCircle size={17} />
                    <p>
                      Aucun prix exact trouvé dans les marchés sélectionnés.
                      Affichage des prix indicatifs disponibles via Open Prices.
                    </p>
                  </div>
                )}

                {entriesToDisplay.length === 0 ? (
                  <div className="price-row-empty">
                    Aucun prix exploitable trouvé pour cet ingrédient.
                  </div>
                ) : (
                  <div className="price-table-wrapper">
                    <table className="price-table-modern">
                      <thead>
                        <tr>
                          <th>Produit</th>
                          <th>Source</th>
                          <th>Quantité</th>
                          <th>Prix</th>
                        </tr>
                      </thead>

                      <tbody>
                        {entriesToDisplay.map((entry, index) => {
                          const storeName = getStoreName(entry);
                          const isBestPrice = index === 0;
                          return (
                            <tr
                              key={`${ingredientName}-${index}`}
                              className={isBestPrice ? "is-best-price" : ""}
                            >
                              <td>
                                <div className="product-cell">
                                  <strong>{getProductName(entry)}</strong>

                                  {isBestPrice && (
                                    <span className="best-label">
                                      Prix le plus bas
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <StoreTag name={storeName} />
                              </td>

                              <td>{getQuantity(entry)}</td>

                              <td>
                                <strong className="price-value">
                                  {formatPrice(entry)}
                                </strong>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StoreTag({ name }: { name: string }) {
  const color = getStoreColor(name);

  return (
    <span
      className="store-tag"
      style={{
        backgroundColor: `${color}18`,
        color,
        border: `1px solid ${color}35`,
      }}
    >
      {name}
    </span>
  );
}
function getStoreColor(name: string): string {
  const directColor = STORE_COLORS[name];

  if (directColor) {
    return directColor;
  }
  const normalized = normalizeName(name);

  if (normalized.includes("carrefour")) return STORE_COLORS.Carrefour;
  if (normalized.includes("lidl")) return STORE_COLORS.Lidl;
  if (normalized.includes("aldi")) return STORE_COLORS.Aldi;
  if (normalized.includes("bim")) return STORE_COLORS.BIM;
  if (normalized.includes("marjane")) return STORE_COLORS.Marjane;
  if (normalized.includes("leclerc")) return STORE_COLORS["E.Leclerc"];

  return "#6B7280";
}

function getEntriesFromResult(result: PriceResult): DisplayPriceEntry[] {
  const flexibleResult = result as FlexiblePriceResult;

  if (Array.isArray(flexibleResult.entries)) {
    return flexibleResult.entries;
  }

  if (Array.isArray(flexibleResult.prices)) {
    return flexibleResult.prices;
  }

  if (Array.isArray(flexibleResult.results)) {
    return flexibleResult.results;
  }

  return [];
}

function matchesSelectedMarket(
  price: DisplayPriceEntry,
  selectedMarkets: Market[]
): boolean {
  if (selectedMarkets.length === 0) {
    return true;
  }

  const selectedNames = selectedMarkets.map((market) =>
    normalizeName(market.brand || market.name)
  );

  const priceStoreName = normalizeName(
    price.store || price.brand || price.location || price.source || ""
  );

  if (!priceStoreName) {
    return false;
  }

  return selectedNames.some((selectedName) => {
    return (
      priceStoreName.includes(selectedName) ||
      selectedName.includes(priceStoreName)
    );
  });
}

function isValidPriceEntry(entry: DisplayPriceEntry): boolean {
  if (typeof entry.price !== "number") {
    return false;
  }

  if (entry.price <= 0.05) {
    return false;
  }

  if (entry.currency && entry.currency.toUpperCase() !== "EUR") {
    return false;
  }

  const productName = getProductName(entry);

  if (!productName || productName === "Produit alimentaire") {
    return false;
  }

  return true;
}

function matchesIngredient(
  entry: DisplayPriceEntry,
  ingredientName: string
): boolean {
  const productName = normalizeName(getProductName(entry));
  const ingredient = normalizeName(ingredientName);

  if (!productName || !ingredient) {
    return false;
  }

  if (productName.includes(ingredient)) {
    return true;
  }

  const words = ingredient
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);

  if (words.length === 0) {
    return false;
  }

  return words.some((word) => productName.includes(word));
}

function getProductName(entry: DisplayPriceEntry): string {
  return (
    entry.productName ||
    entry.product_name ||
    entry.product ||
    "Produit alimentaire"
  );
}

function getStoreName(entry: DisplayPriceEntry): string {
  const rawStore = entry.store || entry.brand || entry.location || entry.source || "";
  const normalized = normalizeName(rawStore);

  if (
    !rawStore ||
    normalized === "france" ||
    normalized === "fr" ||
    normalized === "unknown" ||
    normalized === "inconnu"
  ) {
    return "Open Prices";
  }

  return rawStore;
}

function getQuantity(entry: DisplayPriceEntry): string {
  return entry.quantity || "-";
}

function getPriceValue(entry: DisplayPriceEntry): number {
  return typeof entry.price === "number" ? entry.price : Number.POSITIVE_INFINITY;
}

function formatPrice(entry: DisplayPriceEntry): string {
  if (typeof entry.price !== "number" || entry.price <= 0.05) {
    return "-";
  }

  return `${entry.price.toFixed(2)} ${entry.currency || "EUR"}`;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}