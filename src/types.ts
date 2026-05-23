
export interface Question {
  question: string;
  options: string[]; // Empty for essay
  answer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface QuizStats {
  totalQuestions: number;
  extractedWords: number;
  processingTime: number;
}

export interface QuizData {
  quiz: Quiz;
  stats: QuizStats;
  timeLimit?: number; // Time limit in seconds
}

export type Language = 'en' | 'ar' | 'unknown';

export type QuestionType = 'mcq' | 'true_false' | 'mixed' | 'essay';
