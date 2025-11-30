"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const RateOrderModal = ({
  open,
  onClose,
  order,
  onRated,
  onSuccess, // ✅ أضف هذا
}: {
  open: boolean;
  onClose: () => void;
  order: any;
  onRated: (orderNumber: string) => void;
  onSuccess: () => void; // ✅ أضف هذا
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    if (open && order?.order_number) {
      const ratedOrders = JSON.parse(localStorage.getItem("ratedOrders") || "[]");
      setHasRated(ratedOrders.includes(order.order_number));
      setRating(null);
      setComment("");
    }
  }, [open, order]);

  const handleSubmit = async () => {
    if (!rating) {
      toast.error("يرجى تحديد تقييم بين 1 و 5 نجوم");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("يرجى تسجيل الدخول أولًا.");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/order/api/orders/rate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order: order.order_number,
          stars: rating,
          comment,
        }),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const data = await res.json();
          if (data?.detail === "تم تقييم هذا الطلب مسبقًا.") {
            toast.error("تم تقييم هذا الطلب بالفعل");
            setHasRated(true);
            onRated(order.order_number);
            onSuccess()
            return;
          }
        }
        
      }

      // تحديث localStorage
      const ratedOrders = JSON.parse(localStorage.getItem("ratedOrders") || "[]");
      const updatedRated = [...new Set([...ratedOrders, order.order_number])];
      localStorage.setItem("ratedOrders", JSON.stringify(updatedRated));

      toast.success("✅ تم إرسال التقييم بنجاح");
      setHasRated(true);
    } catch (error) {
      console.error(error);
      toast.error("❌ حدث خطأ أثناء إرسال التقييم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>تقييم الطلب رقم #{order?.order_number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!hasRated ? (
            <>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => setRating(val)}
                    className={`px-3 py-1 border rounded transition-all ${
                      rating === val
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {val}⭐
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="اكتب تعليقك (اختياري)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
                rows={4}
              />

              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال التقييم"}
              </Button>
            </>
          ) : (
            <div className="text-green-600 text-center font-semibold">
              ✅ تم تقييم هذا الطلب
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RateOrderModal;
