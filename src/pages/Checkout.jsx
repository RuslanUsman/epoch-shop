// src/pages/Checkout.jsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useUser } from "../context/UserContext"
import { sendOrder } from "../lib/sendOrder"
import "./Checkout.css"

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalRubles, totalPoints, clearCart } = useCart()
  const { profile } = useUser()
  const { id: buyerId, name, telegram_name } = profile

  const [success, setSuccess] = useState(false)

  const handleCheckout = async () => {
    if (!items.length) {
      alert("Ваша корзина пуста")
      return
    }

    const orderId = Date.now()

    // считаем бонусы только с рублёвой части
    const rubleSum = items
      .filter(i => !i.payWithPoints)
      .reduce((sum, i) => {
        const priceRub = Number(i.item.priceRub) || 0
        return sum + priceRub * i.qty
      }, 0)

    const accruedBonus = Math.floor(rubleSum * 0.1)

    // итог для отображения
    const total = `${totalRubles} ₽ + ${totalPoints} 🪙`

    // дата и время заказа
    const now = new Date()
    const dateStr = now.toLocaleDateString("ru-RU")
    const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

    // формируем текст заказа
    const itemLines = items
      .map(({ item, qty, payWithPoints }) => {
        const priceRub = Number(item.priceRub) || 0
        const pricePts = Number(item.pricePoints) || 0
        const priceLabel = payWithPoints ? `${pricePts} 🪙` : `${priceRub} ₽`
        return [
          `• ${item.name}`,
          `  Раздел: ${item.category}`,
          `  Описание: ${item.desc}`,
          `  Цена: ${priceLabel} ×${qty}`,
        ].join("\n")
      })
      .join("\n\n")

    const text = `
📦 Новый заказ #${orderId}
👤 Клиент: ${name} (@${telegram_name})
🆔 ID профиля: ${buyerId}
🕒 Дата: ${dateStr} ${timeStr}

${itemLines}

💰 Итого: ${total}
💵 Оплачено рублями: ${totalRubles} ₽
🪙 Оплачено баллами: ${totalPoints} 🪙
🎁 Бонус к начислению: ${accruedBonus} 🪙
    `.trim()

    try {
      await sendOrder({
        orderId,
        buyerId,
        name,
        telegramUsername: telegram_name,
        text,
        bonus: accruedBonus
      })

      setSuccess(true)
      clearCart()

      // через 3 секунды отправляем в магазин
      setTimeout(() => navigate("/store", { replace: true }), 3000)
    } catch (err) {
      console.error(err)
      alert(err.message || "Не удалось отправить заказ")
    }
  }

  if (success) {
    return (
      <div className="checkout-page success">
        <div className="success-icon">✅</div>
        <h2>Заказ успешно отправлен!</h2>
        <p>Мы уже уведомили администраторов в Telegram</p>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <h2>Оформление заказа для {name}</h2>
      <p>Товаров в заказе: {items.length}</p>
      <p>Сумма: {totalRubles} ₽ / {totalPoints} 🪙</p>
      <p>Возможные бонусы: {Math.floor(
        items.filter(i => !i.payWithPoints)
             .reduce((sum, i) => sum + (Number(i.item.priceRub) || 0) * i.qty, 0) * 0.1
      )} 🪙</p>
      <button className="checkout-btn" onClick={handleCheckout}>
        Оформить заказ
      </button>
    </div>
  )
}
