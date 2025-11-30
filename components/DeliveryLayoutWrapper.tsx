"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import ChatIcon from "@/components/new/ChatIcon";

export default function DeliveryLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false); // ⛔ ضروري حتى ننتظر قراءة localStorage

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setHydrated(true);
  }, []);

  const isDeliveryPage = pathname.startsWith("/delivery");

  // ⛔ لا نعرض شيئًا قبل التحقق من role
  if (!hydrated) return null;

  // ✅ القرار النهائي
  const hideLayout = isDeliveryPage && role === "delivery";

  return (
    <div>
      {!hideLayout && <Header />}
      {children}
      {!hideLayout && <Footer />}
      {!hideLayout && <ChatIcon />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#000000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}
