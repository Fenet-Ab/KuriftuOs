"use client";

import { useState } from "react";
import {
  TrendingUp, AlertTriangle, CheckCircle, XCircle, Package, Users, BarChart2, Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  mockPricingRecommendations,
  mockHolidayAlerts,
  mockUpsellPackages,
  mockStaffingForecast,
  mockRevenueTrend,
} from "../../lib/mockData";

type PricingRow = typeof mockPricingRecommendations[number];

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH: "text-green-600 bg-green-50 border-green-200",
  MEDIUM: "text-orange-600 bg-orange-50 border-orange-200",
  LOW: "text-neutral-500 bg-neutral-50 border-neutral-200",
};

const URGENCY_COLOR: Record<string, string> = {
  HIGH: "border-red-200 bg-red-50",
  MEDIUM: "border-orange-200 bg-orange-50",
  LOW: "border-yellow-200 bg-yellow-50",
};

const URGENCY_BADGE: Record<string, string> = {
  HIGH: "bg-red-500 text-white",
  MEDIUM: "bg-orange-400 text-white",
  LOW: "bg-yellow-400 text-forest",
};

export default function RevSensePage() {
  const [pricing, setPricing] = useState(
    mockPricingRecommendations.map((r) => ({ ...r, accepted: null as boolean | null }))
  );

  const acceptRate = (id: number) => {
    setPricing((prev) => prev.map((r) => (r.id === id ? { ...r, accepted: true } : r)));
    const row = pricing.find((r) => r.id === id);
    toast.success(`✓ Rate accepted for ${row?.category} — now ${row?.suggestedRate.toLocaleString()} ETB/night`);
  };

  const rejectRate = (id: number) => {
    setPricing((prev) => prev.map((r) => (r.id === id ? { ...r, accepted: false } : r)));
    toast("Rate kept at current price", { icon: "↩️" });
  };

  // Inline SVG revenue chart
  const maxRevenue = Math.max(...mockRevenueTrend.map((d) => d.revenue));
  const chartW = 560;
  const chartH = 140;
  const padX = 40;
  const padY = 16;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  const points = mockRevenueTrend.map((d, i) => {
    const x = padX + (i / (mockRevenueTrend.length - 1)) * innerW;
    const y = padY + innerH - (d.revenue / maxRevenue) * innerH;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M ${points[0].x},${chartH - padY} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${chartH - padY} Z`;

  const accepted = pricing.filter((r) => r.accepted === true).length;
  const projectedUplift = pricing
    .filter((r) => r.accepted === true)
    .reduce((sum, r) => sum + (r.suggestedRate - r.currentRate), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-resort-green/10 p-2 rounded-xl">
              <TrendingUp className="text-resort-green" size={24} />
            </div>
            <h1 className="text-2xl font-black text-forest tracking-tight uppercase">RevSense</h1>
            <span className="px-3 py-1 bg-resort-yellow/20 text-forest text-[10px] font-black rounded-full uppercase tracking-widest border border-resort-yellow/30">AI Revenue Engine</span>
          </div>
          <p className="text-neutral-500 text-sm max-w-lg">
            Dynamic pricing recommendations, upsell optimization, and demand forecasting powered by AI.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-neutral-100 px-6 py-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Accepted</p>
            <p className="text-2xl font-black text-resort-green">{accepted}/{pricing.length}</p>
          </div>
          <div className="bg-white border border-neutral-100 px-6 py-4 rounded-2xl shadow-sm text-center">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Uplift</p>
            <p className="text-2xl font-black text-resort-green">+{projectedUplift.toLocaleString()} ETB</p>
          </div>
        </div>
      </div>

      {/* Holiday Alert Banners */}
      <div className="space-y-3">
        {mockHolidayAlerts.map((alert, i) => (
          <div key={i} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border ${URGENCY_COLOR[alert.urgency]} animate-in fade-in duration-500`}>
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle size={20} className={alert.urgency === "HIGH" ? "text-red-500" : alert.urgency === "MEDIUM" ? "text-orange-500" : "text-yellow-500"} />
              <div>
                <p className="font-bold text-forest text-sm">{alert.holiday} — {alert.date}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{alert.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-resort-green">{alert.demand}</span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${URGENCY_BADGE[alert.urgency]}`}>
                {alert.urgency} DEMAND
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Pricing Panel */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-50 flex items-center gap-3">
          <Zap className="text-resort-yellow" size={20} />
          <h2 className="text-xl font-bold text-forest">Dynamic Pricing Recommendations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50/50">
                <th className="px-8 py-4 text-left">Category</th>
                <th className="px-6 py-4 text-right">Current Rate</th>
                <th className="px-6 py-4 text-right">AI Suggested</th>
                <th className="px-6 py-4 text-right">Change</th>
                <th className="px-6 py-4 text-center">Confidence</th>
                <th className="px-8 py-4 text-left">Reason</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {pricing.map((row) => (
                <PricingRow
                  key={row.id}
                  row={row}
                  onAccept={() => acceptRate(row.id)}
                  onReject={() => rejectRate(row.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue Trend + Upsell packages side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Revenue Trend Chart */}
        <div className="xl:col-span-3 bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <BarChart2 className="text-resort-green" size={20} />
            <h2 className="text-xl font-bold text-forest">7-Day Revenue Trend</h2>
            <span className="ml-auto text-sm font-bold text-resort-green">
              {mockRevenueTrend[mockRevenueTrend.length - 1].revenue.toLocaleString()} ETB today
            </span>
          </div>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ minWidth: 280 }}>
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} x1={padX} x2={chartW - padX} y1={padY + innerH * (1 - f)} y2={padY + innerH * (1 - f)}
                  stroke="#f0f0f0" strokeWidth="1" />
              ))}
              {/* Area fill */}
              <path d={area} fill="rgba(52,168,83,0.08)" />
              {/* Line */}
              <polyline points={polyline} fill="none" stroke="#34A853" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
              {/* Dots + labels */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill="#34A853" />
                  <text x={p.x} y={chartH - 2} textAnchor="middle" fontSize="9" fill="#999" fontWeight="bold">
                    {p.day.split(" ")[1]}
                  </text>
                  {i === points.length - 1 && (
                    <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="#34A853" fontWeight="bold">
                      {(p.revenue / 1000).toFixed(0)}K
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
          <p className="text-[10px] text-neutral-400 text-center mt-2 uppercase tracking-widest">Revenue in ETB · All locations combined</p>
        </div>

        {/* Staffing forecast teaser */}
        <div className="xl:col-span-2 bg-forest p-8 rounded-3xl text-white">
          <div className="flex items-center gap-3 mb-6">
            <Users size={20} className="text-resort-yellow" />
            <h2 className="text-xl font-bold">Staffing Forecast</h2>
          </div>
          <p className="text-white/60 text-xs mb-6">Minimum staff per department for upcoming dates</p>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {mockStaffingForecast.slice(0, 7).map((row, i) => {
              const total = row.housekeeping + row.fnb + row.security + row.reception;
              const isHigh = total > 30;
              return (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isHigh ? "bg-resort-yellow/20 border border-resort-yellow/30" : "bg-white/5"}`}>
                  <span className="text-xs font-bold text-white/80">{row.date}</span>
                  <div className="flex gap-3 text-[10px] font-black">
                    <span className="text-white/50">HK:{row.housekeeping}</span>
                    <span className="text-white/50">F&B:{row.fnb}</span>
                    <span className="text-white/50">Sec:{row.security}</span>
                  </div>
                  <span className={`font-black text-sm ${isHigh ? "text-resort-yellow" : "text-white/70"}`}>{total}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Total staff needed peak day (Apr 18)</p>
            <p className="text-3xl font-black text-resort-yellow mt-1">
              {mockStaffingForecast[mockStaffingForecast.length - 1].housekeeping +
               mockStaffingForecast[mockStaffingForecast.length - 1].fnb +
               mockStaffingForecast[mockStaffingForecast.length - 1].security +
               mockStaffingForecast[mockStaffingForecast.length - 1].reception}
            </p>
          </div>
        </div>
      </div>

      {/* Upsell Packages */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Package className="text-resort-green" size={20} />
          <h2 className="text-xl font-bold text-forest">Upsell Packages Catalogue</h2>
          <span className="ml-auto text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            {mockUpsellPackages.reduce((s, p) => s + p.conversions, 0)} conversions this week
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {mockUpsellPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white p-6 rounded-3xl border border-neutral-100 hover:border-resort-green/30 hover:shadow-xl transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-resort-green/5 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-resort-green/10 transition-colors">
                  {pkg.icon}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">conversions</p>
                  <p className="text-2xl font-black text-resort-green">{pkg.conversions}</p>
                </div>
              </div>
              <h3 className="text-base font-bold text-forest mb-1">{pkg.name}</h3>
              <p className="text-xs text-neutral-400 mb-4">{pkg.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-resort-green uppercase tracking-widest px-3 py-1 bg-resort-green/5 rounded-full border border-resort-green/10">
                  {pkg.category}
                </span>
                <span className="text-base font-black text-forest">{pkg.price.toLocaleString()} ETB</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Staffing Forecast Table */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-neutral-50 flex items-center gap-3">
          <Users className="text-forest" size={20} />
          <h2 className="text-xl font-bold text-forest">14-Day Staffing Forecast</h2>
          <span className="ml-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Based on reservation data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50/50">
                <th className="px-8 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Housekeeping</th>
                <th className="px-6 py-4 text-center">F&B</th>
                <th className="px-6 py-4 text-center">Security</th>
                <th className="px-6 py-4 text-center">Reception</th>
                <th className="px-8 py-4 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {mockStaffingForecast.map((row, i) => {
                const total = row.housekeeping + row.fnb + row.security + row.reception;
                const isPeak = total > 35;
                return (
                  <tr key={i} className={`hover:bg-neutral-50 transition-colors ${isPeak ? "bg-resort-yellow/5" : ""}`}>
                    <td className="px-8 py-4 text-sm font-bold text-forest">
                      {row.date}
                      {isPeak && <span className="ml-2 text-[9px] font-black text-resort-yellow uppercase tracking-widest bg-resort-yellow/20 px-2 py-0.5 rounded-full">PEAK</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-neutral-700">{row.housekeeping}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-neutral-700">{row.fnb}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-neutral-700">{row.security}</td>
                    <td className="px-6 py-4 text-center text-sm font-bold text-neutral-700">{row.reception}</td>
                    <td className="px-8 py-4 text-center">
                      <span className={`text-sm font-black ${isPeak ? "text-resort-green" : "text-neutral-900"}`}>{total}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricingRow({ row, onAccept, onReject }: {
  row: PricingRow & { accepted: boolean | null };
  onAccept: () => void;
  onReject: () => void;
}) {
  const isPositive = row.change > 0;

  return (
    <tr className={`hover:bg-neutral-50/50 transition-colors ${row.accepted === true ? "bg-green-50/30" : row.accepted === false ? "bg-neutral-50/50 opacity-60" : ""}`}>
      <td className="px-8 py-5 font-bold text-forest">{row.category}</td>
      <td className="px-6 py-5 text-right font-bold text-neutral-500">{row.currentRate.toLocaleString()} ETB</td>
      <td className="px-6 py-5 text-right font-black text-forest text-base">{row.suggestedRate.toLocaleString()} ETB</td>
      <td className="px-6 py-5 text-right">
        <span className={`font-black ${isPositive ? "text-resort-green" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{row.change.toFixed(1)}%
        </span>
      </td>
      <td className="px-6 py-5 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${CONFIDENCE_COLOR[row.confidence]}`}>
          {row.confidence}
        </span>
      </td>
      <td className="px-8 py-5 text-xs text-neutral-500 max-w-xs">{row.reason}</td>
      <td className="px-8 py-5">
        {row.accepted === null ? (
          <div className="flex gap-2 justify-center">
            <button onClick={onAccept}
              className="flex items-center gap-1.5 px-4 py-2 bg-resort-green text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-forest transition-colors"
            >
              <CheckCircle size={13} /> Accept
            </button>
            <button onClick={onReject}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-100 text-neutral-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              <XCircle size={13} /> Reject
            </button>
          </div>
        ) : row.accepted ? (
          <div className="flex items-center gap-1.5 justify-center text-resort-green text-[10px] font-black uppercase tracking-widest">
            <CheckCircle size={14} /> Accepted
          </div>
        ) : (
          <div className="flex items-center gap-1.5 justify-center text-neutral-400 text-[10px] font-black uppercase tracking-widest">
            <XCircle size={14} /> Rejected
          </div>
        )}
      </td>
    </tr>
  );
}
