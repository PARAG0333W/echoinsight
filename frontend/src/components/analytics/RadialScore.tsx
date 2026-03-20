import React from 'react';

interface RadialScoreProps {
  score?: number | null;
  size?: number;
  strokeWidth?: number;
}

const RadialScore: React.FC<RadialScoreProps> = ({ 
  score = null, 
  size = 40, 
  strokeWidth = 3 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const validScore = typeof score === 'number' ? score : 0;
  const offset = circumference - (validScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return '#10b981'; // emerald-500
    if (s >= 60) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={typeof score === 'number' ? getColor(score) : '#e2e8f0'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={score === null || score === undefined ? circumference : offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-200">
        {typeof score === 'number' ? Math.round(score) : '—'}
      </span>
    </div>
  );
};

export default RadialScore;
