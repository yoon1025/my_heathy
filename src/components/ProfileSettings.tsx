import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';
import { notificationService } from '../services/notifications';
import { User as UserIcon, Target, Droplets, Save, CheckCircle2, Bell, BellOff } from 'lucide-react';
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
    geminiApiKey: profile?.geminiApiKey || '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('default');

  useEffect(() => {
    setPermissionStatus(notificationService.getPermissionStatus());
    // 로컬 스토리지에서 알림 설정 불러오기 (간단히 구현)
    const savedNotify = localStorage.getItem('notifications_enabled') === 'true';
    setNotificationsEnabled(savedNotify);
  }, []);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
        notificationService.sendNotification('알림 설정 완료', 'Greens에서 건강한 소식을 전해드릴게요! 🌱');
      } else {
        alert('알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.');
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem('notifications_enabled', 'false');
    }
    setPermissionStatus(notificationService.getPermissionStatus());
  };

  const handleTestNotification = () => {
    notificationService.sendNotification('테스트 알림', '알림 기능이 정상적으로 작동합니다! 🚀');
  };

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
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-stone-700">개인 Gemini API 키 (선택)</h4>
              </div>
              <p className="text-xs text-stone-500 mb-3">
                본인의 Gemini API 키를 입력하면 개인 할당량을 사용하여 AI 기능을 이용할 수 있습니다. 
                입력하지 않으면 시스템 기본 키를 사용합니다.
              </p>
              <input 
                type="password" 
                placeholder="AI Studio에서 발급받은 API 키 입력"
                value={formData.geminiApiKey}
                onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
              <p className="mt-2 text-[10px] text-stone-400">
                * 키는 브라우저 로컬 저장소에만 안전하게 저장됩니다.
              </p>
            </div>
          </div>

          <hr className="border-stone-50" />

          {/* Reminders */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-stone-400" />
                알림 설정
              </h3>
              {notificationsEnabled && (
                <button 
                  type="button"
                  onClick={handleTestNotification}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  테스트 알림 보내기
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-100">
                <div>
                  <p className="text-sm font-bold text-stone-700">푸시 알림 활성화</p>
                  <p className="text-xs text-stone-400">식사 시간 및 수분 섭취 알림을 받습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className={`w-12 h-6 rounded-full relative transition-all ${
                    notificationsEnabled ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                >
                  <motion.div 
                    animate={{ x: notificationsEnabled ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>

              {permissionStatus === 'denied' && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
                  <BellOff className="w-5 h-5 text-red-500" />
                  <p className="text-xs text-red-600 font-medium">
                    브라우저에서 알림 권한이 차단되어 있습니다. 설정에서 권한을 허용해주세요.
                  </p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-stone-400 text-center italic">
              스마트폰에서 '홈 화면에 추가'를 하면 앱처럼 사용하며 알림을 받을 수 있습니다.
            </p>
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
