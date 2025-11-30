"use client";

import { useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const suggestedQuestions = [
  "وين طلبي؟",
  "شو في خصومات؟",
  "شو بتنصحني اشتري؟",
  "كيف بتواصل مع الدعم؟",
  "شو طرق الدفع؟",
];

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "مرحباً! كيف يمكنني مساعدتك اليوم؟" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim()) return;
    const userMessage = { from: "user", text: messageToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "عذرًا، حدث خطأ. حاول مرة أخرى لاحقًا." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-5 min-h-screen">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <Bot className="text-primary" /> مساعد Tulos الذكي
      </h1>

      <div className="bg-gray-50 rounded-md border p-4 space-y-3 max-h-[60vh] overflow-y-auto">
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`text-sm p-2 rounded-md max-w-[80%] whitespace-pre-line ${
              msg.from === "user"
                ? "ml-auto bg-blue-100 text-blue-900"
                : "mr-auto bg-white text-gray-700 border"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <Input
          placeholder="اكتب سؤالك هنا..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" disabled={loading}>
          <SendHorizonal className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatbotPage;
