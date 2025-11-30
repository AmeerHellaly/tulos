"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

import Container from "./Container";
import HeaderMenu from "./new/HeaderMenu";
import Logo from "./new/Logo";
import { Heart, ListOrdered, Bell } from "lucide-react";
import CartIcon from "./new/CartIcon";
import MobileMenu from "./new/MobileMenu";
import SearchBar from "./new/SearchBar";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [unseenCount, setUnseenCount] = useState(0);
  const [deliveryNotifications, setDeliveryNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");

    if (token) {
      setIsLoggedIn(true);
      setUsername(name || "");

      setTimeout(() => {
        // إشعارات البلاغات
        fetch("http://localhost:8000/api/reports/unseen/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch unseen reports");
            return res.json();
          })
          .then((data) => setUnseenCount(data.length))
          .catch((err) => console.error("🔴 Reports fetch error:", err));

        // إشعارات التوصيل
        fetch("http://localhost:8000/notification/api/notifications/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setDeliveryNotifications(data))
          .catch((err) =>
            console.error("🚚 Delivery notifications fetch error:", err)
          );
      }, 300);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const totalNotifications = unseenCount + deliveryNotifications.length;

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-b-gray-200 py-5">
      <Container className="flex items-center justify-between gap-7 text-lightColor">
        <HeaderMenu />
        <div className="w-auto md:w-1/3 flex items-center justify-center gap-2.5">
          <MobileMenu />  
          <Logo>M&A</Logo>
        </div>
        <div className="w-auto md:w-1/3 flex items-center justify-end gap-5 relative">
          <SearchBar />
          <CartIcon />

          {/* 🔔 جرس موحد للإشعارات */}
          {isLoggedIn && (
            <div className="relative">
              <button
                className="relative"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Bell className="text-yellow-600 hoverEffect" />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {totalNotifications}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3 max-h-[400px] overflow-auto">
                  {/* إشعارات البلاغات */}
                  <p className="text-sm font-bold text-red-600 mb-2">الردود على بلاغاتك</p>
                  {unseenCount > 0 ? (
                    <>
                      <Link href="/my-reports">
                        <p className="text-sm text-gray-800 hover:underline mb-1">
                          لديك {unseenCount} رد جديد.
                        </p>
                      </Link>
                      <Link
                        href="/my-reports/history"
                        className="block w-full text-center py-1 px-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded mb-2"
                      >
                        عرض سجل البلاغات
                      </Link>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">لا يوجد ردود جديدة.</p>
                  )}

                  {/* إشعارات التوصيل */}
                  <p className="text-sm font-bold text-green-600 mb-2">إشعارات التوصيل</p>
                  {deliveryNotifications.length > 0 ? (
                    deliveryNotifications.map((n, i) => (
                      <Link
                        href="/orders"
                        key={i}
                        className="block px-3 py-2 mb-1 text-sm text-gray-800 hover:bg-gray-100 rounded"
                      >
                        <span className="font-semibold">{n.title}</span>
                        <br />
                        <span className="text-xs text-gray-600">{n.body}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">لا يوجد إشعارات توصيل.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {isLoggedIn ? (
            <>
              <Link href="/orders" className="group relative">
                <ListOrdered className="group-hover:text-darkColor hoverEffect" />
              </Link>
              <Link href="/favorites" className="group relative">
                <Heart className="group-hover:text-red-500 hoverEffect" />
              </Link>
              <span className="text-sm font-semibold">{username}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold hover:text-darkColor hoverEffect"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold hover:text-darkColor hoverEffect"
            >
              Login
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;
