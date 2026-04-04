"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Tag, 
  Filter, 
  RefreshCw,
  Search,
  CheckCircle,
  MoreVertical,
  ClipboardList
} from "lucide-react";

interface Task {
  id: number;
  category: string;
  description: string;
  priority: string;
  status: string;
  assigned_to?: number;
  created_at: string;
  resolved_at?: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  email: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/v1/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchTasks();
      if (["admin", "manager"].includes(parsedUser.role?.toLowerCase())) {
        fetchStaff();
      }
    }
  }, [fetchTasks, fetchStaff]);

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const assignTask = async (taskId: number, staffId: number) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/${taskId}/assign?staff_id=${staffId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent": return "text-red-600 bg-red-50 border-red-100";
      case "high": return "text-orange-600 bg-orange-50 border-orange-100";
      case "normal": return "text-blue-600 bg-blue-50 border-blue-100";
      default: return "text-green-600 bg-green-50 border-green-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <CheckCircle2 className="text-green-500" size={18} />;
      case "in_progress": return <Clock className="text-blue-500 animate-pulse" size={18} />;
      case "escalated": return <AlertCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-neutral-400" size={18} />;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    const matchesSearch = task.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => ["new", "in_progress"].includes(t.status)).length,
    completed: tasks.filter(t => t.status === "completed").length,
    urgent: tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <RefreshCw className="animate-spin text-forest" size={40} />
      <p className="text-[11px] font-black text-neutral-400 uppercase tracking-widest">Loading OpsFlow Tasks...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-forest/10 p-2 rounded-xl text-forest">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-2xl font-black text-forest tracking-tight uppercase">OpsFlow Tasks</h1>
          </div>
          <p className="text-neutral-500 text-sm max-w-md">
            Manage resort operations, maintenance requests, and service delivery in real-time.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active", value: stats.active, color: "text-blue-600" },
            { label: "Urgent", value: stats.urgent, color: "text-red-600" },
            { label: "Done", value: stats.completed, color: "text-green-600" },
            { label: "Total", value: stats.total, color: "text-neutral-900" }
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-neutral-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white/80 backdrop-blur-md border border-neutral-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks, categories, staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-forest/20 transition-all placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-neutral-400 mr-2" />
          {["all", "new", "in_progress", "completed", "escalated"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filterStatus === status 
                  ? "bg-forest text-white shadow-lg shadow-forest/20" 
                  : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"}
              `}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.length > 0 ? filteredTasks.map((task) => (
          <div 
            key={task.id}
            className={`
              group bg-white border border-neutral-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500
              ${task.status === 'completed' ? 'opacity-70' : ''}
              hover:translate-y-[-4px]
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-neutral-50 rounded-full border border-neutral-100">
                  <Tag size={12} className="text-neutral-400" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{task.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(task.status)}
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{task.status.replace('_', ' ')}</span>
              </div>
            </div>

            <h3 className="text-neutral-900 font-bold mb-2 group-hover:text-forest transition-colors">{task.description}</h3>
            
            <div className="flex items-center gap-4 py-4 border-y border-neutral-50 my-4 text-[11px] text-neutral-500">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-neutral-400" />
                <span>Added: {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {task.assigned_to && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-neutral-400" />
                  <span>Assigned to Staff #{task.assigned_to}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              {/* Staff Actions */}
              {user?.role === "staff" && (
                <div className="flex gap-2">
                  {task.status === "new" && (
                    <button 
                      onClick={() => updateTaskStatus(task.id, "in_progress")}
                      className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                      Start Work
                    </button>
                  )}
                  {task.status === "in_progress" && (
                    <button 
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle size={14} /> Finish Task
                    </button>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {["admin", "manager"].includes(user?.role?.toLowerCase()) && (
                <div className="flex flex-1 items-center gap-2">
                  <div className="flex flex-1 relative group/assign">
                    <select
                      onChange={(e) => assignTask(task.id, parseInt(e.target.value))}
                      value={task.assigned_to || ""}
                      className="w-full bg-neutral-50 border-none rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:ring-2 focus:ring-forest/10"
                    >
                      <option value="">Choose Staff to Assign</option>
                      {staffList.filter(s => s.role === 'staff').map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                    <User size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {task.status === "completed" && (
                <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase tracking-widest ml-auto">
                   Completed <CheckCircle2 size={16} />
                </div>
              )}
            </div>
          </div>
        )) : (
          <div className="lg:col-span-2 bg-white border border-dashed border-neutral-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-neutral-50 p-6 rounded-full mb-4">
              <ClipboardList className="text-neutral-300" size={48} />
            </div>
            <h3 className="text-lg font-bold text-neutral-400 mb-2">No tasks found</h3>
            <p className="text-neutral-400 text-sm max-w-xs">Everything seems to be running smoothly! Tasks generated by AI or Managers will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
