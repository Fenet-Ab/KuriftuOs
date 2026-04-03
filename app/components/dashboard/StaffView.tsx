"use client";

import React from "react";
import DashboardCard from "./DashboardCard";

const StaffView = () => (
  <section className="space-y-12">
    <header className="mb-12">
      <h1 className="text-3xl font-extrabold text-forest tracking-tight">
        Service Center.
      </h1>
      <p className="text-neutral-500 mt-2 font-light">
        Manage daily tasks, requests, and guest assistance.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      <DashboardCard 
        title="My Shift Duration" 
        value="04:22" 
        desc="Started at 08:30 AM"
      />
      <DashboardCard 
        title="Pending Tasks" 
        value="8" 
        desc="5 high priority tasks"
        trend="+2"
      />
      <DashboardCard 
        title="Guest Requests" 
        value="14" 
        desc="Average response: 12 min"
      />
      <DashboardCard 
        title="Performance Score" 
        value="92" 
        desc="Weekly average (Top 5%)"
      />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-forest">My Priority Tasks</h3>
        <TaskItem task="Deliver fresh towels to Room 302" time="09:45 AM" priority="High" />
        <TaskItem task="Setup evening mood lighting (Bishoftu Bar)" time="10:15 AM" priority="Normal" />
        <TaskItem task="Inventory check for recreation items" time="11:00 AM" priority="Low" />
        <TaskItem task="Verify Selam AI guest request #482" time="11:30 AM" priority="High" />
      </div>

      <div className="bg-forest p-8 rounded-3xl text-white relative overflow-hidden">
        <h3 className="text-xl font-bold mb-6">Staff Bulletin</h3>
        <p className="text-white/70 text-sm font-light mb-6">Important updates for the current shift:</p>
        <div className="space-y-4">
          <BulletinItem icon="❗" text="New policy for late pool usage updated." />
          <BulletinItem icon="🎉" text="Success: Monthly team target achieved!" />
          <BulletinItem icon="🛠️" text="Maintenance: Suite 102 closed." />
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  </section>
);

const TaskItem = ({ task, time, priority }: any) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-neutral-50 last:border-0 px-4 rounded-2xl hover:bg-neutral-50 transition-all group gap-4">
    <div className="flex gap-4 items-center">
       <div className={`w-2 h-2 rounded-full shrink-0 ${priority === 'High' ? 'bg-red-500' : priority === 'Normal' ? 'bg-resort-yellow' : 'bg-green-500'}`} />
       <div>
         <p className="text-sm font-bold text-forest">{task}</p>
         <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{time}</p>
       </div>
    </div>
    <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${priority === 'High' ? 'text-red-500 bg-red-50' : 'text-neutral-400 bg-neutral-100'}`}>
      {priority}
    </span>
  </div>
);

const BulletinItem = ({ icon, text }: any) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-center">
    <span className="text-lg">{icon}</span>
    <p className="text-xs font-light text-white/90">{text}</p>
  </div>
);

export default StaffView;
