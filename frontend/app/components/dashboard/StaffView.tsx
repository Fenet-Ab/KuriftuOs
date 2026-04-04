"use client";

import { useEffect, useState } from "react";
import DashboardCard from "./DashboardCard";
import { getTasks, TASKS_UPDATED_EVENT } from "../../lib/taskStore";
import Link from "next/link";

const StaffView = () => {
  const [tasks, setTasks] = useState(getTasks());
  const [user, setUser] = useState<any>(null);
  const [shiftStart] = useState(() => {
    const d = new Date();
    d.setHours(8, 30, 0, 0);
    return d;
  });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));

    const reload = () => setTasks(getTasks());
    window.addEventListener(TASKS_UPDATED_EVENT, reload);

    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => {
      window.removeEventListener(TASKS_UPDATED_EVENT, reload);
      clearInterval(tick);
    };
  }, []);

  const myTasks = tasks.filter((t) => t.status !== "completed").slice(0, 4);
  const pendingCount = tasks.filter((t) => ["new", "in_progress"].includes(t.status)).length;
  const urgentCount = tasks.filter((t) => t.priority === "urgent" && t.status !== "completed").length;

  const elapsed = now.getTime() - shiftStart.getTime();
  const elapsedHours = Math.floor(elapsed / 3600000);
  const elapsedMinutes = Math.floor((elapsed % 3600000) / 60000);
  const shiftDuration = `${String(elapsedHours).padStart(2, "0")}:${String(elapsedMinutes).padStart(2, "0")}`;

  return (
    <section className="space-y-12">
      <header className="mb-12">
        <h1 className="text-3xl font-extrabold text-forest tracking-tight">Service Center.</h1>
        <p className="text-neutral-500 mt-2 font-light">
          {user ? `Welcome, ${user.name.split(" ")[0]}. ` : ""}Manage daily tasks, requests, and guest assistance.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        <DashboardCard title="My Shift Duration" value={shiftDuration} desc="Started at 08:30 AM" />
        <DashboardCard title="Pending Tasks" value={String(pendingCount)} desc={`${urgentCount} urgent priority`} trend={urgentCount > 0 ? `+${urgentCount}` : undefined} />
        <DashboardCard title="Guest Requests" value="14" desc="Average response: 12 min" />
        <DashboardCard title="Performance Score" value="92" desc="Weekly average (Top 5%)" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-forest">My Priority Tasks</h3>
            <Link href="/dashboard/tasks" className="text-[10px] font-black text-resort-green uppercase tracking-widest hover:underline">
              View All →
            </Link>
          </div>
          {myTasks.length > 0 ? myTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task.description}
              time={new Date(task.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              priority={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              category={task.category}
            />
          )) : (
            <div className="py-8 text-center bg-neutral-50 rounded-2xl">
              <p className="text-neutral-400 text-sm">No pending tasks — great work! 🎉</p>
            </div>
          )}
        </div>

        <div className="bg-forest p-8 rounded-3xl text-white relative overflow-hidden">
          <h3 className="text-xl font-bold mb-6">Staff Bulletin</h3>
          <p className="text-white/70 text-sm font-light mb-6">Important updates for the current shift:</p>
          <div className="space-y-4">
            <BulletinItem icon="❗" text="Fasika weekend (Apr 19) — full occupancy expected. All hands on deck." />
            <BulletinItem icon="🎉" text="Monthly target achieved! Exceptional guest satisfaction scores." />
            <BulletinItem icon="🛠️" text="Maintenance: Suite 102 AC being serviced. Guests relocated." />
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
};

const TaskItem = ({ task, time, priority, category }: { task: string; time: string; priority: string; category: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-neutral-50 last:border-0 px-4 rounded-2xl hover:bg-neutral-50 transition-all group gap-4">
    <div className="flex gap-4 items-center">
      <div className={`w-2 h-2 rounded-full shrink-0 ${
        priority === "Urgent" ? "bg-red-500" :
        priority === "High" ? "bg-orange-500" :
        priority === "Normal" ? "bg-resort-yellow" : "bg-green-500"
      }`} />
      <div>
        <p className="text-sm font-bold text-forest">{task}</p>
        <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{category} · {time}</p>
      </div>
    </div>
    <span className={`w-fit text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
      priority === "Urgent" ? "text-red-500 bg-red-50" :
      priority === "High" ? "text-orange-500 bg-orange-50" :
      "text-neutral-400 bg-neutral-100"
    }`}>
      {priority}
    </span>
  </div>
);

const BulletinItem = ({ icon, text }: { icon: string; text: string }) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
    <span className="text-lg shrink-0">{icon}</span>
    <p className="text-xs font-light text-white/90">{text}</p>
  </div>
);

export default StaffView;
