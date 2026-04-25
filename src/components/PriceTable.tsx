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
};

type FlexiblePriceResult = PriceResult & {
  entries?: DisplayPriceEntry[];
  prices?: DisplayPriceEntry[];
  results?: DisplayPriceEntry[];
};

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
}

const STORE_COLORS: Record<string, string> = {
  "E.Leclerc": "#0066CC",
  Carrefour: "#004A99",
  Intermarché: "#E30613",
  Lidl: "#0050AA",
  Aldi: "#1E4798",
  Monoprix: "#E31E24",
  Casino: "#FFCC00",
  "Super U": "#E30613",
};

function StoreTag({ name }: { name: string }) {
  const color = STORE_COLORS[name] || "#6B7280";

  return (
    <span
      className="store-tag"
      style={{
        backgroundColor: color + "18",
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}

export function PriceTable({
  priceResults,
  loadingAll,
  onFetch,
  fetched,
  selectedMarkets,
}: PriceTableProps) {
  return (
    <section className="price-table">
      <div className="price-table__header">
        <div>
          <h2>Comparateur de prix</h2>

          {selectedMarkets.length > 0 ? (
            <p>Prix filtrés selon les marchés sélectionnés autour de toi.</p>
          ) : (
            <p>Sélectionne des marchés proches pour cibler la comparaison.</p>
          )}
        </div>

        <button type="button" onClick={onFetch} disabled={loadingAll}>
          {loadingAll ? "Recherche..." : "Comparer les prix"}
        </button>
      </div>

      {!fetched && <p>Lance une recherche pour afficher les prix disponibles.</p>}

      {fetched && priceResults.size === 0 && (
        <p>Aucun prix trouvé pour cette recette.</p>
      )}

      {fetched && priceResults.size > 0 && (
        <div className="price-table__content">
          {Array.from(priceResults.entries()).map(([ingredientName, result]) => {
            const entries = getEntriesFromResult(result);

            const filteredEntries = entries.filter((entry) =>
              matchesSelectedMarket(entry, selectedMarkets)
            );

            return (
              <div key={ingredientName} className="price-table__ingredient">
                <h3>{ingredientName}</h3>

                {filteredEntries.length === 0 ? (
                  <p>Aucun prix trouvé dans les marchés sélectionnés.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Magasin</th>
                        <th>Quantité</th>
                        <th>Prix</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEntries.map((entry, index) => {
                        const storeName = getStoreName(entry);

                        return (
                          <tr key={`${ingredientName}-${index}`}>
                            <td>{getProductName(entry)}</td>
                            <td>
                              <StoreTag name={storeName} />
                            </td>
                            <td>{getQuantity(entry)}</td>
                            <td>{formatPrice(entry)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
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
    price.store || price.brand || price.location || ""
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

function getProductName(entry: DisplayPriceEntry): string {
  return (
    entry.productName ||
    entry.product_name ||
    entry.product ||
    "Produit alimentaire"
  );
}

function getStoreName(entry: DisplayPriceEntry): string {
  return entry.store || entry.brand || entry.location || "Magasin inconnu";
}

function getQuantity(entry: DisplayPriceEntry): string {
  return entry.quantity || "-";
}

function formatPrice(entry: DisplayPriceEntry): string {
  if (typeof entry.price !== "number") {
    return "-";
  }

  return `${entry.price.toFixed(2)} ${entry.currency || "€"}`;
}
