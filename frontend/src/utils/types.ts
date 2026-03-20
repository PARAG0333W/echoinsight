export type Speaker = 'customer' | 'agent';

export interface TranscriptMessage {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp?: string;
}

export interface ScoreBreakdown {
  overall: number;
  sentiment: string;
  empathy: number;
  professionalism: number;
  solution: number;
  tone: number;
  communication: number;
}

export interface Mistake {
  id: string;
  messageId: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Suggestion {
  id: string;
  messageId: string;
  improvedResponse: string;
  notes?: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';