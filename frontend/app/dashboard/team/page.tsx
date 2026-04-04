"use client";

import { useState, useEffect } from "react";
import { Sparkles, Users, Clock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { mockStaff } from "../../lib/mockData";
import { getTasks, TASKS_UPDATED_EVENT } from "../../lib/taskStore";

const DEPARTMENTS = [
  { name: "Housekeeping", emoji: "🛏️" },
  { name: "F&B", emoji: "🍽️" },
  { name: "Security", emoji: "🔒" },
  { name: "Reception", emoji: "🏨" },
  { name: "Maintenance", emoji: "🔧" },
  { name: "Spa", emoji: "💆" },
];

const MOCK_TASKS_COMPLETED = [14, 11, 8, 12, 9, 7, 10, 6];
const MOCK_RATINGS = [5, 4, 4, 5, 3, 4, 4, 3];

export default function TeamPage() {
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const calc = () => setCompletedTasks(getTasks().filter((t) => t.status === "completed").length);
    calc();
    window.addEventListener(TASKS_UPDATED_EVENT, calc);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, calc);
  }, []);

  const getDeptStaff = (dept: string) => mockStaff.filter((s) => s.department === dept);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black text-forest tracking-tight">Team Overview.</h1>
        <p className="text-neutral-500 mt-2 font-medium">Manage shift scheduling and performance tracking.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Team Size", value: mockStaff.length, icon: <Users className="text-forest" size={20} />, sub: "Staff members" },
          { label: "On Duty Now", value: 6, icon: <Clock className="text-resort-green" size={20} />, sub: "Currently active" },
          { label: "Tasks Completed Today", value: completedTasks, icon: <CheckCircle2 className="text-blue-500" size={20} />, sub: "Via OpsFlow" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
            <div className="p-3 bg-neutral-50 rounded-2xl w-fit mb-4">{s.icon}</div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-forest">{s.value}</p>
            <p className="text-[10px] text-neutral-400 font-medium mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Department Cards */}
      <div>
        <h2 className="text-2xl font-black text-forest mb-6">Departments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.map((dept) => {
            const deptStaff = getDeptStaff(dept.name);
            const isActive = deptStaff.length > 0;
            return (
              <div key={dept.name} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{dept.emoji}</span>
                    <div>
                      <h3 className="font-black text-forest">{dept.name}</h3>
                      <p className="text-[10px] text-neutral-400 font-medium">{deptStaff.length} staff</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                    {isActive ? "Active" : "Standby"}
                  </span>
                </div>
                {deptStaff.slice(0, 2).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-resort-green/20 flex items-center justify-center text-[10px] font-black text-resort-green">
                      {s.name[0]}
                    </div>
                    <span className="text-xs font-medium text-neutral-600">{s.name}</span>
                  </div>
                ))}
                <button
                  onClick={() => toast(`Schedule generated for ${dept.name} team ✓`, { icon: "📅" })}
                  className="mt-4 w-full bg-neutral-50 border border-neutral-100 text-forest py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all"
                >
                  Schedule
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white rounded-[3rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-50">
          <h2 className="text-xl font-black text-forest">Performance Tracker</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-50">
                {["Staff Name", "Department", "Tasks Completed", "Rating", "Status"].map((h) => (
                  <th key={h} className="text-left px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockStaff.map((staff, idx) => {
                const tasksCount = MOCK_TASKS_COMPLETED[idx] ?? 5;
                const rating = MOCK_RATINGS[idx] ?? 4;
                const isOnShift = idx % 2 === 0;
                return (
                  <tr key={staff.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-resort-green flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                          {staff.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="font-bold text-forest text-sm">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-neutral-500">{staff.department}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="font-black text-forest">{tasksCount}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`text-sm ${s <= rating ? "text-resort-yellow" : "text-neutral-200"}`}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isOnShift ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-400"}`}>
                        {isOnShift ? "On Shift" : "Off Duty"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Performance Summary */}
      <div className="bg-forest rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-resort-green/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="text-resort-yellow w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-resort-yellow uppercase tracking-widest">AI Powered</p>
              <h3 className="text-2xl font-black">AI Performance Summary</h3>
            </div>
          </div>
          <p className="text-white/80 font-medium leading-relaxed max-w-3xl mb-8">
            This week&apos;s top performer is <span className="text-resort-yellow font-black">Abebe Bikila</span> with 14 completed tasks and a 5-star guest rating. Housekeeping department leads with{" "}
            <span className="font-black">89% completion rate</span>. Recommend recognizing{" "}
            <span className="text-resort-yellow font-black">Sara Girma (F&B)</span> for 4-star consistency across 11 tasks.
          </p>
          <button
            onClick={() => toast.success("Report sent to admin inbox ✓")}
            className="bg-resort-yellow text-forest px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Generate Performance Report
          </button>
        </div>
      </div>
    </div>
  );
}
