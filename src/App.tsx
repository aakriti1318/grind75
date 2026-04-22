/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Scale as ScaleIcon, 
  Settings as SettingsIcon,
  Flame,
  Check,
  TrendingDown,
  PlusCircle,
  Award,
  Calendar,
  ChevronRight,
  Target,
  Edit2,
  Trash2,
  Moon,
  Utensils,
  Footprints,
  Briefcase,
  MonitorPlay,
  RotateCcw,
  Dumbbell,
  Droplets
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

type Screen = 'dashboard' | 'progress' | 'weight' | 'settings';

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  streak: number;
}

interface WeightEntry {
  date: string;
  weight: number;
}

// --- Mock Data ---

const INITIAL_HABITS: Habit[] = [
  { id: '1', title: 'Startup Work', description: '9:00 AM', icon: <Briefcase size={20} />, completed: true, streak: 5 },
  { id: '2', title: 'Content', description: '11:00 AM', icon: <MonitorPlay size={20} />, completed: true, streak: 5 },
  { id: '3', title: 'Sleep', description: '8 Hours', icon: <Moon size={20} />, completed: true, streak: 12 },
  { id: '4', title: 'Diet', description: 'Protein+', icon: <Utensils size={20} />, completed: true, streak: 8 },
  { id: '5', title: 'No Junk', description: 'Whole Day', icon: <Trash2 size={20} />, completed: false, streak: 12 },
  { id: '6', title: 'Steps 8k', description: '5,420 / 8,000', icon: <Footprints size={20} />, completed: false, streak: 3 },
  { id: '7', title: 'Office Work', description: 'Complete', icon: <Briefcase size={20} />, completed: true, streak: 5 },
  { id: '8', title: 'Gym', description: 'Leg Day', icon: <Dumbbell size={20} />, completed: false, streak: 5 },
];

const WEIGHT_DATA: WeightEntry[] = [
  { date: 'Mar 01', weight: 84.5 },
  { date: 'Mar 05', weight: 84.1 },
  { date: 'Mar 10', weight: 83.8 },
  { date: 'Mar 15', weight: 83.2 },
  { date: 'Mar 20', weight: 83.5 },
  { date: 'Mar 25', weight: 82.8 },
  { date: 'Mar 30', weight: 82.4 },
];

// --- Components ---

const TopBar = ({ day = 12, streak = 12 }) => (
  <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-obsidian/80 backdrop-blur-lg border-b border-white/10">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-electric-blue font-display tracking-tight font-semibold">Day {day} of 75</h1>
    </div>
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
      <span className="text-sm font-bold text-gradient-orange flex items-center gap-1">
        {streak} <Flame size={14} className="fill-current" />
      </span>
    </div>
  </header>
);

const BottomNav = ({ active, onNavigate }: { active: Screen, onNavigate: (s: Screen) => void }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'progress', label: 'Progress', icon: <BarChart3 size={20} /> },
    { id: 'weight', label: 'Weight', icon: <ScaleIcon size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ] as const;

  return (
    <nav className="fixed bottom-0 w-full z-50 px-6 pb-8 pt-4 bg-obsidian/90 backdrop-blur-2xl border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 rounded-xl px-3 py-2",
              active === item.id 
                ? "text-electric-blue bg-electric-blue/10 scale-110" 
                : "text-zinc-500 hover:text-white"
            )}
            id={`nav-${item.id}`}
          >
            {item.icon}
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] mt-1.5">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

// --- Screen Components ---

