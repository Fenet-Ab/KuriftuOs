"use client";

import { MessageSquareMore, X, Send, Sparkles, Bot, Loader2, Mic } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { addTask, detectServiceRequest } from "../../lib/taskStore";

const SYSTEM_PROMPT = `You are Selam, the AI concierge for Kuriftu Resorts & Spa — Ethiopia's premier luxury resort chain with locations in Bishoftu (Lake District), Entoto, Lake Tana, and Awash National Park.

Your personality: warm, professional, knowledgeable about Ethiopian culture and hospitality, fluent in both English and Amharic. You use occasional Amharic phrases naturally (like "selam", "ameseginalehu", "yikirta").

Your capabilities:
- Help guests with room bookings, amenities, and resort services
- Recommend activities: lake boat tours, coffee ceremonies, Ethiopian dining experiences, spa treatments, safari trips
- Answer questions about Kuriftu's locations, packages, and pricing (in ETB)
- Handle service requests: room service, maintenance, housekeeping, transport
- Provide information about Ethiopian holidays, culture, and local attractions
- Assist staff with operational queries

When a guest makes a service request (towels, room service, maintenance, transport, spa, cleaning), acknowledge it warmly and confirm it will be handled. Be concise but warm. Responses should be 2-4 sentences unless more detail is needed. Never expose that you are powered by a third-party AI — you are simply "Selam AI" by Kuriftu.`;

type ChatMessage = { role: "user" | "ai"; text: string };
type GeminiMessage = { role: "user" | "model"; parts: { text: string }[] };

