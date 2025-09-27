// src/pages/Store.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { CATEGORIES, PRODUCTS } from "../data/products";
import { supabase } from "../lib/supabaseClient";
import "./Store.css";

// 👇 Универсальный компонент для картинок товаров
function ProductImage({ src, alt, size = 96 }) {
  const defaultUrl = `${import.meta.env.BASE_URL}images/default-product.png`;

  const finalSrc = src
    ? src.startsWith("http")
      ? src
      : `${import.meta.env.BASE_URL}${src.replace(/^\//, "")}`
    : defaultUrl;

  return (
    <img
      src={finalSrc}
      alt={alt || "Товар"}
      className="product-img"
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={(e) => {
        console.error(`Ошибка загрузки изображения: ${src}`);
        e.currentTarget.src = defaultUrl;
      }}
    />
  );
}

export default function Store() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0]);
  const {
    items: cartItems,
    addToCart,
    updateQty,
    togglePayWithPoints,
  } = useCart();

  // серверное состояние (старт сервера)
  const [server, setServer] = useState(null);

  // тикер для обновления таймера раз в секунду
  const [nowTs, setNowTs] = useState(Date.now());

  // товары текущей категории
  const products = PRODUCTS[activeCat] || [];

  // Загружаем состояние сервера
  useEffect(() => {
    async function fetchServer() {
      const { data } = await supabase
        .from("server_state")
        .select("*")
        .eq("id", "main") // фиксированный id записи
        .single();
      if (data) setServer(data);
      else setServer(null);
    }
    fetchServer();
  }, []);

  // Тикер: обновляет nowTs каждую секунду, чтобы таймеры на карточках тикали
  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Функция расчёта времени ожидания для товара
  function getProductTimeLeft(product) {
    if (!server || !product.unlockHours) return "";
    const start = new Date(server.start_time).getTime();
    const unlockAt = start + product.unlockHours * 3600 * 1000;
    const diff = unlockAt - nowTs;
    if (diff <= 0) return "";
    const h = Math.floor(diff / 1000 / 3600);
    const m = Math.floor((diff / 1000) % 3600 / 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${h}ч ${m}м ${s}с`;
  }

  return (
    <div className="store-page">
      <div className="store-container">
        <h1 className="store-title">Магазин «Эпоха выживания»</h1>

        {/* табы категорий */}
        <nav className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`tab ${cat === activeCat ? "active" : ""}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* сетка товаров */}
        <div className="products-grid">
          {products.map((product) => {
            // запись в корзине по id товара
            const entry =
              cartItems.find((e) => e.item.id === product.id) || {
                qty: 0,
                payWithPoints: false,
              };

            // время ожидания для конкретного товара
            const productTimeLeft = getProductTimeLeft(product);
            const isLocked = !!productTimeLeft;

            return (
              <div
                key={product.id}
                className={`product-card ${entry.qty > 0 ? "in-cart" : ""}`}
              >
                <ProductImage src={product.img} alt={product.name} size={96} />

                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.desc}</p>

                <div className="price">
                  {!entry.payWithPoints && product.priceRub != null && (
                    <span className="price-rub">{product.priceRub} ₽</span>
                  )}
                  <span className="price-points">
                    {product.pricePoints} 🪙
                  </span>
                </div>

                <label className="pay-checkbox">
                  <input
                    type="checkbox"
                    checked={entry.payWithPoints}
                    onChange={() => togglePayWithPoints(product.id)}
                    disabled={isLocked}
                  />
                  Оплатить баллами
                </label>

                <div className="qty-controls">
                  {isLocked ? (
                    <p className="wait-text">
                      ⏳ Доступно через {productTimeLeft}
                    </p>
                  ) : entry.qty > 0 ? (
                    <>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(product.id, -1)}
                      >
                        –
                      </button>
                      <span className="qty-number">{entry.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(product.id, +1)}
                      >
                        +
                      </button>
                    </>
                  ) : (
                    <button
                      className="add-btn"
                      onClick={() => addToCart(product)}
                      aria-label="Добавить в корзину"
                    >
                      <span className="add-icon">🛒</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
