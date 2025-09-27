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

// -------------------------
// Обработка callback_query
// -------------------------
bot.on("callback_query", async (callbackQuery) => {
  const { id: cbId, data = "", message, from } = callbackQuery
  const parts  = data.split("|") // теперь используем безопасный разделитель
  const action = parts[0]        // "take", "credit" или "vip"
  const orderId = parts[1]       // ID заказа/заявки
  const buyerKey = parts[2]      // UUID (для заказов) или telegram_name (для VIP)
  const points  = action === "credit"
    ? parseInt(parts[3], 10) || 0
    : 0

  console.log("Callback data:", data, "Action:", action, "OrderId:", orderId, "BuyerKey:", buyerKey)

  // Проверяем, что есть клавиатура
  const kb = message?.reply_markup?.inline_keyboard
  if (!kb) {
    return bot.answerCallbackQuery(cbId, { text: "Клавиатура не найдена" })
  }

  const goButton  = kb[0][0]   // кнопка «Перейти»

  // 1) Обработка «Взять заказ»
  if (action === "take") {
    const adminName = from.username || from.first_name || "admin"
    const takeLabel = {
      text:          `🟢 Взял: @${adminName}`,
      callback_data: "none"
    }
    const creditRow = kb[2]

    await bot.editMessageReplyMarkup(
      { inline_keyboard: [[goButton], [takeLabel], [creditRow[0]]] },
      { chat_id: message.chat.id, message_id: message.message_id }
    )

    await supabase
      .from("orders")
      .update({
        taker_id:       from.id,
        taker_username: adminName
      })
      .eq("id", orderId)

    return bot.answerCallbackQuery(cbId)
  }

  // 2) Обработка «Зачислить баллы»
  if (action === "credit") {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("points")
      .eq("id", buyerKey) // здесь остаётся id (UUID)
      .single()

    const currentPoints = profileData?.points || 0
    const newPoints     = currentPoints + points

    await supabase.from("profiles").update({ points: newPoints }).eq("id", buyerKey)
    await supabase.from("orders").update({ bonus_given: points }).eq("id", orderId)

    const takeRow = kb[1]
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

  // 3) Обработка «Выдать VIP»
  if (action === "vip") {
    const adminName = from.username || from.first_name || "admin"
    const telegramName = buyerKey // теперь это telegram_name

    console.log("VIP callback:", { orderId, telegramName, adminName })

    // Обновляем профиль в Supabase по telegram_name
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ is_vip: true, vip_given_by: adminName })
      .eq("telegram_name", telegramName)

    if (profileErr) {
      console.error("Ошибка обновления VIP:", profileErr.message)
      return bot.answerCallbackQuery(cbId, { text: "Ошибка при выдаче VIP" })
    }

    const vipLabel = {
      text: `🌟 VIP выдал: @${adminName}`,
      callback_data: "none"
    }

    await bot.editMessageReplyMarkup(
      {
        inline_keyboard: [
          [ { text: "Перейти в профиль", url: `https://t.me/${telegramName}` } ],
          [ vipLabel ]
        ]
      },
      { chat_id: message.chat.id, message_id: message.message_id }
    )

    return bot.answerCallbackQuery(cbId, { text: "VIP выдан" })
  }
})

// -------------------------
// Обработка простых сообщений
// -------------------------
bot.on("message", (msg) => {
  if (msg.text === "/start") {
    bot.sendMessage(msg.chat.id, "Привет! Я бот для управления заказами и VIP-заявками.")
  }
})

// -------------------------
// Функция для отправки VIP-заявки
// -------------------------
export async function sendVipRequest({ name, telegramUsername }) {
  const text = `
🌟 Новый запрос на VIP
👤 Пользователь: ${name} (@${telegramUsername})
Хочет оформить VIP-подписку
  `.trim()

  const extra = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Перейти в профиль",
            url: `https://t.me/${telegramUsername}`
          }
        ],
        [
          {
            text: "Выдать VIP",
            callback_data: `vip|${Date.now()}|${telegramUsername}` // теперь через |
          }
        ]
      ]
    }
  }

  try {
    await bot.sendMessage(process.env.TELEGRAM_ADMIN_CHAT_ID, text, extra)
  } catch (err) {
    console.error("Ошибка отправки VIP-заявки:", err.message)
  }
}
