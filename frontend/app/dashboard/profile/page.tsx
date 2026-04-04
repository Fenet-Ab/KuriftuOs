"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Mail, User as UserIcon, Shield } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        avatar_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);

    const handleImageClick = () => {
        fileInputRef?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatar_url: reader.result as string });
                toast.success("Image selected! Don't forget to save changes.");
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            setFormData({
                name: parsed.name,
                email: parsed.email,
                avatar_url: parsed.avatar_url || "",
            });
        }
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("http://localhost:8000/api/v1/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.status === 401) {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                router.push("/login");
                return;
            }

            if (!response.ok) throw new Error(data.detail || "Update failed");

            // Update local storage
            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
            toast.success("Profile updated successfully!");
            
            // Refresh page to show new data in header
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-12">
            <header className="mb-12">
                <h1 className="text-3xl font-extrabold text-forest tracking-tight">Your Profile.</h1>
                <p className="text-neutral-500 mt-2 font-light">Manage your personal information and presence.</p>
            </header>

            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="bg-forest h-32 relative">
                   <div className="absolute -bottom-12 left-10">
                       <div 
                           className="relative w-24 h-24 rounded-full border-4 border-white shadow-xl group cursor-pointer overflow-hidden"
                           onClick={handleImageClick}
                       >
                           {formData.avatar_url ? (
                                <Image src={formData.avatar_url} alt="avatar" fill className="object-cover" />
                           ) : (
                               <div className="w-full h-full bg-resort-green flex items-center justify-center text-white text-3xl font-bold">
                                   {user.name?.[0].toUpperCase()}
                               </div>
                           )}
                           
                           {/* Overlay on hover */}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Camera className="text-white w-8 h-8" />
                           </div>

                           {/* Edit Icon Button */}
                           <div className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-neutral-100">
                               <Camera className="w-3 h-3 text-resort-green" />
                           </div>
                       </div>
                       
                       <input 
                           type="file" 
                           className="hidden" 
                           ref={(ref) => setFileInputRef(ref)} 
                           accept="image/*"
                           onChange={handleFileChange}
                       />
                   </div>
                </div>

                <div className="p-10 pt-16">
                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Display Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Profile Image URL</label>
                            <input 
                                type="text" 
                                value={formData.avatar_url}
                                onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all font-bold text-forest"
                                placeholder="Paste an image URL here"
                            />
                        </div>

                        <div className="md:col-span-2 pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-forest text-white px-8 py-3.5 rounded-xl font-bold tracking-widest text-[10px] uppercase hover:bg-forest/90 transition-all shadow-lg shadow-forest/10 disabled:opacity-50"
                            >
                                {loading ? "SAVING..." : "UPDATE PROFILE"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-red-600">Sensitive Actions</h3>
                    <p className="text-[11px] text-red-500/70">These actions are permanent and cannot be undone.</p>
                </div>
                <button className="text-[10px] font-black tracking-widest text-red-600 uppercase border border-red-200 px-6 py-2.5 rounded-full hover:bg-red-100">
                    DELETE ACCOUNT
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
