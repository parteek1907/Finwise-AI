export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  risk: RiskLevel;
  biases: string[];
  summary: string;
  recommendations: string[];
}

export interface EmotionHistory extends EmotionAnalysis {
  id: string;
  timestamp: string;
  query: string;
}

export interface EmotionStats {
  totalAnalyses: number;
  averageRisk: RiskLevel;
  averageConfidence: number;
  mostCommonEmotion: string;
  biasFrequencies: Record<string, number>;
  emotionDistribution: Record<string, number>;
  riskTrend: { date: string; riskScore: number }[];
  emotionTrend: { date: string; confidence: number }[];
}
