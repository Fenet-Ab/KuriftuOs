"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Bed, Clock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const ReservationItem = ({ location, date, status, roomType, price }: { location: string, date: string, status: string, roomType: string, price: number }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2.5rem] bg-white border border-neutral-100 group hover:shadow-2xl hover:shadow-neutral-200/50 transition-all mb-6 last:border-0 hover:-translate-y-1 gap-6">
    <div className="flex items-center gap-6">
      <div className={`p-4 rounded-2xl ${status.toLowerCase() === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
        <Bed size={24} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black text-resort-green uppercase tracking-[0.2em]">{roomType} Room</p>
          {status.toLowerCase() === 'confirmed' && <ShieldCheck size={12} className="text-green-500" />}
        </div>
        <h4 className="text-xl font-bold text-forest">{location}</h4>
        <p className="text-xs text-neutral-400 font-medium mt-1 flex items-center gap-2">
          <Calendar size={12} /> {date}
        </p>
      </div>
    </div>
    
    <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0 border-neutral-50">
      <div className="text-right">
        <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Total Paid</p>
        <p className="text-lg font-black text-forest">${price}</p>
      </div>
      <span className={`
        px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border
        ${status.toLowerCase() === 'confirmed' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-yellow-100 text-yellow-600 border-yellow-200'}
      `}>
        {status}
      </span>
    </div>
  </div>
);

const BookingsPage = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            fetchBookings();
        }
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`http://localhost:8000/api/v1/bookings/my-bookings`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setBookings(data);
            }
        } catch (err) {
            toast.error("Failed to sync bookings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <header className="mb-12 flex justify-between items-end">
                <div>
                  <h1 className="text-4xl font-black text-forest tracking-tight">My Bookings.</h1>
                  <p className="text-neutral-500 mt-2 font-medium">Manage your stays and view transaction history.</p>
                </div>
                <div className="bg-neutral-50 px-6 py-3 rounded-2xl border border-neutral-100 flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-resort-green animate-pulse" />
                   <span className="text-[10px] font-black text-forest uppercase tracking-widest">{bookings.length} RESERVATIONS</span>
                </div>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-resort-green/20 border-t-resort-green rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Fetching your itinerary...</p>
                </div>
            ) : bookings.length > 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {bookings.map((booking: any) => (
                        <ReservationItem 
                            key={booking.id}
                            location={`Kuriftu Resort & Spa`}
                            roomType={booking.room_type}
                            date={`${new Date(booking.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(booking.check_out).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                            status={booking.status}
                            price={booking.total_price || 0}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-neutral-100 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-6">
                       <AlertCircle className="text-neutral-300 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-forest mb-2">No Bookings Found</h3>
                    <p className="text-neutral-400 max-w-md mx-auto mb-10 font-medium">
                      You haven&apos;t made any reservations yet. Use our AI Concierge to find the perfect room based on your vibe!
                    </p>
                    <a 
                      href="/dashboard"
                      className="bg-forest text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-xl shadow-forest/20 flex items-center gap-3"
                    >
                      EXPLORE ROOMS <ArrowRight size={14} />
                    </a>
                </div>
            )}

            <div className="bg-forest p-10 rounded-[3rem] text-white relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="max-w-md">
                     <h3 className="text-2xl font-bold mb-2">Need to change your dates?</h3>
                     <p className="text-white/60 text-sm font-medium">Contact our 24/7 support line or use the AI chat to request a rescheduling.</p>
                  </div>
                  <button className="bg-white text-forest px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                      CONTACT SUPPORT
                  </button>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-resort-green/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </div>
        </div>
    );
};

export default BookingsPage;
