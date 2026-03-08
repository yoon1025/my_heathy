export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  targetWeight?: number;
  targetWeightSetAt?: string; // ISO date string
  dailyWaterGoal?: number;
  geminiApiKey?: string;
  createdAt: string;
}

export interface WeightLog {
  id?: string;
  uid: string;
  date: string; // YYYY-MM-DD
  weight: number;
  createdAt: string;
}

export interface MealLog {
  id?: string;
  uid: string;
  date: string; // YYYY-MM-DD
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  content: string;
  calories?: number;
  imageUrl?: string;
  createdAt: string;
}

export interface ExerciseLog {
  id?: string;
  uid: string;
  date: string; // YYYY-MM-DD
  type: string; // e.g., Walking, Running, Gym
  duration: number; // minutes
  caloriesBurned?: number;
  createdAt: string;
}

export interface WaterLog {
  id?: string;
  uid: string;
  date: string; // YYYY-MM-DD
  amount: number; // ml
  createdAt: string;
}
