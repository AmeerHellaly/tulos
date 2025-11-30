"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProtectedWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
        const res = await fetch("http://127.0.0.1:8000/accounts/me/", {
            headers: {
    Authorization: `Bearer ${token}`,
  },
        });

        if (!res.ok) {
          const errorData = await res.json();

          // حالة المستخدم محظور (غير مفعل)
          if (errorData?.code === "user_inactive") {
            console.warn("المستخدم غير مفعل");
            router.push("/login");
            return;
          }

          // حالة خطأ غير معروف
          console.warn("فشل التحقق من المستخدم");
          router.push("/login");
          return;
        }

        const data = await res.json();

        // حالة is_active = false، من غير رسالة خطأ
        if (!data.is_active) {
          console.warn("المستخدم غير مفعل عبر الحقل");
          router.push("/login");
          return;
        }

        // ✅ كلشي تمام
        setLoading(false);
      } catch (err) {
        console.error("خطأ أثناء التحقق", err);
        router.push("/login");
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div className="text-center p-8">جارٍ التحقق من الصلاحيات...</div>;
  }

  return <>{children}</>;
};

export default ProtectedWrapper;
