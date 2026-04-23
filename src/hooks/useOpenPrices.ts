import { useState, useEffect, useCallback } from "react";

export interface PriceEntry {
  store_name: string;
  store_type: string;
  price: number;
  currency: string;
  price_per_kg: number | null;
  product_name: string;
  product_quantity: string | null;
  date: string;
  location: string;
}

export interface PriceResult {
  ingredient: string;
  prices: PriceEntry[];
  loading: boolean;
  error: string | null;
  cheapest: PriceEntry | null;
}

const OPEN_PRICES_BASE = "https://prices.openfoodfacts.org/api/v1";

// Normalise store name from Open Prices data
function normalizeStoreName(raw: string): string {
  const map: Record<string, string> = {
    "E.Leclerc": "E.Leclerc",
    Leclerc: "E.Leclerc",
    leclerc: "E.Leclerc",
    carrefour: "Carrefour",
    Carrefour: "Carrefour",
    intermarch: "Intermarché",
    Intermarché: "Intermarché",
    lidl: "Lidl",
    Lidl: "LIDL",
    aldi: "Aldi",
    Aldi: "Aldi",
    monoprix: "Monoprix",
    Monoprix: "Monoprix",
    casino: "Casino",
    Casino: "Casino",
    super_u: "Super U",
    "Super U": "Super U",
  };
  for (const key of Object.keys(map)) {
    if (raw.toLowerCase().includes(key.toLowerCase())) return map[key];
  }
  return raw;
}

export function useOpenPricesSearch(searchTerm: string) {
  const [result, setResult] = useState<PriceResult>({
    ingredient: searchTerm,
    prices: [],
    loading: false,
    error: null,
    cheapest: null,
  });

  const fetchPrices = useCallback(async () => {
    if (!searchTerm) return;
    setResult((r) => ({ ...r, loading: true, error: null }));

    try {
      const url = `${OPEN_PRICES_BASE}/prices?product_name__icontains=${encodeURIComponent(
        searchTerm
      )}&country=FR&size=20&order_by=price`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const items: PriceEntry[] = (data.items || []).map((item: any) => ({
        store_name: normalizeStoreName(item.location?.osm_name || item.location?.name || "Inconnu"),
        store_type: item.location?.osm_tag || "",
        price: item.price,
        currency: item.currency || "EUR",
        price_per_kg: item.price_per_kg ?? null,
        product_name: item.product?.product_name || searchTerm,
        product_quantity: item.product?.quantity || null,
        date: item.date,
        location: item.location?.city || item.location?.country || "France",
      }));

      // Dédoublonnage par magasin — garder le moins cher de chaque enseigne
      const byStore = new Map<string, PriceEntry>();
      for (const item of items) {
        if (!byStore.has(item.store_name) || item.price < byStore.get(item.store_name)!.price) {
          byStore.set(item.store_name, item);
        }
      }
      const deduped = Array.from(byStore.values()).sort((a, b) => a.price - b.price);

      setResult({
        ingredient: searchTerm,
        prices: deduped,
        loading: false,
        error: null,
        cheapest: deduped[0] ?? null,
      });
    } catch (e: any) {
      setResult((r) => ({
        ...r,
        loading: false,
        error: e.message || "Erreur de récupération des prix",
      }));
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { ...result, refetch: fetchPrices };
}

// Hook batch pour plusieurs ingrédients
export function useRecipePrices(searchTerms: string[]) {
  const [results, setResults] = useState<Map<string, PriceResult>>(new Map());
  const [loadingAll, setLoadingAll] = useState(false);

  const fetchAll = useCallback(async () => {
    if (searchTerms.length === 0) return;
    setLoadingAll(true);

    const newResults = new Map<string, PriceResult>();

    for (const term of searchTerms) {
      try {
        // Rate limit friendly — pause entre les requêtes
        await new Promise((r) => setTimeout(r, 300));

        const url = `${OPEN_PRICES_BASE}/prices?product_name__icontains=${encodeURIComponent(
          term
        )}&country=FR&size=15&order_by=price`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const items: PriceEntry[] = (data.items || []).map((item: any) => ({
          store_name: normalizeStoreName(
            item.location?.osm_name || item.location?.name || "Inconnu"
          ),
          store_type: item.location?.osm_tag || "",
          price: item.price,
          currency: item.currency || "EUR",
          price_per_kg: item.price_per_kg ?? null,
          product_name: item.product?.product_name || term,
          product_quantity: item.product?.quantity || null,
          date: item.date,
          location: item.location?.city || "France",
        }));

        const byStore = new Map<string, PriceEntry>();
        for (const item of items) {
          if (!byStore.has(item.store_name) || item.price < byStore.get(item.store_name)!.price) {
            byStore.set(item.store_name, item);
          }
        }
        const deduped = Array.from(byStore.values()).sort((a, b) => a.price - b.price);

        newResults.set(term, {
          ingredient: term,
          prices: deduped,
          loading: false,
          error: null,
          cheapest: deduped[0] ?? null,
        });
      } catch (e: any) {
        newResults.set(term, {
          ingredient: term,
          prices: [],
          loading: false,
          error: e.message,
          cheapest: null,
        });
      }
    }

    setResults(newResults);
    setLoadingAll(false);
  }, [searchTerms.join(",")]);

  return { results, loadingAll, fetchAll };
}
