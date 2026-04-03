"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

const LoginPage = ({ initialMode = "login" }: { initialMode?: "login" | "register" }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password, role: "guest" };

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Authentication failed");

      if (isLogin) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Welcome back to Kuriftu!");
        router.push("/dashboard");
      } else {
        toast.success("Registration successful! Please login.");
        setIsLogin(true);
      }
    } catch (err: any) {
       toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-resort-parchment flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-brass/20">
        {/* Left Side: Background / Info */}
        <div className="md:w-1/2 relative bg-forest p-12 text-white flex flex-col justify-between overflow-hidden">
          <div className="relative z-10">
             <div className="relative w-40 h-10 mb-8">
              <Image
                src="/logo.png"
                alt="logo"
                fill
                className="object-contain brightness-0 invert"
                sizes="(max-width: 768px) 100vw, 160px"
                priority
              />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight">
              {isLogin ? "Welcome Back to Kuriftu" : "Start Your Luxury Journey"}
            </h1>
            <p className="text-resort-parchment/70 font-light leading-relaxed">
              {isLogin
                ? "Sign in to access your dashboard, bookings, and personalized services."
                : "Register to enjoy exclusive member benefits and seamless resort experiences."}
            </p>
          </div>
          
          <div className="relative z-10 mt-12 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <p className="text-sm font-light italic">
              "Experience the ultimate luxury and comfort at our world-class resorts."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-resort-yellow/20 flex items-center justify-center">
                 <span className="text-resort-yellow font-bold">K</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Kuriftu Resort</p>
                <p className="text-[10px] text-white/40">Established Excellence</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-resort-green/20 rounded-full blur-[100px]" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-resort-yellow/10 rounded-full blur-[100px]" />
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 bg-white">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-forest">
              {isLogin ? "Sign In" : "Register"}
            </h2>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold uppercase tracking-widest text-resort-green hover:underline cursor-pointer"
            >
              {isLogin ? "Need an account?" : "Have an account?"}
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all text-forest font-bold"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all text-forest font-bold"
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-resort-green/20 transition-all text-forest font-bold"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest text-white py-4 rounded-xl font-bold tracking-widest text-xs uppercase hover:bg-forest/90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? "SIGN IN" : "CREATE ACCOUNT"
              )}
            </button>

            {isLogin && (
              <div className="pt-4 flex justify-center">
                <Link href="#" className="text-[10px] text-resort-green font-black hover:underline tracking-widest uppercase py-2">
                  Forgot Password?
                </Link>
              </div>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Kuriftu Resort & Spa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;