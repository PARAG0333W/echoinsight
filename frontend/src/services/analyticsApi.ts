import { apiClient } from './apiClient';

export interface OverviewStats {
  total_conversations: number;
  analyzed_count: number;
  average_score: number | null;
  high_risk_count: number;
  total_mistakes: number;
}

export interface RiskSummary {
  risk_type: string;
  severity: string;
  total: number;
  resolved: number;
  unresolved: number;
}

export const fetchOverviewStats = async (): Promise<OverviewStats> => {
  const res = await apiClient.get('/analytics/overview');
  return res.data.data;
};

export const fetchRiskSummary = async (): Promise<RiskSummary[]> => {
  const res = await apiClient.get('/analytics/risk-summary');
  return res.data.data;
};
