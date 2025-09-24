// src/App.jsx
import React, { useEffect, useState } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Register from "./pages/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Friends from "./pages/Friends"
import UserProfile from "./pages/UserProfile"
import DialogList from "./pages/DialogList"
import Chat from "./pages/Chat"
import Store from "./pages/Store"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import About from "./pages/About"
import Settings from "./pages/Settings"   // 👈 добавили импорт

import { supabase } from "./lib/supabaseClient"

import { UserProvider } from "./context/UserContext"
import { ActiveChatProvider } from "./context/ActiveChatContext"
import { CartProvider } from "./context/CartContext"
import { MessagesProvider } from "./context/MessagesContext"

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // при старте проверяем сессию
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      if (data.session?.user) {
        applyUserTheme(data.session.user.id)
      }
    })

    // подписка на изменения авторизации
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        applyUserTheme(newSession.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 👇 функция подтягивает тему из user_settings
  async function applyUserTheme(userId) {
    const { data } = await supabase
      .from("user_settings")
      .select("theme")
      .eq("id", userId)
      .single()
    if (data?.theme) {
      document.documentElement.dataset.theme = data.theme
    }
  }

  return (
    <Router>
      <MessagesProvider>
        <UserProvider>
          <ActiveChatProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar session={session} />

                <main className="flex-1">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Navigate to={session ? "/profile" : "/register"} replace />
                      }
                    />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/about" element={<About />} />

                    <Route
                      path="/profile"
                      element={session ? <Profile /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/friends"
                      element={session ? <Friends /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/user/:id"
                      element={session ? <UserProfile /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/messages"
                      element={session ? <DialogList /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/chat/:id"
                      element={session ? <Chat /> : <Navigate to="/login" replace />}
                    />

                    <Route
                      path="/store"
                      element={session ? <Store /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/cart"
                      element={session ? <Cart /> : <Navigate to="/login" replace />}
                    />
                    <Route
                      path="/checkout"
                      element={session ? <Checkout /> : <Navigate to="/login" replace />}
                    />

                    {/* 👇 Новый маршрут для страницы Настройки */}
                    <Route
                      path="/settings"
                      element={session ? <Settings /> : <Navigate to="/login" replace />}
                    />
                  </Routes>
                </main>

                <Footer />
              </div>
            </CartProvider>
          </ActiveChatProvider>
        </UserProvider>
      </MessagesProvider>
    </Router>
  )
}
