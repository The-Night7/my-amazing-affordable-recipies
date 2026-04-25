// src/components/MarketSelector.tsx

import type { Market } from "../types/market";
import { useNearbyMarkets } from "../hooks/useNearbyMarkets";

type MarketSelectorProps = {
  selectedMarkets: Market[];
  onChange: (markets: Market[]) => void;
};

export function MarketSelector({
  selectedMarkets,
  onChange,
}: MarketSelectorProps) {
  const { markets, loading, error, findNearbyMarkets } = useNearbyMarkets();

  const toggleMarket = (market: Market) => {
    const alreadySelected = selectedMarkets.some((item) => item.id === market.id);

    if (alreadySelected) {
      onChange(selectedMarkets.filter((item) => item.id !== market.id));
    } else {
      onChange([...selectedMarkets, market]);
    }
  };

  return (
    <section className="market-selector">
      <div className="market-selector__header">
        <div>
          <h2>Marchés proches</h2>
          <p>
            Sélectionne les magasins autour de toi pour comparer les prix plus
            intelligemment.
          </p>
        </div>

        <button
          type="button"
          onClick={findNearbyMarkets}
          disabled={loading}
          className="market-selector__button"
        >
          {loading ? "Recherche..." : "Trouver les marchés proches"}
        </button>
      </div>

      {error && <p className="market-selector__error">{error}</p>}

      {markets.length > 0 && (
        <div className="market-selector__list">
          {markets.map((market) => {
            const checked = selectedMarkets.some((item) => item.id === market.id);

            return (
              <label
                key={market.id}
                className={`market-selector__item ${
                  checked ? "market-selector__item--selected" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMarket(market)}
                />

                <span>
                  <strong>{market.name}</strong>

                  <small>
                    {market.type}
                    {typeof market.distanceKm === "number"
                      ? ` · ${market.distanceKm.toFixed(1)} km`
                      : ""}
                  </small>

                  {market.address && <small>{market.address}</small>}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {selectedMarkets.length > 0 && (
        <p className="market-selector__selected">
          {selectedMarkets.length} marché
          {selectedMarkets.length > 1 ? "s" : ""} sélectionné
          {selectedMarkets.length > 1 ? "s" : ""}.
        </p>
      )}
    </section>
  );
}
