import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";
import { UserProfile, MealLog, ExerciseLog } from "../types";

export const getGeminiAI = () => {
  const profile = storage.getProfile();
  // 우선순위: 1. 사용자가 설정한 키, 2. 환경 변수 키
  const apiKey = profile?.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("Gemini API 키가 설정되지 않았습니다. 프로필 설정에서 키를 입력해주세요.");
  }

  return new GoogleGenAI({ apiKey });
};

export const analyzeMeal = async (mealContent: string) => {
  const ai = getGeminiAI();
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview", // Using a stable model
    contents: [{
      parts: [{
        text: `다음 식단 내용에 대해 예상 칼로리를 숫자로만 알려줘. 만약 여러 음식이면 합계를 알려줘. 
        설명 없이 숫자만 응답해. 예: 450
        
        식단 내용: ${mealContent}`
      }]
    }]
  });

  const response = await model;
  const text = response.text;
  const calories = parseInt(text.replace(/[^0-9]/g, ''));
  
  return isNaN(calories) ? null : calories;
};

export const getAICoaching = async (profile: UserProfile, meals: MealLog[], exercises: ExerciseLog[], water: number) => {
  const ai = getGeminiAI();
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [{
        text: `당신은 전문 건강 코치입니다. 다음 사용자의 오늘 하루 기록을 바탕으로 친절하고 전문적인 건강 피드백을 제공해주세요.
        
        사용자 정보:
        - 이름: ${profile.displayName}
        - 목표 체중: ${profile.targetWeight}kg
        - 수분 목표: ${profile.dailyWaterGoal}ml
        
        오늘의 기록:
        - 식단: ${meals.map(m => `${m.type}(${m.content}, ${m.calories}kcal)`).join(', ') || '기록 없음'}
        - 운동: ${exercises.map(e => `${e.type}(${e.duration}분, ${e.caloriesBurned}kcal 소모)`).join(', ') || '기록 없음'}
        - 수분 섭취량: ${water}ml
        
        피드백은 다음 형식을 지켜주세요:
        1. 칭찬 한 마디 (오늘 잘한 점)
        2. 개선 제안 (부족한 점이나 내일 더 잘할 수 있는 점)
        3. 한 줄 응원
        
        한국어로 응답해주세요. 전체 길이는 200자 내외로 짧고 명확하게 작성해주세요.`
      }]
    }]
  });

  const response = await model;
  return response.text;
};
