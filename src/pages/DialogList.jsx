// src/pages/DialogList.jsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { Link } from "react-router-dom"
import "../styles/common.css"
import "../styles/dialogList.css"

export default function DialogList() {
  const [me, setMe] = useState(null)
  const [dialogs, setDialogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("Ошибка получения текущего пользователя:", error.message)
        return
      }
      if (!user) return

      setMe(user)
      await loadDialogs(user.id)
      subscribeToDialogs(user.id)
      setLoading(false)
    })()

    return () => supabase.removeAllChannels()
  }, [])

  // Загружаем список диалогов
  async function loadDialogs(myId) {
    const { data, error } = await supabase
      .from("dialogs")
      .select(`
        id,
        user1,
        user2,
        last_message_at,
        messages (
          id,
          content,
          created_at,
          read_at,
          sender_id
        ),
        user1_profile:profiles!dialogs_user1_fkey (id, name, avatar_url),
        user2_profile:profiles!dialogs_user2_fkey (id, name, avatar_url)
      `)
      .order("last_message_at", { ascending: false })

    if (error) {
      console.error("Ошибка загрузки диалогов:", error.message)
      return
    }

    const list = data.map(d => {
      const otherId = d.user1 === myId ? d.user2 : d.user1
      const otherProfile =
        d.user1_profile?.id === otherId ? d.user1_profile : d.user2_profile

      // Последнее сообщение
      const lastMessage = d.messages?.length
        ? d.messages.reduce((a, b) =>
            new Date(a.created_at) > new Date(b.created_at) ? a : b
          )
        : null

      // Количество непрочитанных
      const unreadCount =
        d.messages?.filter(m => m.sender_id !== myId && !m.read_at).length || 0

      return {
        id: d.id,
        name: otherProfile?.name || "Без имени",
        avatar_url: otherProfile?.avatar_url,
        lastMessage,
        unreadCount,
      }
    })

    setDialogs(list)
  }

  // Подписка на изменения в сообщениях
  function subscribeToDialogs(myId) {
    supabase
      .channel("dialogs_listener")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => loadDialogs(myId)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => loadDialogs(myId)
      )
      .subscribe()
  }

  return (
    <div className="dialog-list">
      <div className="dialog-list-header">
        <h2>Сообщения</h2>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      {!loading && dialogs.length === 0 && (
        <div className="empty">Нет диалогов</div>
      )}

      <div className="dialog-items">
        {dialogs.map(d => (
          <Link to={`/messages/${d.id}`} key={d.id} className="dialog-item">
            <img
              src={d.avatar_url || "/images/avatar-placeholder.png"}
              alt=""
              className="avatar"
            />
            <div className="dialog-info">
              <div className="dialog-top">
                <span className="dialog-name">{d.name}</span>
                <span className="dialog-time">
                  {d.lastMessage
                    ? new Date(d.lastMessage.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
              <div className="dialog-bottom">
                <span className="dialog-last">
                  {d.lastMessage?.content || "Нет сообщений"}
                </span>
                {d.unreadCount > 0 && (
                  <span className="unread-badge">{d.unreadCount}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
