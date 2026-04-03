"use client";

import React from "react";
import DashboardCard from "./DashboardCard";

const AdminView = () => (
  <section className="space-y-12">
    <header className="mb-12">
      <h1 className="text-3xl font-extrabold text-forest tracking-tight">
        System Overview.
      </h1>
      <p className="text-neutral-500 mt-2 font-light">
        Manage your resort assets, staff, and system performance.
      </p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
      <DashboardCard 
        title="Total Revenue (Daily)" 
        value="$24,500" 
        desc="Integrated from all resorts"
        trend="+12%"
      />
      <DashboardCard 
        title="Total Active Guests" 
        value="480" 
        desc="Across 5 Kuriftu locations"
        trend="+5%"
      />
      <DashboardCard 
        title="Active Staff" 
        value="122" 
        desc="72 currently on shift"
      />
      <DashboardCard 
        title="System Uptime" 
        value="99.98%" 
        desc="Last check: 2 mins ago"
      />
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-forest">Recent Staff Logins</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-4">
                <th className="pb-4">Name</th>
                <th className="pb-4">Role</th>
                <th className="pb-4">Location</th>
                <th className="pb-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              <StaffLoginItem name="Abebe Bikila" role="Manager" location="Bishoftu" time="09:12 AM" />
              <StaffLoginItem name="Sara Girma" role="Staff" location="Entoto" time="09:05 AM" />
              <StaffLoginItem name="Dawit Kebede" role="Admin" location="Head Office" time="08:45 AM" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-forest p-8 rounded-3xl text-white">
        <h3 className="text-xl font-bold mb-6">System Health</h3>
        <div className="space-y-6">
          <HealthItem label="API Connections" status="Active" />
          <HealthItem label="Database Backup" status="Secured" />
          <HealthItem label="Third-Party Integrations" status="Stable" />
        </div>
      </div>
    </div>
  </section>
);

const StaffLoginItem = ({ name, role, location, time }: any) => (
  <tr>
    <td className="py-4 text-sm font-bold text-forest">{name}</td>
    <td className="py-4 text-xs text-neutral-500 uppercase tracking-widest font-medium">{role}</td>
    <td className="py-4 text-xs font-bold text-resort-green">{location}</td>
    <td className="py-4 text-xs text-neutral-400 font-medium">{time}</td>
  </tr>
);

const HealthItem = ({ label, status }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-white/70 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-bold text-resort-yellow">{status}</span>
  </div>
);

export default AdminView;
