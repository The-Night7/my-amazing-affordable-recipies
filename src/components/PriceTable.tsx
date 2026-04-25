import { useState } from "react";
import { ShoppingCart, TrendingDown, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import type { Market } from "../types/market";
import type { PriceResult } from "../hooks/useOpenPrices";

type PriceTableProps = {
  priceResults: Map<string, PriceResult>;
  loadingAll: boolean;
  onFetch: () => void;
  fetched: boolean;
  selectedMarkets: Market[];
};

type PriceItem = {
  productName: string;
  store?: string;
  brand?: string;
  price: number;
  currency: string;
  quantity?: string;
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
      style={{ backgroundColor: color + "18", color, border: `1px solid ${color}40` }}
    >
      {name}
    </span>
  );
}

export function PriceTable({ priceResults, loadingAll, onFetch, fetched, selectedMarkets }: PriceTableProps) {
  const selectedNames = selectedMarkets.map((market) =>
    normalizeName(market.brand || market.name)
  );

  // Extract all prices from the priceResults map
  const allPrices: PriceItem[] = [];
  priceResults.forEach((result) => {
    if (result.prices) {
      allPrices.push(...result.prices);
    }
  });

  const filteredPrices =
    selectedMarkets.length === 0
      ? allPrices
      : allPrices.filter((price) => {
          const storeName = normalizeName(price.store || price.brand || "");
          
          return selectedNames.some((selectedName) => {
            return (
              storeName.includes(selectedName) ||
              selectedName.includes(storeName)
            );
          });
        });

  if (selectedMarkets.length === 0) {
    return (
      <section className="price-table-empty">
        <ShoppingCart size={48} className="text-gray-300" />
        <h3>Comparateur de prix</h3>
        <p>
          Sélectionne des marchés proches pour obtenir une comparaison plus
          ciblée.
        </p>
    </section>
  );
}

  if (loadingAll) {
    return (
      <section className="price-table">
        <h2>Comparateur de prix</h2>
        <div className="loading-state">
          <RefreshCw size={24} className="animate-spin" />
          <p>Chargement des prix...</p>
        </div>
      </section>
    );
  }

  if (!fetched) {
    return (
      <section className="price-table">
        <h2>Comparateur de prix</h2>
        <div className="fetch-prompt">
          <button onClick={onFetch} className="fetch-button">
            <RefreshCw size={18} />
            Charger les prix
          </button>
        </div>
      </section>
    );
  }

  if (filteredPrices.length === 0) {
    return (
      <section className="price-table">
        <h2>Comparateur de prix</h2>
        <p>
          Aucun prix précis trouvé pour les marchés sélectionnés. Les données
          peuvent être incomplètes selon les enseignes disponibles.
        </p>
      </section>
    );
  }

  return (
    <section className="price-table">
      <h2>Prix dans les marchés sélectionnés</h2>

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
          {filteredPrices.map((item, index) => (
            <tr key={`${item.productName}-${index}`}>
              <td>{item.productName}</td>
              <td>{item.store || item.brand || "Magasin inconnu"}</td>
              <td>{item.quantity || "-"}</td>
              <td>
                {item.price.toFixed(2)} {item.currency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="price-footer">
        <p className="price-disclaimer">
          ⚠️ Prix indicatifs issus de la base communautaire. Les prix peuvent varier selon la région et la date.
        </p>
      </div>
    </section>
  );
}