"use client";

import React, { useState } from "react";
import { Sparkles, Calendar, Check, ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const SmartBooking = ({ user }: { user: any }) => {
  const [preferences, setPreferences] = useState({
    check_in: "",
    check_out: "",
    wants_view: false,
    wants_quiet: false,
    wants_luxury: false,
  });
  const [suggestion, setSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleGetSuggestion = async () => {
    if (!preferences.check_in || !preferences.check_out) {
      return toast.error("Please select dates first");
    }

    setLoading(true);
    setSuggestion(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/v1/bookings/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_id: user?.id || 1,
          ...preferences,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.error) {
          toast.error(data.error);
        } else {
          setSuggestion(data);
          toast.success("AI found the perfect room for you!");
        }
      } else {
        throw new Error(data.detail || "Failed to get suggestion");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!suggestion) return;

    setBookingLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Please log in to confirm your booking.");

      // 1. Create Booking
      const bookingRes = await fetch("http://localhost:8000/api/v1/bookings", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          guest_id: user?.guest_id || user?.id || 1,
          room_type: suggestion.room_type,
          check_in: preferences.check_in,
          check_out: preferences.check_out,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.detail || "Booking failed");

      // 2. Initialize Payment
      const checkInDate = new Date(preferences.check_in);
      const checkOutDate = new Date(preferences.check_out);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const totalAmount = suggestion.price_per_night * diffDays;

      const paymentRes = await fetch("http://localhost:8000/api/v1/bookings/pay", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          booking_id: bookingData.id,
          amount: totalAmount, 
          email: user?.email || "guest@example.com",
          first_name: user?.name?.split(" ")[0] || "Guest",
          last_name: user?.name?.split(" ")[1] || "User",
        }),
      });

      const paymentData = await paymentRes.json();
      if (paymentRes.ok && paymentData.data?.checkout_url) {
        toast.success("Redirecting to payment...");
        window.location.href = paymentData.data.checkout_url;
      } else {
        throw new Error(paymentData.message || "Payment initialization failed");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-forest to-forest/90 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-resort-green/20 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Sparkles className="text-resort-yellow w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">AI-Powered Booking</h3>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                  <input 
                    type="datetime-local" 
                    value={preferences.check_in}
                    onChange={(e) => setPreferences({...preferences, check_in: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 focus:outline-none transition-all font-bold text-white placeholder-white/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                  <input 
                    type="datetime-local" 
                    value={preferences.check_out}
                    onChange={(e) => setPreferences({...preferences, check_out: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 focus:bg-white/20 focus:outline-none transition-all font-bold text-white placeholder-white/30"
                  />
                </div>
              </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Preferences</p>
            <div className="space-y-4">
               {[
                 { id: 'wants_view', label: 'Stunning View', icon: '🌅' },
                 { id: 'wants_quiet', label: 'Quiet Area', icon: '🤫' },
                 { id: 'wants_luxury', label: 'Ultra Luxury', icon: '👑' }
               ].map((pref) => (
                 <label key={pref.id} className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                       <span className="text-xl">{pref.icon}</span>
                       <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{pref.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={(preferences as any)[pref.id]}
                      onChange={(e) => setPreferences({...preferences, [pref.id]: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-white/20 bg-white/10 text-resort-green focus:ring-resort-green"
                    />
                 </label>
               ))}
            </div>
          </div>
        </div>

        {!suggestion ? (
          <button 
            onClick={handleGetSuggestion}
            disabled={loading}
            className="w-full bg-resort-yellow text-forest py-5 rounded-2xl font-black tracking-widest text-xs uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                ANALYZING PREFERENCES...
              </>
            ) : (
              <>
                GET PERSONALIZED SUGGESTION <ArrowRight size={16} />
              </>
            )}
          </button>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="p-8 rounded-[2.5rem] bg-white text-forest border border-white/20 shadow-2xl mb-6 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-resort-green/10 rounded-3xl flex items-center justify-center text-3xl">
                    {suggestion.room_type === 'suite' ? '🏰' : suggestion.room_type === 'deluxe' ? '⭐' : '🏠'}
                 </div>
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-resort-green uppercase tracking-widest">Recommended Room</span>
                      <div className="px-2 py-0.5 bg-resort-green text-white text-[8px] font-black rounded-full uppercase">Best Match</div>
                    </div>
                    <h4 className="text-3xl font-black capitalize">{suggestion.room_type} Room</h4>
                    <p className="text-neutral-400 text-sm font-medium mt-1">{suggestion.message}</p>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mb-1">Price Per Night</p>
                  <p className="text-4xl font-black text-forest">${suggestion.price_per_night}</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                  onClick={() => setSuggestion(null)}
                  className="py-5 rounded-2xl border border-white/20 text-white font-bold tracking-widest text-[10px] uppercase hover:bg-white/10 transition-all font-black"
                >
                  RE-PICK PREFERENCES
                </button>
                <button 
                  onClick={handleConfirmBooking}
                  disabled={bookingLoading}
                  className="bg-resort-green text-white py-5 rounded-2xl font-black tracking-widest text-[10px] uppercase hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      CONFIRM & PAY NOW <Check size={16} />
                    </>
                  )}
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartBooking;
