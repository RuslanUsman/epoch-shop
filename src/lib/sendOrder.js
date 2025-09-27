// src/lib/sendOrder.js

export async function sendOrder({
  orderId,
  buyerId,              // для заказов — UUID профиля
  name,
  telegramUsername,      // для VIP — используем именно telegram_name
  text,
  bonus = 0,             // для заказов
  type = "order"         // "order" или "vip"
}) {
  // В Vite переменные окружения доступны через import.meta.env
  const token  = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
  const chatId = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID

  if (!token || !chatId) {
    throw new Error("Не заданы VITE_TELEGRAM_BOT_TOKEN или VITE_TELEGRAM_ADMIN_CHAT_ID")
  }

  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`

  // Валидация входных параметров
  if (!orderId) throw new Error("Не передан orderId в sendOrder")
  if (!name) throw new Error("Не передано name в sendOrder")
  if (!telegramUsername) throw new Error("Не передано telegramUsername в sendOrder")
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Текст отсутствует")
  }
  if (text.length > 4000) {
    throw new Error("Текст слишком длинный для Telegram")
  }
  if (type === "order") {
    if (!buyerId) throw new Error("Не передан buyerId в sendOrder (для заказа)")
    if (typeof bonus !== "number" || bonus < 0) {
      throw new Error("Не передан корректный bonus в sendOrder")
    }
  }

  // URL для кнопки «Перейти»
  const prefill    = `👤 Клиент: ${name} (@${telegramUsername})`
  const profileUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(prefill)}`

  let keyboard

  if (type === "order") {
    // Формируем callback_data для кнопок заказа
    const takeData   = `take|${orderId}|${buyerId}`
    const creditData = `credit|${orderId}|${buyerId}|${bonus}`

    keyboard = {
      inline_keyboard: [
        [ { text: "Перейти", url: profileUrl } ],
        [ { text: "Взять заказ", callback_data: takeData } ],
        [ { text: "Зачислить баллы", callback_data: creditData } ]
      ]
    }
  } else if (type === "vip") {
    // Для VIP-заявки: кнопка «Перейти в профиль» и «Выдать VIP»
    const vipData = `vip|${orderId}|${telegramUsername}`

    keyboard = {
      inline_keyboard: [
        [ { text: "Перейти в профиль", url: `https://t.me/${telegramUsername}` } ],
        [ { text: "Выдать VIP", callback_data: vipData } ]
      ]
    }
  }

  // Пейлоад для Telegram API
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: keyboard
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log("Telegram API ответ:", data)

    if (!res.ok || !data.ok) {
      throw new Error(data.description || "Ошибка отправки в Telegram")
    }

    return data
  } catch (err) {
    console.error("Ошибка при отправке в Telegram:", err)
    throw err
  }
}
