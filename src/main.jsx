// src/main.jsx
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import "./styles/Theme.css"   // 👈 подключаем глобальные темы

import { CartProvider } from "./context/CartContext"
import { UserProvider } from "./context/UserContext"
import { ActiveChatProvider } from "./context/ActiveChatContext"
import { MessagesProvider } from "./context/MessagesContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MessagesProvider>
      <UserProvider>
        <ActiveChatProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ActiveChatProvider>
      </UserProvider>
    </MessagesProvider>
  </React.StrictMode>
)
