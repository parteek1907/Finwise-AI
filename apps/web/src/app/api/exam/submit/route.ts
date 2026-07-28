import { NextResponse } from 'next/server';
import { FINAL_EXAM_QUESTIONS } from '../data';

export async function POST(req: Request) {
  try {
    const { answers } = await req.json();

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    let correctCount = 0;
    const totalQuestions = FINAL_EXAM_QUESTIONS.length;
    const results: any[] = [];

    FINAL_EXAM_QUESTIONS.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.answerIndex;
      if (isCorrect) correctCount++;
      
      results.push({
        id: q.id,
        isCorrect,
        correctAnswerIndex: q.answerIndex,
        explanation: q.explanation
      });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;

    return NextResponse.json({
      score,
      passed,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      totalQuestions,
      results
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
