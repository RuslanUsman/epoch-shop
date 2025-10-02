// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "./UserProfile.css";
import {
  FaUserMinus,
  FaUserPlus,
  FaRegCommentDots,
  FaGift,
  FaCrown,
} from "react-icons/fa";
import Avatar from "../components/Avatar";

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [giftPoints, setGiftPoints] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Загружаем текущего авторизованного пользователя
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Ошибка получения текущего пользователя:", error.message);
        return;
      }
      if (user) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (!profileError && data) setCurrentUser(data);
      }
    };
    fetchCurrentUser();
  }, []);
  // Загружаем профиль того, на кого зашли
  useEffect(() => {
    const fetchUser = async () => {
      console.log("Ищу профиль по id из URL:", id);
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Ошибка загрузки профиля:", error.message);
        setErrorMsg("Ошибка загрузки профиля");
        setUser(null);
      } else if (!data) {
        console.warn("Профиль не найден для id:", id);
        setErrorMsg("Пользователь не найден");
        setUser(null);
      } else {
        setUser(data);
      }
      setLoading(false);
    };
    if (id) fetchUser();
  }, [id]);

  // 🎁 Подарить баллы
  const handleGift = async () => {
    if (!giftPoints || isNaN(giftPoints)) return;
    const pointsToGift = parseInt(giftPoints, 10);

    if (!currentUser) {
      alert("Сначала войдите в систему");
      return;
    }

    if ((currentUser?.points ?? 0) < pointsToGift) {
      alert("Недостаточно баллов для перевода");
      return;
    }

    const { error: senderError } = await supabase
      .from("profiles")
      .update({ points: (currentUser?.points ?? 0) - pointsToGift })
      .eq("id", currentUser.id);

    if (senderError) {
      console.error("Ошибка при списании баллов:", senderError.message);
      return;
    }

    const { error: receiverError } = await supabase
      .from("profiles")
      .update({ points: (user?.points ?? 0) + pointsToGift })
      .eq("id", user.id);

    if (receiverError) {
      console.error("Ошибка при начислении баллов:", receiverError.message);
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

    setCurrentUser((prev) => ({ ...prev, points: (prev?.points ?? 0) - pointsToGift }));
    setUser((prev) => ({ ...prev, points: (prev?.points ?? 0) + pointsToGift }));

    alert(`Вы подарили ${pointsToGift} баллов пользователю ${user?.name ?? ""}`);
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
      .update({ is_vip: !user?.is_vip })
      .eq("id", user.id);

    if (error) {
      console.error("Ошибка при изменении VIP:", error.message);
      return;
    }

    setUser((prev) => ({ ...prev, is_vip: !prev?.is_vip }));
  };

  // 👥 Добавить/удалить из друзей
  const handleFriend = async () => {
    if (!currentUser) return;

    if (user?.is_friend) {
      // Удаляем из друзей
      await supabase
        .from("friends")
        .delete()
        .or(
          `and(user_id.eq.${currentUser.id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${currentUser.id})`
        );
      setUser((prev) => ({ ...prev, is_friend: false }));
      alert("Пользователь удалён из друзей");
    } else {
      // Отправляем заявку
      await supabase.from("friend_requests").insert({
        from_id: currentUser.id,
        to_id: user.id,
        status: "pending",
      });
      alert("Заявка отправлена");
    }
  };

  // 🔔 Подписка на изменения в friends
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel("friends-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friends" },
        (payload) => {
          const { new: newRow, old: oldRow } = payload || {};

          const affected =
            (newRow?.user_id === currentUser.id && newRow?.friend_id === id) ||
            (newRow?.friend_id === currentUser.id && newRow?.user_id === id) ||
            (oldRow?.user_id === currentUser.id && oldRow?.friend_id === id) ||
            (oldRow?.friend_id === currentUser.id && oldRow?.user_id === id);

          if (affected) {
            if (payload.eventType === "INSERT") {
              setUser((prev) => ({ ...prev, is_friend: true }));
            } else if (payload.eventType === "DELETE") {
              setUser((prev) => ({ ...prev, is_friend: false }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, id]);
  // 💬 Написать сообщение
  const handleMessage = async () => {
    if (!currentUser) {
      alert("Сначала войдите в систему");
      return;
    }

    const { data: existingDialog, error: findError } = await supabase
      .from("dialogs")
      .select("*")
      .or(
        `and(user1.eq.${currentUser.id},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${currentUser.id})`
      )
      .maybeSingle();

    if (findError) {
      console.error("Ошибка поиска диалога:", findError.message);
    }

    let dialogId = existingDialog?.id;

    if (!dialogId) {
      const { data: newDialog, error: createError } = await supabase
        .from("dialogs")
        .insert([{ user1: currentUser.id, user2: user.id }])
        .select()
        .single();

      if (createError) {
        console.error("Ошибка при создании диалога:", createError.message);
        alert("Не удалось создать диалог");
        return;
      }
      dialogId = newDialog.id;
    }

    navigate(`/messages/${dialogId}`);
  };

  if (loading) return <p>Загрузка...</p>;
  if (errorMsg) return <p>{errorMsg}</p>;

  return (
    <div className="userprofile-page">
      <div className="userprofile-card">
        <div className="userprofile-info">
          <Avatar src={user?.avatar_url} size={128} />
          <h2 className="userprofile-name">
            {user?.name} {user?.is_vip && <FaCrown color="gold" />}
          </h2>
          <p className="userprofile-username">@{user?.telegram_name}</p>
          <p className="userprofile-points">
            Баллы: <span>{user?.points ?? 0}</span>
          </p>

          <div className="userprofile-actions">
            <button className="btn-friend" onClick={handleFriend}>
              {user?.is_friend ? <FaUserMinus /> : <FaUserPlus />}
              {user?.is_friend ? "Удалить из друзей" : "Добавить в друзья"}
            </button>

            <button className="btn-message" onClick={handleMessage}>
              <FaRegCommentDots /> Написать сообщение
            </button>

            {currentUser?.is_admin && (
              <button className="btn-vip" onClick={toggleVip}>
                {user?.is_vip ? "Снять VIP" : "Выдать VIP"}
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






