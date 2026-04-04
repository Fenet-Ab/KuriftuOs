"use client";

import React, { useState, useEffect } from "react";
import {
    Bed,
    CheckCircle2,
    AlertTriangle,
    LayoutDashboard,
    RefreshCcw,
    Search,
    ArrowUpRight,
    Sparkles,
    Camera,
    Layers,
    Box,
    Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";

const RoomCard = ({ room }: { room: any }) => {
    // Amenities simulation based on room type
    const amenitiesMap: Record<string, string[]> = {
        "standard": ["King Bed", "High-speed Wi-Fi", "Garden View", "Air Conditioning"],
        "deluxe": ["King Bed", "Private Balcony", "Lake View", "Mini Bar", "Premium Spa access"],
        "suite": ["King Bed", "Separate Living Area", "Panoramic View", "Jacuzzi", "Private Butler", "All-inclusive Dining"]
    };

    // Fallback images map
    const imageMap: Record<string, string> = {
        "standard": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1000",
        "deluxe": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
        "suite": "https://images.unsplash.com/photo-1591088398332-8a77d399c80c?auto=format&fit=crop&q=80&w=1000",
        "poolside villa": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1000",
        "luxury suite": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000"
    };

    const amenities = amenitiesMap[room.name.toLowerCase()] || ["King Bed", "Wi-Fi"];
    const occupancyRate = room.total_rooms > 0
        ? Math.max(0, Math.min(100, Math.round(((room.total_rooms - room.available_rooms) / room.total_rooms) * 100)))
        : 0;

    const displayImage = room.image_url && room.image_url !== "NULL"
        ? room.image_url
        : (imageMap[room.name.toLowerCase()] || "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000");

    return (
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 overflow-hidden group hover:shadow-2xl hover:shadow-neutral-200/50 transition-all duration-500 hover:-translate-y-2">
            <div className="relative h-48 overflow-hidden">
                <img
                    src={displayImage}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                    <span className="text-[10px] font-black text-forest uppercase tracking-widest">${room.price_per_night}/night</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <button className="w-full bg-white text-forest py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        View Details <ArrowUpRight size={14} />
                    </button>
                </div>
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-xl font-bold text-forest capitalize mb-1">{room.name} Room</h4>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-resort-yellow text-[10px]">★</span>)}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-medium lowercase italic">Premium Choice</span>
                        </div>
                    </div>
                </div>

                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">What&apos;s Inside</p>
                <div className="flex flex-wrap gap-2 mb-8">
                    {amenities.map((item, idx) => (
                        <span key={idx} className="bg-neutral-50 text-forest text-[9px] font-bold px-3 py-1.5 rounded-full border border-neutral-100/50">
                            {item}
                        </span>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Live Availability</p>
                            <p className="text-sm font-bold text-forest">{room.available_rooms} Rooms Vacant</p>
                        </div>
                        <p className={`text-xs font-bold ${occupancyRate > 80 ? 'text-orange-500' : 'text-resort-green'}`}>
                            {occupancyRate}% Occupied
                        </p>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden p-0.5 border border-dashed border-neutral-200">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${occupancyRate > 80 ? 'bg-orange-500' : 'bg-resort-green'}`}
                            style={{ width: `${occupancyRate}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const RoomServicePage = () => {
    const [stats, setStats] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [predictionLoading, setPredictionLoading] = useState(false);
    const [predictedInventory, setPredictedInventory] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, categoriesRes] = await Promise.all([
                fetch("http://localhost:8000/api/v1/rooms/stats"),
                fetch("http://localhost:8000/api/v1/rooms")
            ]);

            const statsData = await statsRes.json();
            const categoriesData = await categoriesRes.json();

            setStats(statsData);
            setCategories(categoriesData);
        } catch (err) {
            toast.error("Failed to update inventory data");
        } finally {
            setLoading(false);
        }
    };

    const handleAIPrediction = () => {
        setPredictionLoading(true);
        // Simulate a "WOW" AI prediction using images & historical data
        setTimeout(() => {
            setPredictedInventory({
                trend: "rising",
                percentage: 15,
                message: "Demand for Deluxe Rooms is predicted to increase by 15% this weekend based on real-time visual occupancy checks and local event trends.",
                statusColor: "text-resort-green"
            });
            setPredictionLoading(false);
            toast.success("AI Visual Prediction Complete");
        }, 2500);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="p-2 bg-forest text-white rounded-xl"><LayoutDashboard size={18} /></span>
                        <p className="text-[10px] font-black text-resort-green uppercase tracking-[0.3em]">Operational Metrics</p>
                    </div>
                    <h1 className="text-4xl font-black text-forest tracking-tight">Room Service & Inventory.</h1>
                    <p className="text-neutral-500 font-medium">Detailed room features, global capacity, and image-based survival/demand predictions.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={fetchData}
                        className="bg-white border border-neutral-100 p-4 rounded-2xl hover:bg-neutral-50 transition-all group"
                    >
                        <RefreshCcw size={18} className="text-neutral-400 group-hover:rotate-180 duration-500" />
                    </button>
                    <button
                        onClick={handleAIPrediction}
                        disabled={predictionLoading}
                        className="bg-forest text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all shadow-xl shadow-forest/20 flex items-center gap-3 disabled:opacity-50"
                    >
                        {predictionLoading ? "Analyzing Visual Flow..." : <>Predict via Image <Sparkles size={14} /></>}
                    </button>
                </div>
            </header>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Asset Count", value: stats?.total_rooms || 0, icon: <Box className="text-blue-500" />, sub: "Rooms Managed" },
                    { label: "Vacant Units", value: stats?.available_rooms || 0, icon: <CheckCircle2 className="text-resort-green" />, sub: "Bookable Now" },
                    // { label: "Booked", value: stats?.booked_rooms || 0, icon: <Bed className="text-orange-500" />, sub: "Checked-in" },
                    // { label: "Maintenance", value: 0, icon: <AlertTriangle className="text-red-400" />, sub: "Off-service" }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-100 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-neutral-50 rounded-2xl">{s.icon}</div>
                            <div className="px-3 py-1 bg-neutral-100 rounded-full text-[9px] font-black text-neutral-400 uppercase tracking-widest">REAL-TIME</div>
                        </div>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <div className="flex items-end gap-2">
                            <h3 className="text-3xl font-black text-forest leading-none">{s.value}</h3>
                            <span className="text-[10px] text-neutral-400 font-bold uppercase mb-1 leading-none">{s.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Visual Prediction Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-gradient-to-br from-forest to-forest/90 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-resort-yellow/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl rotate-45" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                <ImageIcon className="text-resort-yellow w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">AI Vision Prediction Dashboard</h3>
                                <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">Image-to-Inventory Forecasting</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-10 items-center">
                            <div className="md:w-1/2 relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="aspect-video relative rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000"
                                        alt="resort drone view"
                                        className="w-full h-full object-cover saturate-50 group-hover:saturate-100 group-hover:scale-105 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center border-4 border-white/10 m-3 rounded-[1.5rem]">
                                        <div className="text-center">
                                            <Camera className="w-10 h-10 mx-auto text-white/40 mb-3" />
                                            <p className="text-[10px] font-black tracking-widest uppercase text-white/60">Observing Resort Density...</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-resort-yellow/50 rounded-lg animate-pulse" />
                                    <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border-2 border-resort-green/50 rounded-lg animate-pulse delay-500" />
                                </div>
                            </div>
                            <div className="md:w-1/2 space-y-6">
                                {predictedInventory ? (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-resort-green/20 rounded-2xl">
                                                <ArrowUpRight className="text-resort-green" />
                                            </div>
                                            <div>
                                                <p className="text-4xl font-black">{predictedInventory.percentage}%</p>
                                                <p className="text-[10px] font-black text-resort-green uppercase tracking-widest">Inventory Demand Spike</p>
                                            </div>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium italic">
                                            &quot;{predictedInventory.message}&quot;
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Model Accuracy</p>
                                                <p className="text-sm font-black">94.8%</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Alert Priority</p>
                                                <p className="text-sm font-black uppercase text-resort-yellow">High</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center opacity-60">
                                        <Layers className="w-12 h-12 mx-auto mb-4 text-white/20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Initiate &apos;Predict via Image&apos; to begin analysis</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-neutral-100 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div>
                        <h3 className="text-xl font-bold text-forest mb-2">Service Alerts</h3>
                        <p className="text-xs text-neutral-400 font-medium">Automatic room service notifications.</p>
                    </div>
                    <div className="space-y-6 my-8">
                        {[
                            { color: 'bg-orange-500', title: 'Deep Cleaning: Suite 401', time: '15m ago' },
                            { color: 'bg-blue-500', title: 'Mini Bar Restock: RM-205', time: '1h ago' },
                            { color: 'bg-red-400', title: 'HVAC Check: Villa B2', time: '3h ago' }
                        ].map((alert, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-neutral-50 pb-4 last:border-0 hover:translate-x-2 transition-transform cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${alert.color}`} />
                                    <div>
                                        <p className="text-xs font-bold text-forest">{alert.title}</p>
                                        <p className="text-[9px] text-neutral-400 uppercase tracking-widest">{alert.time}</p>
                                    </div>
                                </div>
                                <ArrowUpRight size={14} className="text-neutral-200" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full bg-neutral-50 text-forest py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all border border-neutral-100">
                        OPEN SERVICE MANAGER
                    </button>
                </div>
            </div>

            {/* Room Categories Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black text-forest flex items-center gap-3">
                        <span className="p-2 bg-resort-green/10 rounded-2xl text-resort-green font-normal">🏡</span>
                        Inventory Details by Type
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find room type..."
                            className="pl-12 pr-6 py-3 bg-white border border-neutral-100 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest/10 w-64 shadow-sm"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[500px] bg-neutral-50 rounded-[3rem] animate-pulse border border-neutral-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat: any) => (
                            <RoomCard key={cat.id} room={cat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomServicePage;