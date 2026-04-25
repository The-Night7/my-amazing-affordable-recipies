import { useState, useMemo } from "react";
import { Search, Filter, ExternalLink } from "lucide-react";
import RecipeCard from "../components/RecipeCard";
import recipes, { type Recipe } from "../data/recipes";

const CATEGORIES: { value: Recipe["category"] | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "salade", label: "🥗 Salades" },
  { value: "plat", label: "🍳 Plats" },
  { value: "petit-dejeuner", label: "🥞 Petit déj" },
  { value: "snack", label: "🍋 Snacks" },
  { value: "dessert", label: "🍪 Desserts" },
  { value: "boisson", label: "🥤 Boissons" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Recipe["category"] | "all">("all");

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      const matchCat = category === "all" || r.category === category;
      const matchSearch =
        search === "" ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
        r.ingredients.some((i) =>
          i.name.toLowerCase().includes(search.toLowerCase())
        );
      return matchCat && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-avatar">👩‍🍳</div>
          <h1 className="hero-title">Some amazing affordable recipies</h1>
          <p className="hero-subtitle">
            Toutes les recettes{" "}
            <strong>healthy &amp; perte de poids</strong> de{" "}
            <a
              href="https://www.instagram.com/souka_yanel/"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-link"
            >
              @souka_yanel
            </a>{" "}
            — avec comparateur de prix en supermarché 🛒
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">{recipes.length}</span>
              <span className="stat-label">Recettes</span>
            </div>
            <div className="stat">
              <span className="stat-number">7</span>
              <span className="stat-label">Magasins</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Healthy</span>
            </div>
          </div>
          <a
            href="https://www.instagram.com/souka_yanel/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-insta-btn"
          >
            📸 Suivre @souka_yanel
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une recette ou un ingrédient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="category-filters">
          <Filter size={16} className="filter-icon" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`cat-btn ${category === cat.value ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="results-count">
        {filtered.length} recette{filtered.length > 1 ? "s" : ""} trouvée
        {filtered.length > 1 ? "s" : ""}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="recipes-grid">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <span>🔍</span>
          <p>Aucune recette ne correspond à votre recherche.</p>
          <button onClick={() => { setSearch(""); setCategory("all"); }} className="btn-primary">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
