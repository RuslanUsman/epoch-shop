// bot.js

import dotenv from "dotenv"
import TelegramBot from "node-telegram-bot-api"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

// Инициализируем Supabase-клиент с service-role ключом
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Инициализируем бота в режиме long polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

bot.on("callback_query", async (callbackQuery) => {
  const { id: cbId, data = "", message, from } = callbackQuery
  const parts  = data.split("_")
  const action = parts[0]              // "take" или "credit"
  const orderId = parts[1]             // ID заказа
  const buyerId = parts[2]             // UUID покупателя
  const points  = action === "credit"  // число баллов для credit
    ? parseInt(parts[3], 10) || 0
    : 0

  // Игнорируем чужие callback’ы
  if (action !== "take" && action !== "credit") {
    return bot.answerCallbackQuery(cbId)
  }

  // Проверяем, что есть клавиатура
  const kb = message?.reply_markup?.inline_keyboard
  if (!kb) {
    return bot.answerCallbackQuery(cbId, { text: "Клавиатура не найдена" })
  }

  const goButton  = kb[0][0]   // кнопка «Перейти»
  const takeRow   = kb[1]      // строка с take-кнопкой или лейблом «🟢 Взял…»
  const creditRow = kb[2]      // строка с «Зачислить баллы»

  // 1) Обработка «Взять заказ»
  if (action === "take") {
    const adminName = from.username || from.first_name || "admin"
    const takeLabel = {
      text:          `🟢 Взял: @${adminName}`,
      callback_data: "none"
    }

    // Редактируем ReplyMarkup
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [[goButton], [takeLabel], [creditRow[0]]] },
      { chat_id: message.chat.id, message_id: message.message_id }
    )

    // Сохраняем, кто взял заказ
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        taker_id:       from.id,
        taker_username: adminName
      })
      .eq("id", orderId)

    if (orderErr) {
      console.error("Ошибка обновления заказа:", orderErr.message)
    }

    return bot.answerCallbackQuery(cbId)
  }

  // 2) Обработка «Зачислить баллы»
  if (action === "credit") {
    // a) Сначала получаем текущие баллы профиля
    const { data: profileData, error: selectErr } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", buyerId)
      .single()

    if (selectErr) {
      console.error("Ошибка чтения профиля:", selectErr.message)
    }

    const currentPoints = profileData?.points || 0
    const newPoints     = currentPoints + points

    // b) Обновляем профиль: складываем баллы
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ points: newPoints })
      .eq("id", buyerId)

    if (profileErr) {
      console.error("Ошибка начисления баллов профилю:", profileErr.message)
    }

    // c) Фиксируем бонус в заказе
    const { error: orderErr } = await supabase
      .from("orders")
      .update({ bonus_given: points })
      .eq("id", orderId)

    if (orderErr) {
      console.error("Ошибка обновления бонуса в заказе:", orderErr.message)
    }

    // d) Редактируем ReplyMarkup: показываем, сколько начислено
    const creditLabel = {
      text:          `✅ Начислено ${points} баллов`,
      callback_data: "none"
    }

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [[goButton], takeRow, [creditLabel]] },
      { chat_id: message.chat.id, message_id: message.message_id }
    )

    return bot.answerCallbackQuery(cbId)
  }
})

// Обработка простых сообщений (например, /start)
bot.on("message", (msg) => {
  if (msg.text === "/start") {
    bot.sendMessage(msg.chat.id, "Привет! Я бот для управления заказами.")
  }
})
