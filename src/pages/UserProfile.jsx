// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import "./UserProfile.css"
import { FaUserMinus, FaRegCommentDots, FaGift } from "react-icons/fa"

const UserProfile = () => {
  const { id } = useParams() // id профиля, на который зашли
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [giftPoints, setGiftPoints] = useState("")
  const [currentUser, setCurrentUser] = useState(null)

  // Загружаем текущего авторизованного пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error(error)
        return
      }
      if (user) {
        // Берём профиль из таблицы profiles
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        if (!profileError) setCurrentUser(data)
      }
    }
    fetchCurrentUser()
  }, [])

  // Загружаем профиль того, на кого зашли
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error(error)
        setUser(null)
      } else {
        setUser(data)
      }
      setLoading(false)
    }

    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="userprofile-page">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="userprofile-page">
        <div className="user-not-found">Пользователь не найден</div>
      </div>
    )
  }

  const handleGift = async () => {
    if (!giftPoints || isNaN(giftPoints)) return
    const pointsToGift = parseInt(giftPoints, 10)

    if (!currentUser) {
      alert("Сначала войдите в систему")
      return
    }

    if (currentUser.points < pointsToGift) {
      alert("Недостаточно баллов для перевода")
      return
    }

    // 1. Списываем у отправителя
    const { error: senderError } = await supabase
      .from("profiles")
      .update({ points: currentUser.points - pointsToGift })
      .eq("id", currentUser.id)

    if (senderError) {
      console.error(senderError)
      alert("Ошибка при списании баллов")
      return
    }

    // 2. Начисляем получателю
    const { error: receiverError } = await supabase
      .from("profiles")
      .update({ points: user.points + pointsToGift })
      .eq("id", user.id)

    if (receiverError) {
      console.error(receiverError)
      alert("Ошибка при начислении баллов")
      return
    }

    // 3. Записываем транзакцию в point_transfers
    await supabase.from("point_transfers").insert([
      {
        from_user: currentUser.id,
        to_user: user.id,
        amount: pointsToGift,
        created_at: new Date()
      }
    ])

    // Обновляем локальное состояние
    setCurrentUser((prev) => ({
      ...prev,
      points: prev.points - pointsToGift
    }))
    setUser((prev) => ({
      ...prev,
      points: prev.points + pointsToGift
    }))

    alert(`Вы подарили ${pointsToGift} баллов пользователю ${user.name}`)
    setGiftPoints("")
  }

  return (
    <div className="userprofile-page">
      <div className="userprofile-card">
        <div className="userprofile-info">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.name}
            className="avatar"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "16px",
              border: "2px solid var(--line)"
            }}
          />
          <h2 className="userprofile-name">{user.name}</h2>
          <p className="userprofile-username">@{user.telegram_name}</p>
          <p className="userprofile-points">
            Баллы: <span>{user.points}</span>
          </p>

          <div className="userprofile-actions">
            <button className="btn-friend friends">
              <FaUserMinus /> Удалить из друзей
            </button>
            <button className="btn-message">
              <FaRegCommentDots /> Написать сообщение
            </button>
          </div>
        </div>

        <div className="userprofile-gift">
          <h3>
            <FaGift /> Подарить баллы
          </h3>
          <input
            type="number"
            value={giftPoints}
            onChange={(e) => setGiftPoints(e.target.value)}
            placeholder="Количество"
          />
          <button onClick={handleGift}>Подарить</button>
          <p>Баллы спишутся с вашего аккаунта и сразу начислятся этому пользователю.</p>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