const Dashboard = ({ habits, toggleHabit }: { habits: Habit[], toggleHabit: (id: string) => void }) => {
  const completedCount = habits.filter(h => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <section className="text-center pt-8">
        <h2 className="font-display text-4xl sm:text-5xl font-black italic tracking-tighter text-gradient-blue leading-tight mb-4">
          Discipline is doing what needs to be done.
        </h2>
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em]">— THE STOIC WAY</p>
      </section>

      <section className="flex justify-center relative">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[12px] border-white/5" />
          <div 
            className="absolute inset-0 rounded-full progress-conical transition-all duration-1000" 
            style={{ 
              '--progress': `${progressPercent}%`,
              maskImage: 'radial-gradient(transparent 58%, black 59%)',
              WebkitMaskImage: 'radial-gradient(transparent 58%, black 59%)'
            } as any}
          />
          <div className="text-center z-10">
            <span className="font-mono text-[10px] text-electric-blue uppercase tracking-widest">TODAY'S GRIND</span>
            <div className="font-display text-6xl font-black tracking-tighter leading-none mt-2">{progressPercent}%</div>
            <span className="text-sm text-zinc-400 mt-2 block">{completedCount}/{habits.length} Complete</span>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-electric-blue/20 blur-[80px] -z-10 rounded-full" />
      </section>

      <section className="grid grid-cols-2 gap-4">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className={cn(
              "glass-surface moonlight-edge p-4 rounded-2xl flex flex-col justify-between h-40 transition-all duration-300 group text-left",
              !habit.completed && "border-dashed border-white/10 opacity-60"
            )}
          >
            <div className="flex justify-between items-start">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                habit.completed ? "bg-electric-blue/10 text-electric-blue" : "bg-white/5 text-zinc-500"
              )}>
                {habit.icon}
              </div>
              <div className="px-2 py-0.5 rounded bg-punchy-orange/10 text-[9px] font-bold text-punchy-orange uppercase tracking-tighter">
                {habit.streak} STREAK
              </div>
            </div>
            <div>
              <h3 className={cn("font-semibold text-sm mb-1", habit.completed ? "text-white" : "text-zinc-400")}>{habit.title}</h3>
              <div className="flex justify-between items-end">
                <span className="text-[10px] text-zinc-500 font-medium">{habit.description}</span>
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300",
                  habit.completed ? "bg-electric-blue text-obsidian scale-100" : "bg-white/5 border border-white/10 scale-90"
                )}>
                  {habit.completed && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            </div>
          </button>
        ))}
      </section>

      <section className="relative w-full h-48 rounded-2xl overflow-hidden glass-surface moonlight-edge group">
        <img 
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=600" 
          alt="Gym" 
          className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className="font-mono text-[9px] text-electric-blue uppercase tracking-[0.2em]">NEXT SESSION</span>
          <p className="font-display text-xl font-bold text-white">HIIT Blast - 6:00 PM</p>
        </div>
      </section>
    </div>
  );
};

const ProgressHeatmap = () => {
  // Mock heatmap grid data
  const grid = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0,
      selected: i === 65
    }));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <div className="space-y-1">
        <span className="font-mono text-[10px] text-electric-blue uppercase tracking-widest font-bold">Analytics Dashboard</span>
        <h2 className="font-display text-3xl font-black">Mission Progress</h2>
      </div>

      <section className="glass-surface moonlight-edge rounded-2xl p-6">
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Activity History</p>
            <p className="text-lg font-bold">10-Week Momentum</p>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-[10px] text-zinc-500">Less</span>
            {[0, 1, 2, 3, 4].map(v => (
              <div 
                key={v} 
                className={cn(
                  "w-3 h-3 rounded-[2px]",
                  v === 0 ? "bg-white/5" : `bg-electric-blue/${v * 20}`
                )} 
              />
            ))}
            <span className="text-[10px] text-zinc-500">More</span>
          </div>
        </div>

        <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-4 custom-scrollbar">
          {grid.map((cell) => (
            <div 
              key={cell.id} 
              className={cn(
                "w-3.5 h-3.5 rounded-[2px] transition-all cursor-pointer hover:ring-1 hover:ring-white/20",
                cell.intensity === 0 && "bg-white/5",
                cell.intensity === 1 && "bg-electric-blue/20",
                cell.intensity === 2 && "bg-electric-blue/40",
                cell.intensity === 3 && "bg-electric-blue/70",
                cell.intensity === 4 && "bg-electric-blue",
                cell.selected && "ring-2 ring-white ring-offset-2 ring-offset-obsidian"
              )}
            />
          ))}
        </div>
      </section>

      <section className="glass-surface moonlight-edge rounded-2xl p-6 bg-electric-blue/5 border-electric-blue/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Thursday, Oct 24</h3>
              <p className="text-zinc-500 text-xs font-mono">Day 48 of 75 • Completed</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-electric-blue font-black text-2xl">100%</p>
            <p className="text-zinc-500 font-mono text-[9px] uppercase tracking-tighter">Daily Score</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Habits</span>
            <p className="text-sm font-bold">6 / 6 Completed</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="w-full h-full bg-electric-blue" />
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">Weight</span>
            <p className="text-sm font-bold">184.2 lbs</p>
            <p className="text-[10px] text-emerald-400 font-bold">-0.4 lbs from yesterday</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-surface moonlight-edge rounded-2xl p-6 flex flex-col justify-between aspect-square">
          <div>
             <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-2 block">Weekly completion %</span>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black font-display tracking-tighter">94.2%</span>
                <span className="text-emerald-400 text-sm font-bold">↑ 2.4%</span>
             </div>
          </div>
          <div className="h-24 flex items-end gap-1.5">
            {[70, 85, 90, 60, 95, 100, 98].map((v, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex-1 rounded-t-lg transition-all duration-1000",
                  i === 6 ? "bg-electric-blue" : "bg-white/10"
                )}
                style={{ height: `${v}%` }}
              />
            ))}
          </div>
        </div>

        <div className="glass-surface moonlight-edge rounded-2xl p-6 bg-gradient-to-br from-punchy-orange/10 to-transparent flex flex-col justify-between">
           <div>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-4 block">Most Consistent Habit</span>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-punchy-orange/20 flex items-center justify-center text-punchy-orange">
                <Droplets size={32} />
              </div>
              <div>
                <h4 className="text-lg font-bold">1 Gallon Water</h4>
                <p className="text-punchy-orange text-sm font-bold">48 Day Streak</p>
              </div>
            </div>
           </div>
           <div className="relative pt-6">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-5xl font-black italic tracking-tighter text-gradient-orange">48</span>
                <span className="text-zinc-500 font-bold text-xs">DAYS ACTIVE</span>
              </div>
              <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                You are in the top 2% of the global GRIND75 community.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

