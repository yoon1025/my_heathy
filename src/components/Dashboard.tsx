import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog, MealLog } from '../types';
import { storage } from '../services/storage';
import { 
  Utensils, 
  Droplets, 
  Scale, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Award,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { format, isSameDay, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  profile: UserProfile | null;
  setActiveTab: (tab: any) => void;
}

export default function Dashboard({ profile, setActiveTab }: DashboardProps) {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [todayWater, setTodayWater] = useState<number>(0);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!profile) return;

    // Fetch weight logs for chart
    const allWeightLogs = storage.getWeightLogs();
    const sortedWeightLogs = [...allWeightLogs]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
    setWeightLogs(sortedWeightLogs);

    // Fetch today's meals
    const allMealLogs = storage.getMealLogs();
    const filteredMeals = allMealLogs.filter(m => m.date === today);
    setTodayMeals(filteredMeals);

    // Fetch today's water
    const allWaterLogs = storage.getWaterLogs();
    const totalWater = allWaterLogs
      .filter(w => w.date === today)
      .reduce((acc, curr) => acc + curr.amount, 0);
    setTodayWater(totalWater);

  }, [profile, today]);

  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
  const weightDiff = weightLogs.length > 1 
    ? (weightLogs[weightLogs.length - 1].weight - weightLogs[weightLogs.length - 2].weight).toFixed(1)
    : 0;

  const waterProgress = profile?.dailyWaterGoal ? Math.min((todayWater / profile.dailyWaterGoal) * 100, 100) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 mb-1">안녕하세요, {profile?.displayName}님! 👋</h1>
        <p className="text-stone-500">오늘도 건강한 하루를 만들어볼까요?</p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weight Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-blue-600" />
            </div>
            <button onClick={() => setActiveTab('weight')} className="text-stone-400 hover:text-stone-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm font-medium text-stone-500 mb-1">현재 체중</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-stone-900">{currentWeight || '--'}</h2>
            <span className="text-stone-400 font-medium">kg</span>
          </div>
          {weightDiff !== 0 && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${Number(weightDiff) < 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(weightDiff) < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(Number(weightDiff))}kg {Number(weightDiff) < 0 ? '감소' : '증가'} (어제 대비)
            </div>
          )}
        </motion.div>

        {/* Water Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-600" />
            </div>
            <button onClick={() => setActiveTab('water')} className="text-stone-400 hover:text-stone-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm font-medium text-stone-500 mb-1">오늘의 수분</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-stone-900">{todayWater}</h2>
            <span className="text-stone-400 font-medium">/ {profile?.dailyWaterGoal || 2000}ml</span>
          </div>
          <div className="mt-4 h-2 bg-stone-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${waterProgress}%` }}
              className="h-full bg-cyan-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Goal Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-100 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-emerald-100 text-sm font-medium mb-1">목표 체중까지</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold">
              {profile?.targetWeight && currentWeight ? Math.max(0, currentWeight - profile.targetWeight).toFixed(1) : '--'}
            </h2>
            <span className="text-emerald-100 font-medium">kg 남음</span>
          </div>
          <p className="mt-2 text-xs text-emerald-100 opacity-80">목표: {profile?.targetWeight || '--'}kg</p>
        </motion.div>
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-stone-900">최근 체중 변화</h3>
            <button onClick={() => setActiveTab('weight')} className="text-xs font-semibold text-emerald-600 hover:underline">상세보기</button>
          </div>
          <div className="h-64 w-full">
            {weightLogs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightLogs}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
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
                    hide 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(str) => format(new Date(str), 'yyyy년 MM월 dd일')}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-400">
                <Scale className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">기록된 체중이 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Meals */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-stone-900">오늘의 식단</h3>
            <button onClick={() => setActiveTab('meals')} className="text-xs font-semibold text-emerald-600 hover:underline">기록하기</button>
          </div>
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner'].map((type) => {
              const meal = todayMeals.find(m => m.type === type);
              const labels: Record<string, string> = { breakfast: '아침', lunch: '점심', dinner: '저녁' };
              return (
                <div key={type} className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meal ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-400'}`}>
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{labels[type]}</p>
                    <p className={`text-sm font-medium ${meal ? 'text-stone-900' : 'text-stone-400 italic'}`}>
                      {meal ? meal.content : '기록이 없습니다'}
                    </p>
                  </div>
                  {!meal && (
                    <button 
                      onClick={() => setActiveTab('meals')}
                      className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
