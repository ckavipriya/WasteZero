import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Leaf, Recycle, Calendar, ArrowUpRight } from 'lucide-react';

const WEEKLY_DATA = [
  { day: 'Mon', plastic: 24, paper: 18, glass: 12, ewaste: 8, totalKg: 62, co2SavedKg: 84.8 },
  { day: 'Tue', plastic: 32, paper: 22, glass: 15, ewaste: 12, totalKg: 81, co2SavedKg: 110.5 },
  { day: 'Wed', plastic: 28, paper: 30, glass: 10, ewaste: 6, totalKg: 74, co2SavedKg: 99.2 },
  { day: 'Thu', plastic: 45, paper: 25, glass: 18, ewaste: 14, totalKg: 102, co2SavedKg: 138.7 },
  { day: 'Fri', plastic: 38, paper: 35, glass: 22, ewaste: 10, totalKg: 105, co2SavedKg: 142.8 },
  { day: 'Sat', plastic: 52, paper: 40, glass: 28, ewaste: 18, totalKg: 138, co2SavedKg: 187.6 },
  { day: 'Sun', plastic: 40, paper: 28, glass: 16, ewaste: 9, totalKg: 93, co2SavedKg: 126.4 },
];

export default function AdminWasteAnalyticsChart({ stats }) {
  const [metricView, setMetricView] = useState('combined'); // 'combined' | 'categories' | 'co2'
  const [timeRange, setTimeRange] = useState('thisWeek');

  const totalWeeklyWeight = WEEKLY_DATA.reduce((acc, curr) => acc + curr.totalKg, 0);
  const totalWeeklyCo2 = WEEKLY_DATA.reduce((acc, curr) => acc + curr.co2SavedKg, 0).toFixed(1);

  // Custom Tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[160px]">
          <div className="font-bold border-b border-slate-800 pb-1 text-slate-300 flex justify-between">
            <span>Day: {label}</span>
            <span className="text-emerald-400 font-semibold">Weekly Audit</span>
          </div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center text-[11px] gap-3">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value} {entry.name.includes('CO2') || entry.name.includes('CO₂') ? 'kg CO₂e' : 'kg'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Weekly Collection Statistics & Environmental Impact
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit weekly municipal waste diversion (kg) vs CO₂ greenhouse emissions offset
          </p>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMetricView('combined')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                metricView === 'combined'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Weight vs CO₂
            </button>
            <button
              onClick={() => setMetricView('categories')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                metricView === 'categories'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Material Breakdown
            </button>
            <button
              onClick={() => setMetricView('co2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                metricView === 'co2'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              CO₂ Impact Only
            </button>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Weekly Waste Diversion
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              {totalWeeklyWeight} <span className="text-xs font-normal text-slate-500">kg total</span>
            </span>
          </div>
          <Recycle className="w-7 h-7 text-emerald-600" />
        </div>

        <div className="p-3.5 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
              CO₂ Greenhouse Offset
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
              {totalWeeklyCo2} <span className="text-xs font-normal text-slate-500">kg CO₂e</span>
            </span>
          </div>
          <Leaf className="w-7 h-7 text-teal-600" />
        </div>

        <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              Recycling Efficiency Rate
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1">
              <span>94.2%</span>
              <span className="text-xs font-semibold text-emerald-600 inline-flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> +3.4%
              </span>
            </span>
          </div>
          <TrendingUp className="w-7 h-7 text-rose-600" />
        </div>
      </div>

      {/* Recharts Bar Chart Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#94a3b8" />
            <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {metricView === 'combined' && (
              <>
                <Bar dataKey="totalKg" name="Total Waste Recycled (kg)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="co2SavedKg" name="CO₂ Offset (kg CO₂e)" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </>
            )}

            {metricView === 'categories' && (
              <>
                <Bar dataKey="plastic" name="Plastic (kg)" stackId="a" fill="#3b82f6" />
                <Bar dataKey="paper" name="Paper (kg)" stackId="a" fill="#f59e0b" />
                <Bar dataKey="glass" name="Glass (kg)" stackId="a" fill="#14b8a6" />
                <Bar dataKey="ewaste" name="E-Waste (kg)" stackId="a" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </>
            )}

            {metricView === 'co2' && (
              <Bar dataKey="co2SavedKg" name="CO₂ Emissions Saved (kg CO₂e)" fill="#059669" radius={[6, 6, 0, 0]}>
                {WEEKLY_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.co2SavedKg > 130 ? '#059669' : '#10b981'} />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
