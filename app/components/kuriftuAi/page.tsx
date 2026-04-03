"use client";

import { MessageSquareMore, X, Send, Sparkles, User, Bot, Loader2, Mic } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const KuriftuAi = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("access_token"));
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    const toggleChat = () => {
        if (!isLoggedIn && !isOpen) {
            toast.error("Please login to chat with Selam AI");
            router.push("/login"); // Optional: redirects to login if not logged in
            return;
        }
        setIsOpen(!isOpen);
    };

    const [isListening, setIsListening] = useState(false);

    // Voice recognition setup
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; // Can be 'am-ET' if supported
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            toast.success("Listening...");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error(event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Please allow microphone access in your browser settings.");
            } else {
                toast.error(`Voice error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message.trim();
        setMessage("");
        setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://localhost:8000/api/v1/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await response.json();

            if (response.status === 401) {
                toast.error("Session expired. Please login again.");
                router.push("/login");
                return;
            }

            if (!response.ok) throw new Error(data.detail || "AI message failed");

            // Text to Speech for AI response
            if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(data.response);
                utterance.rate = 1.1;
                window.speechSynthesis.speak(utterance);
            }

            setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
        } catch (err: any) {
            toast.error(err.message);
            setChatHistory(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please try again later when my quota resets." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="absolute bottom-10 right-10 z-50 group">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[400px] max-h-[600px] h-[80vh] bg-white rounded-[3rem] shadow-2xl border border-neutral-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500">
                    {/* Header */}
                    <div className="bg-forest p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Sparkles size={20} className="text-resort-yellow" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-widest uppercase">Selam AI</h3>
                                <p className="text-[10px] text-white/50 uppercase tracking-widest">Concierge Concierge</p>
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
                                <p className="text-xs text-neutral-400 font-medium">Hello! I'm Selam, your AI concierge. How can I help with your resort experience today?</p>
                            </div>
                        )}
                        {chatHistory.map((chat, i) => (
                            <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
                                <div className={`max-w-[80%] p-4 rounded-[1.5rem] text-xs leading-relaxed ${
                                    chat.role === 'user' 
                                    ? 'bg-forest text-white rounded-tr-none shadow-xl shadow-forest/10 font-medium' 
                                    : 'bg-white text-forest rounded-tl-none border border-neutral-100 shadow-sm'
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

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-50 flex gap-3">
                        <button 
                            type="button"
                            onClick={startListening}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                isListening 
                                ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' 
                                : 'bg-neutral-50 text-neutral-400 border-neutral-100 hover:bg-neutral-100'
                            }`}
                        >
                            <Mic size={20} />
                        </button>
                        <input 
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Type your request here..."}
                            className="flex-1 px-5 py-3 rounded-2xl bg-neutral-50 border border-neutral-100 focus:outline-none focus:ring-2 focus:ring-resort-green/20 text-xs text-forest font-medium placeholder:text-neutral-300 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={isLoading || !message.trim()}
                            className="w-12 h-12 bg-resort-green rounded-2xl flex items-center justify-center text-white shadow-lg shadow-resort-green/20 hover:bg-forest transition-all disabled:opacity-50 active:scale-95 translate-y-0.5"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Bubble Button */}
            <div className="absolute inset-0 bg-resort-green/20 rounded-full blur-xl group-hover:bg-resort-green/40 transition-all duration-500 animate-pulse" />
            <button 
                onClick={toggleChat}
                className="relative w-16 h-16 bg-resort-green rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
            >
                {isOpen ? <X size={28} /> : <MessageSquareMore size={28} className="group-hover:-rotate-6 transition-transform" />}

                {/* Pulsing AI Badge */}
                {!isOpen && (
                    <div className="absolute -top-1 -right-1 bg-resort-orange text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-lg animate-bounce duration-[2000ms]">
                        AI
                    </div>
                )}

                {/* Status Indicator */}
                {!isOpen && (
                    <div className="absolute bottom-1 right-3 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* Tooltip hint */}
            {!isOpen && (
                <div className="absolute right-20 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-zinc-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-4 group-hover:translate-x-0 w-max">
                    <p className="text-[11px] font-bold text-forest uppercase tracking-widest whitespace-nowrap">Chat with Selam AI</p>
                </div>
            )}
        </div>
    )
}

export default KuriftuAi