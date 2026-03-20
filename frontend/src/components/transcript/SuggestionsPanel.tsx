import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import type { Suggestion } from '../../utils/types';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
}

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions }) => {
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium">Improved responses</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {suggestions.length > 0 ? (
          suggestions.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-border/70 bg-white px-3 py-2.5 space-y-2 transition-all hover:border-primary/30"
            >
              {s.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Original</p>
                  <p className="text-[12px] italic text-slate-500 leading-relaxed border-l-2 border-slate-200 pl-2">
                    "{s.notes}"
                  </p>
                </div>
              )}
              {s.improvedResponse && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Improved Response</p>
                  <p className="text-[13px] font-medium text-slate-900 leading-relaxed bg-indigo-50/30 rounded px-2 py-1">
                    {s.improvedResponse}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[11px] text-muted-foreground py-2">
            No improved responses available. Agent responses align with best practices.
          </p>
        )}
      </div>
    </Card>
  );
};

export default SuggestionsPanel;