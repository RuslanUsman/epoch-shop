// src/context/MessagesContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

const MessagesContext = createContext()

export function MessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [myId, setMyId] = useState(null)

  // Получаем ID текущего пользователя
  useEffect(() => {
    let cancelled = false
    async function getUser() {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error("MessagesContext: auth error:", error.message)
        return
      }
      if (!cancelled && user) setMyId(user.id)
    }
    getUser()
    return () => { cancelled = true }
  }, [])

  // Считаем количество диалогов с непрочитанными сообщениями
  async function fetchUnreadDialogs(userId) {
    if (!userId) return

    const { data, error } = await supabase
      .from("dialogs")
      .select(`
        id,
        messages (
          id,
          sender_id,
          read_at
        )
      `)

    if (error) {
      console.error("MessagesContext: fetchUnreadDialogs error:", error.message)
      return
    }

    const unreadDialogs = (data || []).filter(d =>
      d.messages?.some(m => m.sender_id !== userId && !m.read_at)
    )

    setUnreadCount(unreadDialogs.length)
  }

  // Подписка на новые и обновлённые сообщения
  useEffect(() => {
    if (!myId) return
    let channel

    fetchUnreadDialogs(myId)

    channel = supabase
      .channel("dialogs_unread_channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => fetchUnreadDialogs(myId)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => fetchUnreadDialogs(myId)
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [myId])

  return (
    <MessagesContext.Provider value={{ unreadCount }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  return useContext(MessagesContext)
}
