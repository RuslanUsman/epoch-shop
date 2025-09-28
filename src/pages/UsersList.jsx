import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient";

import { useNavigate } from "react-router-dom"

export default function UsersList() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers(query) {
    let q = supabase.from("telegram_users").select("*")
    if (query) {
      q = q.ilike("username", `%${query}%`).or(`full_name.ilike.%${query}%`)
    }
    const { data } = await q
    setUsers(data || [])
  }

  async function toggleVip(user) {
    await supabase.from("telegram_users")
      .update({ is_vip: !user.is_vip })
      .eq("id", user.id)
    fetchUsers(search)
  }

  async function addFriend(user) {
    await supabase.from("friend_requests").insert({
      from_id: supabase.auth.user().id,
      to_id: user.id,
      status: "pending"
    })
    alert("Заявка отправлена")
  }

  return (
    <div style={{ padding: 20 }}>
      <input
        type="text"
        placeholder="Поиск по имени или username"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => fetchUsers(search)}>Найти</button>

      <ul>
        {users.map(u => (
          <li key={u.id} style={{ margin: "10px 0" }}>
            <img src={u.avatar_url} alt="avatar" width={40} />
            <span>{u.full_name} (@{u.username})</span>
            <button onClick={() => toggleVip(u)}>
              {u.is_vip ? "Снять VIP" : "Выдать VIP"}
            </button>
            <button onClick={() => navigate(`/user/${u.id}`)}>Профиль</button>
            <button onClick={() => addFriend(u)}>Добавить в друзья</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
