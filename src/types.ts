export interface JobAnalysis {
  company: string;
  roleTitle: string;
  level: string;
  techStack: string[];
  summary: string;
  responsibilities: string[];
  keyTopics: string[];
  starTip: string;
  firstQuestion: string;
  sourceUrl?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  area: string;
  level: number;
  xp: number;
  streak: number;
  streakShieldActive?: boolean;
  lostStreak?: number;
  issuesResolved?: number;
  correctAnswers?: number;
  totalAnswers?: number;
  completedLessons?: string[];
  reviewedWords?: string[];
  techStack: string[];
  onboarded: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  audioFeedback?: string;
  xpAwarded?: number;
}

export interface PreRegistrationLead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  instagram?: string;
  area: string;
  knownTechs: string[];
  customTechs?: string;
  hasCourse: string;
  courseDetails?: string;
  jobContext?: {
    company?: string;
    roleTitle?: string;
    level?: string;
    techStack?: string[];
    rawInput?: string;
  } | null;
  createdAt: string;
  status?: 'novo' | 'em_contato' | 'aprovado';
}

