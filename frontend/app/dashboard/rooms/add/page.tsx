"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Hotel, FileText, Hash, Check } from "lucide-react";

const AddRoomPage = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: "",
        description: "",
        category_id: "",
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/v1/rooms/");
                const data = await response.json();
                if (response.ok) setCategories(data);
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category_id) return toast.error("Please select a category");

        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://localhost:8000/api/v1/rooms/rooms", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    category_id: parseInt(formData.category_id)
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to add room");
            }

            toast.success(`Room ${formData.number} added successfully!`);
            router.push("/dashboard");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <header className="mb-12">
                <h1 className="text-3xl font-extrabold text-forest tracking-tight">Add New Room.</h1>
                <p className="text-neutral-500 mt-2 font-light">Register a specific room number and its description.</p>
            </header>

            <div className="bg-white p-10 rounded-3xl border border-neutral-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Room Number</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
                            <input 
                                type="text"
                                required
                                value={formData.number}
                                onChange={(e) => setFormData({...formData, number: e.target.value})}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
                                placeholder="e.g. 101, RM-205"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Category</label>
                        <div className="relative">
                            <Hotel className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 w-4 h-4" />
                            <select 
                                required
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest appearance-none"
                            >
                                <option value="">Select a Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()} - ${cat.price_per_night}/night</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-4 text-neutral-300 w-4 h-4" />
                            <textarea 
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-medium text-forest"
                                placeholder="Luxury suite with garden view, king size bed..."
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-forest text-white py-4 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-forest/90 transition-all shadow-xl shadow-forest/10 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? "PROCESSING..." : (
                            <>
                                <Check size={16} /> CONFIRM & ADD ROOM
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddRoomPage;
