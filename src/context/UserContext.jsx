import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    let channel

    // 1) Загружаем текущего пользователя и профиль
    async function loadProfile() {
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr) {
        console.error('Ошибка получения auth.user():', authErr)
        return
      }
      if (!user) return

      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchErr) {
        console.error('Ошибка загрузки профиля:', fetchErr)
      } else {
        setProfile(data)
      }

      // 2) Подписываемся на UPDATE той же строки в profiles
      channel = supabase
        .channel(`public:profiles:id=eq.${user.id}`)
        .on(
          'postgres_changes',
          {
            event:  'UPDATE',
            schema: 'public',
            table:  'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            setProfile(payload.new)
          }
        )
        .subscribe()
    }

    loadProfile()

    // Отписываемся при демонтировании
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

