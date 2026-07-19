export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type StudentStatus = 'Faol' | 'Bloklangan';
export type Subscription = 'Bepul' | 'Premium' | 'VIP';

export interface Student {
  id: string;
  name: string;
  username: string;
  phone: string;
  level: Level;
  xp: number;
  progress: number;
  streak: number;
  subscription: Subscription;
  status: StudentStatus;
  isOnline: boolean;
  lastActive: string;
}

export interface TestItem {
  id: string;
  title: string;
  type: 'Reading' | 'Listening' | 'Grammar' | 'Vocabulary' | 'Speaking';
  level: Level;
  questions: number;
  participants: number;
  average: number;
  status: 'Faol' | 'Qoralama';
  createdAt: string;
}

export interface ParsedQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface ExamSubmission {
  id: string;
  student: string;
  exam: 'CEFR' | 'at-Tanal';
  level: Level;
  reading: number;
  listening: number;
  writing?: number;
  speaking?: number;
  submittedAt: string;
  status: 'Tekshirilmoqda' | 'Yakunlangan';
  essay: string;
}

export interface Battle {
  id: string;
  playerA: string;
  playerB: string;
  scoreA: number;
  scoreB: number;
  speedA: number;
  speedB: number;
  progress: number;
  status: 'Jonli' | 'Yakunlangan';
}
