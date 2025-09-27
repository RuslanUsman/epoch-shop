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
import Settings from "./pages/Settings"
import AdminPanel from "./pages/AdminPanel"
import UsersList from "./pages/UsersList"
import VipInfo from "./pages/VipInfo" // 👈 добавили VIP-страницу

import { supabase } from "./lib/supabaseClient"

import { UserProvider } from "./context/UserContext"
import { ActiveChatProvider } from "./context/ActiveChatContext"
import { CartProvider } from "./context/CartContext"
import { MessagesProvider } from "./context/MessagesContext"

// 👇 компонент-защита для админки
function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()
      if (data?.is_admin) setIsAdmin(true)
      setLoading(false)
    }
    check()
  }, [])

  if (loading) return <p>Загрузка...</p>
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      if (data.session?.user) {
        applyUserTheme(data.session.user.id)
      }
    })

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
                    <Route
                      path="/vip"
                      element={session ? <VipInfo /> : <Navigate to="/login" replace />} // 👈 добавлено
                    />

                    <Route
                      path="/settings"
                      element={session ? <Settings /> : <Navigate to="/login" replace />}
                    />

                    {/* 👇 Админка */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminPanel />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <AdminRoute>
                          <UsersList />
                        </AdminRoute>
                      }
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
