// src/hooks/useNearbyMarkets.ts

import { useCallback, useState } from "react";
import type { Market } from "../types/market";
import { getDistanceKm } from "../utils/distance";

type LocationState = {
  latitude: number;
  longitude: number;
};

type UseNearbyMarketsResult = {
  markets: Market[];
  loading: boolean;
  error: string | null;
  userLocation: LocationState | null;
  findNearbyMarkets: () => Promise<void>;
};

export function useNearbyMarkets(): UseNearbyMarketsResult {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userLocation, setUserLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findNearbyMarkets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition();

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setUserLocation({ latitude, longitude });

      const radiusMeters = 5000;

      const query = `
        [out:json][timeout:25];
        (
          node["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radiusMeters},${latitude},${longitude});
          way["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radiusMeters},${latitude},${longitude});
          relation["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radiusMeters},${latitude},${longitude});
          node["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
          way["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
          relation["amenity"="marketplace"](around:${radiusMeters},${latitude},${longitude});
        );
        out center tags;
      `;

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=UTF-8",
        },
        body: query,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error("Impossible de récupérer les marchés proches.");
      }

      if (text.trim().startsWith("<")) {
        throw new Error(
          "L'API a renvoyé du HTML au lieu du JSON. Vérifie l'URL appelée."
        );
      }

      const data = JSON.parse(text);

      const parsedMarkets: Market[] = data.elements
        .map((item: any) => {
          const lat = item.lat ?? item.center?.lat;
          const lon = item.lon ?? item.center?.lon;

          if (!lat || !lon) {
            return null;
          }

          const tags = item.tags ?? {};

          const name =
            tags.name ||
            tags.brand ||
            getDefaultMarketName(tags.shop, tags.amenity);
          const addressParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"],
          ].filter(Boolean);

          return {
            id: `${item.type}-${item.id}`,
            name,
            brand: tags.brand,
            type: tags.shop || tags.amenity || "market",
            latitude: lat,
            longitude: lon,
            address: addressParts.join(" "),
            distanceKm: getDistanceKm(latitude, longitude, lat, lon),
          } satisfies Market;
        })
        .filter(Boolean)
        .sort((a: Market, b: Market) => {
          return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
        });

      setMarkets(parsedMarkets);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue pendant la recherche.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markets,
    loading,
    error,
    userLocation,
    findNearbyMarkets,
  };
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("La géolocalisation n'est pas disponible sur ce navigateur.")
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

function getDefaultMarketName(shop?: string, amenity?: string): string {
  if (amenity === "marketplace") {
    return "Marché";
  }

  switch (shop) {
    case "supermarket":
      return "Supermarché";
    case "convenience":
      return "Épicerie";
    case "greengrocer":
      return "Primeur";
    case "butcher":
      return "Boucherie";
    case "bakery":
      return "Boulangerie";
    case "marketplace":
      return "Marché";
    default:
      return "Commerce alimentaire";
  }
}