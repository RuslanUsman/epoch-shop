import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary"; // 👈 новый импорт

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Friends from "./pages/Friends";
import UserProfile from "./pages/UserProfile";
import DialogList from "./pages/DialogList";
import Chat from "./pages/Chat";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Settings from "./pages/Settings";
import AdminPanel from "./pages/AdminPanel";
import UsersList from "./pages/UsersList";
import VipInfo from "./pages/VipInfo";

import { supabase } from "./lib/supabaseClient";

import { UserProvider } from "./context/UserContext";
import { ActiveChatProvider } from "./context/ActiveChatContext";
import { CartProvider } from "./context/CartContext";
import { MessagesProvider } from "./context/MessagesContext";

// 👑 компонент-защита для админки
function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (data?.is_admin) setIsAdmin(true);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null);
      if (data.session?.user) {
        applyUserTheme(data.session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        applyUserTheme(newSession.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function applyUserTheme(userId) {
    const { data } = await supabase
      .from("user_settings")
      .select("theme")
      .eq("id", userId)
      .single();
    if (data?.theme) {
      document.documentElement.dataset.theme = data.theme;
    }
  }

  if (loading) {
    return <p>Загрузка...</p>;
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <MessagesProvider>
        <UserProvider>
          <ActiveChatProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar session={session} />

                <main className="flex-1">
                  {/* 👇 Оборачиваем все маршруты в ErrorBoundary */}
                  <ErrorBoundary>
                    <Routes>
                      {/* Главная */}
                      <Route
                        path="/"
                        element={
                          <Navigate to={session ? "/profile" : "/register"} replace />
                        }
                      />

                      {/* Публичные страницы */}
                      <Route path="/register" element={<Register />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/about" element={<About />} />

                      {/* Приватные страницы */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute session={session}>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/friends"
                        element={
                          <ProtectedRoute session={session}>
                            <Friends />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/user/:id"
                        element={
                          <ProtectedRoute session={session}>
                            <UserProfile />
                          </ProtectedRoute>
                        }
                      />

                      {/* 📩 Диалоги */}
                      <Route
                        path="/messages"
                        element={
                          <ProtectedRoute session={session}>
                            <DialogList />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/messages/:id"
                        element={
                          <ProtectedRoute session={session}>
                            <Chat />
                          </ProtectedRoute>
                        }
                      />

                      {/* 🛒 Магазин */}
                      <Route
                        path="/store"
                        element={
                          <ProtectedRoute session={session}>
                            <Store />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute session={session}>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout"
                        element={
                          <ProtectedRoute session={session}>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/vip"
                        element={
                          <ProtectedRoute session={session}>
                            <VipInfo />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/settings"
                        element={
                          <ProtectedRoute session={session}>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />

                      {/* 👑 Админка */}
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
                  </ErrorBoundary>
                </main>

                <Footer />
              </div>
            </CartProvider>
          </ActiveChatProvider>
        </UserProvider>
      </MessagesProvider>
    </Router>
  );
}
