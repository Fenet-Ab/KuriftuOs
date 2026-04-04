"use client";

import React, { useState, useEffect } from "react";
import DashboardCard from "./DashboardCard";
import { Search, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import SmartBooking from "./SmartBooking";
import { mockRoomCategories, mockBookings as defaultBookings } from "../../lib/mockData";

const ReservationItem = ({ location, date, status }: { location: string; date: string; status: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-neutral-50/50 border border-neutral-100 group hover:shadow-lg hover:shadow-neutral-200/50 transition-all mb-4 last:border-0 hover:bg-neutral-50 gap-4">
    <div>
      <p className="text-sm font-bold text-forest">{location}</p>
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mt-1">{date}</p>
    </div>
    <span className={`w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
      status === "Confirmed" ? "bg-green-100 text-green-600 border border-green-200" : "bg-yellow-100 text-yellow-600 border border-yellow-200"
    }`}>
      {status}
    </span>
  </div>
);

type Booking = { id: number; room_type: string; check_in: string; check_out: string; status: string; location: string; total_price: number };

const LOCATIONS = ["Bishoftu", "Entoto", "Lake Tana", "Awash"];

const GuestView = () => {
  const [searchData, setSearchData] = useState({ check_in: "", check_out: "" });
  const [searchResults, setSearchResults] = useState<typeof mockRoomCategories>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [confirmedRoom, setConfirmedRoom] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // Load bookings from sessionStorage or defaults
    const stored = sessionStorage.getItem("kuriftu_bookings");
    setBookings(stored ? JSON.parse(stored) : [...defaultBookings]);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.check_in || !searchData.check_out) return toast.error("Please select both dates");

    setIsSearching(true);
    await new Promise((r) => setTimeout(r, 800)); // simulate search
    setSearchResults(mockRoomCategories.filter((r) => r.available_rooms > 0));
    if (mockRoomCategories.length === 0) toast.error("No rooms available for these dates");
    setIsSearching(false);
  };

  const handleBookRoom = async (roomName: string, price: number) => {
    if (!user) return toast.error("Please login to book a room");
    if (!searchData.check_in || !searchData.check_out) return toast.error("Please select dates first");

    setIsBooking(roomName);
    await new Promise((r) => setTimeout(r, 1200)); // simulate processing

    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const nights = Math.max(
      1,
      Math.ceil((new Date(searchData.check_out).getTime() - new Date(searchData.check_in).getTime()) / 86400000)
    );
    const total = price * nights;

    const newBooking: Booking = {
      id: Date.now(),
      room_type: roomName,
      check_in: searchData.check_in,
      check_out: searchData.check_out,
      status: "confirmed",
      location,
      total_price: total,
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    sessionStorage.setItem("kuriftu_bookings", JSON.stringify(updated));

    setConfirmedRoom(roomName);
    setIsBooking(null);
    setSearchResults([]);
    toast.success(`Booking confirmed! ${roomName} at Kuriftu ${location} ✓`, { duration: 5000 });
  };

  return (
    <section className="space-y-12 pb-20">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-forest tracking-tight">Resort Experience.</h1>
        <p className="text-neutral-500 mt-2 font-light">Your ultimate stay starts here. How can we assist you today?</p>
      </header>

      {/* Booking Confirmed Banner */}
      {confirmedRoom && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-green-800">Booking Confirmed!</p>
            <p className="text-xs text-green-600 mt-0.5">Your {confirmedRoom} room has been reserved. Check your reservations below for details.</p>
          </div>
          <button onClick={() => setConfirmedRoom(null)} className="ml-auto text-green-400 hover:text-green-600 transition-colors text-xl">×</button>
        </div>
      )}

      {/* Room Search */}
      <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-2xl shadow-neutral-100/50 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-resort-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <h3 className="text-2xl font-black text-forest mb-8 flex items-center gap-3 relative z-10">
          <Search className="text-resort-green w-6 h-6" />
          Find Your Perfect Room
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Check-in Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
              <input type="datetime-local" value={searchData.check_in}
                onChange={(e) => setSearchData({ ...searchData, check_in: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Check-out Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
              <input type="datetime-local" value={searchData.check_out}
                onChange={(e) => setSearchData({ ...searchData, check_out: e.target.value })}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isSearching}
              className="w-full bg-forest text-white py-4 rounded-2xl font-bold tracking-widest text-[10px] uppercase hover:bg-forest/90 transition-all shadow-xl shadow-forest/20 flex items-center justify-center gap-2"
            >
              {isSearching ? "Searching..." : (<>CHECK AVAILABILITY <ArrowRight size={14} /></>)}
            </button>
          </div>
        </form>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {searchResults.map((cat) => (
              <div key={cat.id} className="p-6 rounded-[2rem] border border-neutral-100 hover:border-resort-green/20 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{cat.emoji}</span>
                      <h4 className="text-xl font-bold text-forest capitalize">{cat.name}</h4>
                    </div>
                    <p className="text-xs text-neutral-400">{cat.available_rooms} rooms available</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-resort-green">{cat.price_per_night.toLocaleString()} ETB</p>
                    <p className="text-[10px] text-neutral-400">per night</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {cat.features.map((f) => (
                    <span key={f} className="text-[9px] px-2 py-0.5 bg-neutral-50 rounded-full text-neutral-500 border border-neutral-100">{f}</span>
                  ))}
                </div>
                <button onClick={() => handleBookRoom(cat.name, cat.price_per_night)} disabled={isBooking === cat.name}
                  className="w-full py-3 rounded-xl border border-resort-green/30 text-resort-green text-[10px] font-black uppercase tracking-widest hover:bg-resort-green hover:text-white transition-all disabled:opacity-50"
                >
                  {isBooking === cat.name ? "CONFIRMING..." : "BOOK THIS ROOM"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Smart Booking */}
      <SmartBooking user={user} onBookingConfirmed={(booking: Booking) => {
        const updated = [booking, ...bookings];
        setBookings(updated);
        sessionStorage.setItem("kuriftu_bookings", JSON.stringify(updated));
      }} />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <DashboardCard title="Active Reservation" value={bookings.filter(b => b.status === "confirmed").length > 0 ? bookings.find(b => b.status === "confirmed")?.location || "None" : "None"} desc={bookings.length > 0 ? `${bookings.length} booking${bookings.length > 1 ? "s" : ""} total` : "No bookings yet"} color="bg-resort-green" />
        <DashboardCard title="Membership Status" value="Gold Elite" desc="1,200 points to Platinum" color="bg-resort-yellow" trend="4.8K" />
        <DashboardCard title="AI Concierge Activity" value="8 Requests" desc="Last: Room service confirmed" color="bg-forest" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden">
          <h3 className="text-xl font-bold mb-8 text-forest flex items-center gap-2">
            <span>📅</span> Your Reservations
          </h3>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <ReservationItem
                key={booking.id}
                location={`Kuriftu ${booking.location} (${booking.room_type})`}
                date={`${new Date(booking.check_in).toLocaleDateString()} — ${new Date(booking.check_out).toLocaleDateString()} · ${booking.total_price.toLocaleString()} ETB`}
                status={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              />
            ))
          ) : (
            <div className="py-12 text-center bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200">
              <p className="text-neutral-400 text-sm font-medium italic">No active reservations yet. Use the room search or ask Selam AI!</p>
            </div>
          )}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-resort-green/5 rounded-full blur-3xl" />
        </div>

        <div className="bg-resort-green p-10 rounded-3xl text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Selam AI</h3>
            <p className="text-white/70 text-sm font-light mb-8">
              Talk to our AI Concierge for anything during your stay — from booking a massage to ordering late-night snacks.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-kuriftu-ai"))}
              className="w-full bg-white text-resort-green py-5 rounded-2xl font-bold tracking-widest text-xs uppercase hover:bg-neutral-100 transition-all shadow-xl group"
            >
              OPEN AI CONCIERGE <span className="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
            </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </section>
  );
};

export default GuestView;
