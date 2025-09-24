// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useMemo } from "react"

export const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [cartMap, setCartMap] = useState({})

  const addToCart = (item, payWithPoints = false) => {
    setCartMap(prev => {
      const entry = prev[item.id]
      if (entry) {
        return {
          ...prev,
          [item.id]: { ...entry, qty: entry.qty + 1 }
        }
      }
      return {
        ...prev,
        [item.id]: { item, qty: 1, payWithPoints }
      }
    })
  }

  const removeFromCart = id => {
    setCartMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updateQty = (id, delta) => {
    setCartMap(prev => {
      const entry = prev[id]
      if (!entry) return prev

      const newQty = entry.qty + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return {
        ...prev,
        [id]: { ...entry, qty: newQty }
      }
    })
  }

  const togglePayWithPoints = id => {
    setCartMap(prev => {
      const entry = prev[id]
      if (!entry) return prev
      return {
        ...prev,
        [id]: { ...entry, payWithPoints: !entry.payWithPoints }
      }
    })
  }

  const clearCart = () => {
    setCartMap({})
  }

  // Преобразуем словарь cartMap в массив записей { item, qty, payWithPoints }
  const items = useMemo(() => Object.values(cartMap), [cartMap])

  // Общее количество товаров
  const totalItems = useMemo(
    () => items.reduce((sum, { qty }) => sum + qty, 0),
    [items]
  )

  // Итоговая сумма в рублях (только позиции с payWithPoints = false)
  const totalRubles = useMemo(
    () =>
      items.reduce((sum, { item, qty, payWithPoints }) => {
        if (payWithPoints) return sum
        const priceRub = Number(item.priceRub) || 0
        return sum + priceRub * qty
      }, 0),
    [items]
  )

  // Итоговая сумма в баллах (только позиции с payWithPoints = true)
  const totalPoints = useMemo(
    () =>
      items.reduce((sum, { item, qty, payWithPoints }) => {
        if (!payWithPoints) return sum
        const pricePts = Number(item.pricePoints) || 0
        return sum + pricePts * qty
      }, 0),
    [items]
  )

  // Бонусные баллы за рублевые покупки
  const bonusPoints = useMemo(() => {
    if (totalRubles > 500) return 150
    if (totalRubles > 300) return 100
    if (totalRubles > 100) return 50
    return 0
  }, [totalRubles])

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalRubles,
        totalPoints,
        bonusPoints,
        addToCart,
        removeFromCart,
        updateQty,
        togglePayWithPoints,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
