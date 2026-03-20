import React from 'react';
import { Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { RiskLevel } from '../../utils/types';

interface RiskIndicatorProps {
  risk: RiskLevel;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk }) => {
  const label =
    risk === 'low' ? 'Low risk' : risk === 'medium' ? 'Medium risk' : 'High risk';

  const variant: Parameters<typeof Badge>[0]['variant'] =
    risk === 'high' ? 'destructive' : risk === 'medium' ? 'warning' : 'success';

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-slate-700" />
        <div className="flex flex-col">
          <span className="text-xs font-medium">Risk level</span>
          <span className="text-[11px] text-muted-foreground">
            Based on compliance and escalation signals
          </span>
        </div>
      </div>
      <Badge variant={variant}>{label}</Badge>
    </Card>
  );
};

export default RiskIndicator;