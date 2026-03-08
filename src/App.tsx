import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { storage } from './services/storage';
import { notificationService } from './services/notifications';
import { 
  LayoutDashboard, 
  Utensils, 
  Droplets, 
  Scale, 
  Calendar as CalendarIcon, 
  User as UserIcon,
  LogOut,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import Dashboard from './components/Dashboard';
import MealTracker from './components/MealTracker';
import WaterTracker from './components/WaterTracker';
import WeightTracker from './components/WeightTracker';
import ExerciseTracker from './components/ExerciseTracker';
import CalendarView from './components/CalendarView';
import ProfileSettings from './components/ProfileSettings';

type Tab = 'dashboard' | 'meals' | 'water' | 'weight' | 'exercise' | 'calendar' | 'profile';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    // Initialize profile from storage
    const existingProfile = storage.getProfile();
    if (existingProfile) {
      setProfile(existingProfile);
    } else {
      // Create default profile if none exists
      const newProfile: UserProfile = {
        uid: 'local-user',
        email: 'user@local.storage',
        displayName: '사용자',
        createdAt: new Date().toISOString(),
        targetWeight: 0,
        dailyWaterGoal: 2000,
      };
      storage.saveProfile(newProfile);
      setProfile(newProfile);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check for date change every minute to ensure UI "resets" for the new day
    const dateInterval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
      const lastDate = localStorage.getItem('greens_last_active_date');
      
      if (lastDate && lastDate !== todayStr) {
        // Date changed! Refresh to clear today's views
        localStorage.setItem('greens_last_active_date', todayStr);
        window.location.reload();
      } else if (!lastDate) {
        localStorage.setItem('greens_last_active_date', todayStr);
      }
    }, 1000 * 60);

    // Water reminder logic
    const reminderInterval = setInterval(() => {
      const notificationsEnabled = localStorage.getItem('notifications_enabled') === 'true';
      if (notificationsEnabled) {
        const now = new Date();
        const hour = now.getHours();
        const todayStr = now.toLocaleDateString('en-CA');
        
        // Only remind between 9 AM and 9 PM
        if (hour >= 9 && hour <= 21) {
          const lastNotifyTime = localStorage.getItem('greens_last_notification_time');
          const lastNotifyDate = localStorage.getItem('greens_last_notification_date');
          
          const twoHoursInMs = 1000 * 60 * 60 * 2;
          const currentTime = now.getTime();
          
          // Send if:
          // 1. Never sent before
          // 2. Sent on a different day
          // 3. Sent more than 2 hours ago
          if (!lastNotifyTime || lastNotifyDate !== todayStr || (currentTime - parseInt(lastNotifyTime)) >= twoHoursInMs) {
            notificationService.sendNotification(
              '수분 섭취 알림 💧',
              '지금 시원한 물 한 잔 어떠신가요? 건강을 위해 수분을 충전하세요!'
            );
            localStorage.setItem('greens_last_notification_time', currentTime.toString());
            localStorage.setItem('greens_last_notification_date', todayStr);
          }
        }
      }
    }, 1000 * 60); // Check every minute

    return () => {
      clearInterval(dateInterval);
      clearInterval(reminderInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderContent = () => {
    if (!profile) return null;
    
    switch (activeTab) {
      case 'dashboard': return <Dashboard profile={profile} setActiveTab={setActiveTab} />;
      case 'meals': return <MealTracker profile={profile} />;
      case 'water': return <WaterTracker profile={profile} />;
      case 'weight': return <WeightTracker profile={profile} />;
      case 'exercise': return <ExerciseTracker profile={profile} />;
      case 'calendar': return <CalendarView profile={profile} />;
      case 'profile': return <ProfileSettings profile={profile} setProfile={(p) => {
        setProfile(p);
        storage.saveProfile(p);
      }} />;
      default: return <Dashboard profile={profile} setActiveTab={setActiveTab} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: '홈' },
    { id: 'meals', icon: Utensils, label: '식단' },
    { id: 'exercise', icon: Activity, label: '운동' },
    { id: 'water', icon: Droplets, label: '수분' },
    { id: 'weight', icon: Scale, label: '체중' },
    { id: 'calendar', icon: CalendarIcon, label: '기록' },
  ];

  const handleResetData = () => {
    if (window.confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-0 md:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-stone-900 tracking-tight">Greens</span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-emerald-600' : 'text-stone-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-stone-100">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all mb-2 ${
              activeTab === 'profile' 
                ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                : 'text-stone-500 hover:bg-stone-50'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            프로필 설정
          </button>
          <button
            onClick={handleResetData}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            데이터 초기화
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-stone-900 tracking-tight">Greens</span>
        </div>
        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border border-stone-200"
        >
          <UserIcon className="w-5 h-5 text-stone-400" />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex items-center justify-between z-50 pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className="flex flex-col items-center gap-1"
          >
            <div className={`p-2 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-stone-400'
            }`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-medium ${
              activeTab === item.id ? 'text-emerald-600' : 'text-stone-400'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
