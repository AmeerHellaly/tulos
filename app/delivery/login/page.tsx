"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const DeliveryLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
  const existingRole = localStorage.getItem("role");
  if (existingRole && existingRole !== "delivery") {
    setLoading(false);
    setError("Please log out from the current user account first.");
    return;
  }
    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Invalid email or password");

      const data = await res.json();

      if (data.role !== "delivery") {
        throw new Error("You are not authorized as delivery staff.");
      }

      // حفظ المعلومات بالتخزين المحلي
      localStorage.setItem("token", data.access);
      localStorage.setItem("email", data.email);
      localStorage.setItem("name", data.name);
      localStorage.setItem("role", data.role);

      // ✅ إرسال الموقع الجغرافي بعد تسجيل الدخول
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await fetch("http://127.0.0.1:8000/accounts/update-my-location/", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${data.access}`,
                },
                body: JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                }),
              });
              toast.success("📍 Location sent to admin");
            } catch (error) {
              toast.error("⚠️ Location update failed");
            }

            // انتقل إلى لوحة التوصيل
            router.push("/delivery/dashboard");
          },
          (error) => {
            toast.error("⚠️ Location permission denied");
            router.push("/delivery/dashboard"); // حتى لو فشل ننتقل
          }
        );
      } else {
        toast.error("Geolocation not supported");
        router.push("/delivery/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Delivery Login</CardTitle>
          <CardDescription>Login to view your delivery tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground mx-auto">
            Only authorized delivery staff can login.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DeliveryLogin;
