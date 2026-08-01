export interface EmotionCheckResponses {
  emotion: string;
  influence: string;
  horizon: string;
  confidence: number;
}

export interface EmotionAnalysisResult {
  readinessScore: number;
  detectedBiases: string[];
  recommendation: string;
}

export const analyzeTradeEmotion = (
  responses: EmotionCheckResponses,
  stockChangePercent: number,
  side: 'BUY' | 'SELL',
  hasRecentLosses?: boolean
): EmotionAnalysisResult => {
  const biases: string[] = [];
  let score = 100;
  
  // Base deductions for negative emotions
  if (['Fearful', 'Frustrated', 'Nervous'].includes(responses.emotion)) {
    score -= 15;
  }

  // 1. FOMO (Fear Of Missing Out)
  if (side === 'BUY' && stockChangePercent > 5 && (responses.emotion === 'Excited' || responses.influence === 'Price movement' || responses.influence === 'Social media')) {
    biases.push('FOMO');
    score -= 25;
  }
  
  // 2. Panic Selling
  if (side === 'SELL' && stockChangePercent < -3 && (responses.emotion === 'Fearful' || responses.emotion === 'Nervous' || responses.influence === 'Price movement')) {
    biases.push('Panic Selling');
    score -= 25;
  }
  
  // 3. Overconfidence
  if (responses.confidence > 90 && (responses.influence === 'Social media' || responses.influence === 'Friend recommendation' || responses.influence === 'News')) {
    biases.push('Overconfidence');
    score -= 15;
  }
  
  // 4. Herd Mentality
  if (responses.influence === 'Social media' || responses.influence === 'Friend recommendation') {
    biases.push('Herd Mentality');
    score -= 15;
  }
  
  // 5. Impatience
  if (responses.horizon === 'Intraday' || responses.horizon === 'Swing') {
    if (['Nervous', 'Frustrated', 'Fearful'].includes(responses.emotion)) {
      biases.push('Impatience');
      score -= 20;
    }
  }

  // 6. Revenge Trading
  if (side === 'BUY' && hasRecentLosses && (responses.emotion === 'Frustrated' || responses.emotion === 'Excited' || responses.influence === 'Price movement')) {
    biases.push('Revenge Trading');
    score -= 30;
  }

  // Positive reinforcements
  if (responses.influence === 'My own research' || responses.influence === 'Company fundamentals') {
    score += 10;
  }
  if (responses.horizon === 'Years' || responses.horizon === 'Months') {
    score += 5;
  }
  if (responses.emotion === 'Calm') {
    score += 10;
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Generate Recommendation
  let recommendation = 'Proceed with confidence.';
  if (score < 50) {
    recommendation = 'High emotional risk detected. Consider waiting 24 hours or discussing with AI Mentor.';
  } else if (score < 80) {
    recommendation = 'Proceed carefully. Ensure you stick to your trading plan.';
  }

  return {
    readinessScore: score,
    detectedBiases: biases,
    recommendation
  };
};
