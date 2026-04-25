import { Link } from "react-router-dom";
import { Clock, Users, ChefHat, ExternalLink } from "lucide-react";
import type { Recipe } from "../data/recipes";

interface RecipeCardProps {
  recipe: Recipe;
}

const categoryColors: Record<Recipe["category"], string> = {
  salade: "bg-green-100 text-green-800",
  dessert: "bg-pink-100 text-pink-800",
  snack: "bg-orange-100 text-orange-800",
  plat: "bg-blue-100 text-blue-800",
  "petit-dejeuner": "bg-yellow-100 text-yellow-800",
  boisson: "bg-purple-100 text-purple-800",
};

const categoryLabels: Record<Recipe["category"], string> = {
  salade: "Salade",
  dessert: "Dessert",
  snack: "Snack",
  plat: "Plat",
  "petit-dejeuner": "Petit déjeuner",
  boisson: "Boisson",
};

const platformIcon: Record<Recipe["source_platform"], string> = {
  instagram: "📸",
  tiktok: "🎵",
  threads: "🧵",
  youtube: "📺",
  twitter: "🐦",
  reddit: "👾",
  facebook: "📘",
  maman: "👩‍🍳", // Émoji ajouté pour votre recette de Riz Basmatti
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <div className="recipe-card">
      {/* Thumbnail */}
      <div className="recipe-thumb">
        <span className="recipe-emoji">{recipe.thumbnail}</span>
        <div className="recipe-platform-badge">
          {platformIcon[recipe.source_platform]}
        </div>
      </div>

      {/* Content */}
      <div className="recipe-card-body">
        {/* Category badge */}
        <span className={`category-badge ${categoryColors[recipe.category]}`}>
          {categoryLabels[recipe.category]}
        </span>

        {/* Title */}
        <h3 className="recipe-title">{recipe.title}</h3>

        {/* Meta */}
        <div className="recipe-meta">
          {recipe.prep_time_minutes && (
            <span className="meta-item">
              <Clock size={14} />
              {recipe.prep_time_minutes} min
            </span>
          )}
          {recipe.serves && (
            <span className="meta-item">
              <Users size={14} />
              {recipe.serves} pers.
            </span>
          )}
          {recipe.cook_method && (
            <span className="meta-item">
              <ChefHat size={14} />
              {recipe.cook_method}
            </span>
          )}
        </div>

        {/* Ingredient count */}
        <p className="ingredient-count">
          🥬 {recipe.ingredients.length} ingrédients
        </p>

        {/* Tags */}
        <div className="tags-row">
          {recipe.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="card-actions">
          <Link to={`/recette/${recipe.id}`} className="btn-primary">
            Voir la recette
          </Link>
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
            title="Source originale"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
