"use client";

import { useState, useEffect } from "react";
import { Calendar, Bed, ArrowRight, ShieldCheck, AlertCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { mockBookings } from "../../lib/mockData";

const mockAllBookings = [
  { id: 1, guest: "Alemayehu Tadesse", room_type: "Suite", check_in: "2026-04-15T14:00", check_out: "2026-04-18T11:00", status: "confirmed", location: "Bishoftu", total_price: 45000 },
  { id: 2, guest: "Mekdes Haile", room_type: "Villa", check_in: "2026-04-10T14:00", check_out: "2026-04-14T11:00", status: "checked-in", location: "Entoto", total_price: 100000 },
  { id: 3, guest: "Solomon Girma", room_type: "Deluxe", check_in: "2026-04-20T14:00", check_out: "2026-04-22T11:00", status: "pending", location: "Bishoftu", total_price: 17000 },
  { id: 4, guest: "Hana Bekele", room_type: "Standard", check_in: "2026-04-08T14:00", check_out: "2026-04-10T11:00", status: "checked-out", location: "Lake Tana", total_price: 9000 },
  { id: 5, guest: "Yohannes Tesfaye", room_type: "Suite", check_in: "2026-04-19T14:00", check_out: "2026-04-21T11:00", status: "confirmed", location: "Awash", total_price: 30000 },
  { id: 6, guest: "Biruk Alemu", room_type: "Deluxe", check_in: "2026-04-12T14:00", check_out: "2026-04-13T11:00", status: "pending", location: "Entoto", total_price: 8500 },
  { id: 7, guest: "Selam Worku", room_type: "Villa", check_in: "2026-04-16T14:00", check_out: "2026-04-19T11:00", status: "confirmed", location: "Kuriftu Village", total_price: 75000 },
  { id: 8, guest: "Dawit Haile", room_type: "Standard", check_in: "2026-04-05T14:00", check_out: "2026-04-07T11:00", status: "checked-out", location: "Lake Tana", total_price: 9000 },
  { id: 9, guest: "Tigist Mengesha", room_type: "Deluxe", check_in: "2026-04-18T14:00", check_out: "2026-04-20T11:00", status: "confirmed", location: "Bishoftu", total_price: 17000 },
  { id: 10, guest: "Abiy Girma", room_type: "Suite", check_in: "2026-04-22T14:00", check_out: "2026-04-25T11:00", status: "pending", location: "Entoto", total_price: 45000 },
];

const statusStyles: Record<string, string> = {
  confirmed: "bg-green-100 text-green-600 border-green-200",
  pending: "bg-yellow-100 text-yellow-600 border-yellow-200",
  "checked-in": "bg-blue-100 text-blue-600 border-blue-200",
  "checked-out": "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const statusIconStyles: Record<string, string> = {
  confirmed: "bg-green-50 text-green-600",
  pending: "bg-yellow-50 text-yellow-600",
  "checked-in": "bg-blue-50 text-blue-600",
  "checked-out": "bg-neutral-50 text-neutral-400",
};

const ReservationItem = ({
  booking,
  isGuest,
  onCancel,
}: {
  booking: any;
  isGuest: boolean;
  onCancel?: (id: number) => void;
}) => {
  const dateStr = `${new Date(booking.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${new Date(booking.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-neutral-100 group hover:shadow-2xl hover:shadow-neutral-200/50 transition-all mb-6 hover:-translate-y-1 gap-6">
      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl ${statusIconStyles[booking.status] || "bg-neutral-50 text-neutral-400"}`}>
          <Bed size={24} />
        </div>
        <div>
          {!isGuest && (
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">{booking.guest}</p>
          )}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black text-resort-green uppercase tracking-[0.2em]">{booking.room_type} Room</p>
            {booking.status === "confirmed" && <ShieldCheck size={12} className="text-green-500" />}
          </div>
          <h4 className="text-xl font-bold text-forest">{booking.location}</h4>
          <p className="text-xs text-neutral-400 font-medium mt-1 flex items-center gap-2">
            <Calendar size={12} /> {dateStr}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-50">
        <div className="text-right">
          <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Total</p>
          <p className="text-lg font-black text-forest">{booking.total_price.toLocaleString()} ETB</p>
        </div>
        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${statusStyles[booking.status] || "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
          {booking.status}
        </span>
        {isGuest && booking.status === "pending" && onCancel && (
          <button
            onClick={() => onCancel(booking.id)}
            className="p-2 rounded-full border border-red-200 text-red-400 hover:bg-red-50 transition-all"
            title="Cancel booking"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

const FILTER_OPTIONS = ["All", "Confirmed", "Pending", "Checked-in"];

const BookingsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string>("guest");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const userRole = savedUser ? JSON.parse(savedUser).role : "guest";
    setRole(userRole);

    if (["staff", "manager", "admin"].includes(userRole)) {
      setBookings(mockAllBookings);
    } else {
      try {
        const stored = sessionStorage.getItem("kuriftu_bookings");
        setBookings(stored ? JSON.parse(stored) : mockBookings);
      } catch {
        setBookings(mockBookings);
      }
    }
    setLoading(false);
  }, []);

  const handleCancel = (id: number) => {
    const updated = bookings.map((b) =>
      b.id === id && b.status === "pending" ? { ...b, status: "cancelled" } : b
    );
    setBookings(updated);
    try {
      sessionStorage.setItem("kuriftu_bookings", JSON.stringify(updated));
    } catch {}
    toast.success("Booking cancelled.");
  };

  const isGuest = !["staff", "manager", "admin"].includes(role);

  const filtered =
    filter === "All"
      ? bookings
      : bookings.filter((b) => b.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-forest tracking-tight">
            {isGuest ? "My Bookings." : "All Reservations."}
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">
            {isGuest ? "Manage your stays and view transaction history." : "All active and historical bookings across locations."}
          </p>
        </div>
        <div className="bg-neutral-50 px-6 py-3 rounded-2xl border border-neutral-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-resort-green animate-pulse" />
          <span className="text-[10px] font-black text-forest uppercase tracking-widest">{bookings.length} RESERVATIONS</span>
        </div>
      </header>

      {!isGuest && (
        <div className="flex gap-3 flex-wrap">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                filter === f
                  ? "bg-forest text-white border-forest"
                  : "bg-white text-neutral-500 border-neutral-100 hover:border-forest/30"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-resort-green/20 border-t-resort-green rounded-full animate-spin" />
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Loading reservations...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {filtered.map((booking) => (
            <ReservationItem key={booking.id} booking={booking} isGuest={isGuest} onCancel={handleCancel} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-neutral-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="text-neutral-300 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-forest mb-2">No Bookings Found</h3>
          <p className="text-neutral-400 max-w-md mx-auto mb-10 font-medium">
            {isGuest
              ? "You haven't made any reservations yet. Use our AI Concierge to find the perfect room!"
              : "No bookings match the selected filter."}
          </p>
          {isGuest && (
            <a
              href="/dashboard"
              className="bg-forest text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-xl shadow-forest/20 flex items-center gap-3"
            >
              EXPLORE ROOMS <ArrowRight size={14} />
            </a>
          )}
        </div>
      )}

      <div className="bg-forest p-10 rounded-[3rem] text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold mb-2">Need to change your dates?</h3>
            <p className="text-white/60 text-sm font-medium">Contact our 24/7 support line or use the AI chat to request a rescheduling.</p>
          </div>
          <button
            onClick={() => toast("Our support team is available 24/7 at +251-11-123-4567", { icon: "📞" })}
            className="bg-white text-forest px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            CONTACT SUPPORT
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-resort-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>
    </div>
  );
};

export default BookingsPage;
