// components/ChatWidget.tsx
"use client";
import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([{ role: "system", content: "مرحبا! كيف فيني ساعدك؟" }]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const data = await res.json();
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
  };

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-xl rounded-lg w-80 p-4">
      <div className="h-60 overflow-y-auto">
        {messages.map((msg, idx) => (
          <p key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span className="block p-1">{msg.content}</span>
          </p>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border px-2 py-1 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-1 rounded" onClick={handleSend}>إرسال</button>
      </div>
    </div>
  );
}
