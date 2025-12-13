"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hello! 👋 How can I help you today?" },
  ]);

  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    const userMsg = { id: Date.now(), from: "user", text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    // Simulated reply
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: `Thanks for your message: "${text}". I can help with SEO tips, code review, or website optimization.`,
      };

      setMessages((m) => [...m, botMsg]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end">

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden mb-4"
            >

              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="font-semibold text-sm text-white">Assistant</h2>
                <button
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  ✕
                </button>
              </div>

              <div
                ref={boxRef}
                className="h-64 overflow-auto p-4 space-y-3 bg-white dark:bg-slate-900"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                        m.from === "user"
                          ? "bg-brand-600 text-white"
                          : "bg-brand-700 text-white"  
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
                    <span className="animate-pulse">Assistant is typing...</span>
                  </div>
                )}
              </div>

              <form onSubmit={sendMessage} className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Type a message..."
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Send
                  </button>
                </div>
              </form>

            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen((s) => !s)}
          className="w-14 h-14 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-5.4-1.9L3 21l1.9-4.1A8.38 8.38 0 0 1 3 11.5a8.5 8.5 0 0 1 3.1-6.6A8.38 8.38 0 0 1 11.5 3a8.5 8.5 0 0 1 10 10z"/>
          </svg>
        </motion.button>

      </div>
    </div>
  );
};

export default Chatbot;
