// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./UserProfile.css";
import {
  FaUserMinus,
  FaUserPlus,
  FaRegCommentDots,
  FaGift,
  FaCrown,
} from "react-icons/fa";
import Avatar from "../components/Avatar"; // 👈 используем универсальный Avatar

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftPoints, setGiftPoints] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Загружаем текущего авторизованного пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        return;
      }
      if (user) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (!profileError) setCurrentUser(data);
      }
    };
    fetchCurrentUser();
  }, []);

  // Загружаем профиль того, на кого зашли
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setUser(null);
      } else {
        setUser(data);
      }
      setLoading(false);
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="userprofile-page">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="userprofile-page">
        <div className="user-not-found">Пользователь не найден</div>
      </div>
    );
  }

  // 🎁 Подарить баллы
  const handleGift = async () => {
    if (!giftPoints || isNaN(giftPoints)) return;
    const pointsToGift = parseInt(giftPoints, 10);

    if (!currentUser) {
      alert("Сначала войдите в систему");
      return;
    }

    if (currentUser.points < pointsToGift) {
      alert("Недостаточно баллов для перевода");
      return;
    }

    const { error: senderError } = await supabase
      .from("profiles")
      .update({ points: currentUser.points - pointsToGift })
      .eq("id", currentUser.id);

    if (senderError) {
      console.error(senderError);
      alert("Ошибка при списании баллов");
      return;
    }

    const { error: receiverError } = await supabase
      .from("profiles")
      .update({ points: user.points + pointsToGift })
      .eq("id", user.id);

    if (receiverError) {
      console.error(receiverError);
      alert("Ошибка при начислении баллов");
      return;
    }

    await supabase.from("point_transfers").insert([
      {
        from_user: currentUser.id,
        to_user: user.id,
        amount: pointsToGift,
        created_at: new Date(),
      },
    ]);

    setCurrentUser((prev) => ({
      ...prev,
      points: prev.points - pointsToGift,
    }));
    setUser((prev) => ({
      ...prev,
      points: prev.points + pointsToGift,
    }));

    alert(`Вы подарили ${pointsToGift} баллов пользователю ${user.name}`);
    setGiftPoints("");
  };

  // 👑 Выдать/снять VIP (только админ)
  const toggleVip = async () => {
    if (!currentUser?.is_admin) {
      alert("Нет прав для изменения VIP");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ is_vip: !user.is_vip })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      alert("Ошибка при изменении VIP");
      return;
    }

    setUser((prev) => ({ ...prev, is_vip: !prev.is_vip }));
  };

  // 👥 Добавить/удалить из друзей
  const handleFriend = async () => {
    if (!currentUser) return;

    if (user.is_friend) {
      // удалить из друзей
      await supabase.from("friends").delete().match({
        user_id: currentUser.id,
        friend_id: user.id,
      });
      setUser((prev) => ({ ...prev, is_friend: false }));
    } else {
      // отправить заявку
      await supabase.from("friend_requests").insert({
        from_id: currentUser.id,
        to_id: user.id,
        status: "pending",
      });
      alert("Заявка отправлена");
    }
  };

  return (
    <div className="userprofile-page">
      <div className="userprofile-card">
        <div className="userprofile-info">
          <Avatar src={user.avatar_url} size={128} /> {/* 👈 заменили <img> */}
          <h2 className="userprofile-name">
            {user.name} {user.is_vip && <FaCrown color="gold" />}
          </h2>
          <p className="userprofile-username">@{user.telegram_name}</p>
          <p className="userprofile-points">
            Баллы: <span>{user.points}</span>
          </p>

          <div className="userprofile-actions">
            <button className="btn-friend" onClick={handleFriend}>
              {user.is_friend ? <FaUserMinus /> : <FaUserPlus />}
              {user.is_friend ? "Удалить из друзей" : "Добавить в друзья"}
            </button>
            <button className="btn-message">
              <FaRegCommentDots /> Написать сообщение
            </button>
            {currentUser?.is_admin && (
              <button className="btn-vip" onClick={toggleVip}>
                {user.is_vip ? "Снять VIP" : "Выдать VIP"}
              </button>
            )}
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
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


