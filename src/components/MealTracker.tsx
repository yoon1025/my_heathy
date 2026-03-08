import React, { useState, useEffect } from 'react';
import { UserProfile, MealLog } from '../types';
import { storage } from '../services/storage';
import { Utensils, Plus, Trash2, Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface MealTrackerProps {
  profile: UserProfile | null;
}

export default function MealTracker({ profile }: MealTrackerProps) {
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeal, setNewMeal] = useState({
    type: 'breakfast' as MealLog['type'],
    content: '',
    calories: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchMeals = () => {
    if (!profile) return;
    const allMeals = storage.getMealLogs();
    const sortedMeals = [...allMeals].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setMeals(sortedMeals);
  };

  useEffect(() => {
    fetchMeals();
  }, [profile]);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newMeal.content) return;

    storage.addMealLog({
      uid: profile.uid,
      date: newMeal.date,
      type: newMeal.type,
      content: newMeal.content,
      calories: newMeal.calories ? parseInt(newMeal.calories) : undefined,
      createdAt: new Date().toISOString()
    });
    
    setNewMeal({ ...newMeal, content: '', calories: '' });
    setIsModalOpen(false);
    fetchMeals();
  };

  const handleDeleteMeal = (id: string) => {
    if (!profile) return;
    storage.deleteMealLog(id);
    fetchMeals();
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식'
  };

  const mealTypeColors: Record<string, string> = {
    breakfast: 'bg-orange-100 text-orange-600',
    lunch: 'bg-emerald-100 text-emerald-600',
    dinner: 'bg-indigo-100 text-indigo-600',
    snack: 'bg-amber-100 text-amber-600'
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">식단 기록 🥗</h1>
          <p className="text-stone-500">무엇을 드셨나요? 꼼꼼하게 기록해보세요.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          기록하기
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {meals.map((meal) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${mealTypeColors[meal.type]}`}>
                  {mealTypeLabels[meal.type]}
                </span>
                <button 
                  onClick={() => meal.id && handleDeleteMeal(meal.id)}
                  className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-stone-800 font-medium mb-2 leading-relaxed">
                {meal.content}
              </p>

              {meal.calories && (
                <p className="text-emerald-600 font-bold text-sm mb-4">
                  {meal.calories} kcal
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-stone-400 font-medium pt-4 border-t border-stone-50">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {meal.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(meal.createdAt), 'HH:mm')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {meals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Utensils className="w-16 h-16 mb-4 opacity-10" />
          <p>아직 기록된 식단이 없습니다.</p>
          <p className="text-sm">오늘의 첫 끼니를 기록해보세요!</p>
        </div>
      )}

      {/* Add Meal Modal */}
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
                <h2 className="text-xl font-bold text-stone-900">식단 기록하기</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddMeal} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">날짜</label>
                  <input 
                    type="date" 
                    value={newMeal.date}
                    onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">식사 종류</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(mealTypeLabels).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewMeal({ ...newMeal, type: key as MealLog['type'] })}
                        className={`py-3 rounded-2xl text-sm font-bold transition-all border ${
                          newMeal.type === key 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                            : 'bg-stone-50 border-stone-200 text-stone-500 hover:border-emerald-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">내용</label>
                  <textarea 
                    placeholder="무엇을 드셨나요? (예: 닭가슴살 샐러드, 현미밥)"
                    value={newMeal.content}
                    onChange={(e) => setNewMeal({ ...newMeal, content: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">칼로리 (선택)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">kcal</span>
                  </div>
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
