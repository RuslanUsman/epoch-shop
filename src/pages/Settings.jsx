// src/pages/Settings.jsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import "./Settings.css"

export default function Settings() {
  const [tab, setTab] = useState("profile")
  const [profile, setProfile] = useState({ name: "", telegram: "", avatar_url: "" })
  const [settings, setSettings] = useState({ theme: "system" })
  const [loading, setLoading] = useState(false)

  // Загружаем профиль и настройки
  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Профиль
      const { data: prof } = await supabase
        .from("profiles")
        .select("name, telegram_name, avatar_url")
        .eq("id", user.id)
        .single()
      if (prof) {
        setProfile({
          name: prof.name || "",
          telegram: prof.telegram_name || "",
          avatar_url: prof.avatar_url || "",
        })
      }

      // Настройки
      const { data: sett } = await supabase
        .from("user_settings")
        .select("theme")
        .eq("id", user.id)
        .single()

      if (sett) {
        setSettings(sett)
        document.documentElement.dataset.theme = sett.theme
      } else {
        await supabase.from("user_settings").insert({ id: user.id })
      }
    })()
  }, [])

  // Сохранение профиля
  async function saveProfile() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        telegram_name: profile.telegram,
        avatar_url: profile.avatar_url,
      })
      .eq("id", user.id)

    if (error) alert("Ошибка сохранения: " + error.message)
    else alert("Профиль обновлён ✅")

    setLoading(false)
  }

  // Сохранение настроек
  async function saveSettings() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        id: user.id,
        theme: settings.theme,
        updated_at: new Date(),
      })

    if (error) alert("Ошибка: " + error.message)
    else {
      document.documentElement.dataset.theme = settings.theme
      alert("Настройки сохранены ✅")
    }
  }

  // Смена пароля
  async function changePassword() {
    const newPass = prompt("Введите новый пароль:")
    if (!newPass) return
    const { error } = await supabase.auth.updateUser({ password: newPass })
    if (error) alert("Ошибка: " + error.message)
    else alert("Пароль изменён ✅")
  }

  return (
    <div className="settings-page">
      <h1>Настройки</h1>

      {/* Вкладки */}
      <nav className="settings-tabs">
        <button onClick={() => setTab("profile")} className={tab==="profile" ? "active" : ""}>Профиль</button>
        <button onClick={() => setTab("interface")} className={tab==="interface" ? "active" : ""}>Интерфейс</button>
        <button onClick={() => setTab("security")} className={tab==="security" ? "active" : ""}>Безопасность</button>
      </nav>

      {/* Контент */}
      <div className="settings-content">
        {tab === "profile" && (
          <div>
            <h2>Профиль</h2>
            <label>Имя
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </label>
            <label>Telegram
              <input
                type="text"
                value={profile.telegram}
                onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
              />
            </label>
            <label>Аватар (URL)
              <input
                type="text"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
              />
            </label>
            <button onClick={saveProfile} disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        )}

        {tab === "interface" && (
          <div>
            <h2>Интерфейс</h2>
            <label>
              Тема:
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
              >
                <option value="system">Системная</option>
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
              </select>
            </label>
            <button onClick={saveSettings}>Сохранить</button>
          </div>
        )}

        {tab === "security" && (
          <div>
            <h2>Безопасность</h2>
            <button onClick={changePassword}>Сменить пароль</button>
            <button className="danger" onClick={() => alert("2FA пока не реализована")}>
              Включить 2FA
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
