import { create } from 'zustand';
import type {
  TranscriptMessage,
  ScoreBreakdown,
  Mistake,
  Suggestion,
  RiskLevel,
} from '../utils/types';

interface ConversationState {
  currentId: string | null;
  agentName: string;
  messages: TranscriptMessage[];
  scores: ScoreBreakdown | null;
  mistakes: Mistake[];
  suggestions: Suggestion[];
  risk: RiskLevel;
  
  // Loading & Flow states
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
  historyIds: string[]; // For session-based history filtering

  setAgentName: (name: string) => void;
  setUploading: (bool: boolean) => void;
  setAnalyzing: (bool: boolean) => void;
  setUploadProgress: (p: number) => void;
  setConversation: (id: string, payload: Partial<ConversationState>) => void;
  addToHistory: (id: string) => void;
  reset: () => void;
}

const defaultState = {
  currentId: null,
  agentName: '',
  messages: [],
  scores: null,
  mistakes: [],
  suggestions: [],
  risk: 'low' as RiskLevel,
  isUploading: false,
  isAnalyzing: false,
  uploadProgress: 0,
  historyIds: [],
};

export const useConversationStore = create<ConversationState>((set) => ({
  ...defaultState,
  setAgentName: (agentName) => set({ agentName }),
  setUploading: (isUploading) => set({ isUploading }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setConversation: (id, payload) =>
    set((state) => ({
      currentId: id,
      agentName: payload.agentName ?? state.agentName,
      messages: payload.messages ?? state.messages,
      scores: payload.scores ?? state.scores,
      mistakes: payload.mistakes ?? state.mistakes,
      suggestions: payload.suggestions ?? state.suggestions,
      risk: payload.risk ?? state.risk,
    })),
  addToHistory: (id) => set((state) => ({ 
    historyIds: state.historyIds.includes(id) ? state.historyIds : [...state.historyIds, id] 
  })),
  reset: () => set((state) => ({ ...defaultState, historyIds: state.historyIds })), // Keep history even on reset
}));