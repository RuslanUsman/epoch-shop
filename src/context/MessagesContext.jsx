// src/context/MessagesContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

const MessagesContext = createContext()

export function MessagesProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let channel

    async function fetchUnread() {
      const { data, error } = await supabase
        .from("messages")
        .select("id")
        .is("read_at", null)

      if (!error && data) {
        setUnreadCount(data.length)
      }
    }

    fetchUnread()

    channel = supabase
      .channel("messages_unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async payload => {
          console.log("Realtime event:", payload)
          await fetchUnread() // 👈 всегда пересчитываем
        }
      )
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return (
    <MessagesContext.Provider value={{ unreadCount, setUnreadCount }}>
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  return useContext(MessagesContext)
}
