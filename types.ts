
export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  watchUrl: string;
  thumbnail: string;
  textbookContent: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export type ViewState = 'HOME' | 'VIDEO' | 'PODCAST' | 'TEXTBOOK' | 'QUIZ';
