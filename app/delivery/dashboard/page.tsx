"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { MapPin, LogOut } from "lucide-react";

// ✅ Load Leaflet map dynamically (no SSR)
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

interface Delivery {
  order_number: string;
  customer_name: string;
  customer_email: string;
  address: string;
  phone_number: string;
  status: string;
  latitude: string;
  longitude: string;
  has_apologized: boolean;
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

const fetchOrders = async () => {
  try {
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/api/delivery/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (Array.isArray(data)) {
      setOrders(data);
    } else {
      setOrders([]);  // تصفير القائمة
      console.error("Unexpected response:", data);
      toast.error("Unexpected response from server.");
    }
  } catch (err) {
    setOrders([]);
    toast.error("Failed to load delivery orders");
  } finally {
    setLoading(false);
  }
};


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    router.push("/delivery/login");
  };

  const handleMarkAsDelivered = async (orderNumber: string) => {
    try {
const res = await fetch(
  `http://127.0.0.1:8000/api/delivery/${orderNumber}/update-status/`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ status: "delivered" }),
  }
);
  if (!res.ok) {
  const text = await res.text();
  console.error("Server responded:", text);
  throw new Error("Failed to update status");
}
      toast.success("Delivery marked as completed!");
      fetchOrders();
    } catch (err) {
      toast.error("Error updating delivery status");
    }
  };

  useEffect(() => {
    fetchOrders();
    
  }, []);

  return (
    <div className="p-6">
      {/* 🔓 زر تسجيل الخروج */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
        <Button onClick={handleLogout} variant="destructive">
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card key={order.order_number}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Order: {order.order_number}
                </CardTitle>
                <Badge variant="secondary">{order.status}</Badge>
              </CardHeader>
              <CardContent>
                <p><strong>Name:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.phone_number || "—"}</p>
                <p><strong>Address:</strong> {order.address || "—"}</p>

                {order.latitude && order.longitude && (
                  <div className="my-4 space-y-2">
                    <LeafletMap
                      lat={parseFloat(order.latitude)}
                      lng={parseFloat(order.longitude)}
                      label={order.customer_name + "'s location"}
                    />
                    <a
                      href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full">
                        <MapPin className="w-4 h-4" />
                        Open in Google Maps
                      </Button>
                    </a>
                  </div>
                )}

                <div className="mt-4">
{order.status !== "delivered" && !order.has_apologized && (
  <div className="flex flex-col gap-2">
    <Button
      variant="default"
      onClick={() => handleMarkAsDelivered(order.order_number)}
    >
      Mark as Delivered
    </Button>

    <Button
      variant="destructive"
      onClick={async () => {
        const message = prompt("Please enter your reason for apology:");
        if (!message) return;

        try {
          const res = await fetch(
            `http://127.0.0.1:8000/api/delivery/${order.order_number}/apologize/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({ message }),
            }
          );

          if (!res.ok) throw new Error();
          toast.success("Apology sent to admin.");
          fetchOrders(); // refresh list
        } catch {
          toast.error("Failed to send apology.");
        }
      }}
    >
      Apologize for Delivery
    </Button>
  </div>
)}


                  
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
