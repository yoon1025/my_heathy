import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog, MealLog, WaterLog } from '../types';
import { storage } from '../services/storage';
import { 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Droplets, 
  Scale,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarViewProps {
  profile: UserProfile | null;
}

export default function CalendarView({ profile }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthData, setMonthData] = useState<{
    meals: MealLog[];
    weights: WeightLog[];
    waters: WaterLog[];
  }>({ meals: [], weights: [], waters: [] });

  useEffect(() => {
    if (!profile) return;

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    // Fetch all logs for the month from local storage
    const allMeals = storage.getMealLogs();
    const allWeights = storage.getWeightLogs();
    const allWaters = storage.getWaterLogs();

    const filteredMeals = allMeals.filter(m => {
      const d = new Date(m.date);
      return d >= start && d <= end;
    });
    const filteredWeights = allWeights.filter(w => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    });
    const filteredWaters = allWaters.filter(w => {
      const d = new Date(w.date);
      return d >= start && d <= end;
    });

    setMonthData({
      meals: filteredMeals,
      weights: filteredWeights,
      waters: filteredWaters
    });
  }, [profile, currentMonth]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayMeals = monthData.meals.filter(m => m.date === selectedDateStr);
  const dayWeight = monthData.weights.find(w => w.date === selectedDateStr);
  const dayWater = monthData.waters.filter(w => w.date === selectedDateStr).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 mb-1">기록 달력 📅</h1>
        <p className="text-stone-500">지나온 기록들을 한눈에 확인해보세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-stone-900">
              {format(currentMonth, 'yyyy년 MM월', { locale: ko })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-stone-50 text-stone-400 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-stone-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, i) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const hasMeal = monthData.meals.some(m => m.date === dateStr);
              const hasWeight = monthData.weights.some(w => w.date === dateStr);
              const hasWater = monthData.waters.some(w => w.date === dateStr);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border ${
                    isSelected 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100 z-10' 
                      : isCurrentMonth 
                        ? 'bg-white border-stone-50 text-stone-700 hover:border-emerald-200' 
                        : 'bg-stone-50 border-transparent text-stone-300'
                  }`}
                >
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                  <div className="flex gap-0.5 mt-1">
                    {hasMeal && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />}
                    {hasWeight && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'}`} />}
                    {hasWater && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-cyan-400'}`} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail Card */}
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
              {format(selectedDate, 'd')}
            </div>
            <div>
              <h3 className="font-bold text-stone-900">{format(selectedDate, 'MM월 dd일 (EEEE)', { locale: ko })}</h3>
              <p className="text-xs text-stone-400 font-medium">상세 기록</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Weight Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-bold text-stone-700">체중</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <p className="text-lg font-black text-blue-900">
                  {dayWeight ? `${dayWeight.weight} kg` : '기록 없음'}
                </p>
              </div>
            </div>

            {/* Water Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-bold text-stone-700">수분</span>
              </div>
              <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-100">
                <p className="text-lg font-black text-cyan-900">
                  {dayWater > 0 ? `${dayWater} ml` : '기록 없음'}
                </p>
              </div>
            </div>

            {/* Meals Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-stone-700">식단</span>
              </div>
              <div className="space-y-2">
                {dayMeals.length > 0 ? dayMeals.map((meal, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">
                      {meal.type === 'breakfast' ? '아침' : meal.type === 'lunch' ? '점심' : meal.type === 'dinner' ? '저녁' : '간식'}
                    </span>
                    <p className="text-sm font-medium text-emerald-900">{meal.content}</p>
                  </div>
                )) : (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-stone-400 text-sm italic">
                    기록 없음
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
