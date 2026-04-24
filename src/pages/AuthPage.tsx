import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (isRegister) {
      await register(email, password);
    } else {
      await login(email, password);
    }

    navigate("/");
  }

  return (
    <div className="auth-container">
      <h1>My Amazing Affordable Recipies</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          {isRegister ? "Créer un compte" : "Connexion"}
        </button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Déjà un compte ?" : "Créer un compte"}
      </button>
    </div>
  );
}