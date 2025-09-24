// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import "./Navbar.css";

export default function Navbar({ session }) {
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const userId = session?.user?.id || null;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      await fetchProfile(userId);
    })();
  }, [userId]);

  async function fetchProfile(myId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("telegram_name, avatar_url, points")
      .eq("id", myId)
      .single();

    if (!error) {
      setProfile(data);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/register");
  };

  // 👇 Логика скролла
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Логотип */}
        <Link to="/" className="navbar-brand">
          Эпоха выживания
        </Link>

        {/* Только профиль */}
        {profile && (
          <div
            className="navbar-profile"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img
              src={profile.avatar_url || "/images/avatar-placeholder.png"}
              alt="Аватар"
              className="navbar-avatar"
            />
            <span className="navbar-name">{profile.telegram_name || "Без имени"}</span>
            <span className="navbar-points">{profile.points ?? 0} 🪙</span>

            {dropdownOpen && (
              <div className="navbar-dropdown">
                <Link to="/profile" className="dropdown-item">
                  <FaUser /> Профиль
                </Link>
                <Link to="/settings" className="dropdown-item">
                  <FaCog /> Настройки
                </Link>
                <button onClick={handleLogout} className="dropdown-item danger">
                  <FaSignOutAlt /> Выйти
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
