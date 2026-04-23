import { useState } from "react";
import { ShoppingCart, TrendingDown, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import type { PriceResult } from "../hooks/useOpenPrices";

interface PriceTableProps {
  priceResults: Map<string, PriceResult>;
  loadingAll: boolean;
  onFetch: () => void;
  fetched: boolean;
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

function PriceRow({ result }: { result: PriceResult }) {
  const [expanded, setExpanded] = useState(false);

  if (result.loading) {
    return (
      <div className="price-row loading">
        <div className="price-row-name">{result.ingredient}</div>
        <div className="price-loader">
          <div className="spinner-sm" />
          Recherche en cours...
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="price-row error">
        <div className="price-row-name">{result.ingredient}</div>
        <div className="price-error">
          <AlertCircle size={14} />
          Données non disponibles
        </div>
      </div>
    );
  }

  if (result.prices.length === 0) {
    return (
      <div className="price-row empty">
        <div className="price-row-name">{result.ingredient}</div>
        <div className="price-empty">Aucun prix trouvé en France</div>
      </div>
    );
  }

  const cheapest = result.prices[0];
  const mostExpensive = result.prices[result.prices.length - 1];
  const savings =
    result.prices.length > 1 ? mostExpensive.price - cheapest.price : 0;

  return (
    <div className={`price-row ${expanded ? "expanded" : ""}`}>
      <div className="price-row-header" onClick={() => setExpanded(!expanded)}>
        <div className="price-row-name">{result.ingredient}</div>
        <div className="price-row-summary">
          <div className="cheapest-info">
            <TrendingDown size={14} className="text-green-600" />
            <StoreTag name={cheapest.store_name} />
            <span className="cheapest-price">
              {cheapest.price.toFixed(2)} €
            </span>
            {cheapest.price_per_kg && (
              <span className="unit-price">
                ({cheapest.price_per_kg.toFixed(2)} €/kg)
              </span>
            )}
          </div>
          {savings > 0.01 && (
            <span className="savings-badge">
              Économie jusqu'à {savings.toFixed(2)} €
            </span>
          )}
          <button className="expand-btn">{expanded ? "▲" : "▼"}</button>
        </div>
      </div>

      {expanded && (
        <div className="price-details">
          <div className="price-details-header">
            <span>Magasin</span>
            <span>Produit</span>
            <span>Prix</span>
            <span>Prix/kg</span>
          </div>
          {result.prices.map((entry, i) => (
            <div
              key={i}
              className={`price-detail-row ${i === 0 ? "best-price" : ""}`}
            >
              <StoreTag name={entry.store_name} />
              <span className="product-name-cell">{entry.product_name}</span>
              <span className={`price-cell ${i === 0 ? "text-green-700 font-bold" : ""}`}>
                {entry.price.toFixed(2)} €
              </span>
              <span className="unit-price-cell">
                {entry.price_per_kg ? `${entry.price_per_kg.toFixed(2)} €/kg` : "—"}
              </span>
            </div>
          ))}
          <div className="source-note">
            <ExternalLink size={12} />
            Source :{" "}
            <a
              href="https://prices.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Prices (Open Food Facts)
            </a>{" "}
            — données communautaires, prix indicatifs
          </div>
        </div>
      )}
    </div>
  );
}

export default function PriceTable({
  priceResults,
  loadingAll,
  onFetch,
  fetched,
}: PriceTableProps) {
  // Calcul du total minimum (somme des prix les moins chers)
  let totalMin = 0;
  let totalMax = 0;
  let countWithData = 0;
  priceResults.forEach((r) => {
    if (r.prices.length > 0) {
      totalMin += r.prices[0].price;
      totalMax += r.prices[r.prices.length - 1].price;
      countWithData++;
    }
  });

  if (!fetched) {
    return (
      <div className="price-table-empty">
        <ShoppingCart size={48} className="text-gray-300" />
        <h3>Comparer les prix en supermarché</h3>
        <p>
          Cliquez sur le bouton pour rechercher les prix des ingrédients via
          l'API <strong>Open Prices</strong> (Open Food Facts) — gratuite,
          données communautaires.
        </p>
        <button onClick={onFetch} className="btn-fetch-prices">
          <ShoppingCart size={18} />
          Comparer les prix
        </button>
      </div>
    );
  }

  return (
    <div className="price-table">
      {/* Summary bar */}
      {countWithData > 0 && (
        <div className="price-summary-bar">
          <div className="price-summary-item">
            <span className="summary-label">Prix total minimum estimé</span>
            <span className="summary-value text-green-700">
              {totalMin.toFixed(2)} €
            </span>
          </div>
          <div className="price-summary-item">
            <span className="summary-label">Prix total maximum estimé</span>
            <span className="summary-value text-red-600">
              {totalMax.toFixed(2)} €
            </span>
          </div>
          <div className="price-summary-item">
            <span className="summary-label">Économie potentielle</span>
            <span className="summary-value text-orange-600">
              {(totalMax - totalMin).toFixed(2)} €
            </span>
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="price-rows">
        {loadingAll ? (
          <div className="loading-all">
            <div className="spinner" />
            <p>Récupération des prix en cours...</p>
            <p className="loading-note">
              L'API Open Prices est interrogée pour chaque ingrédient
            </p>
          </div>
        ) : (
          Array.from(priceResults.entries()).map(([term, result]) => (
            <PriceRow key={term} result={result} />
          ))
        )}
      </div>

      {/* Refresh + note */}
      <div className="price-footer">
        <button onClick={onFetch} className="btn-refresh">
          <RefreshCw size={14} />
          Actualiser les prix
        </button>
        <p className="price-disclaimer">
          ⚠️ Prix indicatifs issus de la base communautaire{" "}
          <a
            href="https://prices.openfoodfacts.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Prices
          </a>
          . Les prix peuvent varier selon la région et la date.
        </p>
      </div>
    </div>
  );
}
