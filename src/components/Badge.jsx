import { useRealtimeCounters } from "../hooks/useRealtimeCounters";

export default function Badge({ type }) {
  const { pendingRequests, unreadMessages } = useRealtimeCounters();
  const count = type === "friends" ? pendingRequests : unreadMessages;

  if (!count) return null;
  return (
    <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 text-xs bg-red-500 text-white rounded-full">
      {count}
    </span>
  );
}
