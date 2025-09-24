// src/pages/About.jsx
import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-card">
        <h1>О нас</h1>
        <p>
          Добро пожаловать в <strong>Эпоху выживания</strong> — проект, созданный для
          объединения игроков, друзей и единомышленников.
        </p>
        <p>
          Здесь вы можете общаться, обмениваться баллами, покупать предметы в магазине
          и строить собственное игровое сообщество.
        </p>
        <p>
          Мы стремимся к тому, чтобы интерфейс был простым, современным и удобным для
          каждого пользователя.
        </p>

        {/* Кнопки */}
        <div className="about-buttons">
          <a
            href="https://t.me/eraSurvivalLios"   // ⚡ сюда вставь ссылку на группу
            target="_blank"
            rel="noopener noreferrer"
            className="about-btn"
          >
            🚀 Вступить в Telegram‑группу
          </a>

          <a
            href="https://t.me/Dragon010101" // ⚡ сюда вставь ссылку на профиль создателя
            target="_blank"
            rel="noopener noreferrer"
            className="about-btn secondary"
          >
            👤 Профиль создателя
          </a>
        </div>
      </div>
    </div>
  );
}
