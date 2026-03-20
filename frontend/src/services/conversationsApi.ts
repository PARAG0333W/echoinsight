import { apiClient } from './apiClient';
import type {
  TranscriptMessage,
  ScoreBreakdown,
  Mistake,
  Suggestion,
  RiskLevel,
} from '../utils/types';

export interface ConversationListItem {
  id: string;
  file_name: string;
  status: string;
  created_at: string;
  overall_score?: number | null;
  agent_name?: string;
}

export const uploadConversation = async (
  file: File,
  agentName: string,
  onProgress?: (p: number) => void,
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  // Send agent_name so backend can associate it with the conversation
  if (agentName.trim()) {
    formData.append('agent_name', agentName.trim());
  }

  const response = await apiClient.post('/conversations/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (ev) => {
      if (!onProgress || !ev.total) return;
      onProgress((ev.loaded / ev.total) * 100);
    },
  });

  // The backend returns { success: true, data: { conversation_id: "..." } }
  return response.data.data.conversation_id;
};

export const listConversations = async (page = 1, limit = 20): Promise<{
  conversations: ConversationListItem[];
  total: number;
}> => {
  const res = await apiClient.get('/conversations', { params: { page, limit } });
  return {
    conversations: res.data.data,
    total: res.data.meta.total,
  };
};

export const fetchConversation = async (
  conversationId: string,
): Promise<{ id: string; status: string }> => {
  const res = await apiClient.get(`/conversations/${conversationId}`);
  return res.data.data;
};

export const fetchTranscript = async (
  conversationId: string,
): Promise<TranscriptMessage[]> => {
  const res = await apiClient.get(`/conversations/${conversationId}/transcript`);
  // Map backend { success: true, data: [...] } to TranscriptMessage[]
  // Backend content field maps to frontend text field
  return (res.data.data || []).map((msg: any) => ({
    id: `msg-${msg.turn_index}`,
    speaker: msg.speaker,
    text: msg.content,
    timestamp: msg.timestamp || '',
  }));
};

export const startAnalysis = async (conversationId: string): Promise<any> => {
  const res = await apiClient.post(`/conversations/${conversationId}/reanalyze`);
  return res.data.data;
};

export const fetchConversationReport = async (
  conversationId: string,
): Promise<{
  messages: TranscriptMessage[];
  scores: ScoreBreakdown;
  mistakes: Mistake[];
  suggestions: Suggestion[];
  risk: RiskLevel;
}> => {
  const res = await apiClient.get(`/conversations/${conversationId}/report`);
  const report = res.data.data;
  console.log("API Response:", report);
  console.log("improved_responses:", report.improved_responses);
  console.log("llm_raw_response:", report.llm_raw_response);

  const messages: TranscriptMessage[] = (report.transcript || []).map((msg: any) => ({
    id: `msg-${msg.turn_index}`,
    speaker: msg.speaker,
    text: msg.content,
    timestamp: msg.timestamp || '',
  }));
  
  // Map backend scores list to ScoreBreakdown
  // Prefer llm_raw_response for direct AI scores, fallback to scores table
  const rawAi = report.llm_raw_response || {};
  const scoresList: any[] = report.scores || [];
  const findScore = (cat: string) =>
    scoresList.find((s: any) => s.category?.toLowerCase() === cat)?.score;

  const scores: ScoreBreakdown = {
    overall: report.overall_score,
    sentiment: rawAi.sentiment ?? report.overall_sentiment ?? 'neutral',
    communication: rawAi.communication_score ?? findScore('clarity'),
    tone: rawAi.tone_score ?? findScore('greeting'),
    empathy: rawAi.empathy_score ?? findScore('empathy'),
    professionalism: rawAi.professionalism_score ?? findScore('professionalism'),
    solution: rawAi.solution_score ?? findScore('resolution'),
  };
  
  console.log(`[API] Mapped scores:`, scores);

  const mistakes: Mistake[] = (report.mistakes || []).map((m: any, idx: number) => ({
    id: `mistake-${idx}`,
    messageId: `msg-${m.turn_index ?? idx}`,
    label: m.title || m.category || `Mistake ${idx + 1}`,
    // Backend stores in 'description' field from DB but also has 'mistake' from llm_raw
    description: m.description || m.mistake || '',
    severity: (m.severity || 'low').toLowerCase() as RiskLevel,
  }));

  // improved_responses are now included directly in the report from report_service
  // Fallback also to llm_raw_response.improved_responses
  const rawImprovedResponses: any[] =
    report.improved_responses ||
    rawAi.improved_responses ||
    [];

  const suggestions: Suggestion[] = rawImprovedResponses.map((s: any, idx: number) => ({
    id: `sug-${idx}`,
    messageId: `msg-${s.turn_index ?? idx}`,
    improvedResponse: s.improved || s.improvedResponse || '',
    notes: s.original || s.notes || '', // 'notes' holds the original text shown in the UI
  }));

  console.log(`[API] Suggestions mapped:`, suggestions);

  const risk: RiskLevel = (() => {
    if (report.risks && report.risks.length > 0) {
      return (report.risks[0].severity || 'low').toLowerCase() as RiskLevel;
    }
    // Fall back to llm_raw risk_level
    const rl = rawAi.risk_level || 'low';
    return rl.toLowerCase() as RiskLevel;
  })();

  return {
    messages,
    scores,
    mistakes,
    suggestions,
    risk,
  };
};