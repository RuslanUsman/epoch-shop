import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { sendOrder } from "../lib/sendOrder"
import { supabase } from "../lib/supabase"
import "./VipInfo.css"

export default function VipInfo() {
  const { profile } = useUser()
  const { id: userId, name, telegram_name } = profile || {}

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isVip, setIsVip] = useState(false)

  // Проверяем статус VIP в Supabase
  useEffect(() => {
    async function fetchVipStatus() {
      if (!userId) return
      const { data, error } = await supabase
        .from("profiles")
        .select("is_vip")
        .eq("id", userId)
        .single()

      if (!error && data) {
        setIsVip(data.is_vip)
      }
    }
    fetchVipStatus()
  }, [userId])

  const handleVipRequest = async () => {
    if (!userId || !telegram_name) {
      alert("Ошибка: отсутствуют данные профиля")
      return
    }
    setLoading(true)

    try {
      await sendOrder({
        orderId: Date.now(),          // уникальный ID заявки
        buyerId: userId,              // UUID профиля (для совместимости)
        name,
        telegramUsername: telegram_name, // именно telegram_name
        text: `
🌟 Новый запрос на VIP
👤 Пользователь: ${name} (@${telegram_name})
Хочет оформить VIP-подписку
        `.trim(),
        type: "vip"
      })

      setSuccess(true)
    } catch (err) {
      console.error("Ошибка при отправке VIP-заявки:", err)
      alert("Ошибка при отправке запроса на VIP")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="vip-page success">
        <h2>✅ Запрос на VIP успешно отправлен!</h2>
        <p>Администраторы получили уведомление в Telegram</p>
        <Link to="/store" className="back-link">← Вернуться в магазин</Link>
      </div>
    )
  }

  return (
    <div className="vip-page">
      <h2>🌟 Преимущества VIP-статуса</h2>

      <ul className="vip-benefits">
        <li>🔻 Скидка 10% на все покупки за рубли</li>
        <li>🚀 Приоритетная обработка заказов</li>
        <li>🎁 Повышенные бонусы за покупки</li>
        <li>📦 Доступ к эксклюзивным наборам</li>
      </ul>

      <div className="vip-actions">
        {isVip ? (
          <p className="vip-badge">✅ У вас уже активирован VIP-статус</p>
        ) : (
          <button
            className="vip-btn"
            onClick={handleVipRequest}
            disabled={loading}
          >
            {loading ? "Отправляем..." : "Оформить VIP"}
          </button>
        )}
        <Link to="/store" className="back-link">← Назад в магазин</Link>
      </div>
    </div>
  )
}
