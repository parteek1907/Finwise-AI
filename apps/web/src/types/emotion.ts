export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'None';

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
  riskTrend: { id?: string; date: string; riskScore: number }[];
  emotionTrend: { id?: string; date: string; confidence: number }[];
}
