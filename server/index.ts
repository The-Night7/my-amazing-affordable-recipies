// server/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/markets/nearby", async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius ?? 5000);

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Les paramètres lat et lng sont obligatoires.",
      });
    }

    const query = `
      [out:json][timeout:25];
      (
        node["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radius},${lat},${lng});
        way["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radius},${lat},${lng});
        relation["shop"~"supermarket|convenience|greengrocer|butcher|bakery|marketplace"](around:${radius},${lat},${lng});
      );
      out center tags;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Erreur lors de l'appel à Overpass API.",
      });
    }

    const data = await response.json();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur.",
    });
  }
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
