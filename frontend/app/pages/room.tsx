import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/navbar/page";
import {
  Bed,
  Bath,
  Droplets,
  Wind,
  Wifi,
  Coffee,
  Sparkles,
  ArrowRight,
  Hotel,
  DoorOpen,
} from "lucide-react";

export type RoomInventory = {
  total_rooms: number;
  available_rooms: number;
  booked_rooms: number;
};

const highlights = [
  {
    icon: Bed,
    title: "Signature king bed",
    desc: "Premium linens, black-out drapes, and a restful view toward green and water.",
  },
  {
    icon: Bath,
    title: "Private spa bath",
    desc: "Deep soaking tub, rainfall shower, and curated bath amenities.",
  },
  {
    icon: Droplets,
    title: "Wellness touches",
    desc: "Spa-grade toiletries, plush robes, and refreshed water at turndown.",
  },
  {
    icon: Wind,
    title: "Climate & quiet",
    desc: "Discreet climate control so your suite stays exactly as you like it.",
  },
  {
    icon: Wifi,
    title: "Stay connected",
    desc: "Complimentary high-speed Wi‑Fi and bedside charging for every device.",
  },
  {
    icon: Coffee,
    title: "Morning ritual",
    desc: "In-room coffee and tea with local blends and filtered spring water.",
  },
];

type RoomPageProps = {
  stats?: RoomInventory | null;
};

const RoomPage = ({ stats = null }: RoomPageProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-resort-parchment font-sans selection:bg-brass selection:text-white">
      <Navbar />
      <section className="relative min-h-[72vh] w-full flex flex-col justify-end pb-16 md:pb-24 pt-28 overflow-hidden bg-forest">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero1.png"
            alt="Luxury suite interior"
            fill
            className="object-cover brightness-[0.78] scale-105 animate-slow-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-8 w-full text-center md:text-left">
          <p className="text-brass italic text-lg md:text-xl font-serif tracking-widest mb-3">
            Kuriftu Resort &amp; Spa
          </p>
          <h1 className="text-white font-serif text-4xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight mb-6 drop-shadow-2xl uppercase leading-none">
            Rooms for deep rest
          </h1>
          <p className="text-white/88 text-lg md:text-xl max-w-2xl mx-auto md:mx-0 font-light leading-relaxed mb-8">
            King beds, private spa baths, and calm details in every corner — your
            suite is the quiet between adventure and lakeside evenings.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 justify-center md:justify-start">
            <div className="rounded-[1.25rem] bg-white/12 backdrop-blur-xl border border-white/20 px-6 py-4 min-w-[155px] text-left shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-brass mb-2">
                <Hotel size={16} strokeWidth={1.75} aria-hidden />
                <span className="text-[10px] font-black tracking-[0.28em] uppercase">
                  Total rooms
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-serif font-bold text-white tabular-nums tracking-tight">
                {stats != null ? stats.total_rooms : "—"}
              </p>
              <p className="text-[11px] text-white/55 mt-1 font-medium">
                In our inventory
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-white/12 backdrop-blur-xl border border-white/20 px-6 py-4 min-w-[155px] text-left shadow-lg shadow-black/10">
              <div className="flex items-center gap-2 text-brass mb-2">
                <DoorOpen size={16} strokeWidth={1.75} aria-hidden />
                <span className="text-[10px] font-black tracking-[0.28em] uppercase">
                  Free now
                </span>
              </div>
              <p className="text-3xl md:text-4xl font-serif font-bold text-white tabular-nums tracking-tight">
                {stats != null ? stats.available_rooms : "—"}
              </p>
              <p className="text-[11px] text-white/55 mt-1 font-medium">
                Not booked / available
              </p>
            </div>
          </div>
          {stats == null && (
            <p className="text-white/50 text-xs mb-6 max-w-md mx-auto md:mx-0 tracking-wide">
              Live counts load when the Kuriftu API is reachable (start the backend on
              port 8000).
            </p>
          )}

          <Link
            href="/booking"
            className="inline-flex items-center justify-center gap-3 h-14 md:h-16 px-10 bg-resort-orange rounded-full text-[11px] font-black tracking-[0.25em] text-white hover:bg-resort-green hover:shadow-xl hover:shadow-resort-green/25 transition-all duration-500 active:scale-95"
          >
            BOOK NOW
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>

      <section className="relative py-20 md:py-28 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 md:mb-20">
            <p className="text-brass text-sm font-serif italic tracking-widest mb-2">
              What&apos;s in your room
            </p>
            <h2 className="text-forest font-serif text-3xl md:text-5xl font-bold">
              Bed, bath &amp; spa comfort
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {highlights.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-[2rem] bg-white border border-resort-yellow/15 p-8 shadow-sm hover:shadow-xl hover:shadow-resort-green/5 hover:border-resort-green/20 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-full bg-resort-green/10 flex items-center justify-center text-resort-green mb-5 group-hover:scale-110 transition-transform">
                  <Icon size={26} strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-forest font-serif text-xl font-bold mb-2">
                  {title}
                </h3>
                <p className="text-zinc-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-3 h-14 md:h-16 px-10 bg-resort-green rounded-full text-[11px] font-black tracking-[0.25em] text-white hover:opacity-90 hover:shadow-lg hover:shadow-resort-green/20 transition-all duration-500 active:scale-95"
            >
              BOOK NOW
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-6xl mx-auto rounded-[2rem] overflow-hidden bg-forest text-white flex flex-col lg:flex-row shadow-2xl shadow-forest/20">
          <div className="lg:w-[52%] p-10 md:p-14 flex flex-col justify-center order-2 lg:order-1">
            <div className="flex items-center gap-2 text-brass mb-4">
              <Sparkles size={20} aria-hidden />
              <span className="text-[10px] font-black tracking-[0.35em] uppercase">
                Spa at Kuriftu
              </span>
            </div>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">
              From suite to spa, without leaving the calm
            </h3>
            <p className="text-white/80 leading-relaxed mb-8">
              Add treatments and hydrotherapy to your stay. Return to a room
              ready for sleep — turndown, soft light, still water at the bedside.
            </p>
            <Link
              href="/booking"
              className="self-start inline-flex items-center gap-3 h-12 px-8 rounded-full border-2 border-brass text-brass text-[10px] font-black tracking-[0.25em] hover:bg-brass hover:text-forest transition-all duration-300"
            >
              BOOK NOW
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="lg:w-[48%] min-h-[300px] relative bg-resort-green/20 order-1 lg:order-2">
            <Image
              src="/hero1.png"
              alt="Resort spa and wellness"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/80 via-forest/20 to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest/30 to-forest lg:hidden" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomPage;
