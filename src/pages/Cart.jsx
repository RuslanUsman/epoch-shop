// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { CATEGORIES, PRODUCTS } from "../data/products";
import { FaTrash } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import "./Cart.css";

// 👇 Универсальный компонент для картинок в корзине
function CartImage({ src, alt, size = 64 }) {
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
      className="cart-img"
      style={{ width: size, height: size, objectFit: "contain" }}
      onError={(e) => {
        console.error(`Ошибка загрузки изображения: ${src}`);
        e.currentTarget.src = defaultUrl;
      }}
    />
  );
}

export default function Cart() {
  const {
    items,
    updateQty,
    removeFromCart,
    togglePayWithPoints,
    totalPoints,
  } = useCart();

  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    async function fetchVipStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_vip")
          .eq("id", user.id)
          .single();

        setIsVip(profile?.is_vip || false);
      }
    }

    fetchVipStatus();
  }, []);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container empty">
          <h2>🛒 Ваша корзина пуста</h2>
          <Link to="/store" className="empty-link">
            Перейти в магазин
          </Link>
        </div>
      </div>
    );
  }

  const sections = CATEGORIES
    .map((cat) => {
      const sectionItems = items.filter((e) =>
        (PRODUCTS[cat] || []).some((p) => p.id === e.item.id)
      );
      return { cat, items: sectionItems };
    })
    .filter((section) => section.items.length > 0);

  const totalRublesRaw = items.reduce((sum, { item, qty, payWithPoints }) => {
    const price = Number(item.priceRub) || 0;
    return payWithPoints ? sum : sum + price * qty;
  }, 0);

  const totalRublesWithDiscount = isVip ? totalRublesRaw * 0.9 : totalRublesRaw;
  const discountAmount = isVip ? totalRublesRaw - totalRublesWithDiscount : 0;

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Ваша корзина</h2>

        {sections.map(({ cat, items: sectionItems }) => (
          <div key={cat} className="cart-section">
            <h3 className="cart-section-title">{cat}</h3>

            {sectionItems.map(({ item, qty, payWithPoints, selectedOption }) => {
              const baseRub = Number(item.priceRub) || 0;
              const basePts = Number(item.pricePoints) || 0;

              const priceValue = payWithPoints ? basePts * qty : baseRub * qty;
              const priceLabel = payWithPoints
                ? `${priceValue} 🪙`
                : `${priceValue} ₽`;

              const optionLabel =
                selectedOption &&
                item.options?.find((o) => o.id === selectedOption)?.label;

              return (
                <div key={item.id} className="cart-item">
                  <CartImage src={item.img} alt={item.name} size={64} />
                  <div className="cart-info">
                    <h4>{item.name}</h4>
                    <p className="cart-desc">{item.desc}</p>

                    {optionLabel && (
                      <p className="cart-option">
                        🔫 Выбранное оружие: <b>{optionLabel}</b>
                      </p>
                    )}

                    <div className="price">{priceLabel}</div>

                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.id, -1)}>–</button>
                      <span>{qty}</span>
                      <button onClick={() => updateQty(item.id, +1)}>+</button>
                    </div>

                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={payWithPoints}
                        onChange={() => togglePayWithPoints(item.id)}
                      />
                      <span className="slider"></span>
                      <span className="switch-label">Оплатить баллами</span>
                    </label>

                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FaTrash /> Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="cart-totals">
          <div
            className="total-line"
            title="Скидка применяется только к рублёвой оплате при оформлении заказа"
          >
            Итого (₽): {Math.round(totalRublesWithDiscount)} ₽
            {isVip && (
              <span className="vip-badge">
                🎉 VIP-цены применяются при оформлении
              </span>
            )}
          </div>

          {isVip && discountAmount > 0 && (
            <div className="total-line discount-line">
              Вы сэкономили: {Math.round(discountAmount)} ₽
            </div>
          )}

          {totalPoints > 0 && (
            <div className="total-line">Итого (🪙): {totalPoints} 🪙</div>
          )}
        </div>

        {/* 👉 Возвращаем переход на Checkout */}
        <Link to="/checkout" className="checkout-btn">
          Оформить заказ
        </Link>
      </div>
    </div>
  );
}
