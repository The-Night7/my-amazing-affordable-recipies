import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import RecipePage from "./pages/RecipePage";
import ApiGuidePage from "./pages/ApiGuidePage";
import MealPlannerPage from "./pages/MealPlannerPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recette/:id" element={<RecipePage />} />
          <Route path="/guide-api" element={<ApiGuidePage />} />
          <Route path="/planificateur" element={<MealPlannerPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>
          Recettes de{" "}
          <a
            href="https://www.instagram.com/souka_yanel/"
            target="_blank"
            rel="noopener noreferrer"
          >
            @souka_yanel
          </a>{" "}
          · Prix via{" "}
          <a
            href="https://prices.openfoodfacts.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Prices
          </a>{" "}
          · Construit avec React TSX
        </p>
      </footer>
    </BrowserRouter>
  );
}
