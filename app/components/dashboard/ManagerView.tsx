"use client";

import React from "react";
import DashboardCard from "./DashboardCard";

const ManagerView = () => (
  <section className="space-y-12">
    <header className="mb-12">
      <h1 className="text-3xl font-extrabold text-forest tracking-tight">
        Resort Performance.
      </h1>
      <p className="text-neutral-500 mt-2 font-light">
        Review bookings, team performance, and guest feedback.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <DashboardCard 
        title="Active Bookings" 
        value="122" 
        desc="Confirmed for this week"
        trend="+18%"
      />
      <DashboardCard 
        title="Pending Approvals" 
        value="4" 
        desc="Staff requests, supplier logs"
      />
      <DashboardCard 
        title="Guest Feedback" 
        value="4.8" 
        desc="Average score (current month)"
        trend="+0.2%"
      />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-forest">Upcoming Arrivals</h3>
        <ArrivalItem name="John Doe" room="Suite 405" guests={2} time="10:30 AM" />
        <ArrivalItem name="Jane Smith" room="Villa 12" guests={4} time="11:15 AM" />
        <ArrivalItem name="Chris Brown" room="Deluxe 202" guests={1} time="01:00 PM" />
      </div>

      <div className="bg-resort-green/5 p-8 rounded-3xl border border-resort-green/10">
        <h3 className="text-xl font-bold mb-6 text-forest">Team Shift Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {["Housekeeping", "F&B", "Security", "Reception"].map(dept => (
            <div key={dept} className="p-4 bg-white rounded-2xl border border-neutral-100 text-center">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 truncate">{dept}</p>
              <p className="text-lg font-extrabold text-resort-green">8 / 10</p>
            </div>
          ))}
        </div>
        <button className="w-full bg-resort-green text-white py-4 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-forest transition-all">
          MANAGE SHIFT SCHEDULE
        </button>
      </div>
    </div>
  </section>
);

const ArrivalItem = ({ name, room, guests, time }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 px-4 rounded-xl transition-all gap-4">
    <div>
      <p className="text-sm font-bold text-forest">{name}</p>
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{room} | {guests} Guests</p>
    </div>
    <span className="text-xs font-bold text-resort-green w-fit">{time}</span>
  </div>
);

export default ManagerView;
