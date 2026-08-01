import { useState, useCallback, useEffect } from 'react';
import { formatDate } from '@/utils/formatters';
import { EmotionAnalysis, EmotionHistory, EmotionStats } from '../types/emotion';
import { analyzeEmotion, getEmotionHistory, saveEmotion } from '../services/emotion';

export const useEmotion = () => {
  const [history, setHistory] = useState<EmotionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<EmotionHistory | null>(null);
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
    let relevantCount = 0;
    
    // Risk weighting
    const riskScores: Record<string, number> = { 'Low': 1, 'Medium': 2, 'High': 3, 'Very High': 4, 'None': 0 };
    let totalRiskScore = 0;

    const emotionCounts: Record<string, number> = {};
    const biasCounts: Record<string, number> = {};
    const riskTrend: { id: string; date: string; riskScore: number }[] = [];
    const emotionTrend: { id: string; date: string; confidence: number }[] = [];

    // Process from oldest to newest for trends
    const reversedData = [...data].reverse();

    reversedData.forEach(entry => {
      if (entry.emotion === 'Irrelevant') return;

      totalConfidence += entry.confidence;
      totalRiskScore += riskScores[entry.risk] || 0;
      relevantCount++;
      
      const dateObj = new Date(entry.timestamp);
      const shortDate = `${formatDate(dateObj)} ${dateObj.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
      riskTrend.push({ id: entry.id, date: shortDate, riskScore: riskScores[entry.risk] || 0 });
      emotionTrend.push({ id: entry.id, date: shortDate, confidence: entry.confidence });

      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      
      entry.biases.forEach(bias => {
        biasCounts[bias] = (biasCounts[bias] || 0) + 1;
      });
    });

    const averageConfidence = relevantCount > 0 ? Math.round(totalConfidence / relevantCount) : 0;
    const avgRiskNum = relevantCount > 0 ? Math.round(totalRiskScore / relevantCount) : 0;
    const averageRisk = avgRiskNum > 0 ? (Object.keys(riskScores).find(key => riskScores[key] === avgRiskNum) as any || 'Medium') : 'None';

    let mostCommonEmotion = '';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonEmotion = emotion;
      }
    }

    setStats({
      totalAnalyses: relevantCount,
      averageRisk,
      averageConfidence,
      mostCommonEmotion: mostCommonEmotion || 'N/A',
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
      const savedResult = saveEmotion(query, result);
      setCurrentAnalysis(savedResult);
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
