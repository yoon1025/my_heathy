import React, { useState, useEffect } from 'react';
import { UserProfile, WaterLog } from '../types';
import { storage } from '../services/storage';
import { Droplets, Plus, Trash2, Calendar as CalendarIcon, Clock, X, GlassWater } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface WaterTrackerProps {
  profile: UserProfile | null;
}

export default function WaterTracker({ profile }: WaterTrackerProps) {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchLogs = () => {
    if (!profile) return;
    const allLogs = storage.getWaterLogs();
    const todayLogs = allLogs
      .filter(log => log.date === today)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setLogs(todayLogs);
  };

  useEffect(() => {
    fetchLogs();
  }, [profile, today]);

  const handleAddWater = (amount: number) => {
    if (!profile) return;

    storage.addWaterLog({
      uid: profile.uid,
      date: today,
      amount,
      createdAt: new Date().toISOString()
    });
    fetchLogs();
  };

  const handleDeleteLog = (id: string) => {
    if (!profile) return;
    storage.deleteWaterLog(id);
    fetchLogs();
  };

  const totalAmount = logs.reduce((acc, log) => acc + log.amount, 0);
  const goal = profile?.dailyWaterGoal || 2000;
  const progress = Math.min((totalAmount / goal) * 100, 100);

  const quickAddOptions = [
    { label: '한 컵', amount: 200, icon: GlassWater },
    { label: '작은 병', amount: 330, icon: Droplets },
    { label: '큰 병', amount: 500, icon: Droplets },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 mb-1">수분 섭취 💧</h1>
        <p className="text-stone-500">건강한 몸을 위해 충분한 물을 마셔주세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-stone-100"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * progress) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-cyan-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-stone-900">{Math.round(progress)}%</span>
              <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">목표 달성</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-stone-900">{totalAmount} <span className="text-lg text-stone-400 font-medium">ml</span></h2>
            <p className="text-stone-500 font-medium">오늘의 목표: {goal}ml</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full mt-10">
            {quickAddOptions.map((option) => (
              <button
                key={option.amount}
                onClick={() => handleAddWater(option.amount)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-700 hover:bg-cyan-100 transition-all group"
              >
                <option.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">{option.label}</span>
                <span className="text-[10px] opacity-60">+{option.amount}ml</span>
              </button>
            ))}
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-stone-900 mb-6">오늘의 기록</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-900">{log.amount}ml</p>
                      <p className="text-[10px] font-medium text-stone-400">{format(new Date(log.createdAt), 'HH:mm')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => log.id && handleDeleteLog(log.id)}
                    className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                <p className="text-sm">아직 기록이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
