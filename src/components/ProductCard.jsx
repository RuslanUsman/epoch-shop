// src/components/ProductCard.jsx
import React from "react"
import "./ProductCard.css"

export default function ProductCard({ product, onAdd }) {
  // Защита от NaN: приводим цены к числу и даём fallback 0
  const priceRub = Number(product.priceRub) || 0
  const pricePts = Number(product.pricePoints) || 0
  // Учесть, что в данных может быть поле img, а не image
  const imgSrc = product.img || product.image

  return (
    <div className="product-card">
      <img src={imgSrc} alt={product.name} />
      <h3>{product.name}</h3>
      {product.discount && (
        <div className="discount">{product.discount}%</div>
      )}
      <div className="price">
        <span className="price-rub">{priceRub} ₽</span>
        <span className="price-points" style={{ marginLeft: 8 }}>
          {pricePts} 🪙
        </span>
      </div>
      <button onClick={() => onAdd(product)}>В корзину</button>
    </div>
  )
}