const WeightTracker = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <section className="glass-surface moonlight-edge rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <ScaleIcon size={120} />
        </div>
        <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-3">CURRENT WEIGHT</p>
        <div className="flex items-baseline gap-2">
           <h1 className="font-display text-7xl font-black tracking-tighter text-electric-blue">82.4</h1>
           <span className="text-2xl font-bold text-zinc-500">kg</span>
        </div>
        <div className="mt-6 flex items-center gap-2 bg-electric-blue/10 px-5 py-2.5 rounded-full border border-electric-blue/20">
          <TrendingDown size={18} className="text-electric-blue" />
          <span className="font-mono text-xs font-bold text-electric-blue uppercase tracking-widest">-2.1 KG THIS WEEK</span>
        </div>
      </section>

      <section className="glass-surface moonlight-edge rounded-3xl p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">Weight Trend</h2>
            <p className="text-xs text-zinc-500 font-mono">Last 30 Days</p>
          </div>
          <div className="bg-white/5 rounded-xl p-1.5 flex gap-1 border border-white/5">
            <button className="px-4 py-1.5 text-[10px] font-bold rounded-lg bg-electric-blue text-obsidian uppercase tracking-widest shadow-lg">30D</button>
            <button className="px-4 py-1.5 text-[10px] font-bold rounded-lg text-zinc-500 hover:text-white uppercase tracking-widest transition-all">90D</button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEIGHT_DATA}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'Space Grotesk' }} 
              />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#60a5fa' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#60a5fa" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorWeight)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-surface moonlight-edge rounded-2xl p-6 flex flex-col justify-between aspect-square transition-transform active:scale-95">
          <div className="w-12 h-12 rounded-2xl bg-punchy-orange/10 flex items-center justify-center mb-4 text-punchy-orange">
             <TrendingDown size={28} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Starting</p>
            <p className="text-3xl font-black font-display">84.5 <span className="text-sm font-bold text-zinc-500">kg</span></p>
          </div>
        </div>

        <div className="glass-surface moonlight-edge rounded-2xl p-6 flex flex-col justify-between aspect-square transition-transform active:scale-95">
          <div className="w-12 h-12 rounded-2xl bg-electric-blue/10 flex items-center justify-center mb-4 text-electric-blue">
             <Award size={28} />
          </div>
          <div>
            <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">Weekly Avg</p>
            <p className="text-3xl font-black font-display">82.9 <span className="text-sm font-bold text-zinc-500">kg</span></p>
          </div>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-electric-blue to-royal-purple p-5 rounded-full flex items-center justify-center gap-3 group transition-all duration-500 active:scale-90 shadow-[0_0_30px_rgba(96,165,250,0.3)]">
        <PlusCircle size={24} className="text-obsidian group-hover:rotate-90 transition-transform duration-500" />
        <span className="font-display font-black text-obsidian tracking-tight">LOG TODAY'S WEIGHT</span>
      </button>
    </div>
  );
};

