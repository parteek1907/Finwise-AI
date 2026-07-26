import { course1 } from './courses/l1';
import { course2 } from './courses/l2';
import { course3 } from './courses/l3';
import { course4 } from './courses/l4';
import { course5 } from './courses/l5';
import { course6 } from './courses/l6';
import { course7 } from './courses/l7';
import { course8 } from './courses/l8';
import { course9 } from './courses/l9';
import { course10 } from './courses/l10';

export const LESSON_CONTENTS: Record<string, any[]> = {
  'l1': course1.chapters,
  'l2': course2.chapters,
  'l3': course3.chapters,
  'l4': course4.chapters,
  'l5': course5.chapters,
  'l6': course6.chapters,
  'l7': course7.chapters,
  'l8': course8.chapters,
  'l9': course9.chapters,
  'l10': course10.chapters,
};

export const LESSON_QUIZZES: Record<string, any[]> = {
  'l1': course1.finalQuiz,
  'l2': course2.finalQuiz,
  'l3': course3.finalQuiz,
  'l4': course4.finalQuiz,
  'l5': course5.finalQuiz,
  'l6': course6.finalQuiz,
  'l7': course7.finalQuiz,
  'l8': course8.finalQuiz,
  'l9': course9.finalQuiz,
  'l10': course10.finalQuiz,
};
