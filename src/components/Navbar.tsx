import { Link, useLocation } from "react-router-dom";
import { BookOpen, Plug, ShoppingBag } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-emoji">🥗</span>
          <div>
            <span className="brand-name">Recettes Souka</span>
            <span className="brand-sub">@souka_yanel</span>
          </div>
        </Link>
        <div className="navbar-links">
          <Link
            to="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            <BookOpen size={16} />
            Recettes
          </Link>
          <Link
            to="/guide-api"
            className={`nav-link ${pathname === "/guide-api" ? "active" : ""}`}
          >
            <Plug size={16} />
            Guide APIs
          </Link>
          <a
            href="https://www.instagram.com/souka_yanel/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link nav-insta"
          >
            <ShoppingBag size={16} />
            Instagram
          </a>
        </div>
      </div>
    </nav>
  );
}
