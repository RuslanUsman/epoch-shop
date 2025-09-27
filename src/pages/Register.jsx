import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [tgName, setTgName] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 👇 универсальный путь к картинке
  const imageUrl = `${import.meta.env.BASE_URL}images/telegram_hint.png`;

  const handleRegister = async () => {
    if (!name || !tgName || !password || !agree) {
      alert("Заполните все поля и поставьте галочку.");
      return;
    }
    if (password.length < 6) {
      alert("Пароль должен быть не менее 6 символов.");
      return;
    }

    setLoading(true);
    const email = `${tgName}@example.com`;

    const { data: signup, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr) {
      const msg = authErr.message || "";
      if (msg.includes("User already registered")) {
        alert("Вы уже зарегистрированы. Пожалуйста, войдите в систему.");
        navigate("/login");
      } else {
        alert("Ошибка регистрации: " + msg);
      }
      setLoading(false);
      return;
    }

    const user = signup.user;
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name,
        telegram_name: tgName,
        points: 0,
        avatar_url: null,
      });

    setLoading(false);
    if (profileErr) {
      alert("Ошибка сохранения профиля: " + profileErr.message);
      return;
    }

    navigate("/profile");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Регистрация</h1>

        <label className="register-label">Ваше имя</label>
        <input
          className="register-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="register-label">
          Имя как в Telegram (без @)
        </label>
        <input
          className="register-input"
          value={tgName}
          onChange={(e) => setTgName(e.target.value)}
        />
        <img
          src={imageUrl}
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

        <label className="register-checkbox">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          <span>Согласен с правилами проекта</span>
        </label>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="register-button"
        >
          {loading ? "Создаём..." : "Зарегистрироваться"}
        </button>

        <p className="register-login">
          Уже есть аккаунт?{" "}
          <Link to="/login" className="register-login-link">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
