import { UserProfile, WeightLog, MealLog, WaterLog, ExerciseLog } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'greens_profile',
  WEIGHT_LOGS: 'greens_weight_logs',
  MEAL_LOGS: 'greens_meal_logs',
  WATER_LOGS: 'greens_water_logs',
  EXERCISE_LOGS: 'greens_exercise_logs',
};

export const storage = {
  // Profile
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  // Weight Logs
  getWeightLogs: (): WeightLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    return data ? JSON.parse(data) : [];
  },
  addWeightLog: (log: WeightLog) => {
    const logs = storage.getWeightLogs();
    const newLog = { ...log, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify([newLog, ...logs]));
    return newLog;
  },
  deleteWeightLog: (id: string) => {
    const logs = storage.getWeightLogs();
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs.filter(l => l.id !== id)));
  },

  // Meal Logs
  getMealLogs: (): MealLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEAL_LOGS);
    return data ? JSON.parse(data) : [];
  },
  addMealLog: (log: MealLog) => {
    const logs = storage.getMealLogs();
    const newLog = { ...log, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify([newLog, ...logs]));
    return newLog;
  },
  deleteMealLog: (id: string) => {
    const logs = storage.getMealLogs();
    localStorage.setItem(STORAGE_KEYS.MEAL_LOGS, JSON.stringify(logs.filter(l => l.id !== id)));
  },

  // Exercise Logs
  getExerciseLogs: (): ExerciseLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.EXERCISE_LOGS);
    return data ? JSON.parse(data) : [];
  },
  addExerciseLog: (log: ExerciseLog) => {
    const logs = storage.getExerciseLogs();
    const newLog = { ...log, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify([newLog, ...logs]));
    return newLog;
  },
  deleteExerciseLog: (id: string) => {
    const logs = storage.getExerciseLogs();
    localStorage.setItem(STORAGE_KEYS.EXERCISE_LOGS, JSON.stringify(logs.filter(l => l.id !== id)));
  },

  // Water Logs
  getWaterLogs: (): WaterLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.WATER_LOGS);
    return data ? JSON.parse(data) : [];
  },
  addWaterLog: (log: WaterLog) => {
    const logs = storage.getWaterLogs();
    const newLog = { ...log, id: crypto.randomUUID() };
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify([newLog, ...logs]));
    return newLog;
  },
  deleteWaterLog: (id: string) => {
    const logs = storage.getWaterLogs();
    localStorage.setItem(STORAGE_KEYS.WATER_LOGS, JSON.stringify(logs.filter(l => l.id !== id)));
  },
};
