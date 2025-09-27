import Avatar from "./Avatar";
import { Link } from "react-router-dom";
import "./UserCard.css";

export default function UserCard({ user, onAdd, isFriend }) {
  // Безопасно достаём данные
  const userId = user?.id || null;
  const name = user?.name || "Без имени";
  const tgName = user?.telegram_name || "unknown";
  const avatarUrl = user?.avatar_url || null;

  // 👇 Универсальная обработка пути
  let finalAvatar = null;
  if (avatarUrl) {
    finalAvatar = avatarUrl.startsWith("http")
      ? avatarUrl
      : `${import.meta.env.BASE_URL}${avatarUrl}`;
  }

  return (
    <div className="usercard">
      <div className="usercard-left">
        <Avatar src={finalAvatar} size={48} />
        <div className="usercard-info">
          <div className="usercard-name">{name}</div>
          <div className="usercard-tg">@{tgName}</div>
        </div>
      </div>

      <div className="usercard-actions">
        {/* Кнопка "Добавить" только если не друг и есть onAdd */}
        {!isFriend && onAdd && userId && (
          <button onClick={() => onAdd(user)} className="btn-add">
            Добавить
          </button>
        )}

        {/* Кнопка "Профиль" активна только если есть id */}
        {userId ? (
          <Link to={`/user/${userId}`} className="btn-profile">
            Профиль
          </Link>
        ) : (
          <button className="btn-profile disabled" disabled>
            Профиль
          </button>
        )}
      </div>
    </div>
  );
}
