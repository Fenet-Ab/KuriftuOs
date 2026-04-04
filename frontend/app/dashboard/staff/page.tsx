"use client";

import { useState, useEffect } from "react";
import { Sparkles, Search, Users, Clock, Building2, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { mockStaff } from "../../lib/mockData";
import { addTask } from "../../lib/taskStore";

const DEPARTMENTS = ["All", "Housekeeping", "F&B", "Security", "Reception", "Maintenance", "Spa"];

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [tasks, setTasks] = useState<Record<number, number>>({});

  useEffect(() => {
    // track how many tasks assigned per staff in this session
    const stored = sessionStorage.getItem("staff_assigned_tasks");
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  const filtered = mockStaff.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = dept === "All" || s.department === dept;
    return matchSearch && matchDept;
  });

  const handleAssignTask = (staff: typeof mockStaff[0]) => {
    addTask({
      category: "General",
      description: `New task assigned to ${staff.name}`,
      priority: "normal",
      status: "new",
      assigned_to: staff.id,
    });
    const updated = { ...tasks, [staff.id]: (tasks[staff.id] || 0) + 1 };
    setTasks(updated);
    sessionStorage.setItem("staff_assigned_tasks", JSON.stringify(updated));
    toast.success(`Task assigned to ${staff.name}`);
  };

  const handleView = (staff: typeof mockStaff[0]) => {
    toast(`${staff.name} — ${staff.department} · ${staff.location}`, { icon: "👤" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-forest tracking-tight">Staff Management.</h1>
          <p className="text-neutral-500 mt-2 font-medium">Monitor team status, shift assignments, and performance across all locations.</p>
        </div>
        <div className="bg-neutral-50 px-6 py-3 rounded-2xl border border-neutral-100 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-resort-green animate-pulse" />
          <span className="text-[10px] font-black text-forest uppercase tracking-widest">{mockStaff.length} TEAM MEMBERS</span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Staff", value: mockStaff.length, icon: <Users className="text-forest" size={20} />, sub: "Across all depts" },
          { label: "On Shift", value: 38, icon: <Clock className="text-resort-green" size={20} />, sub: "Currently active" },
          { label: "Departments", value: 6, icon: <Building2 className="text-blue-500" size={20} />, sub: "Active units" },
          { label: "Avg Performance", value: "91%", icon: <TrendingUp className="text-resort-yellow" size={20} />, sub: "This week" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
            <div className="p-3 bg-neutral-50 rounded-2xl w-fit mb-4">{s.icon}</div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-3xl font-black text-forest">{s.value}</p>
            <p className="text-[10px] text-neutral-400 font-medium mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or department..."
            className="w-full pl-12 pr-6 py-3 bg-white border border-neutral-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/10 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                dept === d ? "bg-forest text-white border-forest" : "bg-white text-neutral-500 border-neutral-100 hover:border-forest/30"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-[3rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-50">
          <h2 className="text-xl font-black text-forest">Team Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-50">
                {["Staff Member", "Department", "Location", "Role", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-8 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((staff, idx) => {
                const isOnShift = idx % 2 === 0;
                return (
                  <tr key={staff.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-resort-green flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {staff.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-forest text-sm">{staff.name}</p>
                          <p className="text-[10px] text-neutral-400">{staff.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-medium text-forest">{staff.department}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-neutral-500">{staff.location}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        isOnShift ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-400"
                      }`}>
                        {isOnShift ? "On Shift" : "Off Duty"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(staff)}
                          className="px-4 py-2 bg-neutral-50 text-forest border border-neutral-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleAssignTask(staff)}
                          className="px-4 py-2 bg-forest text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest/90 transition-all"
                        >
                          Assign Task
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Shift Optimizer */}
      <div className="bg-forest rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-resort-green/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="text-resort-yellow w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-resort-yellow uppercase tracking-widest">AI Powered</p>
              <h3 className="text-2xl font-black">AI Shift Recommendation</h3>
            </div>
          </div>
          <p className="text-white/80 font-medium leading-relaxed max-w-3xl mb-8">
            Based on current occupancy (77%) and upcoming Fasika weekend demand, recommend scheduling{" "}
            <span className="text-resort-yellow font-black">4 additional housekeeping staff</span> and{" "}
            <span className="text-resort-yellow font-black">2 F&B staff</span> for Apr 16–19.{" "}
            Projected cost: +18,400 ETB. Expected revenue uplift: +127,000 ETB.
          </p>
          <button
            onClick={() => toast.success("Shift schedule generated and sent to department heads ✓")}
            className="bg-resort-yellow text-forest px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Generate Full Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
