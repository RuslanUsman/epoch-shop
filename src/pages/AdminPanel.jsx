// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"
import { FaCrown, FaGem } from "react-icons/fa"
import "./AdminPanel.css"

export default function AdminPanel() {
  const [profile, setProfile] = useState(null)
  const [users, setUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [showUsers, setShowUsers] = useState(false)

  // 🔥 состояние для сервера
  const [showModal, setShowModal] = useState(false)
  const [wipeSeconds, setWipeSeconds] = useState("")
  const [endTime, setEndTime] = useState(null)
  const [timeLeft, setTimeLeft] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    loadAdmin()
    fetchUsers()
    fetchServerState()
  }, [])

  async function loadAdmin() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return navigate("/login")

    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, telegram_name, avatar_url, is_admin")
      .eq("id", user.id)
      .single()

    if (!error) setProfile(data)
  }

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, telegram_name, avatar_url, is_vip, is_admin, points")
    if (!error) {
      setUsers(data || [])
      setAllUsers(data || [])
    }
    setLoading(false)
  }

  async function toggleVip(u) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_vip: !u.is_vip })
      .eq("id", u.id)
    if (!error) {
      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, is_vip: !p.is_vip } : p))
      setAllUsers(prev => prev.map(p => p.id === u.id ? { ...p, is_vip: !p.is_vip } : p))
    }
  }

  // 🔥 запуск сервера
  async function startServer() {
    const secs = parseInt(wipeSeconds, 10)
    if (!secs || secs <= 0) return
    const start = new Date()
    const end = new Date(Date.now() + secs * 1000)

    await supabase
      .from("server_state")
      .upsert({ id: "main", start_time: start.toISOString(), end_time: end.toISOString() })

    setEndTime(end.getTime())
    setShowModal(false)
  }

  // 🔥 остановка сервера
  async function stopServer() {
    await supabase.from("server_state").delete().eq("id", "main")
    setEndTime(null)
    setTimeLeft("")
    setWipeSeconds("")
  }

  // 🔥 загрузка состояния сервера при входе
  async function fetchServerState() {
    const { data } = await supabase.from("server_state").select("*").eq("id", "main").single()
    if (data) {
      setEndTime(new Date(data.end_time).getTime())
    }
  }


    // 🔥 обновление таймера
  useEffect(() => {
    if (!endTime) return
    const interval = setInterval(() => {
      const diff = endTime - Date.now()
      if (diff <= 0) {
        setTimeLeft("Вайп завершён")
        clearInterval(interval)
      } else {
        const h = Math.floor(diff / 1000 / 3600)
        const m = Math.floor((diff / 1000 % 3600) / 60)
        const s = Math.floor(diff / 1000 % 60)
        setTimeLeft(`${h}ч ${m}м ${s}с`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  // Поиск «на лету»
  useEffect(() => {
    if (!search.trim()) {
      setUsers(allUsers)
    } else {
      const q = search.toLowerCase()
      setUsers(
        allUsers.filter(
          u =>
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.telegram_name && u.telegram_name.toLowerCase().includes(q))
        )
      )
    }
  }, [search, allUsers])

  const totalUsers = allUsers.length
  const vipUsers = allUsers.filter(u => u.is_vip).length

  return (
    <div className="admin-page">
      <div className="admin-card">
        <h1 className="admin-title">Админ‑панель</h1>

        {profile && (
          <div className="admin-profile">
            <img
              src={profile.avatar_url || "/images/avatar-placeholder.png"}
              alt="avatar"
              className="admin-avatar"
            />
            <div className="admin-info">
              <h2 className="admin-name">
                {profile.name || profile.telegram_name}
                {profile.is_admin && <FaCrown color="gold" style={{ marginLeft: 6 }} />}
              </h2>
              <p className="admin-username">@{profile.telegram_name}</p>
              <p className="admin-role">Администратор</p>
            </div>
          </div>
        )}

        {/* Счётчики пользователей */}
        <div className="users-stats">
          <span>Всего пользователей: <b>{totalUsers}</b></span>
          <span>из них VIP: <b>{vipUsers}</b></span>
        </div>

        {/* 🔥 Кнопки управления */}
        <div className="admin-controls">
          {endTime ? (
            <button className="btn btn-danger" onClick={stopServer}>
              Закрыть сервер
            </button>
          ) : (
            <button className="btn btn-danger" onClick={() => setShowModal(true)}>
              Запуск сервера
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={() => setShowUsers(prev => !prev)}
          >
            {showUsers ? "Скрыть пользователей" : "Показать пользователей"}
          </button>
        </div>

        {/* 🔥 Статус сервера */}
        {endTime && (
          <div className="server-status">
            Сервер запущен. До конца вайпа: <b>{timeLeft}</b>
          </div>
        )}


        {/* Модалка */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Укажите время вайпа (в секундах)</h3>
              <input
                type="number"
                value={wipeSeconds}
                onChange={(e) => setWipeSeconds(e.target.value)}
                placeholder="Например: 10800 (3 часа)"
              />
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={startServer}>Подтвердить</button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Список пользователей */}
        <div className={`collapse ${showUsers ? "open" : ""}`}>
          <div className="admin-search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск пользователей…"
              className="input"
            />
          </div>

          {loading ? (
            <p className="profile-loading">Загрузка...</p>
          ) : (
            <div className="users-list">
              {users.map(u => (
                <div
                  key={u.id}
                  className={`user-row ${u.is_admin ? "row-admin" : u.is_vip ? "row-vip" : ""}`}
                >
                  <img
                    src={u.avatar_url || "/images/avatar-placeholder.png"}
                    alt="avatar"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">
                      {u.name || "—"}
                      {u.is_admin && <FaCrown color="gold" />}
                      {u.is_vip && <FaGem color="#00ccff" />}
                    </div>
                    <div className="user-telegram">@{u.telegram_name}</div>
                    <div className="user-points">{u.points ?? 0} 🪙</div>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => navigate(`/user/${u.id}`)}
                      className="btn btn-small"
                    >
                      Подробнее
                    </button>
                    <button
                      onClick={() => toggleVip(u)}
                      className="btn btn-small"
                    >
                      {u.is_vip ? "Убрать VIP" : "Сделать VIP"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
