"use client";

import React, { useState } from "react";
import DashboardCard from "./DashboardCard";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const ReservationItem = ({ location, date, status } : { location: string, date: string, status: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl bg-neutral-50/50 border border-neutral-100 group hover:shadow-lg hover:shadow-neutral-200/50 transition-all mb-4 last:border-0 hover:bg-neutral-50 group gap-4">
    <div>
      <p className="text-sm font-bold text-forest">{location}</p>
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider mt-1">{date}</p>
    </div>
    <span className={`
      w-fit px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
      ${status === 'Confirmed' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-yellow-100 text-yellow-600 border border-yellow-200'}
    `}>
      {status}
    </span>
  </div>
);

const GuestView = () => {
  const [searchData, setSearchData] = useState({
    check_in: "",
    check_out: "",
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchData.check_in || !searchData.check_out) {
      return toast.error("Please select both dates");
    }

    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/rooms/rooms/search?check_in=${searchData.check_in}&check_out=${searchData.check_out}`);
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data);
        if (data.length === 0) toast.error("No rooms available for these dates");
      }
    } catch (err) {
      toast.error("Failed to search rooms");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="space-y-12 pb-20">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-forest tracking-tight">
          Resort Experience.
        </h1>
        <p className="text-neutral-500 mt-2 font-light">
          Your ultimate stay starts here. How can we assist you today?
        </p>
      </header>

      {/* Room Search Section */}
      <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-2xl shadow-neutral-100/50 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-resort-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <h3 className="text-2xl font-black text-forest mb-8 flex items-center gap-3 relative z-10">
          <Search className="text-resort-green w-6 h-6" />
          Find Your Perfect Room
        </h3>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Check-in Date & Time</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
              <input 
                type="datetime-local" 
                value={searchData.check_in}
                onChange={(e) => setSearchData({...searchData, check_in: e.target.value})}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Check-out Date & Time</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
              <input 
                type="datetime-local" 
                value={searchData.check_out}
                onChange={(e) => setSearchData({...searchData, check_out: e.target.value})}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-neutral-50 border border-neutral-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={isSearching}
              className="w-full bg-forest text-white py-4 rounded-2xl font-bold tracking-widest text-[10px] uppercase hover:bg-forest/90 transition-all shadow-xl shadow-forest/20 flex items-center justify-center gap-2"
            >
              {isSearching ? "Searching..." : (
                <>
                  CHECK AVAILABILITY <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {searchResults.map((cat: any) => (
              <div key={cat.id} className="p-6 rounded-[2rem] border border-neutral-100 hover:border-resort-green/20 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-forest capitalize">{cat.name}</h4>
                    <p className="text-xs text-neutral-400">{cat.available_rooms} rooms left</p>
                  </div>
                  <p className="text-lg font-black text-resort-green">${cat.price_per_night}<span className="text-[10px] font-normal text-neutral-400">/night</span></p>
                </div>
                <button className="w-full py-3 rounded-xl border border-resort-green/30 text-resort-green text-[10px] font-black uppercase tracking-widest group-hover:bg-resort-green group-hover:text-white transition-all">
                  BOOK THIS ROOM
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <DashboardCard 
          title="Active Reservation" 
          value="Bishoftu" 
          desc="Check-in: Apr 15, Suite 305"
          color="bg-resort-green"
        />
        <DashboardCard 
          title="Membership Status" 
          value="Gold Elite" 
          desc="1,200 points to Platinum"
          color="bg-resort-yellow"
          trend="4.8K"
        />
        <DashboardCard 
          title="AI Concierge Activity" 
          value="8 Requests" 
          desc="Last: Room service confirmed"
          color="bg-forest"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden group">
          <h3 className="text-xl font-bold mb-8 text-forest flex items-center gap-2">
             <span>📅</span> Upcoming Highlights
          </h3>
          <ReservationItem 
              location="Kuriftu Resort & Spa Bishoftu"
              date="Apr 15 - Apr 18"
              status="Confirmed"
          />
          <ReservationItem 
              location="Entoto Park Resort"
              date="May 10 - May 12"
              status="Pending"
          />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-resort-green/5 rounded-full blur-3xl" />
        </div>

        <div className="bg-resort-green p-10 rounded-3xl text-white flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
             <h3 className="text-2xl font-bold mb-4">Selam AI</h3>
             <p className="text-white/70 text-sm font-light mb-8">
               Talk to our AI Concierge for anything during your stay — from booking a massage to ordering late-night snacks.
             </p>
             <button className="w-full bg-white text-resort-green py-5 rounded-2xl font-bold tracking-widest text-xs uppercase hover:bg-neutral-100 transition-all shadow-xl group">
               OPEN AI CONCIERGE 
               <span className="inline-block transition-transform group-hover:translate-x-2 ml-2">→</span>
             </button>
          </div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
        </div>
      </div>
    </section>
  );
};

export default GuestView;
