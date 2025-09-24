import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useRealtimeCounters() {
  const [pendingRequests, setPending] = useState(0);
  const [unreadMessages, setUnread] = useState(0);

  useEffect(() => {
    let uid = null;
    supabase.auth.getUser().then(({ data }) => {
      uid = data.user?.id || null;
      if (!uid) return;

      // Начальные значения
      refresh(uid);

      // Realtime подписки
      const channel = supabase
        .channel("counters")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "friend_requests" },
          () => refresh(uid)
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "messages" },
          () => refresh(uid)
        )
        .subscribe();

      return () => supabase.removeChannel(channel);
    });

    async function refresh(userId) {
      const { data: fr } = await supabase
        .from("friend_requests")
        .select("id")
        .eq("receiver_id", userId)
        .eq("status", "pending");
      setPending(fr?.length || 0);

      const { data: msg } = await supabase
        .from("messages")
        .select("id")
        .is("read_at", null)
        .eq("receiver_id", userId);
      setUnread(msg?.length || 0);
    }
  }, []);

  return { pendingRequests, unreadMessages };
}
