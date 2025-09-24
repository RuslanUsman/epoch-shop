// src/pages/Friends.jsx
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import UserCard from "../components/UserCard"
import "./Friends.css"

export default function Friends() {
  const [me, setMe] = useState(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [pending, setPending] = useState([])     // все заявки (входящие + исходящие)
  const [myFriends, setMyFriends] = useState([])
  const [loading, setLoading] = useState(true)

  // Получаем пользователя и настраиваем подписки
  useEffect(() => {
    let channel = null

    ;(async () => {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser()
      if (authErr) {
        console.error("Ошибка при получении пользователя:", authErr)
        setLoading(false)
        return
      }
      setMe(user)

      if (user) {
        await refresh(user.id)

        // Подписка на изменения в friend_requests и friends
        channel = supabase
          .channel("friends_rt")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "friend_requests" },
            (payload) => {
              const row = payload.eventType === "DELETE" ? payload.old : payload.new
              if (row.sender_id === user.id || row.receiver_id === user.id) {
                refresh(user.id)
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "friends" },
            (payload) => {
              const row = payload.eventType === "DELETE" ? payload.old : payload.new
              if (row.user_a === user.id || row.user_b === user.id) {
                refresh(user.id)
              }
            }
          )
          .subscribe()
      } else {
        setLoading(false)
      }
    })()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  // Общий refresh: pending + myFriends
  async function refresh(uid) {
    setLoading(true)

    const { data: pend, error: pendErr } = await supabase
      .from("friend_requests")
      .select(`
        id,
        sender_id,
        receiver_id,
        status,
        sender:sender_id(id, name, telegram_name, avatar_url),
        receiver:receiver_id(id, name, telegram_name, avatar_url)
      `)
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .eq("status", "pending")
      .order("id", { ascending: false })
    if (pendErr) console.error("Ошибка загрузки заявок:", pendErr)
    setPending(pend || [])

    const { data: fr, error: frErr } = await supabase
      .from("friends")
      .select(`
        user_a,
        user_b,
        a:user_a(id, name, telegram_name, avatar_url),
        b:user_b(id, name, telegram_name, avatar_url)
      `)
      .or(`user_a.eq.${uid},user_b.eq.${uid}`)
    if (frErr) console.error("Ошибка загрузки друзей:", frErr)

    const normalized = (fr || []).map((r) => (r.user_a === uid ? r.b : r.a))
    setMyFriends(normalized)

    setLoading(false)
  }
  // Поиск профилей
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
      } else {
        search(query.trim())
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  async function search(text) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, telegram_name, avatar_url")
      .or(`name.ilike.%${text}%,telegram_name.ilike.%${text}%`)
      .limit(20)
    if (error) {
      console.error("Ошибка поиска:", error)
      return
    }
    setResults((data || []).filter((u) => u.id !== me?.id))
  }

  // Отправка заявки
  async function addFriend(user) {
    if (!me || !user.id) return

    setResults((r) => r.filter((u) => u.id !== user.id))
    setPending((p) => [
      ...p,
      {
        id: `temp-${user.id}`,
        sender_id: me.id,
        receiver_id: user.id,
        status: "pending",
        sender: me,
        receiver: user,
        _optimistic: true,
      },
    ])

    const { error } = await supabase
      .from("friend_requests")
      .upsert(
        { sender_id: me.id, receiver_id: user.id, status: "pending" },
        { onConflict: ["sender_id", "receiver_id"] }
      )
    if (error) {
      alert("Не удалось отправить заявку: " + error.message)
      setPending((p) => p.filter((r) => r.id !== `temp-${user.id}`))
      setResults((r) => [user, ...r])
      console.error(error)
    }
  }

  // Отмена заявки
  async function cancelRequest(reqId) {
    setPending((p) => p.filter((r) => r.id !== reqId))

    const { error } = await supabase.from("friend_requests").delete().eq("id", reqId)
    if (error) {
      alert("Не удалось отменить заявку: " + error.message)
      console.error(error)
      await refresh(me.id)
    }
  }

  // Принять заявку
  async function acceptRequest(req) {
    setPending((p) => p.filter((r) => r.id !== req.id))
    setMyFriends((f) => [...f, req.sender])

    await supabase.from("friend_requests").update({ status: "accepted" }).eq("id", req.id)

    const [a, b] = [req.sender_id, req.receiver_id].sort()
    await supabase.from("friends").insert({ user_a: a, user_b: b })

    await refresh(me.id)
  }

  // Отклонить заявку
  async function declineRequest(reqId) {
    setPending((p) => p.filter((r) => r.id !== reqId))

    const { error } = await supabase.from("friend_requests").delete().eq("id", reqId)
    if (error) {
      alert("Не удалось отклонить заявку: " + error.message)
      console.error(error)
    }
    await refresh(me.id)
  }

  // Удалить из друзей
  async function removeFriend(friendId) {
    if (!me) return

    setMyFriends((f) => f.filter((u) => u.id !== friendId))

    const [a, b] = [me.id, friendId].sort()
    const { error: errFriends } = await supabase.from("friends").delete().match({ user_a: a, user_b: b })
    const { error: errReqs } = await supabase
      .from("friend_requests")
      .delete()
      .or(`and(sender_id.eq.${me.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${me.id})`)
    if (errFriends || errReqs) {
      alert("Не удалось полностью удалить дружбу: " + (errFriends?.message || errReqs?.message))
      console.error(errFriends || errReqs)
    }
    await refresh(me.id)
  }
  if (!me) {
    return loading
      ? <div className="p-6">Загрузка...</div>
      : <div className="p-6">Авторизуйтесь, чтобы увидеть друзей</div>
  }

  const incoming = pending.filter((r) => r.receiver_id === me.id)
  const outgoing = pending.filter((r) => r.sender_id === me.id)

  return (
    <div className="friends-page">
      {/* Поиск друзей */}
      <div className="friends-section">
        <h2>Поиск друзей</h2>
        <div className="friends-search">
          <input
            value={query}
            placeholder="Имя или Telegram-имя"
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => search(query)}>Найти</button>
        </div>
        <div className="friends-grid">
          {results.map((u) => (
            <UserCard key={u.id} user={u} onAdd={() => addFriend(u)} />
          ))}
        </div>
      </div>

      {/* Входящие заявки */}
      <div className="friends-section">
        <h2>Входящие заявки</h2>
        {incoming.length === 0 && <div className="empty">Нет новых заявок</div>}
        {incoming.map((r) => (
          <div key={r.id} className="friend-request">
            <UserCard user={r.sender} />
            <div className="actions">
              <button className="btn-accept" onClick={() => acceptRequest(r)}>
                Принять
              </button>
              <button className="btn-decline" onClick={() => declineRequest(r.id)}>
                Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Исходящие заявки */}
      <div className="friends-section">
        <h2>Исходящие заявки</h2>
        {outgoing.length === 0 && <div className="empty">Нет отправленных заявок</div>}
        {outgoing.map((r) => (
          <div key={r.id} className="friend-request">
            <UserCard user={r.receiver} />
            <div className="actions">
              <button className="btn-decline" onClick={() => cancelRequest(r.id)}>
                Отменить заявку
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Мои друзья */}
      <div className="friends-section">
        <h2>Мои друзья</h2>
        {loading && !myFriends.length && <div className="empty">Загрузка...</div>}
        {!loading && !myFriends.length && <div className="empty">Список пуст</div>}
        <div className="friends-grid">
          {myFriends.map((u) => (
            <div key={u.id} className="friend-card">
              <UserCard user={u} isFriend />
              <button className="btn-remove" onClick={() => removeFriend(u.id)}>
                Удалить из друзей
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
