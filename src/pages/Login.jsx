// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Register.css"; // стили, включая .register-hint

export default function Login() {
  const [tgName, setTgName] = useState(""); // без @
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!tgName || !password) {
      alert("Введите Telegram-имя и пароль.");
      return;
    }

    setLoading(true);
    const email = `${tgName}@example.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Ошибка входа: " + error.message);
      return;
    }

    navigate("/profile");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Вход</h1>

        <label className="register-label">
          Имя как в Telegram (без @)
        </label>
        <input
          className="register-input"
          value={tgName}
          onChange={(e) => setTgName(e.target.value)}
        />

        {/* Хинт-картинка */}
        <img
          src="/telegram_hint.png"
          alt="Где найти Telegram-имя"
          className="register-hint"
        />

        <label className="register-label">Пароль</label>
        <input
          type="password"
          className="register-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="register-button"
        >
          {loading ? "Входим..." : "Войти"}
        </button>

        <p className="register-login">
          Нет аккаунта?{" "}
          <Link to="/register" className="register-login-link">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
