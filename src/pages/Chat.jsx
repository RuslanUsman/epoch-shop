// src/pages/Chat.jsx
import React, { useEffect, useState, useRef, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { ActiveChatContext } from "../context/ActiveChatContext"
import Picker from "emoji-picker-react"
import "./common.css"
import "./chat.css"

export default function Chat() {
  const { id: otherId } = useParams()
  const navigate = useNavigate()
  const { setActiveChatId } = useContext(ActiveChatContext)

  const [me, setMe] = useState(null)
  const [messages, setMessages] = useState([])
  const [profiles, setProfiles] = useState({})
  const [text, setText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const bottomRef = useRef(null)
  const channelRef = useRef(null)

  // Строгая проверка UUID
  const isValidUUID =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      otherId
    )

  // Инициализация: авторизация → история → подписка → пометка как прочитано
  useEffect(() => {
    if (!isValidUUID) return
    setActiveChatId(otherId)
    let cancelled = false

    async function initChat() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Ошибка авторизации:", error)
        return
      }
      if (!user) {
        navigate("/login")
        return
      }
      if (cancelled) return

      setMe(user)
      await loadMessages(user.id, otherId, false)
      subscribeToMessages(user.id, otherId)
      await markAsRead(user.id, otherId)
    }

    initChat()
    return () => {
      cancelled = true
      setActiveChatId(null)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [otherId, isValidUUID, navigate, setActiveChatId])

  // Загрузка истории + устранение дубликатов
  async function loadMessages(myId, otherId, smooth = true) {
    const filter =
      `and(sender_id.eq.${myId},receiver_id.eq.${otherId}),` +
      `and(sender_id.eq.${otherId},receiver_id.eq.${myId})`

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(filter)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Ошибка загрузки сообщений:", error)
      return
    }
    const unique = Array.from(new Map(data.map(m => [m.id, m])).values())
    setMessages(unique)
    await ensureProfilesLoaded(unique)
    scrollToBottom(smooth)
  }

  // Подгружаем профили авторов сообщений
  async function ensureProfilesLoaded(msgs) {
    const ids = Array.from(new Set(msgs.map(m => m.sender_id)))
    const missing = ids.filter(id => !profiles[id])
    if (!missing.length) return

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", missing)

    if (error) {
      console.error("Ошибка подгрузки профилей:", error)
      return
    }
    setProfiles(prev => {
      const next = { ...prev }
      data.forEach(p => (next[p.id] = p))
      return next
    })
  }

  // Помечаем входящие как прочитанные (MessagesContext сам уменьшит счётчик по UPDATE)
  async function markAsRead(myId, otherId) {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", myId)
      .eq("sender_id", otherId)
      .is("read_at", null)

    if (error) console.error("Ошибка markAsRead:", error)
  }

  // Реалтайм-подписка на новые сообщения
  function subscribeToMessages(myId, otherId) {
    const channel = supabase
      .channel(`chat_${myId}_${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async ({ new: msg }) => {
          const inThisChat =
            (msg.sender_id === myId && msg.receiver_id === otherId) ||
            (msg.sender_id === otherId && msg.receiver_id === myId)
          if (!inThisChat) return

          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) {
              return prev.map(m => (m.id === msg.id ? msg : m))
            }
            return [...prev, msg]
          })

          await ensureProfilesLoaded([msg])
          scrollToBottom(true)

          // Автоматически помечаем входящее как прочитанное
          if (msg.receiver_id === myId) {
            await markAsRead(myId, otherId)
          }
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  // Отправка сообщения с оптимистичным UI
  async function sendMessage() {
    if (!text.trim() || !me || !isValidUUID) return

    const optimistic = {
      id: `temp-${Date.now()}`,
      sender_id: me.id,
      receiver_id: otherId,
      content: text.trim(),
      created_at: new Date().toISOString(),
      _optimistic: true
    }
    setMessages(prev => [...prev, optimistic])
    setText("")
    scrollToBottom(true)

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: me.id,
        receiver_id: otherId,
        content: optimistic.content
      })
      .select()
      .single()

    if (error) {
      console.error("Ошибка отправки:", error)
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      return
    }
    setMessages(prev => prev.map(m => (m.id === optimistic.id ? data : m)))
  }

  // Преобразуем unified-код эмодзи в символ
  function unifiedToNative(unified) {
    return unified
      .split("-")
      .map(u => String.fromCodePoint(parseInt(u, 16)))
      .join("")
  }

  // Обработчик выбора эмодзи
  function onEmojiClick(emojiData) {
    const sym =
      emojiData.native ||
      emojiData.emoji ||
      (emojiData.unified && unifiedToNative(emojiData.unified)) ||
      ""
    setText(prev => prev + sym)
    setShowEmojiPicker(false)
  }

  // Группировка сообщений по датам
  function groupMessagesByDate(msgs) {
    const groups = {}
    msgs.forEach(m => {
      const day = new Date(m.created_at).toISOString().split("T")[0]
      groups[day] = [...(groups[day] || []), m]
    })
    return Object.entries(groups).map(([date, items]) => ({
      date,
      label: getDateLabel(date),
      items
    }))
  }

  function getDateLabel(dateStr) {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    if (dateStr === today) return "Сегодня"
    if (dateStr === yesterday) return "Вчера"
    return new Date(dateStr).toLocaleDateString()
  }

  function scrollToBottom(smooth = true) {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto"
      })
    })
  }

  if (!isValidUUID) {
    return (
      <div className="chat-page">
        <p className="chat-error">Ошибка: некорректный идентификатор чата.</p>
      </div>
    )
  }

  const grouped = groupMessagesByDate(messages)

  return (
    <div className="chat-page">
      <div className="messages-list">
        {grouped.map(group => (
          <div key={group.date} className="message-group">
            <div className="date-separator">{group.label}</div>
            {group.items.map(m => {
              const sender = profiles[m.sender_id] || {}
              const mine = m.sender_id === me?.id
              return (
                <div
                  key={m.id}
                  className={`message-row ${mine ? "outgoing" : "incoming"} ${
                    m._optimistic ? "optimistic" : ""
                  }`}
                >
                  <img
                    src={sender.avatar_url || "/images/avatar-placeholder.png"}
                    alt=""
                    className="avatar"
                  />
                  <div className="message-bubble">
                    <div className="message-header">
                      <span className="sender-name">{sender.name || "..."}</span>
                      <span className="message-time">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <div className="message-content">{m.content}</div>
                    {mine && (
                      <div className="message-footer">
                        <span className="status">
                          {m._optimistic ? "⏳" : m.read_at ? "✅" : "✔"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-wrapper">
        <input
          className="chat-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Напишите сообщение..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />

        <button
          className="emoji-btn"
          onClick={() => setShowEmojiPicker(v => !v)}
          aria-label="Открыть эмодзи"
        >
          😊
        </button>

        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!text.trim()}
        >
          Отправить
        </button>

        {showEmojiPicker && (
          <div className="emoji-picker-container">
            <Picker onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>
    </div>
  )
}
