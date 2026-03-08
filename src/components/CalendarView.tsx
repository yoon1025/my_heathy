import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog, MealLog, WaterLog, ExerciseLog } from '../types';
import { storage } from '../services/storage';
import { 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Droplets, 
  Scale,
  Calendar as CalendarIcon,
  Activity,
  Flame
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
  parseISO,
  isWithinInterval
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
    exercises: ExerciseLog[];
  }>({ meals: [], weights: [], waters: [], exercises: [] });

  useEffect(() => {
    if (!profile) return;

    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));

    // Fetch all logs from local storage
    const allMeals = storage.getMealLogs();
    const allWeights = storage.getWeightLogs();
    const allWaters = storage.getWaterLogs();
    const allExercises = storage.getExerciseLogs();

    // Filter logs for the visible interval in the calendar
    const filteredMeals = allMeals.filter(m => {
      const d = parseISO(m.date);
      return isWithinInterval(d, { start, end });
    });
    const filteredWeights = allWeights.filter(w => {
      const d = parseISO(w.date);
      return isWithinInterval(d, { start, end });
    });
    const filteredWaters = allWaters.filter(w => {
      const d = parseISO(w.date);
      return isWithinInterval(d, { start, end });
    });
    const filteredExercises = allExercises.filter(e => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start, end });
    });

    setMonthData({
      meals: filteredMeals,
      weights: filteredWeights,
      waters: filteredWaters,
      exercises: filteredExercises
    });
  }, [profile, currentMonth]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // For the detail view, we should fetch from all logs to be sure we have the data
  // even if the selected date is outside the current month's visible interval
  const allMeals = storage.getMealLogs();
  const allWeights = storage.getWeightLogs();
  const allWaters = storage.getWaterLogs();
  const allExercises = storage.getExerciseLogs();

  const dayMeals = allMeals.filter(m => m.date === selectedDateStr);
  const dayWeight = allWeights.find(w => w.date === selectedDateStr);
  const dayWater = allWaters.filter(w => w.date === selectedDateStr).reduce((acc, curr) => acc + curr.amount, 0);
  const dayExercises = allExercises.filter(e => e.date === selectedDateStr);

  const totalConsumed = dayMeals.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalBurned = dayExercises.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
  const netDayCalories = totalConsumed - totalBurned;

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
              const hasExercise = monthData.exercises.some(e => e.date === dateStr);
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
                    {hasExercise && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-orange-500 shadow-sm shadow-orange-100'}`} />}
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
            {/* Daily Summary Section */}
            <div className="p-5 rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-emerald-100" />
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">일일 칼로리 요약</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <h4 className="text-3xl font-black">{netDayCalories}</h4>
                <span className="text-emerald-100 font-bold text-sm">kcal (순 섭취)</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-[10px] font-bold text-emerald-100">
                <div className="flex flex-col">
                  <span className="opacity-60 mb-1">총 섭취</span>
                  <span className="text-white text-sm">{totalConsumed} kcal</span>
                </div>
                <div className="flex flex-col">
                  <span className="opacity-60 mb-1">총 소모</span>
                  <span className="text-white text-sm">{totalBurned} kcal</span>
                </div>
              </div>
            </div>

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

            {/* Exercise Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-stone-700">운동</span>
              </div>
              <div className="space-y-2">
                {dayExercises.length > 0 ? dayExercises.map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                        {ex.type}
                      </span>
                      <span className="text-[10px] font-bold text-orange-400">
                        {ex.duration}분
                      </span>
                    </div>
                    {ex.caloriesBurned && (
                      <p className="text-xs font-medium text-orange-900">{ex.caloriesBurned} kcal 소모</p>
                    )}
                  </div>
                )) : (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-stone-400 text-sm italic">
                    기록 없음
                  </div>
                )}
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
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">
                        {meal.type === 'breakfast' ? '아침' : meal.type === 'lunch' ? '점심' : meal.type === 'dinner' ? '저녁' : '간식'}
                      </span>
                      {meal.calories && (
                        <span className="text-[10px] font-bold text-emerald-600">
                          {meal.calories} kcal
                        </span>
                      )}
                    </div>
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
