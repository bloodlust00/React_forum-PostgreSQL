import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Users, BookOpen, Globe2, ArrowUpRight } from 'lucide-react';

export default function StatsCard({ stats = {}, isLoading }) {
  const { total_students = 0, qualification_breakdown = {}, language_distribution = {} } = stats;

  // Transform qualification_breakdown for Pie Chart
  const pieData = Object.entries(qualification_breakdown).map(([name, value]) => ({
    name,
    value
  }));

  // Transform language_distribution for Bar Chart
  const barData = Object.entries(language_distribution).map(([name, count]) => ({
    name,
    count
  }));

  // Highly professional, minimal, high-contrast flat colors
  const COLORS = ['#4F46E5', '#64748B', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="premium-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl animate-shimmer" />
            <div className="space-y-1.5 flex-grow">
              <div className="h-3 w-1/3 rounded-sm animate-shimmer" />
              <div className="h-5 w-1/2 rounded-sm animate-shimmer" />
            </div>
          </div>
          <div className="h-32 w-full rounded-xl animate-shimmer" />
        </div>
      ))}
    </div>
  );

  if (isLoading) return renderSkeleton();

  // Find most popular qualification
  const topQualification = pieData.length > 0 
    ? pieData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
    : 'N/A';

  // Find most popular language
  const topLanguage = barData.length > 0 
    ? barData.reduce((prev, current) => (prev.count > current.count) ? prev : current).name 
    : 'N/A';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Widget 1: Key Overview Metrics */}
      <div className="premium-card rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-0.5">
            Active Registry <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total Student Base
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {total_students}
          </h2>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="block font-medium text-slate-400">Top Stream</span>
            <span className="font-bold text-slate-800">{topQualification}</span>
          </div>
          <div className="text-right">
            <span className="block font-medium text-slate-400">Top Language</span>
            <span className="font-bold text-slate-800">{topLanguage}</span>
          </div>
        </div>
      </div>

      {/* Widget 2: Educational Stream distribution */}
      <div className="premium-card rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Qualification Stream
          </h3>
        </div>

        {pieData.length > 0 ? (
          <div className="flex items-center justify-between h-[110px] mt-1">
            <div className="w-[50%] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={46}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#FFFFFF" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-[50%] flex flex-col gap-1 max-h-full overflow-y-auto pl-2">
              {pieData.slice(0, 4).map((item, index) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-700 font-semibold truncate">
                    {item.name}: <span className="font-bold text-slate-900">{item.value}</span>
                  </span>
                </div>
              ))}
              {pieData.length > 4 && (
                <span className="text-[9px] text-slate-500 italic pl-3.5">
                  + {pieData.length - 4} more
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="h-[110px] flex items-center justify-center text-xs text-slate-500 italic font-medium">
            No stats data available
          </div>
        )}

        <div className="text-[10px] text-slate-400 text-right">Academic stream details</div>
      </div>

      {/* Widget 3: Languages Distribution */}
      <div className="premium-card rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <Globe2 className="w-4 h-4 text-slate-650" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Language Capabilities
          </h3>
        </div>

        {barData.some(b => b.count > 0) ? (
          <div className="h-[110px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData.slice(0, 5)} margin={{ top: 5, right: 5, left: -32, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 9, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 23, 42, 0.02)' }}
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    color: '#0F172A',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                />
                <Bar dataKey="count" fill="#4F46E5" radius={[3, 3, 0, 0]}>
                  {barData.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[(index + 1) % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[110px] flex items-center justify-center text-xs text-slate-500 italic font-medium">
            No stats data available
          </div>
        )}

        <div className="text-[10px] text-slate-400 text-right">Top language capabilities</div>
      </div>
    </div>
  );
}
