// src/pages/DialogList.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import "../styles/common.css";
import "../styles/dialogList.css";

export default function DialogList() {
  const [me, setMe] = useState(null);
  const [dialogs, setDialogs] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMe(user);
      await loadDialogs(user.id);
      subscribeToMessages(user.id);
    })();

    return () => supabase.removeAllChannels();
  }, []);

  async function loadDialogs(myId) {
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Ошибка загрузки диалогов:", error);
      return;
    }

    const lastByUser = new Map();
    const unreadMap = new Map();

    messages.forEach(msg => {
      const otherId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id;
      if (!lastByUser.has(otherId)) lastByUser.set(otherId, msg);
      if (msg.receiver_id === myId && !msg.read_at) {
        unreadMap.set(otherId, (unreadMap.get(otherId) || 0) + 1);
      }
    });

    const ids = Array.from(lastByUser.keys());
    if (!ids.length) { 
      setDialogs([]); 
      return; 
    }

    const { data: profiles, error: pErr } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", ids);

    if (pErr) {
      console.error("Ошибка загрузки профилей:", pErr);
      return;
    }

    const list = profiles
      .map(p => ({
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        lastMessage: lastByUser.get(p.id),
        unreadCount: unreadMap.get(p.id) || 0
      }))
      .sort(
        (a, b) =>
          new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );

    setDialogs(list);
  }

  function subscribeToMessages(myId) {
    supabase
      .channel("dialogs_listener")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        payload => {
          const msg = payload.new;
          if (msg.sender_id === myId || msg.receiver_id === myId) {
            loadDialogs(myId);
          }
        }
      )
      .subscribe();
  }

  return (
    <div className="dialog-list">
      <div className="dialog-list-header">
        <h2>Сообщения</h2>
      </div>

      {dialogs.length === 0 && <div className="empty">Нет диалогов</div>}

      <div className="dialog-items">
        {dialogs.map(d => (
          <Link to={`/chat/${d.id}`} key={d.id} className="dialog-item">
            <img
              src={d.avatar_url || "/images/avatar-placeholder.png"}
              alt=""
              className="avatar"
            />
            <div className="dialog-info">
              <div className="dialog-top">
                <span className="dialog-name">{d.name || "Без имени"}</span>
                <span className="dialog-time">
                  {new Date(d.lastMessage.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className="dialog-bottom">
                <span className="dialog-last">{d.lastMessage?.content}</span>
                {d.unreadCount > 0 && (
                  <span className="unread-badge">{d.unreadCount}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
