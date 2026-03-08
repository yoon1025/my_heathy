import React, { useState, useEffect } from 'react';
import { UserProfile, ExerciseLog } from '../types';
import { storage } from '../services/storage';
import { Activity, Plus, Trash2, Calendar as CalendarIcon, Clock, X, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface ExerciseTrackerProps {
  profile: UserProfile | null;
}

export default function ExerciseTracker({ profile }: ExerciseTrackerProps) {
  const [exercises, setExercises] = useState<ExerciseLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExercise, setNewExercise] = useState({
    type: '',
    duration: '',
    caloriesBurned: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchExercises = () => {
    if (!profile) return;
    const allExercises = storage.getExerciseLogs();
    const sortedExercises = [...allExercises].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setExercises(sortedExercises);
  };

  useEffect(() => {
    fetchExercises();
  }, [profile]);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newExercise.type || !newExercise.duration) return;

    storage.addExerciseLog({
      uid: profile.uid,
      date: newExercise.date,
      type: newExercise.type,
      duration: parseInt(newExercise.duration),
      caloriesBurned: newExercise.caloriesBurned ? parseInt(newExercise.caloriesBurned) : undefined,
      createdAt: new Date().toISOString()
    });
    
    setNewExercise({ ...newExercise, type: '', duration: '', caloriesBurned: '' });
    setIsModalOpen(false);
    fetchExercises();
  };

  const calculateWalkingCalories = (mins: number) => {
    // 1시간(60분) 기준 350kcal 소모 (200~400의 중간값)
    // 1분당 약 5.83kcal
    return Math.round(mins * 5.83);
  };

  useEffect(() => {
    if (newExercise.type.includes('걷기') && newExercise.duration) {
      const mins = parseInt(newExercise.duration);
      if (!isNaN(mins)) {
        setNewExercise(prev => ({
          ...prev,
          caloriesBurned: calculateWalkingCalories(mins).toString()
        }));
      }
    }
  }, [newExercise.type, newExercise.duration]);

  const handleDeleteExercise = (id: string) => {
    if (!profile) return;
    storage.deleteExerciseLog(id);
    fetchExercises();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">운동 기록 🏃‍♂️</h1>
          <p className="text-stone-500">오늘 얼마나 움직이셨나요? 건강한 땀방울을 기록하세요.</p>
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
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm relative group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-bold text-stone-800">{exercise.type}</span>
                </div>
                <button 
                  onClick={() => exercise.id && handleDeleteExercise(exercise.id)}
                  className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">시간</span>
                  <span className="text-stone-700 font-bold">{exercise.duration}분</span>
                </div>
                {exercise.caloriesBurned && (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">소모 칼로리</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {exercise.caloriesBurned} kcal
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 font-medium pt-4 border-t border-stone-50">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {exercise.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(exercise.createdAt), 'HH:mm')}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {exercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Activity className="w-16 h-16 mb-4 opacity-10" />
          <p>아직 기록된 운동이 없습니다.</p>
          <p className="text-sm">오늘의 활동을 기록해보세요!</p>
        </div>
      )}

      {/* Add Exercise Modal */}
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
                <h2 className="text-xl font-bold text-stone-900">운동 기록하기</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddExercise} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">날짜</label>
                  <input 
                    type="date" 
                    value={newExercise.date}
                    onChange={(e) => setNewExercise({ ...newExercise, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">운동 종류</label>
                  <input 
                    type="text" 
                    placeholder="예: 걷기, 달리기, 요가, 웨이트"
                    value={newExercise.type}
                    onChange={(e) => setNewExercise({ ...newExercise, type: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['걷기', '달리기', '요가', '웨이트'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewExercise({ ...newExercise, type })}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                          newExercise.type === type 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">시간 (분)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      step="10"
                      min="0"
                      value={newExercise.duration}
                      onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {[10, 30, 60].map(mins => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setNewExercise({ ...newExercise, duration: mins.toString() })}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                        >
                          +{mins}분
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">소모 칼로리</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      value={newExercise.caloriesBurned}
                      onChange={(e) => setNewExercise({ ...newExercise, caloriesBurned: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                    {newExercise.type.includes('걷기') && (
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">걷기 기준 자동 계산됨</p>
                    )}
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
