"use client";
import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  desc: string;
  color?: string;
  trend?: string;
}

const DashboardCard = ({ 
  title, 
  value, 
  desc, 
  color = "bg-resort-green",
  trend 
}: DashboardCardProps) => (
  <div className={`bg-white p-8 rounded-3xl shadow-sm border border-neutral-100 border-b-4 hover:border-b-resort-green transition-all group relative overflow-hidden`}>
    <div className="relative z-10">
      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">
        {title}
      </p>
      <div className="flex items-baseline gap-4 mb-2">
        <p className="text-3xl font-extrabold text-forest">
          {value}
        </p>
        {trend && (
           <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
             {trend} 
           </span>
        )}
      </div>
      <p className="text-xs text-neutral-400 font-light">
        {desc}
      </p>
    </div>
    
    {/* Subtle Background Accent */}
    <div className={`absolute -right-4 -bottom-4 w-20 h-20 opacity-5 rounded-full ${color}`} />
  </div>
);

export default DashboardCard;
