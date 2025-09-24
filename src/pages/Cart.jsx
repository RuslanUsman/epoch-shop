// src/pages/Cart.jsx
import React from "react"
import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { CATEGORIES, PRODUCTS } from "../data/products"
import { FaTrash } from "react-icons/fa"
import "./Cart.css"

export default function Cart() {
  const {
    items,
    updateQty,
    removeFromCart,
    togglePayWithPoints,
    totalRubles,
    totalPoints,
  } = useCart()

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
    )
  }

  const sections = CATEGORIES
    .map(cat => {
      const sectionItems = items.filter(e =>
        PRODUCTS[cat].some(p => p.id === e.item.id)
      )
      return { cat, items: sectionItems }
    })
    .filter(section => section.items.length > 0)

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Ваша корзина</h2>

        {sections.map(({ cat, items: sectionItems }) => (
          <div key={cat} className="cart-section">
            <h3 className="cart-section-title">{cat}</h3>

            {sectionItems.map(({ item, qty, payWithPoints }) => {
              const priceValue = payWithPoints
                ? Number(item.pricePoints) * qty
                : Number(item.priceRub) * qty
              const priceLabel = payWithPoints
                ? `${priceValue || 0} 🪙`
                : `${priceValue || 0} ₽`

              return (
                <div key={item.id} className="cart-item">
                  <img src={item.img} alt={item.name} className="cart-img" />
                  <div className="cart-info">
                    <h4>{item.name}</h4>
                    <p className="cart-desc">{item.desc}</p>

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
              )
            })}
          </div>
        ))}

        <div className="cart-totals">
          {totalRubles > 0 && (
            <div className="total-line">Итого (₽): {totalRubles} ₽</div>
          )}
          {totalPoints > 0 && (
            <div className="total-line">Итого (🪙): {totalPoints} 🪙</div>
          )}
        </div>

        <Link to="/checkout" className="checkout-btn">
          Оформить заказ
        </Link>
      </div>
    </div>
  )
}
