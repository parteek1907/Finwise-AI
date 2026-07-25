import { EmotionAnalysis, EmotionHistory, RiskLevel } from '../types/emotion';

const STORAGE_KEY = 'finwise_emotion_history';

// A mock function to simulate AI delay and response
export const analyzeEmotion = async (query: string): Promise<EmotionAnalysis> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Basic heuristic to return different mock results based on keywords
      const lowerQuery = query.toLowerCase();
      
      let result: EmotionAnalysis = {
        emotion: "Uncertainty",
        confidence: 75,
        risk: "Medium",
        biases: ["Anchoring", "Availability Bias"],
        summary: "Your message indicates hesitation and reliance on recent easily accessible information.",
        recommendations: [
          "Take time to research the fundamentals.",
          "Avoid acting immediately on mixed signals.",
          "Consider dollar-cost averaging instead of a lump sum."
        ]
      };

      if (lowerQuery.includes('everyone') || lowerQuery.includes('fomo') || lowerQuery.includes('miss')) {
        result = {
          emotion: "FOMO",
          confidence: 92,
          risk: "High",
          biases: ["Herd Mentality", "Recency Bias"],
          summary: "The message indicates urgency driven by recent market performance and social proof.",
          recommendations: [
            "Wait 24 hours before making a decision.",
            "Review the company's fundamentals.",
            "Avoid emotional investing based on others' actions."
          ]
        };
      } else if (lowerQuery.includes('crash') || lowerQuery.includes('sell all') || lowerQuery.includes('panic')) {
        result = {
          emotion: "Panic",
          confidence: 88,
          risk: "Very High",
          biases: ["Loss Aversion", "Recency Bias"],
          summary: "We detected intense fear and an urge to liquidate due to short-term negative price action.",
          recommendations: [
            "Review your original investment thesis.",
            "Remember that market corrections are normal.",
            "Consider rebalancing instead of fully liquidating."
          ]
        };
      } else if (lowerQuery.includes('moon') || lowerQuery.includes('all in') || lowerQuery.includes('guaranteed')) {
        result = {
          emotion: "Greed",
          confidence: 95,
          risk: "Very High",
          biases: ["Overconfidence", "Confirmation Bias"],
          summary: "Your thought shows extreme optimism and disregard for potential downside risk.",
          recommendations: [
            "Implement strict position sizing.",
            "Set a stop-loss order to protect capital.",
            "Actively search for bear cases for this asset."
          ]
        };
      }

      // Simulate a random failure (1 in 20 chance) for realism
      if (Math.random() < 0.05) {
        reject(new Error("Failed to connect to the AI analysis engine."));
      } else {
        resolve(result);
      }
    }, 2500); // 2.5s delay to simulate heavy AI processing
  });
};

export const getEmotionHistory = (): EmotionHistory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  
  return newEntry;
};
