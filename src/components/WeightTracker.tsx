import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog } from '../types';
import { storage } from '../services/storage';
import { Scale, Plus, Trash2, Calendar as CalendarIcon, TrendingDown, TrendingUp, X, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightTrackerProps {
  profile: UserProfile | null;
}

export default function WeightTracker({ profile }: WeightTrackerProps) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState({
    weight: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchLogs = () => {
    if (!profile) return;
    const allLogs = storage.getWeightLogs();
    const sortedLogs = [...allLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setLogs(sortedLogs);
  };

  useEffect(() => {
    fetchLogs();
  }, [profile]);

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newWeight.weight) return;

    storage.addWeightLog({
      uid: profile.uid,
      date: newWeight.date,
      weight: parseFloat(newWeight.weight),
      createdAt: new Date().toISOString()
    });
    
    setNewWeight({ ...newWeight, weight: '' });
    setIsModalOpen(false);
    fetchLogs();
  };

  const handleDeleteLog = (id: string) => {
    if (!profile) return;
    storage.deleteWeightLog(id);
    fetchLogs();
  };

  const chartData = [...logs].reverse();
  const currentWeight = logs.length > 0 ? logs[0].weight : 0;
  const startWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const totalDiff = (currentWeight - startWeight).toFixed(1);
  const targetDiff = profile?.targetWeight ? (currentWeight - profile.targetWeight).toFixed(1) : '--';

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">체중 관리 ⚖️</h1>
          <p className="text-stone-500">꾸준한 기록이 변화의 시작입니다.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          기록하기
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
            <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">현재 체중</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black text-stone-900">{currentWeight || '--'}</h2>
              <span className="text-stone-400 font-bold">kg</span>
            </div>
            {Number(totalDiff) !== 0 && (
              <div className={`mt-4 flex items-center gap-1 text-sm font-bold ${Number(totalDiff) < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {Number(totalDiff) < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                시작 대비 {Math.abs(Number(totalDiff))}kg {Number(totalDiff) < 0 ? '감소' : '증가'}
              </div>
            )}
          </div>

          <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-100 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-200" />
              <p className="text-sm font-bold text-emerald-100 uppercase tracking-wider">목표 체중</p>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black">{profile?.targetWeight || '--'}</h2>
              <span className="text-emerald-100 font-bold">kg</span>
            </div>
            <p className="mt-4 text-sm font-medium text-emerald-50">
              목표까지 {targetDiff}kg 남았습니다. 힘내세요!
            </p>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <h3 className="font-bold text-stone-900 mb-8">체중 변화 그래프 (최근 30일)</h3>
          <div className="h-80 w-full">
            {logs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeightMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(str) => format(new Date(str), 'MM/dd')}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(str) => format(new Date(str), 'yyyy년 MM월 dd일')}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorWeightMain)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-300">
                <p>기록된 체중이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-50">
          <h3 className="font-bold text-stone-900">최근 기록 리스트</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">날짜</th>
                <th className="px-6 py-4">체중 (kg)</th>
                <th className="px-6 py-4">변화</th>
                <th className="px-6 py-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {logs.map((log, index) => {
                const prevLog = logs[index + 1];
                const diff = prevLog ? (log.weight - prevLog.weight).toFixed(1) : null;
                return (
                  <tr key={log.id} className="hover:bg-stone-50/50 transition-all group">
                    <td className="px-6 py-4 text-sm font-medium text-stone-600">{log.date}</td>
                    <td className="px-6 py-4 text-sm font-black text-stone-900">{log.weight} kg</td>
                    <td className="px-6 py-4">
                      {diff !== null && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${Number(diff) < 0 ? 'text-emerald-600' : Number(diff) > 0 ? 'text-red-500' : 'text-stone-400'}`}>
                          {Number(diff) < 0 ? <TrendingDown className="w-3 h-3" /> : Number(diff) > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                          {diff === '0.0' ? '-' : `${Math.abs(Number(diff))}kg`}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => log.id && handleDeleteLog(log.id)}
                        className="text-stone-300 hover:text-red-500 transition-all p-2 rounded-xl hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="py-10 text-center text-stone-300 text-sm">기록이 없습니다.</div>
          )}
        </div>
      </div>

      {/* Add Weight Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-stone-900">체중 기록하기</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddWeight} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">날짜</label>
                  <input 
                    type="date" 
                    value={newWeight.date}
                    onChange={(e) => setNewWeight({ ...newWeight, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">체중 (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    placeholder="0.0"
                    value={newWeight.weight}
                    onChange={(e) => setNewWeight({ ...newWeight, weight: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none text-2xl font-black"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                >
                  저장하기
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
