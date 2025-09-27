import React, { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useUser } from "../context/UserContext"
import { sendOrder } from "../lib/sendOrder"
import { supabase } from "../lib/supabase"
import "./Checkout.css"

export default function Checkout() {
  const navigate = useNavigate()
  const { items, totalPoints, clearCart } = useCart()
  const { profile } = useUser()
  const { id: buyerId, name, telegram_name } = profile

  const [success, setSuccess] = useState(false)
  const [isVip, setIsVip] = useState(false)

  useEffect(() => {
    async function fetchVipStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_vip")
          .eq("id", user.id)
          .single()

        setIsVip(profile?.is_vip || false)
      }
    }

    fetchVipStatus()
  }, [])

  const rubleSumRaw = items
    .filter(i => !i.payWithPoints)
    .reduce((sum, i) => {
      const priceRub = Number(i.item.priceRub) || 0
      return sum + priceRub * i.qty
    }, 0)

  const rubleSumDiscounted = isVip ? rubleSumRaw * 0.9 : rubleSumRaw
  const discountAmount = isVip ? rubleSumRaw - rubleSumDiscounted : 0
  const accruedBonus = Math.floor(rubleSumRaw * 0.1)

  const total = `${Math.round(rubleSumDiscounted)} ₽ + ${totalPoints} 🪙`

  const handleCheckout = async () => {
    if (!items.length) {
      alert("Ваша корзина пуста")
      return
    }

    const orderId = Date.now()
    const now = new Date()
    const dateStr = now.toLocaleDateString("ru-RU")
    const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

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
${isVip ? "🌟 Статус: VIP\n" : ""}

${itemLines}

💰 Итого: ${total}
💵 Оплачено рублями: ${Math.round(rubleSumDiscounted)} ₽
🪙 Оплачено баллами: ${totalPoints} 🪙
🎁 Бонус к начислению: ${accruedBonus} 🪙
${isVip ? `📉 Скидка по VIP: ${Math.round(discountAmount)} ₽` : ""}
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
      {isVip && <p className="vip-badge">🌟 У вас VIP-статус — скидка 10% на рубли</p>}
      <p>Товаров в заказе: {items.length}</p>
      <p>Сумма без скидки: {Math.round(rubleSumRaw)} ₽ / {totalPoints} 🪙</p>
      {isVip && <p>Скидка: –{Math.round(discountAmount)} ₽</p>}
      <p>Итого к оплате: {Math.round(rubleSumDiscounted)} ₽ / {totalPoints} 🪙</p>
      <p>Возможные бонусы: {accruedBonus} 🪙</p>
      <Link to="/vip" className="vip-info-link">Узнать больше о VIP</Link>
      <button className="checkout-btn" onClick={handleCheckout}>
        Оформить заказ
      </button>
    </div>
  )
}
