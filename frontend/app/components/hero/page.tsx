'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Users, ArrowRight } from 'lucide-react';
import KuriftuAi from '../kuriftuAi/page';

const Hero = () => {
    const [textIndex, setTextIndex] = useState(0);
    const [times, setTimes] = useState<Record<string, string>>({});

    const titles = [
        "ENJOY YOUR STAY",
        "Chat With KURIFTU AI"
    ];

    // Clock logic
    useEffect(() => {
        const updateTimes = () => {
            const now = new Date();
            const getT = (offset: number) => {
                const d = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (offset * 3600000));
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
            }
            setTimes({
                'ADDIS ABABA': getT(3),
                'LONDON': getT(0),
                'NEW YORK': getT(-5),
                'TOKYO': getT(9),
                'PARIS': getT(1),
            });
        };
        updateTimes();
        const timer = setInterval(updateTimes, 60000);
        return () => clearInterval(timer);
    }, []);

    // Text cycling logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % titles.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative flex-1 min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-start pt-20 md:pt-32 overflow-hidden bg-forest">
            {/* Background Layer with slow pan */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero1.png"
                    alt="Resort Lobby"
                    fill
                    className="object-cover brightness-[0.8] scale-110 animate-slow-zoom"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 w-full max-w-5xl px-8 flex flex-col items-center text-center">
                <p className="text-brass italic text-lg md:text-xl font-serif tracking-widest mb-2 animate-in fade-in slide-in-from-top-8 duration-1000">
                    Welcome to Kuriftu Resort & Spa
                </p>

                <div className="h-[80px] md:h-[140px] flex items-center justify-center mb-8 relative overflow-visible w-full">
                    <h1
                        key={textIndex}
                        className="text-white font-serif text-3xl md:text-[5rem] lg:text-[7rem] font-bold tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-bottom-12 duration-[1500ms] leading-none uppercase whitespace-nowrap"
                    >
                        {titles[textIndex]}
                    </h1>
                </div>

                {/* The Booking Bar */}
                <div className="w-full max-w-6xl bg-white/95 backdrop-blur-xl rounded-[2rem] md:rounded-full p-4 md:p-2 lg:p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-16 duration-1000 border border-white/20">

                    {/* Check-In Section */}
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors rounded-t-[1.5rem] md:rounded-none cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-resort-green/10 flex items-center justify-center text-resort-green shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                            <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-0.5 whitespace-nowrap">Check-in</label>
                            <span className="text-sm font-bold text-forest">03/04/2026</span>
                        </div>
                    </div>

                    {/* Check-Out Section */}
                    <div className="flex-1 flex items-center gap-4 px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-resort-green/10 flex items-center justify-center text-resort-green shrink-0 group-hover:scale-110 transition-transform">
                            <Calendar size={18} />
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                            <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-0.5 whitespace-nowrap">Check-out</label>
                            <span className="text-sm font-bold text-forest">04/04/2026</span>
                        </div>
                    </div>

                    {/* Guests Section */}
                    <div className="flex-[1.2] flex items-center gap-4 px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-resort-green/10 flex items-center justify-center text-resort-green shrink-0 group-hover:scale-110 transition-transform">
                            <Users size={18} />
                        </div>
                        <div className="flex flex-col items-start translate-y-[-1px]">
                            <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-0.5">Guests</label>
                            <span className="text-sm font-bold text-forest whitespace-nowrap">2 adults, 0 children</span>
                        </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between md:justify-end gap-4 px-4 md:px-2 w-full md:w-auto mt-2 md:mt-0">
                        <button className="text-[10px] font-bold text-zinc-400 hover:text-forest transition-colors uppercase tracking-[0.2em] px-4 hidden lg:block">
                            Promo?
                        </button>

                        <button className="flex-1 md:flex-none h-14 md:h-16 px-10 bg-resort-orange rounded-full text-[11px] font-black tracking-[0.25em] text-white hover:bg-resort-green hover:shadow-xl hover:shadow-resort-green/20 transition-all duration-500 flex items-center justify-center gap-3 active:scale-95">
                            FIND YOUR ROOM
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* World Clocks - Premium Ticker */}
                <div className="mt-12 w-full max-w-4xl border-t border-white/10 pt-8 animate-in fade-in duration-1000">
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
                        {Object.entries(times).map(([city, time]) => (
                            <div key={city} className="flex flex-col items-center min-w-[100px]">
                                <span className="text-[9px] font-black tracking-[0.3em] text-brass mb-1 opacity-70">
                                    {city}
                                </span>
                                <span className="text-sm font-medium text-white/90 font-serif tabular-nums tracking-widest">
                                    {time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <KuriftuAi />

        </section>
    );
};

export default Hero;