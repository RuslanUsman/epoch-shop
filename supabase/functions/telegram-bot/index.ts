import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPA_URL  = Deno.env.get("URL")!;
const SUPA_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;
const BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const API       = `https://api.telegram.org/bot${BOT_TOKEN}`;

const supabase = createClient(SUPA_URL, SUPA_KEY, { global: { fetch } });

serve(async (req) => {
  const update = await req.json();

  // === CALLBACK QUERY ===
  if (update.callback_query) {
    const { id: cbId, data = "", message, from } = update.callback_query;
    const parts  = data.split("_");
    const action = parts[0];
    const orderId = parts[1];
    const buyerId = parts[2];
    const points  = action === "credit" ? parseInt(parts[3], 10) || 0 : 0;

    if (action !== "take" && action !== "credit") {
      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cbId })
      });
      return new Response("ok");
    }

    const kb = message?.reply_markup?.inline_keyboard;
    if (!kb) {
      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cbId, text: "Клавиатура не найдена" })
      });
      return new Response("ok");
    }

    const goButton  = kb[0][0];
    const takeRow   = kb[1];
    const creditRow = kb[2];

    // === TAKE ===
    if (action === "take") {
      const adminName = from.username || from.first_name || "admin";
      const takeLabel = { text: `🟢 Взял: @${adminName}`, callback_data: "none" };

      await fetch(`${API}/editMessageReplyMarkup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: { inline_keyboard: [[goButton], [takeLabel], [creditRow[0]]] }
        })
      });

      const { error: orderErr } = await supabase
        .from("orders")
        .update({ taker_id: from.id, taker_username: adminName })
        .eq("id", orderId);

      if (orderErr) console.error("Ошибка обновления заказа:", orderErr.message);

      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cbId })
      });

      return new Response("ok");
    }

    // === CREDIT ===
    if (action === "credit") {
      const { data: profileData, error: selectErr } = await supabase
        .from("profiles")
        .select("points")
        .eq("id", buyerId)
        .single();

      if (selectErr) console.error("Ошибка чтения профиля:", selectErr.message);

      const currentPoints = profileData?.points || 0;
      const newPoints     = currentPoints + points;

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({ points: newPoints })
        .eq("id", buyerId);

      if (profileErr) console.error("Ошибка начисления баллов профилю:", profileErr.message);

      const { error: orderErr } = await supabase
        .from("orders")
        .update({ bonus_given: points })
        .eq("id", orderId);

      if (orderErr) console.error("Ошибка обновления бонуса в заказе:", orderErr.message);

      const creditLabel = { text: `✅ Начислено ${points} баллов`, callback_data: "none" };

      await fetch(`${API}/editMessageReplyMarkup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: message.chat.id,
          message_id: message.message_id,
          reply_markup: { inline_keyboard: [[goButton], takeRow, [creditLabel]] }
        })
      });

      await fetch(`${API}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: cbId })
      });

      return new Response("ok");
    }
  }

  // === /START ===
  if (update.message?.text === "/start") {
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: update.message.chat.id,
        text: "Привет! Я бот для управления заказами."
      })
    });
  }

  return new Response("ok");
});
