import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Search, 
  Filter,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import RadialScore from '../components/analytics/RadialScore';
import { listConversations, type ConversationListItem } from '../services/conversationsApi';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = (status || 'pending').toLowerCase();
  
  const config: Record<string, { label: string; className: string; Icon: React.FC<any> }> = {
    analyzed: {
      label: 'Analyzed',
      className: 'bg-emerald-50 text-emerald-600',
      Icon: CheckCircle2,
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-50 text-blue-600',
      Icon: Loader2,
    },
    transcribed: {
      label: 'Transcribed',
      className: 'bg-blue-50 text-blue-600',
      Icon: Loader2,
    },
    parsed: {
      label: 'Parsed',
      className: 'bg-blue-50 text-blue-600',
      Icon: Loader2,
    },
    analyzing: {
      label: 'Analyzing',
      className: 'bg-indigo-50 text-indigo-600',
      Icon: Loader2,
    },
    failed: {
      label: 'Failed',
      className: 'bg-rose-50 text-rose-600',
      Icon: XCircle,
    },
    pending: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-600',
      Icon: Clock,
    },
    uploaded: {
      label: 'Uploaded',
      className: 'bg-amber-50 text-amber-600',
      Icon: Clock,
    },
  };

  const { label, className, Icon } = config[normalized] ?? config['pending'];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <Icon className={`h-3 w-3 ${normalized === 'processing' || normalized === 'analyzing' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
};

const HistoryPage: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listConversations();
        console.log("History:", data.conversations);
        setConversations(data.conversations);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = conversations.filter((c) =>
    !search ||
    c.file_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.agent_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskLabel = (score?: number | null) => {
    if (score == null) return { label: 'N/A', color: 'bg-slate-100 text-slate-500' };
    if (score >= 80) return { label: 'Low Risk', color: 'bg-emerald-50 text-emerald-600' };
    if (score >= 60) return { label: 'Medium Risk', color: 'bg-amber-50 text-amber-600' };
    return { label: 'High Risk', color: 'bg-rose-50 text-rose-600' };
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analysis History</h1>
          <p className="text-slate-500 font-medium">
            All analyzed conversations ({total})
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <input 
               type="text" 
               placeholder="Search conversations..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 w-72 transition-all shadow-sm"
             />
           </div>
           <button className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 transition-all shadow-sm active:scale-95">
             <Filter className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[88px] w-full bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-20 text-center flex flex-col items-center justify-center border-dashed border-2">
            <p className="text-slate-400 font-medium">
              {search ? 'No results match your search.' : 'No analyzed conversations found yet.'}
            </p>
            {!search && (
              <Link to="/upload" className="mt-4 text-indigo-600 font-bold hover:underline">Upload your first one</Link>
            )}
          </Card>
        ) : (
          filtered.map((conv) => {
            const { label: riskLabel, color: riskColor } = getRiskLabel(conv.overall_score);
            return (
              <Link key={conv.id} to={`/app/conversations/${conv.id}`} className="block group">
                <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-200 hover:scale-[1.005] transition-all duration-200">
                  <div className="flex items-center gap-6">
                    {/* Score */}
                    <div className="shrink-0 bg-slate-50 p-2 rounded-2xl">
                      <RadialScore score={conv.overall_score} size={56} strokeWidth={4} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate mb-1 capitalize group-hover:text-indigo-600 transition-colors">
                        {conv.file_name?.replace(/_/g, ' ') || 'Untitled'}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                        <span>{conv.agent_name || '—'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>{conv.created_at ? format(new Date(conv.created_at), 'M/d/yyyy · h:mm a') : '—'}</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right space-y-1">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${riskColor}`}>
                          {riskLabel}
                        </span>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {conv.overall_score != null ? `Score: ${Math.round(conv.overall_score)}` : '—'}
                        </p>
                      </div>
                      <StatusBadge status={conv.status} />
                      <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
