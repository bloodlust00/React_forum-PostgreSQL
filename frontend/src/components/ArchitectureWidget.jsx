import React, { useState, useEffect } from 'react';
import { Database, Cpu, Layout, Activity, ArrowRightLeft } from 'lucide-react';

export default function ArchitectureWidget() {
  const [latency, setLatency] = useState(12);
  const [status, setStatus] = useState('operational');

  // Simulate subtle heartbeat telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 8) + 8); // 8-15 ms
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-indigo-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-350">
            System Architecture
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          LIVE
        </div>
      </div>

      {/* Horizontal Architecture Pipeline */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        
        {/* SVG Flow Lines */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 320 80" fill="none" preserveAspectRatio="none">
            {/* React to FastAPI */}
            <path
              d="M 80 40 L 160 40"
              stroke="url(#reactToFast)"
              strokeWidth="2"
              className="animate-pulse-flow"
            />
            {/* FastAPI to PostgreSQL */}
            <path
              d="M 160 40 L 240 40"
              stroke="url(#fastToPost)"
              strokeWidth="2"
              className="animate-pulse-flow"
            />
            
            {/* Define Gradients */}
            <defs>
              <linearGradient id="reactToFast" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="fastToPost" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Nodes Grid */}
        <div className="flex justify-between items-center w-full z-10">
          
          {/* Node 1: React Client */}
          <div className="flex flex-col items-center gap-1.5 w-[75px]">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-sm">
              <Layout className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 text-center leading-tight">
              React SPA
            </span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">
              Vite + Tailwind
            </span>
          </div>

          {/* Node 2: FastAPI */}
          <div className="flex flex-col items-center gap-1.5 w-[75px]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 text-center leading-tight">
              FastAPI
            </span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">
              Python REST
            </span>
          </div>

          {/* Node 3: PostgreSQL */}
          <div className="flex flex-col items-center gap-1.5 w-[75px]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/20 dark:border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 text-center leading-tight">
              PostgreSQL
            </span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500">
              SQLAlchemy
            </span>
          </div>

        </div>
      </div>

      {/* Network Metrics Footer */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-150 dark:border-slate-800/60 text-[10px]">
        <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/20 dark:border-slate-800/30">
          <span className="text-slate-400 dark:text-slate-500 block">Avg Connection</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-indigo-400" />
            http://localhost:8000
          </span>
        </div>
        <div className="bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200/20 dark:border-slate-800/30">
          <span className="text-slate-400 dark:text-slate-500 block">DB Query Latency</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {latency} ms
          </span>
        </div>
      </div>
    </div>
  );
}
