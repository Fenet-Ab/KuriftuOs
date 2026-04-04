"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Users,
  Hotel,
  BarChart,
  FileText,
  Calendar,
  Bed,
  Palmtree,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Plus
} from "lucide-react";

interface SidebarProps {
  role: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ role, isOpen, onClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const getNavLinks = () => {
    const baseLinks = [
      { icon: <Home size={20} />, label: "DASHBOARD", path: "/dashboard" },
    ];

    if (role === "admin") {
      return [
        ...baseLinks,
        { icon: <Users size={20} />, label: "STAFF MANAGEMENT", path: "/dashboard/staff" },
        { icon: <Hotel size={20} />, label: "RESORT SETTINGS", path: "/dashboard/settings" },
        { icon: <BarChart size={20} />, label: "ALL ANALYTICS", path: "/dashboard/analytics" },
        { icon: <Plus size={20} />, label: "ADD ROOM", path: "/dashboard/rooms/add" },
        { icon: <FileText size={20} />, label: "TASKS", path: "/dashboard/tasks" },
      ];
    }

    if (role === "manager") {
      return [
        ...baseLinks,
        { icon: <FileText size={20} />, label: "REPORTS", path: "/dashboard/reports" },
        { icon: <Calendar size={20} />, label: "ALL BOOKINGS", path: "/dashboard/bookings" },
        { icon: <Users size={20} />, label: "TEAM", path: "/dashboard/team" },
        { icon: <FileText size={20} />, label: "TASKS", path: "/dashboard/tasks" },
      ];
    }

    if (role === "staff") {
      return [
        ...baseLinks,
        { icon: <Calendar size={20} />, label: "BOOKINGS", path: "/dashboard/bookings" },
        { icon: <Bed size={20} />, label: "ROOM STATUS", path: "/dashboard/roomService" },
        { icon: <FileText size={20} />, label: "TASKS", path: "/dashboard/tasks" },
      ];
    }

    // Default: Guest
    return [
      ...baseLinks,
      { icon: <Calendar size={20} />, label: "MY BOOKINGS", path: "/dashboard/bookings" },
      { icon: <Bed size={20} />, label: "ROOM SERVICE", path: "/dashboard/roomService" },
      // { icon: <Palmtree size={20} />, label: "RECREATION", path: "/dashboard/recreation" },
      { icon: <MessageSquare size={20} />, label: "AI CONCIERGE", path: "/dashboard/ai" },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed lg:sticky top-0 lg:top-20 h-screen lg:h-[calc(100vh-80px)] z-[100] lg:z-40
        bg-white/95 lg:bg-white/90 backdrop-blur-md border-r border-neutral-200 p-4 
        flex flex-col gap-2 transition-all duration-500 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-72 w-72"}
      `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-4 top-4 p-2 text-neutral-400 hover:text-forest transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:text-resort-green hover:border-resort-green transition-all shadow-sm z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className={`mb-6 px-2 transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            Main Menu
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navLinks.map((link) => (
            <SidebarLink
              key={link.label}
              icon={link.icon}
              label={link.label}
              href={link.path}
              active={pathname === link.path}
              isCollapsed={isCollapsed}
              onClose={onClose}
            />
          ))}
        </nav>

        <div className="pt-6 border-t border-neutral-50 mt-auto">
          <div className={`mb-4 px-2 transition-opacity duration-300 ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Account
            </p>
          </div>
          <SidebarLink
            icon={<User size={20} />}
            label="PROFILE"
            href="/dashboard/profile"
            active={pathname === "/dashboard/profile"}
            isCollapsed={isCollapsed}
            onClose={onClose}
          />
          <SidebarLink
            icon={<Settings size={20} />}
            label="SETTINGS"
            href="/dashboard/settings"
            active={pathname === "/dashboard/settings"}
            isCollapsed={isCollapsed}
            onClose={onClose}
          />
        </div>
      </aside>
    </>
  );
};

const SidebarLink = ({
  icon,
  label,
  href,
  active = false,
  isCollapsed,
  onClose
}: {
  icon: React.ReactNode,
  label: string,
  href: string,
  active?: boolean,
  isCollapsed: boolean,
  onClose?: () => void
}) => (
  <Link
    href={href}
    onClick={(e) => {
      if (href === "/dashboard/ai") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-kuriftu-ai'));
      }
      onClose?.();
    }}
    className={`
      w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 group relative
      ${active ? 'bg-resort-green/10 text-resort-green font-bold' : 'text-neutral-500 hover:bg-neutral-50 hover:text-forest'}
      ${isCollapsed ? "lg:justify-center" : "gap-4"}
    `}
  >
    <span className={`shrink-0 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>
      {icon}
    </span>

    {!isCollapsed && (
      <span className="text-[11px] font-bold tracking-widest uppercase truncate animate-in fade-in slide-in-from-left-2 duration-300">
        {label}
      </span>
    )}

    {isCollapsed && (
      <div className="absolute left-16 px-3 py-2 bg-forest text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-[100] shadow-xl">
        {label}
      </div>
    )}

    {active && (
      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-resort-green shadow-lg shadow-resort-green/20" />
    )}
  </Link>
);

export default Sidebar;