const Settings = ({ habits }: { habits: Habit[] }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pt-6">
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="font-display text-4xl font-black">Habit Manager</h2>
          <span className="font-mono text-[9px] text-electric-blue uppercase tracking-[0.3em] mb-1">ACTIVE GRIND</span>
        </div>
        
        <div className="space-y-4">
          {habits.slice(0, 3).map((habit) => (
            <div key={habit.id} className="glass-surface moonlight-edge p-5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400">
                  {habit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{habit.title}</h3>
                  <p className="text-xs text-zinc-500 font-medium">{habit.description}</p>
                </div>
              </div>
              <div className={cn("w-14 h-7 rounded-full p-1 transition-colors duration-500 cursor-pointer flex items-center", habit.completed ? "bg-electric-blue/20" : "bg-white/10")}>
                <div className={cn("w-5 h-5 rounded-full transition-all duration-500", habit.completed ? "translate-x-7 bg-electric-blue" : "translate-x-0 bg-zinc-600 shadow-lg")} />
              </div>
            </div>
          ))}

          <button className="w-full glass-surface moonlight-edge p-6 rounded-2xl border-dashed border-2 grow-0 border-white/5 flex items-center justify-center gap-3 text-electric-blue font-bold tracking-tight hover:bg-white/5 transition-all group active:scale-95">
             <PlusCircle size={22} className="group-hover:scale-125 transition-transform" />
             <span>Add Custom Habit</span>
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-display text-3xl font-black">Challenge Config</h2>
        <div className="glass-surface moonlight-edge rounded-2xl overflow-hidden">
          <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue">
                <Target size={20} />
              </div>
              <div>
                <p className="font-bold">Edit 75-Day Goal</p>
                <p className="text-[11px] text-zinc-500 font-mono">Currently: Peak Performance Body</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>

          <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group border-t border-white/5">
            <div className="flex items-center gap-5">
              <div className="w-10 h-10 rounded-xl bg-royal-purple/10 flex items-center justify-center text-royal-purple">
                <Calendar size={20} />
              </div>
              <div>
                <p className="font-bold">Set Start Date</p>
                <p className="text-[11px] text-zinc-500 font-mono">Current: October 24, 2023</p>
              </div>
            </div>
            <Edit2 size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
          </div>

          <div className="p-5 bg-punchy-orange/5 border-t border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-punchy-orange/10 flex items-center justify-center text-punchy-orange">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-punchy-orange">Reset Challenge</p>
                    <p className="text-[11px] text-punchy-orange/60 font-mono">Wipe all progress and start from Day 1</p>
                  </div>
                </div>
                <button className="bg-punchy-orange/10 text-punchy-orange px-5 py-2 rounded-xl text-xs font-black tracking-widest border border-punchy-orange/20 active:scale-95 transition-all">RESET</button>
             </div>
          </div>
        </div>
      </section>

      <div className="relative h-44 rounded-2xl overflow-hidden glass-surface moonlight-edge group">
        <img 
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600" 
          alt="Motivation" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-110 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <p className="font-mono text-electric-blue uppercase text-[10px] tracking-[0.2em] mb-2 font-bold">Midnight Mantra</p>
          <p className="font-display text-xl italic font-medium leading-snug">"Discipline is the bridge between goals and accomplishment."</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  return (
    <div className="min-h-screen bg-obsidian text-zinc-100 selection:bg-electric-blue/30 overflow-x-hidden">
      <TopBar />
      
      <main className="max-w-md mx-auto pt-20 pb-36 px-5 lg:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {activeScreen === 'dashboard' && <Dashboard habits={habits} toggleHabit={toggleHabit} />}
            {activeScreen === 'progress' && <ProgressHeatmap />}
            {activeScreen === 'weight' && <WeightTracker />}
            {activeScreen === 'settings' && <Settings habits={habits} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav active={activeScreen} onNavigate={setActiveScreen} />
    </div>
  );
}
