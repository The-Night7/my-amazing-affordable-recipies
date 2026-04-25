// src/types/market.ts

export type Market = {
  id: string;
  name: string;
  brand?: string;
  type: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  address?: string;
};
