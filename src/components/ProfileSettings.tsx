import React, { useState } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';
import { User as UserIcon, Target, Droplets, Save, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileSettingsProps {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
}

export default function ProfileSettings({ profile, setProfile }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    targetWeight: profile?.targetWeight || 0,
    dailyWaterGoal: profile?.dailyWaterGoal || 2000,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const updatedProfile = { ...profile, ...formData };
      storage.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900 mb-1">프로필 설정 ⚙️</h1>
        <p className="text-stone-500">목표를 설정하고 개인 정보를 관리하세요.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-stone-400" />
              기본 정보
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">이름 (닉네임)</label>
              <input 
                type="text" 
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">이메일</label>
              <input 
                type="email" 
                value={profile?.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed outline-none"
              />
              <p className="mt-2 text-xs text-stone-400">이메일은 변경할 수 없습니다.</p>
            </div>
          </div>

          <hr className="border-stone-50" />

          {/* Goals */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-stone-400" />
              나의 목표
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">목표 체중 (kg)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">kg</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">일일 수분 목표 (ml)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="100"
                    value={formData.dailyWaterGoal}
                    onChange={(e) => setFormData({ ...formData, dailyWaterGoal: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">ml</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-stone-50" />

          {/* Reminders */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-stone-400" />
              알림 설정 (준비 중)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-sm font-bold text-stone-700">식사 시간 알림</p>
                  <p className="text-xs text-stone-400">아침, 점심, 저녁 식사 시간에 맞춰 알림을 보냅니다.</p>
                </div>
                <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-not-allowed">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-sm font-bold text-stone-700">물 마시기 알림</p>
                  <p className="text-xs text-stone-400">2시간마다 수분 섭취를 권장하는 알림을 보냅니다.</p>
                </div>
                <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-not-allowed">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 text-center italic">푸시 알림 기능은 다음 업데이트에서 정식 지원될 예정입니다.</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2 text-emerald-600 font-bold text-sm"
              >
                <CheckCircle2 className="w-5 h-5" />
                설정이 저장되었습니다!
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isSaving}
            className="ml-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Save className="w-5 h-5" />
            )}
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}
