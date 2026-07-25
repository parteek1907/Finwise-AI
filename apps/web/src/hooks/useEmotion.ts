import { useState, useCallback, useEffect } from 'react';
import { EmotionAnalysis, EmotionHistory, EmotionStats } from '../types/emotion';
import { analyzeEmotion, getEmotionHistory, saveEmotion } from '../services/emotion';

export const useEmotion = () => {
  const [history, setHistory] = useState<EmotionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionAnalysis | null>(null);
  const [stats, setStats] = useState<EmotionStats | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = useCallback(() => {
    const data = getEmotionHistory();
    setHistory(data);
    calculateStats(data);
  }, []);

  const calculateStats = (data: EmotionHistory[]) => {
    if (data.length === 0) {
      setStats(null);
      return;
    }

    const totalAnalyses = data.length;
    let totalConfidence = 0;
    
    // Risk weighting
    const riskScores: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4 };
    let totalRiskScore = 0;

    const emotionCounts: Record<string, number> = {};
    const biasCounts: Record<string, number> = {};
    const riskTrend: { date: string; riskScore: number }[] = [];
    const emotionTrend: { date: string; confidence: number }[] = [];

    // Process from oldest to newest for trends
    const reversedData = [...data].reverse();

    reversedData.forEach(entry => {
      totalConfidence += entry.confidence;
      totalRiskScore += riskScores[entry.risk];

      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      
      entry.biases.forEach(bias => {
        biasCounts[bias] = (biasCounts[bias] || 0) + 1;
      });

      const shortDate = new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      riskTrend.push({ date: shortDate, riskScore: riskScores[entry.risk] });
      emotionTrend.push({ date: shortDate, confidence: entry.confidence });
    });

    const averageConfidence = Math.round(totalConfidence / totalAnalyses);
    const avgRiskNum = Math.round(totalRiskScore / totalAnalyses);
    const averageRisk = Object.keys(riskScores).find(key => riskScores[key] === avgRiskNum) as any || 'Medium';

    let mostCommonEmotion = '';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonEmotion = emotion;
      }
    }

    setStats({
      totalAnalyses,
      averageRisk,
      averageConfidence,
      mostCommonEmotion,
      biasFrequencies: biasCounts,
      emotionDistribution: emotionCounts,
      riskTrend,
      emotionTrend
    });
  };

  const analyze = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setCurrentAnalysis(null);
    
    try {
      const result = await analyzeEmotion(query);
      setCurrentAnalysis(result);
      saveEmotion(query, result);
      loadHistory(); // reload to update stats and history list
    } catch (err: any) {
      setError(err.message || 'Failed to analyze emotion.');
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
  }, []);

  return {
    history,
    loading,
    error,
    currentAnalysis,
    stats,
    analyze,
    clearAnalysis
  };
};
