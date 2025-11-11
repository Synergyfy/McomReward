"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi 👋! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Got it! I’ll connect you to our support soon." },
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 w-80 bg-white shadow-xl rounded-2xl overflow-hidden z-50 border border-gray-200"
          >
            <div className="bg-orange-500 text-white px-4 py-2 font-semibold">
              Loyalty CardX Live Help
            </div>
            <div className="p-3 h-64 overflow-y-auto space-y-2 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      msg.from === "user"
                        ? "bg-orange-500 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center border-t border-gray-200">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={handleSend}
                className="p-2 text-orange-500 hover:text-orange-600"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
