"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Users, Hotel, Star } from "lucide-react";
import { mockGuestFeedback, mockAnalytics } from "../../lib/mockData";
import { getTasks, TASKS_UPDATED_EVENT } from "../../lib/taskStore";

const revenueByLocation = [
  { name: "Bishoftu", value: 112000 },
  { name: "Entoto", value: 68000 },
  { name: "Lake Tana", value: 54000 },
  { name: "Awash", value: 31000 },
  { name: "Kuriftu Village", value: 22500 },
];
const maxRevenue = revenueByLocation[0].value;

const aiInsights = [
  {
    icon: "📈",
    title: "Peak Season Alert",
    body: "Fasika weekend (Apr 19) will drive 38% revenue uplift across all locations. Recommend accepting all RevSense pricing suggestions now.",
    border: "border-resort-yellow",
    time: "AI · 2 min ago",
  },
  {
    icon: "☕",
    title: "Upsell Opportunity",
    body: "Coffee ceremony package has 45 conversions this week — highest of all packages. Suggest featuring it on the guest check-in email.",
    border: "border-resort-green",
    time: "AI · 8 min ago",
  },
  {
    icon: "🔧",
    title: "Maintenance Pattern",
    body: "3 maintenance tasks opened in the last 2 hours. Suite 102 AC issue may indicate HVAC system aging — recommend preventive inspection.",
    border: "border-orange-400",
    time: "AI · 15 min ago",
  },
  {
    icon: "⭐",
    title: "Staff Efficiency",
    body: "Task completion rate is 87%. Top performer: Abebe Bikila (Housekeeping) — 14 tasks completed this week with 0 escalations.",
    border: "border-blue-400",
    time: "AI · 22 min ago",
  },
];

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState(getTasks());

  useEffect(() => {
    const handler = () => setTasks(getTasks());
    window.addEventListener(TASKS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(TASKS_UPDATED_EVENT, handler);
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryCount = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(...Object.values(categoryCount), 1);

  const priorityCount = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const priorityColors: Record<string, string> = {
    urgent: "bg-red-500",
    high: "bg-orange-400",
    normal: "bg-resort-green",
    low: "bg-neutral-300",
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header>
        <h1 className="text-4xl font-black text-forest tracking-tight">All Analytics.</h1>
        <p className="text-neutral-500 mt-2 font-medium">Resort intelligence across all 5 locations</p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Daily Revenue", value: "287,500 ETB", trend: "+12%", icon: <TrendingUp size={20} className="text-resort-green" /> },
          { label: "Active Guests", value: mockAnalytics.activeGuests, trend: "+5%", icon: <Users size={20} className="text-blue-500" /> },
          { label: "Occupancy Rate", value: "77%", trend: "+8%", icon: <Hotel size={20} className="text-resort-yellow" /> },
          { label: "Guest Satisfaction", value: "4.8 / 5", trend: "+0.2", icon: <Star size={20} className="text-orange-400" /> },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-neutral-50 rounded-2xl">{kpi.icon}</div>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black">{kpi.trend}</span>
            </div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-forest">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue by Location + Guest Feedback */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue bars */}
        <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm">
          <h2 className="text-xl font-black text-forest mb-8">Revenue by Location</h2>
          <div className="space-y-5">
            {revenueByLocation.map((loc, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm font-bold text-neutral-500 w-28 flex-shrink-0">{loc.name}</span>
                <div className="flex-1 h-8 bg-neutral-50 rounded-full overflow-hidden border border-neutral-100">
                  <svg width="100%" height="100%">
                    <rect
                      x="0" y="0"
                      width={`${(loc.value / maxRevenue) * 100}%`}
                      height="100%"
                      rx="8"
                      className="fill-resort-green"
                      style={{ opacity: 0.6 + (0.4 * (maxRevenue - loc.value * i * 0.05)) / maxRevenue }}
                    />
                  </svg>
                </div>
                <span className="text-sm font-black text-forest w-32 text-right flex-shrink-0">
                  {loc.value.toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Guest Feedback */}
        <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm">
          <h2 className="text-xl font-black text-forest mb-8">Guest Feedback</h2>
          <div className="space-y-6">
            {mockGuestFeedback.map((fb) => (
              <div key={fb.id} className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= fb.rating ? "text-resort-yellow" : "text-neutral-200"}`}>★</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{fb.location} · {fb.date}</span>
                </div>
                <p className="text-sm text-neutral-600 font-medium leading-relaxed mb-2">"{fb.comment}"</p>
                <p className="text-[10px] font-black text-neutral-500">— {fb.guest}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Overall Sentiment</span>
              <span className="text-[10px] font-black text-resort-green">92% Positive</span>
            </div>
            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-resort-green rounded-full" style={{ width: "92%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-forest rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-resort-green/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Sparkles className="text-resort-yellow w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-resort-yellow uppercase tracking-widest">AI Generated</p>
              <h2 className="text-2xl font-black">AI-Generated Business Intelligence</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((ins, i) => (
              <div key={i} className={`bg-white/5 border-l-4 ${ins.border} p-6 rounded-2xl backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ins.icon}</span>
                  <div>
                    <p className="font-black text-white mb-2">{ins.title}</p>
                    <p className="text-white/70 text-sm leading-relaxed font-medium">{ins.body}</p>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-3">{ins.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Analytics */}
      <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm">
        <h2 className="text-xl font-black text-forest mb-8">OpsFlow Task Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Summary */}
          <div className="space-y-4">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Summary</p>
            {[
              { label: "Total Tasks", value: totalTasks },
              { label: "Completed", value: completedTasks },
              { label: "Active", value: totalTasks - completedTasks },
            ].map((s, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-neutral-50 last:border-0">
                <span className="text-sm font-medium text-neutral-500">{s.label}</span>
                <span className="font-black text-forest">{s.value}</span>
              </div>
            ))}
            <div className="mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Completion Rate</span>
                <span className="text-[10px] font-black text-resort-green">{completionRate}%</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-resort-green rounded-full transition-all" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>

          {/* By Category */}
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">By Category</p>
            <div className="space-y-3">
              {Object.entries(categoryCount).map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-forest">{cat}</span>
                    <span className="text-xs font-black text-neutral-400">{count}</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-resort-green rounded-full" style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">By Priority</p>
            <div className="space-y-3">
              {Object.entries(priorityCount).map(([pri, count]) => (
                <div key={pri} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${priorityColors[pri] || "bg-neutral-300"}`} />
                  <span className="text-xs font-bold text-forest capitalize flex-1">{pri}</span>
                  <span className="font-black text-neutral-400 text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
