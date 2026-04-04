"use client";

import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Types ──────────────────────────────────────────────────────────────────
interface MultiplierBreakdown {
    factor: string;
    multiplier: number;
    impact: string;
}

interface PriceQuote {
    room_type: string;
    nights: number;
    base_price_per_night: number;
    dynamic_price_per_night: number;
    total_base_price: number;
    total_dynamic_price: number;
    total_multiplier: number;
    price_change_pct: number;
    breakdown: MultiplierBreakdown[];
    active_occasions: string[];
    pricing_note: string;
}

interface Occasion {
    id: number;
    name: string;
    occasion_type: string;
    country: string;
    start_date: string;
    end_date: string;
    multiplier: number;
    description?: string;
    is_active: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function MultiplierBadge({ value }: { value: number }) {
    const pct = Math.round((value - 1) * 100);
    const isUp = pct > 0;
    const isDown = pct < 0;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${isUp
                    ? "bg-amber-100 text-amber-800"
                    : isDown
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-600"
                }`}
        >
            {isUp ? "↑" : isDown ? "↓" : "—"} ×{value.toFixed(2)}
        </span>
    );
}

function OccasionTypePill({ type }: { type: string }) {
    const colors: Record<string, string> = {
        holiday: "bg-blue-100 text-blue-700",
        festival: "bg-purple-100 text-purple-700",
        event: "bg-orange-100 text-orange-700",
        season: "bg-teal-100 text-teal-700",
    };
    return (
        <span
            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest ${colors[type] || "bg-neutral-100 text-neutral-500"
                }`}
        >
            {type}
        </span>
    );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function DynamicPricingPage() {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

    // ── Quote state ──────────────────────────────────────────────────────────
    const [roomType, setRoomType] = useState("standard");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [quote, setQuote] = useState<PriceQuote | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState("");

    // ── Occasions state ──────────────────────────────────────────────────────
    const [occasions, setOccasions] = useState<Occasion[]>([]);
    const [upcomingOccasions, setUpcomingOccasions] = useState<Occasion[]>([]);
    const [occasionsLoading, setOccasionsLoading] = useState(true);

    // ── New occasion form ────────────────────────────────────────────────────
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        occasion_type: "holiday",
        country: "Ethiopia",
        start_date: "",
        end_date: "",
        multiplier: 1.2,
        description: "",
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formSuccess, setFormSuccess] = useState("");

    // ── Fetch occasions ──────────────────────────────────────────────────────
    const fetchOccasions = useCallback(async () => {
        setOccasionsLoading(true);
        try {
            const [all, upcoming] = await Promise.all([
                fetch(`${API}/pricing/occasions`).then((r) => r.json()),
                fetch(`${API}/pricing/occasions/upcoming?days=60`).then((r) => r.json()),
            ]);
            setOccasions(Array.isArray(all) ? all : []);
            setUpcomingOccasions(Array.isArray(upcoming) ? upcoming : []);
        } catch {
            setOccasions([]);
        } finally {
            setOccasionsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOccasions();
    }, [fetchOccasions]);

    // ── Get price quote ──────────────────────────────────────────────────────
    const getQuote = async () => {
        if (!checkIn || !checkOut) return;
        setQuoteLoading(true);
        setQuoteError("");
        setQuote(null);
        try {
            const params = new URLSearchParams({
                room_type: roomType,
                check_in: new Date(checkIn).toISOString(),
                check_out: new Date(checkOut).toISOString(),
            });
            const res = await fetch(`${API}/pricing/quote?${params}`);
            if (!res.ok) throw new Error(await res.text());
            setQuote(await res.json());
        } catch (e: any) {
            setQuoteError("Failed to fetch quote. Is the backend running?");
        } finally {
            setQuoteLoading(false);
        }
    };

    // ── Create occasion ──────────────────────────────────────────────────────
    const createOccasion = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormSuccess("");
        try {
            const res = await fetch(`${API}/pricing/occasions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error(await res.text());
            setFormSuccess("Occasion created successfully!");
            setShowForm(false);
            setFormData({
                name: "",
                occasion_type: "holiday",
                country: "Ethiopia",
                start_date: "",
                end_date: "",
                multiplier: 1.2,
                description: "",
            });
            fetchOccasions();
        } catch {
            setFormSuccess("Error: could not create occasion.");
        } finally {
            setFormLoading(false);
        }
    };

    // ── Delete occasion ──────────────────────────────────────────────────────
    const deleteOccasion = async (id: number, name: string) => {
        if (!confirm(`Delete occasion "${name}"?`)) return;
        await fetch(`${API}/pricing/occasions/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchOccasions();
    };

    const priceChangeColor =
        quote && quote.price_change_pct > 10
            ? "text-amber-600"
            : quote && quote.price_change_pct < -5
                ? "text-emerald-600"
                : "text-neutral-700";

    return (
        <div className="space-y-10">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                        💰 Dynamic Pricing Engine
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500 max-w-xl">
                        AI-powered pricing that adjusts room rates based on holidays,
                        occupancy, lead time, and seasonality. All factors combine
                        multiplicatively to produce the final guest price.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-700 transition-colors"
                >
                    {showForm ? "✕ Cancel" : "＋ New Occasion"}
                </button>
            </div>

            {/* ── Create Occasion Form ── */}
            {showForm && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-base font-black text-neutral-800 mb-4 uppercase tracking-widest">
                        Add Pricing Occasion
                    </h2>
                    <form onSubmit={createOccasion} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Name
                            </label>
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Ethiopian New Year"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Type
                            </label>
                            <select
                                value={formData.occasion_type}
                                onChange={(e) => setFormData({ ...formData, occasion_type: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            >
                                <option value="holiday">Holiday</option>
                                <option value="festival">Festival</option>
                                <option value="event">Event</option>
                                <option value="season">Season</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Start Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                End Date
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Price Multiplier (e.g. 1.40 = +40%)
                            </label>
                            <input
                                type="number"
                                step="0.05"
                                min="0.5"
                                max="5"
                                required
                                value={formData.multiplier}
                                onChange={(e) =>
                                    setFormData({ ...formData, multiplier: parseFloat(e.target.value) })
                                }
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Country
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            >
                                <option>Ethiopia</option>
                                <option>International</option>
                                <option>Any</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Description (optional)
                            </label>
                            <input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short description…"
                                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={formLoading}
                                className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-neutral-700 transition-colors disabled:opacity-50"
                            >
                                {formLoading ? "Creating…" : "Create Occasion"}
                            </button>
                            {formSuccess && (
                                <span className="text-sm text-emerald-600 font-medium">{formSuccess}</span>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/* ── Two column layout ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* ── Price Calculator ── */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div>
                        <h2 className="text-base font-black text-neutral-800 uppercase tracking-widest">
                            🧮 Live Price Calculator
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            See how every factor impacts the final guest price in real time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Room Type
                            </label>
                            <select
                                value={roomType}
                                onChange={(e) => setRoomType(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            >
                                <option value="standard">Standard</option>
                                <option value="deluxe">Deluxe</option>
                                <option value="suite">Suite</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Check-in
                            </label>
                            <input
                                type="date"
                                value={checkIn}
                                onChange={(e) => setCheckIn(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 mb-1.5 uppercase tracking-wider">
                                Check-out
                            </label>
                            <input
                                type="date"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={getQuote}
                        disabled={quoteLoading || !checkIn || !checkOut}
                        className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-neutral-700 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                        {quoteLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Calculating…
                            </>
                        ) : (
                            "Calculate Dynamic Price →"
                        )}
                    </button>

                    {quoteError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                            {quoteError}
                        </div>
                    )}

                    {quote && (
                        <div className="space-y-4">
                            {/* Summary card */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-neutral-50 rounded-xl p-4">
                                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">
                                        Base Price / Night
                                    </p>
                                    <p className="text-xl font-black text-neutral-700">
                                        ETB {quote.base_price_per_night.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-xl p-4 text-white">
                                    <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">
                                        Dynamic Price / Night
                                    </p>
                                    <p className={`text-xl font-black`}>
                                        ETB {quote.dynamic_price_per_night.toLocaleString()}
                                    </p>
                                    <p className={`text-xs font-bold mt-0.5 ${priceChangeColor}`}>
                                        {quote.price_change_pct > 0 ? "+" : ""}
                                        {quote.price_change_pct}% vs base
                                    </p>
                                </div>
                                <div className="bg-neutral-50 rounded-xl p-4">
                                    <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mb-1">
                                        Total ({quote.nights} nights)
                                    </p>
                                    <p className="text-lg font-black text-neutral-700 line-through opacity-40">
                                        ETB {quote.total_base_price.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                    <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mb-1">
                                        Total Dynamic Price
                                    </p>
                                    <p className="text-xl font-black text-amber-700">
                                        ETB {quote.total_dynamic_price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div>
                                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-3">
                                    Pricing Breakdown
                                </h3>
                                <div className="space-y-2">
                                    {quote.breakdown.map((b, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-neutral-800">{b.factor}</p>
                                                <p className="text-xs text-neutral-400">{b.impact}</p>
                                            </div>
                                            <MultiplierBadge value={b.multiplier} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
                                💡 {quote.pricing_note}
                            </div>

                            {/* Active occasions */}
                            {quote.active_occasions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {quote.active_occasions.map((name) => (
                                        <span
                                            key={name}
                                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold"
                                        >
                                            🗓 {name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Upcoming Occasions ── */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                    <div>
                        <h2 className="text-base font-black text-neutral-800 uppercase tracking-widest">
                            📅 Upcoming Occasions (60 days)
                        </h2>
                        <p className="text-xs text-neutral-400 mt-0.5">
                            These occasions will automatically affect guest pricing.
                        </p>
                    </div>

                    {occasionsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <svg className="animate-spin h-6 w-6 text-neutral-300" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>
                    ) : upcomingOccasions.length === 0 ? (
                        <div className="text-center py-12 text-neutral-400 text-sm">
                            No upcoming occasions in the next 60 days.
                        </div>
                    ) : (
                        <div className="space-y-2 overflow-y-auto max-h-96">
                            {upcomingOccasions.map((occ) => (
                                <div
                                    key={occ.id}
                                    className="flex items-center justify-between bg-neutral-50 hover:bg-neutral-100 rounded-xl px-4 py-3 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-neutral-800 truncate">{occ.name}</p>
                                            <OccasionTypePill type={occ.occasion_type} />
                                        </div>
                                        <p className="text-xs text-neutral-400 mt-0.5">
                                            {occ.start_date} → {occ.end_date} · {occ.country}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        <MultiplierBadge value={occ.multiplier} />
                                        <button
                                            onClick={() => deleteOccasion(occ.id, occ.name)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                                            title="Delete"
                                        >
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── All Occasions table ── */}
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                    <h2 className="text-base font-black text-neutral-800 uppercase tracking-widest">
                        📋 All Occasions
                    </h2>
                </div>
                {occasions.length === 0 ? (
                    <div className="text-center py-16 text-neutral-400 text-sm">
                        No occasions configured. Run the seeder or add one above.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-neutral-50">
                                <tr>
                                    {["Name", "Type", "Country", "Dates", "Multiplier", "Status", ""].map((h) => (
                                        <th
                                            key={h}
                                            className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-neutral-400"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {occasions.map((occ) => (
                                    <tr key={occ.id} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="px-5 py-3 font-semibold text-neutral-800">{occ.name}</td>
                                        <td className="px-5 py-3">
                                            <OccasionTypePill type={occ.occasion_type} />
                                        </td>
                                        <td className="px-5 py-3 text-neutral-500">{occ.country}</td>
                                        <td className="px-5 py-3 text-neutral-500 whitespace-nowrap">
                                            {occ.start_date} → {occ.end_date}
                                        </td>
                                        <td className="px-5 py-3">
                                            <MultiplierBadge value={occ.multiplier} />
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className={`inline-flex items-center gap-1 text-xs font-bold ${occ.is_active ? "text-emerald-600" : "text-neutral-400"
                                                    }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${occ.is_active ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
                                                        }`}
                                                />
                                                {occ.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <button
                                                onClick={() => deleteOccasion(occ.id, occ.name)}
                                                className="opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 font-bold transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── How It Works ── */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-base font-black text-neutral-800 uppercase tracking-widest mb-4">
                    ⚙️ How the Engine Works
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                        {
                            emoji: "🗓",
                            title: "Occasion",
                            desc: "Holidays & events boost rates. Configured in this dashboard.",
                            color: "bg-blue-50 border-blue-100",
                        },
                        {
                            emoji: "📈",
                            title: "Demand",
                            desc: "High occupancy → surge. Low occupancy → discount to fill rooms.",
                            color: "bg-amber-50 border-amber-100",
                        },
                        {
                            emoji: "⏳",
                            title: "Lead Time",
                            desc: "Last-minute bookings cost more. Book 60+ days ahead for discounts.",
                            color: "bg-purple-50 border-purple-100",
                        },
                        {
                            emoji: "📅",
                            title: "Day of Week",
                            desc: "Fri/Sat check-in commands a 15% weekend premium.",
                            color: "bg-orange-50 border-orange-100",
                        },
                        {
                            emoji: "🌤",
                            title: "Season",
                            desc: "Peak months (Sep, Jan) carry a 20% uplift. Low months get a discount.",
                            color: "bg-teal-50 border-teal-100",
                        },
                    ].map((card) => (
                        <div
                            key={card.title}
                            className={`p-4 rounded-xl border ${card.color} flex flex-col gap-2`}
                        >
                            <span className="text-2xl">{card.emoji}</span>
                            <p className="text-sm font-black text-neutral-800">{card.title}</p>
                            <p className="text-xs text-neutral-500">{card.desc}</p>
                        </div>
                    ))}
                </div>
                <p className="mt-4 text-xs text-neutral-400">
                    <strong>Formula:</strong> Dynamic Price = Base Price × Occasion × Demand × Lead Time ×
                    Day-of-Week × Season. When 100+ confirmed bookings exist, a{" "}
                    <strong>Gradient Boosting ML model</strong> calibrates the final multiplier automatically.
                </p>
            </div>
        </div>
    );
}
