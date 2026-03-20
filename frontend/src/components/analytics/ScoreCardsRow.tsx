import React from 'react';
import { Card } from '../ui/Card';
import type { ScoreBreakdown } from '../../utils/types';

interface ScoreCardsRowProps {
  scores: ScoreBreakdown;
}

const labelColor = (value: number | string) => {
  if (typeof value !== 'number') return 'text-slate-700';
  if (value >= 80) return 'text-emerald-600';
  if (value >= 60) return 'text-amber-600';
  return 'text-rose-600';
};

const ScoreCard: React.FC<{
  label: string;
  value: number | string;
  highlight?: boolean;
}> = ({ label, value, highlight }) => (
  <Card
    className={[
      'flex flex-col justify-between space-y-2',
      highlight ? 'bg-primary/5 border-primary/20' : 'bg-slate-50/50',
    ].join(' ')}
  >
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-end gap-1">
      <span className={`text-2xl font-black leading-none ${labelColor(value)}`}>
        {typeof value === 'number' ? Math.round(value) : value}
      </span>
      {typeof value === 'number' && (
        <span className="text-[11px] text-slate-300 mb-0.5 font-medium">/ 100</span>
      )}
    </div>
  </Card>
);

const ScoreCardsRow: React.FC<ScoreCardsRowProps> = ({ scores }) => {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="col-span-2 sm:col-span-1">
        <ScoreCard label="Overall" value={scores.overall} highlight />
      </div>
      <ScoreCard label="Sentiment" value={scores.sentiment} />
      <ScoreCard label="Communication" value={scores.communication} />
      <ScoreCard label="Empathy" value={scores.empathy} />
      <ScoreCard label="Professionalism" value={scores.professionalism} />
      <ScoreCard label="Solution" value={scores.solution} />
      <ScoreCard label="Tone" value={scores.tone} />
    </div>
  );
};

export default ScoreCardsRow;