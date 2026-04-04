"use client";

import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import Link from "next/link";
import { getTasks, TASKS_UPDATED_EVENT } from "../../lib/taskStore";
import { mockAnalytics, mockArrivals, mockStaff } from "../../lib/mockData";

const ManagerView = () => {
  const [tasks, setTasks] = useState(getTasks());

  useEffect(() => {
    const reload = () => setTasks(getTasks());
    window.addEventListener(TASKS_UPDATED_EVENT, reload);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, reload);
  }, []);

  const activeTasks = tasks.filter((t) => ["new", "in_progress"].includes(t.status)).length;
  const staffOnShift = mockStaff.filter((s) => s.role === "staff").length;

  const deptCounts: Record<string, { on: number; total: number }> = {
    Housekeeping: { on: 7, total: 10 },
    "F&B": { on: 6, total: 8 },
    Security: { on: 3, total: 4 },
    Reception: { on: 4, total: 5 },
  };

  return (
    <section className="space-y-12">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-forest tracking-tight">Resort Performance.</h1>
        <p className="text-neutral-500 mt-2 font-light">Review bookings, team performance, and guest feedback.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <DashboardCard
          title="Active Bookings"
          value={String(mockAnalytics.activeBookings)}
          desc="Confirmed for this week"
          trend="+18%"
        />
        <DashboardCard
          title="Active Tasks"
          value={String(activeTasks)}
          desc={`${tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length} urgent pending`}
          trend={activeTasks > 5 ? `+${activeTasks}` : undefined}
        />
        <DashboardCard
          title="Guest Feedback"
          value={String(mockAnalytics.guestFeedback)}
          desc="Average score (current month)"
          trend="+0.2"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-forest">Upcoming Arrivals</h3>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{mockArrivals.length} today</span>
          </div>
          {mockArrivals.map((arrival, i) => (
            <ArrivalItem key={i} name={arrival.name} room={arrival.room} guests={arrival.guests} time={arrival.time} location={arrival.location} />
          ))}
        </div>

        <div className="bg-resort-green/5 p-8 rounded-3xl border border-resort-green/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-forest">Team Shift Status</h3>
            <span className="text-[10px] font-black text-resort-green uppercase tracking-widest">{staffOnShift} on duty</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Object.entries(deptCounts).map(([dept, counts]) => (
              <div key={dept} className="p-4 bg-white rounded-2xl border border-neutral-100 text-center">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 truncate">{dept}</p>
                <p className="text-lg font-extrabold text-resort-green">{counts.on} / {counts.total}</p>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/tasks"
            className="block w-full bg-resort-green text-white py-4 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-forest transition-all text-center"
          >
            VIEW TASK QUEUE
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/revsense" className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-resort-green/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-resort-green/20 transition-colors">
            <span className="text-2xl">📈</span>
          </div>
          <h4 className="font-bold text-forest mb-1">RevSense Panel</h4>
          <p className="text-xs text-neutral-400">Dynamic pricing & upsell analytics</p>
        </Link>
        <Link href="/dashboard/tasks" className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <span className="text-2xl">📋</span>
          </div>
          <h4 className="font-bold text-forest mb-1">OpsFlow Tasks</h4>
          <p className="text-xs text-neutral-400">{activeTasks} active tasks right now</p>
        </Link>
        <div className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all cursor-pointer"
          onClick={() => window.dispatchEvent(new CustomEvent("open-kuriftu-ai"))}
        >
          <div className="w-12 h-12 bg-resort-yellow/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-resort-yellow/20 transition-colors">
            <span className="text-2xl">✨</span>
          </div>
          <h4 className="font-bold text-forest mb-1">Selam AI</h4>
          <p className="text-xs text-neutral-400">Ask AI for operational insights</p>
        </div>
      </div>
    </section>
  );
};

const ArrivalItem = ({ name, room, guests, time, location }: { name: string; room: string; guests: number; time: string; location: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 px-4 rounded-xl transition-all gap-4">
    <div>
      <p className="text-sm font-bold text-forest">{name}</p>
      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{room} · {guests} guests · {location}</p>
    </div>
    <span className="text-xs font-bold text-resort-green w-fit">{time}</span>
  </div>
);

export default ManagerView;
