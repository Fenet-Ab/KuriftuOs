"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-resort-green" : "bg-neutral-200"}`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

export default function SettingsPage() {
  const [role, setRole] = useState("guest");
  const [language, setLanguage] = useState("English");
  const [notifs, setNotifs] = useState({ tasks: true, guests: true, revenue: true });
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setRole(parsed.role || "guest");
      setLanguage(parsed.language_pref || "English");
    }
    const storedNotifs = localStorage.getItem("kuriftu_notifs");
    if (storedNotifs) setNotifs(JSON.parse(storedNotifs));
  }, []);

  const savePreferences = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      localStorage.setItem("user", JSON.stringify({ ...parsed, language_pref: language }));
    }
    localStorage.setItem("kuriftu_notifs", JSON.stringify(notifs));
    toast.success("Settings saved!");
  };

  const isManagerOrAdmin = ["manager", "admin"].includes(role);
  const isAdmin = role === "admin";

  const roleSubtext: Record<string, string> = {
    guest: "Customize your stay experience and notification preferences.",
    staff: "Manage your shift preferences and task notification settings.",
    manager: "Configure team settings, resort options, and your preferences.",
    admin: "Full system configuration — API keys, diagnostics, and all resort settings.",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-20">
      <header>
        <h1 className="text-4xl font-black text-forest tracking-tight">Settings.</h1>
        <p className="text-neutral-500 mt-2 font-medium">{roleSubtext[role] || roleSubtext.guest}</p>
      </header>

      {/* Section 1: Appearance & Preferences */}
      <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm space-y-8">
        <div>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Section 1</p>
          <h2 className="text-xl font-black text-forest">Appearance &amp; Preferences</h2>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest appearance-none"
          >
            <option>English</option>
            <option>Amharic</option>
            <option>French</option>
          </select>
        </div>

        <div className="space-y-5">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Notifications</p>
          {[
            { key: "tasks" as const, label: "Task assignment alerts", desc: "Get notified when tasks are assigned to you" },
            { key: "guests" as const, label: "Guest request notifications", desc: "Real-time alerts for guest service requests" },
            ...(isManagerOrAdmin ? [{ key: "revenue" as const, label: "Revenue alerts from RevSense", desc: "Pricing recommendations and revenue events" }] : []),
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 border-b border-neutral-50 last:border-0">
              <div>
                <p className="font-bold text-forest text-sm">{label}</p>
                <p className="text-[10px] text-neutral-400 font-medium mt-0.5">{desc}</p>
              </div>
              <Toggle checked={notifs[key]} onChange={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))} />
            </div>
          ))}
        </div>

        <button
          onClick={savePreferences}
          className="bg-forest text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/10"
        >
          Save Preferences
        </button>
      </div>

      {/* Section 2: Resort Configuration (manager/admin only) */}
      {isManagerOrAdmin && (
        <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm space-y-8">
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Section 2</p>
            <h2 className="text-xl font-black text-forest">Resort Configuration</h2>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Resort Name</label>
            <input
              readOnly
              value="Kuriftu Resorts & Spa"
              className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-forest opacity-70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Active Locations</label>
            <div className="space-y-2">
              {["Bishoftu", "Entoto", "Lake Tana", "Awash", "Kuriftu Village"].map((loc) => (
                <div key={loc} className="flex items-center gap-3 py-2 px-4 bg-neutral-50 rounded-xl border border-neutral-100">
                  <CheckSquare size={16} className="text-resort-green flex-shrink-0" />
                  <span className="font-bold text-forest text-sm">{loc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Default Currency</label>
              <input readOnly value="ETB — Ethiopian Birr" className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-forest opacity-70 cursor-not-allowed" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">AI Model</label>
              <div className="flex items-center h-[46px] px-4 rounded-xl border border-neutral-100 bg-neutral-50">
                <span className="bg-resort-green/10 text-resort-green px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Gemini 2.0 Flash
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast.success("Settings saved!")}
            className="bg-forest text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/10"
          >
            Save Configuration
          </button>
        </div>
      )}

      {/* Section 3: System & API (admin only) */}
      {isAdmin && (
        <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 shadow-sm space-y-8">
          <div>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Section 3</p>
            <h2 className="text-xl font-black text-forest">System &amp; API</h2>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Gemini API Key</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                readOnly
                value="sk-••••••••••••••••"
                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 font-bold text-forest opacity-80 pr-16 cursor-not-allowed"
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-forest transition-colors"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">System Uptime</p>
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-black">99.98%</span>
            </div>
            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Last Backup</p>
              <p className="font-bold text-forest text-sm">Today at 03:00 AM</p>
              <p className="text-[10px] text-resort-green font-black">Secured ✓</p>
            </div>
          </div>

          <button
            onClick={() => toast.success("All systems operational ✓ — No issues detected")}
            className="w-full bg-neutral-50 border border-neutral-100 text-forest py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-all"
          >
            Run System Diagnostics
          </button>

          <button
            onClick={() => toast.success("Settings saved!")}
            className="bg-forest text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-lg shadow-forest/10"
          >
            Save System Settings
          </button>
        </div>
      )}
    </div>
  );
}
