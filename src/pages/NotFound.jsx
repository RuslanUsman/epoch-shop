import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Навигация сверху */}
      <Navbar />

      {/* Контент */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl font-bold mb-4 text-red-600">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
        <p className="mb-6 text-gray-600">
          Похоже, вы попали не туда. Попробуйте вернуться на главную или открыть нужный раздел.
        </p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            На главную
          </Link>
          <Link
            to="/store"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            В магазин
          </Link>
        </div>
      </main>

      {/* Футер снизу */}
      <Footer />
    </div>
  );
}
