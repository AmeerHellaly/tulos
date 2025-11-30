"use client";

import { useState } from "react";
import { Bot, X, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const suggestedQuestions = [
  "وين طلبي؟",
  "شو في خصومات؟",
  "شو بتنصحني اشتري؟",
  "كيف بتواصل مع الدعم؟",
  "شو طرق الدفع؟",
];

const SmartAssistantBubble = () => {
  const [open, setOpen] = useState(false);
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
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[300px] md:w-[360px] shadow-lg rounded-lg border border-gray-300 bg-white flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-gray-100 rounded-t-md">
            <span className="font-semibold text-sm">مساعد Tulos الذكي</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="p-3 space-y-2 max-h-72 overflow-y-auto text-sm">
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
                className={`rounded-md px-3 py-2 whitespace-pre-line max-w-[80%] text-sm ${
                  msg.from === "user"
                    ? "ml-auto bg-blue-100 text-blue-900"
                    : "mr-auto bg-gray-100 text-gray-700"
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
            className="flex items-center gap-2 p-3 border-t"
          >
            <Input
              placeholder="اكتب هنا..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" disabled={loading} size="icon">
              <SendHorizonal className="w-4 h-4" />
            </Button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-darkColor text-white p-3 rounded-full shadow-lg hover:bg-black hover:scale-105 transition-all"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SmartAssistantBubble;
