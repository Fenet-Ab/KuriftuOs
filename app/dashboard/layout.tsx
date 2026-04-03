"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "../components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");

    if (!savedUser || !token) {
      router.push("/login");
    } else {
      setUser(JSON.parse(savedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Dashboard Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-neutral-500 hover:text-forest transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-32 h-8 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 128px"
                priority
              />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6 relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-4 bg-neutral-50 px-4 py-2 rounded-2xl border border-neutral-100 cursor-pointer hover:bg-neutral-100 transition-all select-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-forest uppercase tracking-widest">{user.name}</p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-resort-green animate-pulse" />
                <p className="text-[10px] text-neutral-400 capitalize font-medium">{user.role}</p>
              </div>
            </div>
            {user.avatar_url ? (
               <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-resort-green/10">
                 <Image src={user.avatar_url} alt="avatar" fill className="object-cover" />
               </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-resort-green text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-resort-green/20 ring-4 ring-resort-green/10">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-16 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-2 flex flex-col gap-1">
                 <Link 
                   href="/dashboard/profile"
                   onClick={() => setIsDropdownOpen(false)}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 text-[11px] font-bold text-forest uppercase tracking-widest transition-colors"
                 >
                   <span className="text-lg">👤</span> Profile
                 </Link>
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-[11px] font-bold text-red-500 uppercase tracking-widest transition-colors w-full text-left"
                 >
                   <span className="text-lg">🚪</span> Logout
                 </button>
               </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex flex-1 relative w-full">
        {/* Sidebar Navigation */}
        <Sidebar 
          role={user.role?.toLowerCase() || "guest"} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 lg:p-12 min-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            {children}
          </div>
          
          <footer className="mt-20 pt-12 border-t border-neutral-100 text-center pb-8">
            <p className="text-[10px] text-neutral-300 uppercase tracking-[0.4em] font-black">
              © {new Date().getFullYear()} Kuriftu Resort Intelligence Platform — OS 1.0.0
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
