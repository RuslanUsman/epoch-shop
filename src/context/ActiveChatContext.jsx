import { createContext, useState } from "react";

export const ActiveChatContext = createContext();

export function ActiveChatProvider({ children }) {
  const [activeChatId, setActiveChatId] = useState(null);

  return (
    <ActiveChatContext.Provider value={{ activeChatId, setActiveChatId }}>
      {children}
    </ActiveChatContext.Provider>
  );
}
