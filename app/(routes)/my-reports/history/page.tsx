"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

interface Report {
  id: number;
  order: { order_number: string };
  message: string;
  admin_response: string;
  created_at: string;
  responded_at: string;
}

const ReportHistoryPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8000/api/reports/history/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">سجل البلاغات السابقة</h1>

      {loading ? (
        <p>جاري التحميل...</p>
      ) : reports.length === 0 ? (
        <p>لا يوجد بلاغات مقروءة حتى الآن.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="bg-white p-4 border rounded-md shadow flex gap-3 items-start"
            >
              <FileText className="mt-1 text-gray-500" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>رقم الطلب:</strong> #{report.order.order_number}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>رسالتك:</strong> {report.message}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  <strong>رد الإدارة:</strong> {report.admin_response}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  تم الرد بتاريخ: {new Date(report.responded_at).toLocaleString("ar-EG")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportHistoryPage;
