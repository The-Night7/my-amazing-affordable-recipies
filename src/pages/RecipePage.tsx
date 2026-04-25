import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  ExternalLink,
  ShoppingCart,
  Heart,
  CheckCircle2,
  Circle,
} from "lucide-react";
import recipes from "../data/recipes";
import { PriceTable } from "../components/PriceTable";
import { useRecipePrices } from "../hooks/useOpenPrices";
import { MarketSelector } from "../components/MarketSelector";
import type { PriceResult } from "../hooks/useOpenPrices";
import type { Market } from "../types/market";

const platformIcon: Record<string, string> = {
  instagram: "📸 Instagram",
  tiktok: "🎵 TikTok",
  threads: "🧵 Threads",
};

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const recipe = recipes.find((r) => r.id === id);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [priceFetched, setPriceFetched] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>([]);

  // Préparer les termes de recherche uniques
  const searchTerms = recipe
    ? [
        ...new Set(
          recipe.ingredients.flatMap((i) => i.searchTerms.slice(0, 1)) // premier terme par ingrédient
        ),
      ]
    : [];

  const { results: priceResults, loadingAll, fetchAll } = useRecipePrices(searchTerms);

  const handleFetchPrices = () => {
    setPriceFetched(true);
    fetchAll();
  };

  if (!recipe) {
    return (
      <div className="not-found">
        <h2>Recette introuvable 😕</h2>
        <Link to="/" className="btn-primary">
          Retour aux recettes
        </Link>
      </div>
    );
  }

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const s = new Set(prev);
      s.has(i) ? s.delete(i) : s.add(i);
      return s;
    });
  };

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  return (
    <div className="recipe-page">
      {/* Back */}
      <Link to="/" className="back-btn">
        <ArrowLeft size={18} />
        Toutes les recettes
      </Link>

      {/* Header */}
      <div className="recipe-header">
        <div className="recipe-header-emoji">{recipe.thumbnail}</div>
        <div className="recipe-header-info">
          <h1 className="recipe-page-title">{recipe.title}</h1>
          <div className="recipe-page-meta">
            {recipe.prep_time_minutes && (
              <span className="meta-chip">
                <Clock size={15} />
                {recipe.prep_time_minutes} min
              </span>
            )}
            {recipe.serves && (
              <span className="meta-chip">
                <Users size={15} />
                {recipe.serves} personne{recipe.serves > 1 ? "s" : ""}
              </span>
            )}
            {recipe.cook_method && (
              <span className="meta-chip">
                <ChefHat size={15} />
                {recipe.cook_method}
              </span>
            )}
            {recipe.calories_total && (
              <span className="meta-chip">
                🔥 {recipe.calories_total} kcal
              </span>
            )}
          </div>
          <div className="tags-row">
            {recipe.tags.map((t) => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className={`video-link-btn ${
              recipe.source_platform === "instagram" ? "insta" :
              recipe.source_platform === "threads" ? "threads" : ""
            }`}
          >
            <ExternalLink size={14} />
            Voir la vidéo sur {platformIcon[recipe.source_platform]}
          </a>
        </div>
      </div>

      {/* Caption originale */}
      <div className="caption-block">
        <h3>📝 Caption originale</h3>
        <p className="caption-text">{recipe.caption_original}</p>
      </div>

      <div className="recipe-two-col">
        {/* Ingredients */}
        <div className="ingredients-section">
          <h2>
            <ShoppingCart size={20} />
            Ingrédients
            <span className="count-badge">{recipe.ingredients.length}</span>
          </h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.id}
                className={`ingredient-item ${checkedIngredients.has(ing.id) ? "checked" : ""}`}
                onClick={() => toggleIngredient(ing.id)}
              >
                <span className="check-icon">
                  {checkedIngredients.has(ing.id) ? (
                    <CheckCircle2 size={18} className="text-green-500" />
                  ) : (
                    <Circle size={18} className="text-gray-300" />
                  )}
                </span>
                <span className="ingredient-content">
                  <span className="ingredient-name">{ing.name}</span>
                  {(ing.quantity || ing.unit) && (
                    <span className="ingredient-qty">
                      {ing.quantity} {ing.unit}
                    </span>
                  )}
                  {ing.notes && (
                    <span className="ingredient-note">({ing.notes})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="ingredients-hint">
            Cliquez sur un ingrédient pour le cocher ✓
          </p>
        </div>

        {/* Instructions */}
        <div className="instructions-section">
          <h2>👨‍🍳 Préparation</h2>
          <ol className="instructions-list">
            {recipe.instructions.map((step, i) => (
              <li
                key={i}
                className={`instruction-item ${checkedSteps.has(i) ? "done" : ""}`}
                onClick={() => toggleStep(i)}
              >
                <span className="step-number">{i + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Macros si disponible */}
      {recipe.macros && (
        <div className="macros-section">
          <h2>📊 Valeurs nutritionnelles (recette entière)</h2>
          <div className="macros-grid">
            {recipe.macros.proteines_g && (
              <div className="macro-card proteines">
                <span className="macro-value">{recipe.macros.proteines_g}g</span>
                <span className="macro-label">Protéines</span>
              </div>
            )}
            {recipe.macros.glucides_g && (
              <div className="macro-card glucides">
                <span className="macro-value">{recipe.macros.glucides_g}g</span>
                <span className="macro-label">Glucides</span>
              </div>
            )}
            {recipe.macros.lipides_g && (
              <div className="macro-card lipides">
                <span className="macro-value">{recipe.macros.lipides_g}g</span>
                <span className="macro-label">Lipides</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Comparator */}
      <div className="price-section">
        <div className="price-section-header">
          <h2>
            <ShoppingCart size={20} />
            Comparateur de prix en supermarché
          </h2>
          <p className="price-section-desc">
            Trouvez les meilleurs prix pour les ingrédients de cette recette
            dans les supermarchés français via l'API gratuite{" "}
            <a
              href="https://prices.openfoodfacts.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Prices
            </a>
            .
          </p>
        </div>
        <MarketSelector
          selectedMarkets={selectedMarkets}
          onChange={setSelectedMarkets}
        />
        
        <PriceTable
          priceResults={priceResults}
          loadingAll={loadingAll}
          onFetch={handleFetchPrices}
          fetched={priceFetched}
          selectedMarkets={selectedMarkets}
        />
      </div>

      {/* CTA Instagram */}
      <div className="instagram-cta">
        <Heart size={24} />
        <div>
          <p>
            Cette recette vient de{" "}
            <strong>@souka_yanel</strong> sur{" "}
            {recipe.source_platform}.
          </p>
          <a
            href="https://www.instagram.com/souka_yanel/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-insta"
          >
            Suivre Soukaina pour plus de recettes
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
