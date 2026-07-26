import { EmotionAnalysis, EmotionHistory, RiskLevel } from '../types/emotion';

const STORAGE_KEY = 'finwise_emotion_session_v3'; // Changed key to clear history

// Call the Next.js API route directly
export const analyzeEmotion = async (query: string): Promise<EmotionAnalysis> => {
  const response = await fetch(`/api/emotion-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: query }),
  });

  if (!response.ok) {
    throw new Error('Failed to connect to the AI analysis engine.');
  }

  const data = await response.json();
  return data;
};

export const getEmotionHistory = (): EmotionHistory[] => {
  if (typeof window === 'undefined') return [];
  try {
    // Clear old localStorage if it exists so it's fully wiped
    localStorage.removeItem('finwise_emotion_history');
    
    const data = sessionStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveEmotion = (query: string, analysis: EmotionAnalysis): EmotionHistory => {
  const history = getEmotionHistory();
  
  const newEntry: EmotionHistory = {
    ...analysis,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    query
  };
  
  const updatedHistory = [newEntry, ...history]; // newest first
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return newEntry;
};
