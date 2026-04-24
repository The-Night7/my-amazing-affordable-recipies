import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Trash2, ShoppingCart, Download, X,
  ChevronDown, ChevronUp, RotateCcw
} from "lucide-react";
import { useMealPlan, DAYS, MEAL_SLOTS, type MealSlot } from "../hooks/useMealPlan";
import recipes from "../data/recipes";

// ── Modale de sélection de recette ──────────────────────────────────────────
function RecipePickerModal({
  onSelect,
  onClose,
}: {
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  const categories = ["all", ...Array.from(new Set(recipes.map((r) => r.category)))];

  const filtered = recipes.filter((r) => {
    const matchCat = cat === "all" || r.category === cat;
    const matchSearch =
      search === "" ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const catLabels: Record<string, string> = {
    all: "Toutes",
    salade: "🥗 Salades",
    plat: "🍳 Plats",
    "petit-dejeuner": "🥞 Petit déj",
    snack: "🍋 Snacks",
    dessert: "🍪 Desserts",
    boisson: "🍒 Boissons",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Choisir une recette</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-search-bar">
          <input
            autoFocus
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modal-search-input"
          />
        </div>
        <div className="modal-cats">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`cat-btn-sm ${cat === c ? "active" : ""}`}
            >
              {catLabels[c] ?? c}
            </button>
          ))}
        </div>
        <div className="modal-recipe-list">
          {filtered.length === 0 && (
            <p className="modal-empty">Aucune recette trouvée</p>
          )}
          {filtered.map((r) => (
            <button
              key={r.id}
              className="modal-recipe-item"
              onClick={() => { onSelect(r.id); onClose(); }}
            >
              <span className="modal-recipe-emoji">{r.thumbnail}</span>
              <span className="modal-recipe-title">{r.title}</span>
              <span className="modal-recipe-time">
                {r.prep_time_minutes ? `${r.prep_time_minutes} min` : ""}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cellule du planning ──────────────────────────────────────────────────────
function MealCell({
  day: _day,
  slot: _slot,
  entry,
  onAdd,
  onRemove,
  onPortions,
}: {
  day?: number;
  slot?: MealSlot;
  entry: { recipeId: string; portions: number } | undefined;
  onAdd: () => void;
  onRemove: () => void;
  onPortions: (p: number) => void;
}) {
  const recipe = entry ? recipes.find((r) => r.id === entry.recipeId) : null;

  if (!recipe || !entry) {
    return (
      <div className="meal-cell empty" onClick={onAdd} title="Ajouter une recette">
        <Plus size={18} className="meal-add-icon" />
      </div>
    );
  }

  return (
    <div className="meal-cell filled">
      <span className="meal-cell-emoji">{recipe.thumbnail}</span>
      <div className="meal-cell-content">
        <Link to={`/recette/${recipe.id}`} className="meal-cell-title">
          {recipe.title}
        </Link>
        <div className="meal-cell-meta">
          <label>
            <span>×</span>
            <input
              type="number"
              min={0.5}
              max={10}
              step={0.5}
              value={entry.portions}
              onChange={(e) => onPortions(Number(e.target.value))}
              className="portions-input"
            />
            <span>pers.</span>
          </label>
          <button onClick={onRemove} className="meal-remove-btn" title="Supprimer">
            <X size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Liste de courses ─────────────────────────────────────────────────────────
function ShoppingListPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const { getShoppingList } = useMealPlan();
  const list = getShoppingList(recipes);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleCheck = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const exportText = () => {
    const lines = list.map(
      (i) =>
        `${checked.has(i.name) ? "✓" : "☐"} ${i.name}${i.totalQty ? ` — ${i.totalQty.toFixed(0)} ${i.unit || ""}` : ""}`
    );
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "liste-courses-souka.txt";
    a.click();
  };

  if (list.length === 0) {
    return (
      <div className="shopping-panel">
        <div className="shopping-header">
          <h3>🛒 Liste de courses</h3>
          <button onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>
        <p className="shopping-empty">Aucun repas planifié pour la semaine.</p>
      </div>
    );
  }

  return (
    <div className="shopping-panel">
      <div className="shopping-header">
        <h3>🛒 Liste de courses ({list.length} ingrédients)</h3>
        <div className="shopping-actions">
          <button onClick={exportText} className="btn-export">
            <Download size={14} /> Exporter .txt
          </button>
          <button onClick={onClose} className="modal-close"><X size={18} /></button>
        </div>
      </div>
      <p className="shopping-hint">
        Cliquez sur un ingrédient pour le cocher. Basé sur <strong>{Object.keys(useMealPlan().plan).length} jour(s)</strong> planifiés.
      </p>
      <ul className="shopping-list">
        {list.map((item) => (
          <li
            key={item.name}
            className={`shopping-item ${checked.has(item.name) ? "checked" : ""}`}
            onClick={() => toggleCheck(item.name)}
          >
            <span className="shopping-checkbox">{checked.has(item.name) ? "✓" : "○"}</span>
            <span className="shopping-name">{item.name}</span>
            {item.totalQty && (
              <span className="shopping-qty">
                {item.totalQty % 1 === 0 ? item.totalQty.toFixed(0) : item.totalQty.toFixed(1)} {item.unit || ""}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function MealPlannerPage() {
  const { plan, addMeal, removeMeal, updatePortions, clearDay, clearAll } = useMealPlan();
  const [pickerState, setPickerState] = useState<{ day: number; slot: MealSlot } | null>(null);
  const [showShopping, setShowShopping] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());

  const openPicker = (day: number, slot: MealSlot) => setPickerState({ day, slot });
  const closePicker = () => setPickerState(null);

  const toggleDay = (day: number) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  // Calcul du nombre de repas planifiés
  const totalMeals = Object.values(plan).reduce(
    (acc, slots) => acc + Object.keys(slots || {}).length,
    0
  );

  return (
    <div className="meal-planner-page">
      {/* Header */}
      <div className="planner-header">
        <div>
          <h1>📅 Planificateur de repas</h1>
          <p className="planner-subtitle">
            Composez vos ensembles de repas sur la semaine avec les recettes de{" "}
            <a href="https://www.instagram.com/souka_yanel/" target="_blank" rel="noopener noreferrer">
              @souka_yanel
            </a>
          </p>
        </div>
        <div className="planner-top-actions">
          <button onClick={() => setShowShopping(true)} className="btn-shopping">
            <ShoppingCart size={16} />
            Liste de courses
            {totalMeals > 0 && <span className="count-bubble">{totalMeals}</span>}
          </button>
          {totalMeals > 0 && (
            <button onClick={clearAll} className="btn-clear-all" title="Tout effacer">
              <RotateCcw size={16} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Stats rapides */}
      {totalMeals > 0 && (
        <div className="planner-stats">
          <div className="planner-stat">
            <span className="planner-stat-num">{totalMeals}</span>
            <span>repas planifiés</span>
          </div>
          <div className="planner-stat">
            <span className="planner-stat-num">{Object.keys(plan).length}</span>
            <span>jours actifs</span>
          </div>
          <div className="planner-stat">
            <span className="planner-stat-num">
              {new Set(
                Object.values(plan).flatMap((slots) =>
                  Object.values(slots || {}).map((e) => e?.recipeId)
                )
              ).size}
            </span>
            <span>recettes différentes</span>
          </div>
        </div>
      )}

      {/* Grille semaine */}
      <div className="planner-grid">
        {DAYS.map((day) => {
          const dayPlan = plan[day.id] || {};
          const mealCount = Object.keys(dayPlan).length;
          const isCollapsed = collapsedDays.has(day.id);

          return (
            <div key={day.id} className={`day-column ${mealCount > 0 ? "has-meals" : ""}`}>
              {/* Day header */}
              <div className="day-header" onClick={() => toggleDay(day.id)}>
                <div className="day-title-row">
                  <span className="day-name">{day.label}</span>
                  {mealCount > 0 && (
                    <span className="day-meal-count">{mealCount} repas</span>
                  )}
                </div>
                <div className="day-header-actions">
                  {mealCount > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); clearDay(day.id); }}
                      className="day-clear-btn"
                      title="Effacer ce jour"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  <span className="day-collapse-icon">
                    {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </span>
                </div>
              </div>

              {/* Slots */}
              {!isCollapsed && (
                <div className="day-slots">
                  {MEAL_SLOTS.map((slot) => (
                    <div key={slot.id} className="slot-row">
                      <div className="slot-label">
                        <span>{slot.emoji}</span>
                        <span>{slot.label}</span>
                      </div>
                      <MealCell
                        day={day.id}
                        slot={slot.id}
                        entry={dayPlan[slot.id]}
                        onAdd={() => openPicker(day.id, slot.id)}
                        onRemove={() => removeMeal(day.id, slot.id)}
                        onPortions={(p) => updatePortions(day.id, slot.id, p)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recettes suggérées */}
      <div className="planner-suggestions">
        <h2>💡 Idées de menus équilibrés</h2>
        <div className="suggestions-grid">
          {[
            {
              name: "Menu Perte de poids",
              emoji: "⚖️",
              plan: [
                { slot: "petit-dejeuner", id: "latte-overnight-oats" },
                { slot: "dejeuner", id: "salade-pois-chiches" },
                { slot: "snack", id: "protein-lemon-balls" },
                { slot: "diner", id: "diner-express-courgette-coco" },
              ],
            },
            {
              name: "Menu Protéiné",
              emoji: "💪",
              plan: [
                { slot: "petit-dejeuner", id: "pancakes-proteines-sans-gluten" },
                { slot: "dejeuner", id: "salade-roquette-saumon" },
                { slot: "snack", id: "smoothie-cerises-proteine" },
                { slot: "diner", id: "donuts-poulet-legumes" },
              ],
            },
            {
              name: "Menu Sans Gluten",
              emoji: "🌾",
              plan: [
                { slot: "petit-dejeuner", id: "crepes-skyr-banane" },
                { slot: "dejeuner", id: "salade-chan-tan" },
                { slot: "snack", id: "basbousa-healthy-sans-gluten" },
                { slot: "diner", id: "diner-express-courgette-coco" },
              ],
            },
          ].map((suggestion) => (
            <div key={suggestion.name} className="suggestion-card">
              <div className="suggestion-title">
                <span>{suggestion.emoji}</span>
                <strong>{suggestion.name}</strong>
              </div>
              <ul className="suggestion-list">
                {suggestion.plan.map((item) => {
                  const r = recipes.find((r) => r.id === item.id);
                  if (!r) return null;
                  const slotLabel = MEAL_SLOTS.find((s) => s.id === item.slot);
                  return (
                    <li key={item.slot}>
                      <span className="sug-slot">{slotLabel?.emoji} {slotLabel?.label}</span>
                      <span className="sug-recipe">{r.thumbnail} {r.title}</span>
                    </li>
                  );
                })}
              </ul>
              <button
                className="btn-apply-suggestion"
                onClick={() => {
                  const dayId = 0; // Applique au Lundi par défaut
                  suggestion.plan.forEach((item) => {
                    addMeal(dayId, item.slot as MealSlot, item.id, 1);
                  });
                }}
              >
                Appliquer au lundi
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal picker */}
      {pickerState && (
        <RecipePickerModal
          onSelect={(id) => addMeal(pickerState.day, pickerState.slot, id)}
          onClose={closePicker}
        />
      )}

      {/* Shopping panel */}
      {showShopping && (
        <div className="modal-overlay" onClick={() => setShowShopping(false)}>
          <div className="modal-box shopping-modal" onClick={(e) => e.stopPropagation()}>
            <ShoppingListPanel onClose={() => setShowShopping(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
