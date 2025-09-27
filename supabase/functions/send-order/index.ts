// supabase/functions/send-order/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!
const TELEGRAM_ADMIN_CHAT_ID = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID")!
const API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

serve(async (req) => {
  try {
    const { orderId, buyerId, name, telegramUsername, text, bonus = 0, type = "order" } = await req.json()

    if (!orderId || !name || !telegramUsername || !text) {
      return new Response(JSON.stringify({ error: "Некорректные параметры" }), { status: 400 })
    }

    const prefill    = `👤 Клиент: ${name} (@${telegramUsername})`
    const profileUrl = `https://t.me/${telegramUsername}?text=${encodeURIComponent(prefill)}`

    let keyboard

    if (type === "order") {
      if (!buyerId) {
        return new Response(JSON.stringify({ error: "buyerId обязателен для заказа" }), { status: 400 })
      }

      const takeData   = `take_${orderId}_${buyerId}`
      const creditData = `credit_${orderId}_${buyerId}_${bonus}`

      keyboard = {
        inline_keyboard: [
          [ { text: "Перейти", url: profileUrl } ],
          [ { text: "Взять заказ", callback_data: takeData } ],
          [ { text: "Зачислить баллы", callback_data: creditData } ]
        ]
      }
    } else if (type === "vip") {
      const vipData = `vip_${orderId}_${telegramUsername}`

      keyboard = {
        inline_keyboard: [
          [ { text: "Перейти в профиль", url: `https://t.me/${telegramUsername}` } ],
          [ { text: "Выдать VIP", callback_data: vipData } ]
        ]
      }
    }

    const payload = {
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML",
      reply_markup: keyboard
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (!res.ok || !data.ok) {
      return new Response(JSON.stringify({ error: data.description || "Ошибка отправки в Telegram" }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true, data }), { status: 200 })
  } catch (err) {
    console.error("Ошибка в send-order:", err)
    return new Response(JSON.stringify({ error: "Внутренняя ошибка" }), { status: 500 })
  }
})
