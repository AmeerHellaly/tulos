"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface Report {
  id: number;
  order: string;
  message: string;
  admin_response: string;
  created_at: string;
}

const MyReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/reports/unseen/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch reports");
        const data = await res.json();
        setReports(data);

        // ✅ تعليم البلاغات كمقروءة بعد جلبها
        data.forEach((report: Report) => {
          fetch(`http://localhost:8000/api/reports/mark-seen/${report.id}/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }).catch((err) => console.error("Mark as seen error:", err));
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">الردود على البلاغات</h1>
      {reports.length === 0 ? (
        <p>لا توجد ردود جديدة حتى الآن.</p>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li
              key={report.id}
              className="bg-gray-100 p-4 rounded shadow flex gap-3 items-start"
            >
              <AlertCircle className="mt-1 text-blue-600" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>الطلب:</strong> #{report.order}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>رسالتك:</strong> {report.message}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  <strong>رد الإدارة:</strong> {report.admin_response}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyReportsPage;
