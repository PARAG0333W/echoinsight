import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Mistake } from '../../utils/types';

interface MistakesPanelProps {
  mistakes: Mistake[];
}

const MistakesPanel: React.FC<MistakesPanelProps> = ({ mistakes }) => {
  const severityVariant = (s: Mistake['severity']) =>
    s === 'high' ? 'destructive' : s === 'medium' ? 'warning' : 'default';

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-medium">Communication mistakes</h2>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {mistakes.length} detected
        </span>
      </div>
      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
        {mistakes.map((m) => (
          <div
            key={m.id}
            className="rounded-lg border border-border/70 bg-slate-50 px-3 py-2 space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium">{m.label}</p>
              <Badge variant={severityVariant(m.severity)}>
                {m.severity === 'high'
                  ? 'High risk'
                  : m.severity === 'medium'
                  ? 'Medium'
                  : 'Low'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {m.description}
            </p>
          </div>
        ))}
        {mistakes.length === 0 && (
          <p className="text-[11px] text-muted-foreground">
            No notable mistakes detected in this conversation.
          </p>
        )}
      </div>
    </Card>
  );
};

export default MistakesPanel;