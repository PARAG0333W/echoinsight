import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AudioLines, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import RadialScore from '../components/analytics/RadialScore';
import { 
  fetchOverviewStats, 
  fetchRiskSummary,
  type OverviewStats,
  type RiskSummary
} from '../services/analyticsApi';
import { listConversations, type ConversationListItem } from '../services/conversationsApi';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const [overview, setOverview] = React.useState<OverviewStats | null>(null);
  const [risks, setRisks] = React.useState<RiskSummary[]>([]);
  const [recent, setRecent] = React.useState<ConversationListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load conversations first — always available
        const convResult = await listConversations(1, 20);
        const allConvs = convResult.conversations;
        setRecent(allConvs.slice(0, 5));

        // Try to load analytics; if it fails, compute from conversations list
        try {
          const [o, r] = await Promise.all([
            fetchOverviewStats(),
            fetchRiskSummary(),
          ]);
          console.log("Dashboard:", o);
          setOverview(o);
          setRisks(r);
        } catch (analyticsErr) {
          console.warn('Analytics API failed, computing from conversations list:', analyticsErr);
          // Compute stats directly from the conversations list as fallback
          const analyzed = allConvs.filter(c => c.status === 'analyzed');
          const scores = analyzed.map(c => c.overall_score).filter((s): s is number => s != null);
          const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
          const highRisk = analyzed.filter(c => (c.overall_score ?? 100) < 60).length;
          const computed: OverviewStats = {
            total_conversations: convResult.total,
            analyzed_count: analyzed.length,
            average_score: avgScore,
            high_risk_count: highRisk,
            total_mistakes: 0, // Not available without analytics endpoint
          };
          console.log("Dashboard (computed from convs):", computed);
          setOverview(computed);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return (
    <div className="max-w-[1200px] mx-auto space-y-10">
      {/* Skeleton header */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-slate-100 rounded animate-pulse" />
      </div>
      {/* Skeleton stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      {/* Skeleton table */}
      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-48 w-full bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  const topStats = [
    { label: 'Conversations', value: overview?.total_conversations ?? '—', icon: AudioLines, color: 'text-indigo-600' },
    { label: 'Avg. Score', value: overview?.average_score !== null && overview?.average_score !== undefined ? `${Math.round(overview.average_score)}/100` : '—', icon: TrendingUp, color: 'text-emerald-600' },
    { label: 'High Risk', value: overview?.high_risk_count ?? '—', icon: AlertTriangle, color: 'text-rose-600' },
    { label: 'Analyzed', value: overview?.analyzed_count ?? '—', icon: Users, color: 'text-blue-600' },
  ];

  const riskLevels = {
    low: risks.filter(r => r.severity === 'low').reduce((acc, curr) => acc + curr.total, 0),
    medium: risks.filter(r => r.severity === 'medium').reduce((acc, curr) => acc + curr.total, 0),
    high: risks.filter(r => ['high', 'critical'].includes(r.severity)).reduce((acc, curr) => acc + curr.total, 0),
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 font-medium">Overview of call center communication quality</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topStats.map((stat) => (
          <Card key={stat.label} className="p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-slate-900">Recent Analyses</h2>
          <Link to="/app/history" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
            View all
            <ChevronRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <Card className="p-0 overflow-hidden border-slate-200/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">File</th>
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Risk</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[13px]">
                {recent.map((conv) => (
                  <tr key={conv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <div className="max-w-md">
                        <p className="font-bold text-slate-700 leading-relaxed mb-1 capitalize truncate">
                          {conv.file_name?.replace(/_/g, ' ') || 'Untitled'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <p className="font-semibold text-slate-500">
                        {conv.agent_name || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      <RadialScore score={conv.overall_score} size={36} />
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      {conv.overall_score !== null && conv.overall_score !== undefined ? (
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          conv.overall_score >= 80 ? 'bg-emerald-50 text-emerald-600' :
                          conv.overall_score >= 60 ? 'bg-amber-50 text-amber-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {conv.overall_score >= 80 ? 'Low Risk' :
                           conv.overall_score >= 60 ? 'Medium Risk' : 'High Risk'}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 align-top text-center">
                      <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {conv.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-right text-slate-400 font-medium">
                      {conv.created_at ? format(new Date(conv.created_at), 'M/d/yyyy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom Risk Severity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-16 w-16 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Low Risk
            </span>
            <span className="text-4xl font-black text-slate-900">{riskLevels.low}</span>
          </div>
          <p className="text-slate-500 font-medium text-sm">Within acceptable quality</p>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle className="h-16 w-16 text-amber-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Medium Risk
            </span>
            <span className="text-4xl font-black text-slate-900">{riskLevels.medium}</span>
          </div>
          <p className="text-slate-500 font-medium text-sm">Needs improvement</p>
        </Card>

        <Card className="p-8 border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="h-16 w-16 text-rose-600" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
              High Risk
            </span>
            <span className="text-4xl font-black text-slate-900">{riskLevels.high}</span>
          </div>
          <p className="text-slate-500 font-medium text-sm">Requires immediate attention</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;