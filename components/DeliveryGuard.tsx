"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DeliveryGuard({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const role = localStorage.getItem("role");

    // ✅ لا تعمل redirect إذا المستخدم حالياً في صفحة تسجيل الدخول
    if (pathname === "/delivery/login") {
      setAllowed(true);
      return;
    }

    if (role === "delivery") {
      setAllowed(true);
    } else {
      router.push("/login");
    }
  }, [pathname]);

  if (!allowed) return null;

  return <>{children}</>;
}