async function callGemini(history: GeminiMessage[], userMessage: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    // Offline fallback when no API key is set
    return getOfflineResponse(userMessage);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const contents: GeminiMessage[] = [
    ...history,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const body = {
    contents,
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: { temperature: 0.8, maxOutputTokens: 512 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini error ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";
}

function getOfflineResponse(message: string): string {
  const lower = message.toLowerCase();
  if (/towel|linen/.test(lower)) return "Of course! I've sent a request to our housekeeping team to deliver fresh towels to your room right away. They'll be with you within 15 minutes. Is there anything else I can help you with?";
  if (/food|breakfast|lunch|dinner|room service/.test(lower)) return "Certainly! I've placed your room service request with our F&B team. You can expect delivery within 30 minutes. Our Ethiopian breakfast features injera, tibs, and a traditional coffee ceremony — would you like the full menu?";
  if (/spa|massage/.test(lower)) return "Wonderful choice! Our spa offers traditional Ethiopian treatments including coffee scrubs, honey massages, and aromatherapy. Shall I book a session for you? Please let me know your preferred time.";
  if (/book|room|suite|villa/.test(lower)) return "I'd be happy to help you with a room booking! We have Standard rooms from 4,500 ETB/night, Deluxe from 8,500 ETB, Suites from 15,000 ETB, and exclusive Villas from 25,000 ETB per night. Which category interests you?";
  if (/selam|hello|hi|hey/.test(lower)) return "Selam! Welcome to Kuriftu Resorts. I'm Selam, your personal AI concierge. How can I make your stay extraordinary today?";
  if (/amharic|አማርኛ/.test(lower)) return "Ameseginalehu! I'm happy to help in Amharic or English. What can I assist you with today?";
  return "Selam! I'm here to make your Kuriftu experience exceptional. Whether you need room service, activity bookings, or information about our beautiful Ethiopian locations, I'm at your service. How can I assist you today?";
}

const KuriftuAi = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [geminiHistory, setGeminiHistory] = useState<GeminiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
    const handleOpenAi = () => setIsOpen(true);
    window.addEventListener("open-kuriftu-ai", handleOpenAi);
    return () => window.removeEventListener("open-kuriftu-ai", handleOpenAi);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const toggleChat = () => {
    if (!isLoggedIn && !isOpen) {
      toast.error("Please login to chat with Selam AI");
      router.push("/login");
      return;
    }
    setIsOpen(!isOpen);
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); toast.success("Listening..."); };
    recognition.onresult = (event: any) => { setMessage(event.results[0][0].transcript); setIsListening(false); };
    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === "not-allowed") toast.error("Please allow microphone access.");
      else toast.error(`Voice error: ${event.error}`);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMsg = message.trim();
    setMessage("");
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    // Detect service request BEFORE calling AI — create task optimistically
    const taskData = detectServiceRequest(userMsg);
    if (taskData) {
      const newTask = addTask(taskData);
      toast.success(`Task #${newTask.id} created in OpsFlow ✓`, { icon: "📋", duration: 4000 });
    }

    try {
      const aiText = await callGemini(geminiHistory, userMsg);

      // Update Gemini conversation history
      setGeminiHistory((prev) => [
        ...prev,
        { role: "user", parts: [{ text: userMsg }] },
        { role: "model", parts: [{ text: aiText }] },
      ]);

      setChatHistory((prev) => [...prev, { role: "ai", text: aiText }]);

      // Text-to-speech
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(aiText);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      const fallback = getOfflineResponse(userMsg);
      setChatHistory((prev) => [...prev, { role: "ai", text: fallback }]);
      if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        toast.error("AI quota reached — using offline mode");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] group">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] max-h-[600px] h-[80vh] bg-white rounded-[3rem] shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
          {/* Header */}
          <div className="bg-forest p-6 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <Sparkles size={20} className="text-resort-yellow" />
              </div>
              <div>
                <h3 className="text-sm font-black tracking-widest uppercase">Selam AI</h3>
                <p className="text-[10px] text-white/50 uppercase tracking-widest">AI Concierge · Kuriftu</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/50">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-forest/5 flex items-center justify-center text-forest/20">
                  <Bot size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-neutral-400 font-medium">Selam! I'm your AI concierge. Ask me anything about your stay.</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {["Order room service", "Book a spa treatment", "Lake boat tour info", "Extra towels please"].map((s) => (
                      <button key={s} onClick={() => setMessage(s)} className="text-[10px] px-3 py-1.5 rounded-full bg-forest/5 text-forest/60 hover:bg-forest/10 transition-all border border-forest/10 font-medium">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
                <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                  chat.role === "user"
                    ? "bg-forest text-white rounded-tr-none shadow-xl shadow-forest/10 font-medium"
                    : "bg-white text-forest rounded-tl-none border border-neutral-100 shadow-sm"
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white p-4 rounded-[1.5rem] rounded-tl-none border border-neutral-100 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-resort-green" />
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Selam is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-50 flex gap-3 shrink-0">
            <button
              type="button" onClick={startListening}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                isListening ? "bg-red-50 text-red-500 border-red-200 animate-pulse" : "bg-neutral-50 text-neutral-400 border-neutral-100 hover:bg-neutral-100"
              }`}
            >
              <Mic size={20} />
            </button>
            <input
              type="text" value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type your request here..."}
              className="flex-1 px-5 py-3 rounded-2xl bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-resort-green/20 text-xs text-forest font-medium placeholder:text-neutral-300 transition-all"
            />
            <button
              type="submit" disabled={isLoading || !message.trim()}
              className="w-12 h-12 bg-resort-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-resort-green/20 hover:bg-forest transition-all disabled:opacity-50 active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Bubble */}
      <div className="absolute inset-0 bg-resort-green/20 rounded-full blur-xl group-hover:bg-resort-green/40 transition-all duration-500 animate-pulse" />
      <button
        onClick={toggleChat}
        className="relative w-16 h-16 bg-resort-green rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
      >
        {isOpen ? <X size={28} /> : <MessageSquareMore size={28} className="group-hover:-rotate-6 transition-transform" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 bg-resort-orange text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-lg animate-bounce duration-[2000ms]">
            AI
          </div>
        )}
        {!isOpen && <div className="absolute bottom-1 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
      </button>

      {!isOpen && (
        <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-4 group-hover:translate-x-0 w-max">
          <p className="text-[11px] font-bold text-forest uppercase tracking-widest whitespace-nowrap">Chat with Selam AI</p>
        </div>
      )}
    </div>
  );
};

export default KuriftuAi;
