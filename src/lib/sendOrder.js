// src/lib/sendOrder.js
// src/lib/sendOrder.js

export async function sendOrder({
  orderId,
  buyerId,
  name,
  telegramUsername,
  text,
  bonus                 // добавили параметр bonus
}) {
  const token  = "8425850715:AAGd9av8TSmRA5H_lE_7XIDDLn4cBELF3IQ"
  const chatId = "-1002637243186"
  const apiUrl = `https://api.telegram.org/bot${token}/sendMessage`

  // Валидация входных параметров
  if (!orderId) {
    throw new Error("Не передан orderId в sendOrder")
  }
  if (!buyerId) {
    throw new Error("Не передан buyerId в sendOrder")
  }
  if (!name) {
    throw new Error("Не передано name в sendOrder")
  }
  if (!telegramUsername) {
    throw new Error("Не передано telegramUsername в sendOrder")
  }
  if (typeof bonus !== "number" || bonus < 0) {
    throw new Error("Не передан корректный bonus в sendOrder")
  }
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("Текст заказа отсутствует")
  }
  if (text.length > 4000) {
    throw new Error("Текст заказа слишком длинный для Telegram")
  }

  // URL для кнопки «Перейти»
  const prefill    = `👤 Клиент: ${name} (@${telegramUsername})`
  const profileUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(prefill)}`

  // Формируем callback_data для кнопок
  const takeData   = `take_${orderId}_${buyerId}`
  const creditData = `credit_${orderId}_${buyerId}_${bonus}`

  // Структура inline-клавиатуры
  const keyboard = {
    inline_keyboard: [
      [ { text: "Перейти",         url: profileUrl   } ],
      [ { text: "Взять заказ",     callback_data: takeData   } ],
      [ { text: "Зачислить баллы", callback_data: creditData } ]
    ]
  }

  // Пейлоад для Telegram API
  const payload = {
    chat_id:      chatId,
    text,
    parse_mode:   "HTML",
    reply_markup: keyboard
  }

  // Отправляем запрос в Telegram
  const res  = await fetch(apiUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload)
  })
  const data = await res.json()

  console.log("Telegram API ответ:", data)
  if (!res.ok) {
    throw new Error(data.description || "Ошибка отправки в Telegram")
  }

  return data
}
