// src/pages/Chat.jsx
import React, { useEffect, useState, useRef, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { ActiveChatContext } from "../context/ActiveChatContext"
import Picker from "emoji-picker-react"
import "./common.css"
import "./chat.css"

export default function Chat() {
  const { id: dialogId } = useParams()
  const navigate = useNavigate()
  const { setActiveChatId } = useContext(ActiveChatContext)

  const [me, setMe] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const bottomRef = useRef(null)
  const channelRef = useRef(null)

  const isValidUUID =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      dialogId
    )

  useEffect(() => {
    if (!isValidUUID) return
    setActiveChatId(dialogId)
    let cancelled = false

    async function initChat() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Ошибка авторизации:", error.message)
        return
      }
      if (!user) {
        navigate("/login")
        return
      }
      if (cancelled) return

      setMe(user)
      await loadMessages(dialogId, false)
      subscribeToMessages(dialogId, user.id)
      await markAsRead(user.id, dialogId)
    }

    initChat()
    return () => {
      cancelled = true
      setActiveChatId(null)
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [dialogId, isValidUUID, navigate, setActiveChatId])

    // Загрузка сообщений по dialogId
  async function loadMessages(dialogId, smooth = true) {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles!messages_sender_id_fkey(id, name, avatar_url)")
      .eq("dialog_id", dialogId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Ошибка загрузки сообщений:", error.message)
      return
    }
    setMessages(data)
    scrollToBottom(smooth)
  }

  // Помечаем входящие как прочитанные
  async function markAsRead(myId, dialogId) {
    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("dialog_id", dialogId)
      .neq("sender_id", myId)
      .is("read_at", null)

    if (error) console.error("Ошибка markAsRead:", error.message)
  }

  // Подписка на новые сообщения
  function subscribeToMessages(dialogId, myId) {
    const channel = supabase
      .channel(`chat_${dialogId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `dialog_id=eq.${dialogId}` },
        async ({ new: msg }) => {
          setMessages(prev => {
            // ищем оптимистичное сообщение с тем же текстом и отправителем
            const tempIndex = prev.findIndex(
              m => m._optimistic && m.sender_id === msg.sender_id && m.content === msg.content
            )
            if (tempIndex !== -1) {
              const copy = [...prev]
              copy[tempIndex] = msg
              return copy
            }
            if (!prev.some(m => m.id === msg.id)) {
              return [...prev, msg]
            }
            return prev
          })
          scrollToBottom(true)
          if (msg.sender_id !== myId) {
            await markAsRead(myId, dialogId)
          }
        }
      )
      .subscribe()

    channelRef.current = channel
  }

  // Отправка сообщения
  async function sendMessage() {
    if (!text.trim() || !me || !isValidUUID) return

    const optimistic = {
      id: `temp-${Date.now()}`,
      sender_id: me.id,
      dialog_id: dialogId,
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
        dialog_id: dialogId,
        sender_id: me.id,
        content: optimistic.content
      })
      .select("*, profiles!messages_sender_id_fkey(id, name, avatar_url)")
      .single()

    if (error) {
      console.error("Ошибка отправки:", error.message)
      setMessages(prev =>
        prev.map(m => (m.id === optimistic.id ? { ...m, failed: true } : m))
      )
      return
    }

    // заменяем временное сообщение на настоящее
    setMessages(prev =>
      prev.map(m => (m.id === optimistic.id ? data : m))
    )
  }

  // Утилиты
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
      bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })
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
              const mine = m.sender_id === me?.id
              return (
                <div
                  key={m.id}
                  className={`message-row ${mine ? "outgoing" : "incoming"} ${
                    m._optimistic ? "optimistic" : ""
                  } ${m.failed ? "failed" : ""}`}
                >
                  {/* Аватарка собеседника слева */}
                  {!mine && (
                    <img
                      src={m.profiles?.avatar_url || "/images/avatar-placeholder.png"}
                      alt={m.profiles?.name || "Аватар"}
                      className="message-avatar"
                    />
                  )}

                  <div className="message-bubble">
                    <div className="message-header">
                      <span className="sender-name">
                        {m.profiles?.name || (mine ? "Вы" : "Собеседник")}
                      </span>
                      <span className="message-time">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <div className="message-content">{m.content}</div>

                    {/* Статус только у моих сообщений */}
                    {mine && (
                      <div className="message-footer">
                        <span className={`status ${m.read_at ? "read" : ""}`}>
                          {m.failed
                            ? "❌"
                            : m._optimistic
                            ? "⏳"
                            : m.read_at
                            ? "✔✔"
                            : "✔"}
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
            <Picker onEmojiClick={(emoji) => setText(prev => prev + (emoji.native || ""))} />
          </div>
        )}
      </div>
    </div>
  )
}
