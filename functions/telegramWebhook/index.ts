// functions/telegramWebhook/index.ts
import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// подхватим из секретов
const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const TG_TOKEN                  = Deno.env.get("TELEGRAM_BOT_TOKEN")!
const TG_API                    = `https://api.telegram.org/bot${TG_TOKEN}`

// инициализируем supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve({
  async POST(req) {
    const body = await req.json()
    const cb   = body.callback_query
    if (!cb) return new Response("no callback_query", { status: 200 })

    const {
      id: callback_query_id,
      from,
      data,
      message: { chat, message_id, text }
    } = cb

    const [ action, orderId, buyerId ] = data.split("_")
    if (action !== "take") {
      return new Response("ok", { status: 200 })
    }

    // 1) Админ, который нажал кнопку
    const adminUsername = from.username || from.first_name

    // 2) Записываем в Supabase, кто взял заказ
    await supabase
      .from("orders")
      .update({
        taker_id:       from.id,
        taker_username: adminUsername
      })
      .eq("id", orderId)

    // 3) Подготавливаем новый текст сообщения:
    //    оригинал + строка про взятие
    const newText = (text || "")
      + "\n\n"
      + `🟢 Взял заказ: @${adminUsername}`

    // 4) Убираем кнопку «Взять заказ» из inline-клавиатуры
    //    оставляем 1-ю (Перейти) и 3-ю (Зачислить баллы)
    const origKb = cb.message.reply_markup.inline_keyboard
    const newKb = [
      origKb[0],  // [ { text: "Перейти", ... } ]
      origKb[2]   // [ { text: "Зачислить баллы", ... } ]
    ]

    // 5) Редактируем сообщение: меняем text и reply_markup
    await fetch(`${TG_API}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:      chat.id,
        message_id,
        text:         newText,
        parse_mode:   "HTML",
        reply_markup: { inline_keyboard: newKb }
      })
    })

    // 6) Показываем админу pop-up об успешном взятии
    await fetch(`${TG_API}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id,
        text:            `Вы взяли заказ #${orderId}`,
        show_alert:      true
      })
    })

    return new Response("ok", { status: 200 })
  }
})
