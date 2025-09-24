// src/components/Footer.jsx
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useMessages } from "../context/MessagesContext";
import {
  FaStore,
  FaUserFriends,
  FaEnvelope,
  FaUser,
  FaShoppingCart,
  FaInfoCircle
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  const { totalItems } = useContext(CartContext);
  const { unreadCount } = useMessages();
  const location = useLocation();

  return (
    <footer className="mobile-footer">
      <Link
        to="/about"
        className={`footer-item ${location.pathname.startsWith("/about") ? "active" : ""}`}
      >
        <FaInfoCircle />
        <span>О нас</span>
      </Link>

      <Link
        to="/store"
        className={`footer-item ${location.pathname.startsWith("/store") ? "active" : ""}`}
      >
        <FaStore />
        <span>Магазин</span>
      </Link>

      <Link
        to="/friends"
        className={`footer-item ${location.pathname.startsWith("/friends") ? "active" : ""}`}
      >
        <FaUserFriends />
        <span>Друзья</span>
      </Link>

      <Link
        to="/messages"
        className={`footer-item ${location.pathname.startsWith("/messages") ? "active" : ""}`}
      >
        <FaEnvelope />
        <span>Сообщения</span>
        {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
      </Link>

      <Link
        to="/cart"
        className={`footer-item ${location.pathname.startsWith("/cart") ? "active" : ""}`}
      >
        <FaShoppingCart />
        <span>Корзина</span>
        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
      </Link>

      <Link
        to="/profile"
        className={`footer-item ${location.pathname.startsWith("/profile") ? "active" : ""}`}
      >
        <FaUser />
        <span>Профиль</span>
      </Link>
    </footer>
  );
}
