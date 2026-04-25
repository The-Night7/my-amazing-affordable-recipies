import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = email.trim().length > 0 && password.trim().length >= 6;
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }

      navigate("/");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Vérifie tes identifiants.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister((value) => !value);
    setError("");
    setPassword("");
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-visual">
          <div className="auth-visual__badge">
            <Sparkles size={18} />
            Recettes healthy & budget malin
          </div>

          <div className="auth-visual__content">
            <div className="auth-visual__logo">
              <Utensils size={34} />
            </div>

            <h1>My Amazing Affordable Recipies</h1>

            <p>
              Connecte-toi pour retrouver tes recettes, préparer tes courses et
              comparer les prix des ingrédients plus facilement.
            </p>
          </div>

          <div className="auth-benefits">
            <div>
              <ShieldCheck size={20} />
              <span>Recettes organisées</span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>Comparateur de prix</span>
            </div>

            <div>
              <ShieldCheck size={20} />
              <span>Marchés proches de toi</span>
            </div>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card__header">
            <div className="auth-card__icon">
              <LockKeyhole size={24} />
            </div>

            <div>
              <p className="auth-eyebrow">
                {isRegister ? "Création de compte" : "Connexion"}
              </p>

              <h2>{isRegister ? "Créer ton espace" : "Bienvenue"}</h2>

              <p>
                {isRegister
                  ? "Crée un compte pour sauvegarder tes préférences et retrouver tes recettes."
                  : "Connecte-toi pour continuer ta sélection de recettes."}
              </p>
            </div>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-field">
              <span>Email</span>

              <div className="auth-input">
                <Mail size={18} />

                <input
                  type="email"
                  value={email}
                  placeholder="ton.email@example.com"
                  autoComplete="email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Mot de passe</span>

              <div className="auth-input">
                <LockKeyhole size={18} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="Au moins 6 caractères"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <small>
                {isRegister
                  ? "Utilise au moins 6 caractères pour sécuriser ton compte."
                  : "Entre le mot de passe associé à ton compte."}
              </small>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={!canSubmit || loading}
            >
              {loading
                ? "Chargement..."
                : isRegister
                  ? "Créer mon compte"
                  : "Se connecter"}
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isRegister
                ? "Tu as déjà un compte ?"
                : "Tu n'as pas encore de compte ?"}
            </p>

            <button type="button" onClick={toggleMode}>
              {isRegister ? "Se connecter" : "Créer un compte"}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
