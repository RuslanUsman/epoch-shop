// src/pages/Store.jsx
import React, { useState } from "react"
import { useCart } from "../context/CartContext"
import { CATEGORIES, PRODUCTS } from "../data/products"
import "./Store.css"

export default function Store() {
  const [activeCat, setActiveCat] = useState(CATEGORIES[0])
  const {
    items: cartItems,
    addToCart,
    updateQty,
    togglePayWithPoints
  } = useCart()

  // товары текущей категории
  const products = PRODUCTS[activeCat] || []

  return (
    <div className="store-page">
      <div className="store-container">
        <h1 className="store-title">Магазин «Эпоха выживания»</h1>

        {/* табы категорий */}
        <nav className="category-tabs">
          {CATEGORIES.map(cat => (
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
          {products.map(product => {
            // ищем запись в корзине по id товара
            const entry =
              cartItems.find(e => e.item.id === product.id) || {
                qty: 0,
                payWithPoints: false
              }

            return (
              <div
                key={product.id}
                className={`product-card ${entry.qty > 0 ? "in-cart" : ""}`}
              >
                <img
                  src={product.img}
                  alt={product.name || "Товар"}
                  className="product-img"
                />
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
                  />
                  Оплатить баллами
                </label>

                <div className="qty-controls">
                  {entry.qty > 0 ? (
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
