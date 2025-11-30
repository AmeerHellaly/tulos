// app/delivery/layout.tsx
import DeliveryGuard from "@/components/DeliveryGuard";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";

export default function DeliveryLayout({
  
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeliveryGuard>
      {children}
      <Footer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </DeliveryGuard>
  );
}
