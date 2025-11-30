// components/ReportModal.tsx
"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess?: () => void; // ⬅️ جديد
}

const ReportModal: React.FC<ReportModalProps> = ({ open, onOpenChange, orderId,onSuccess }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  if (!message.trim()) {
    toast.error("يرجى كتابة محتوى البلاغ.");
    return;
  }

  setLoading(true);
  try {
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:8000/api/reports/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify({ orderId, message }),
    });

    if (!res.ok) throw new Error();

    // ✅ احفظ orderId ضمن البلاغات
    const existing = JSON.parse(localStorage.getItem("reportedOrders") || "[]");
    if (!existing.includes(orderId)) {
      existing.push(orderId);
      localStorage.setItem("reportedOrders", JSON.stringify(existing));
    }
    onSuccess?.(); 
    toast.success("✅ تم إرسال البلاغ بنجاح.");
    setMessage("");
    onOpenChange(false);
  } catch (err) {
    toast.error("❌ حدث خطأ أثناء إرسال البلاغ.");
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg">الإبلاغ عن مشكلة</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            يرجى كتابة تفاصيل المشكلة المتعلقة بالطلب رقم <strong>{orderId}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-2">
          <Textarea
            rows={5}
            placeholder="مثال: لم يصل الطلب أو لم أتمكن من التواصل مع السائق..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="resize-none"
          />
        </div>

        <DialogFooter className="mt-3">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال البلاغ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;