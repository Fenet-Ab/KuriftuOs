"use client";

import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import Link from "next/link";
import { getTasks, TASKS_UPDATED_EVENT } from "../../lib/taskStore";
import { mockAnalytics, mockRecentLogins, mockStaff } from "../../lib/mockData";

const AdminView = () => {
  const [tasks, setTasks] = useState(getTasks());

  useEffect(() => {
    const reload = () => setTasks(getTasks());
    window.addEventListener(TASKS_UPDATED_EVENT, reload);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, reload);
  }, []);

  const activeTasks = tasks.filter((t) => ["new", "in_progress"].includes(t.status)).length;

  return (
    <section className="space-y-12">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-forest tracking-tight">System Overview.</h1>
        <p className="text-neutral-500 mt-2 font-light">Manage your resort assets, staff, and system performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <DashboardCard
          title="Total Revenue (Daily)"
          value={`${(mockAnalytics.dailyRevenue / 1000).toFixed(0)}K ETB`}
          desc="Integrated from all resorts"
          trend="+12%"
        />
        <DashboardCard
          title="Total Active Guests"
          value={String(mockAnalytics.activeGuests)}
          desc="Across 5 Kuriftu locations"
          trend="+5%"
        />
        <DashboardCard
          title="Active Staff"
          value={String(mockAnalytics.activeStaff)}
          desc={`${mockAnalytics.totalStaff} total · ${mockAnalytics.activeStaff} on shift`}
        />
        <DashboardCard
          title="Active Tasks"
          value={String(activeTasks)}
          desc={`${tasks.filter(t => t.status === "completed").length} completed today`}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-forest">Recent Staff Logins</h3>
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{mockStaff.length} total staff</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100">
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4">Location</th>
                  <th className="pb-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {mockRecentLogins.map((login, i) => (
                  <StaffLoginItem key={i} name={login.name} role={login.role} location={login.location} time={login.time} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-forest p-8 rounded-3xl text-white">
          <h3 className="text-xl font-bold mb-6">System Health</h3>
          <div className="space-y-6">
            <HealthItem label="AI Concierge (Selam)" status="Active" />
            <HealthItem label="OpsFlow Engine" status="Active" />
            <HealthItem label="RevSense Module" status="Active" />
            <HealthItem label="Guest Portal" status="Active" />
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Task Completion Rate</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-resort-yellow rounded-full" style={{ width: `${mockAnalytics.taskCompletionRate}%` }} />
              </div>
              <span className="text-resort-yellow font-black text-sm">{mockAnalytics.taskCompletionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/revsense" className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-resort-green/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <h4 className="font-bold text-forest mb-1">RevSense</h4>
          <p className="text-xs text-neutral-400">Dynamic pricing & revenue analytics</p>
        </Link>
        <Link href="/dashboard/tasks" className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <h4 className="font-bold text-forest mb-1">OpsFlow</h4>
          <p className="text-xs text-neutral-400">{activeTasks} active tasks · live queue</p>
        </Link>
        <Link href="/dashboard/rooms/add" className="group p-6 bg-white rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all">
          <div className="w-12 h-12 bg-resort-yellow/10 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl">🏨</span>
          </div>
          <h4 className="font-bold text-forest mb-1">Add Room</h4>
          <p className="text-xs text-neutral-400">Manage room inventory</p>
        </Link>
      </div>
    </section>
  );
};

const StaffLoginItem = ({ name, role, location, time }: { name: string; role: string; location: string; time: string }) => (
  <tr>
    <td className="py-4 text-sm font-bold text-forest">{name}</td>
    <td className="py-4 text-xs text-neutral-500 uppercase tracking-widest font-medium">{role}</td>
    <td className="py-4 text-xs font-bold text-resort-green">{location}</td>
    <td className="py-4 text-xs text-neutral-400 font-medium">{time}</td>
  </tr>
);

const HealthItem = ({ label, status }: { label: string; status: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/70 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      <span className="text-xs font-bold text-resort-yellow">{status}</span>
    </div>
  </div>
);

export default AdminView;
