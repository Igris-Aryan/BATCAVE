import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: 'normal' | 'inverse' | 'neutral';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  delta,
  deltaColor = 'normal',
}) => {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');

  // Determine styling based on deltaColor mode with Matrix theme palette
  let deltaStyle = 'text-emerald-400/80 bg-emerald-950/40 border border-emerald-800/50';
  let DeltaIcon = Minus;

  if (deltaColor === 'inverse') {
    if (isNegative) {
      deltaStyle = 'text-emerald-300 bg-emerald-950/80 border border-emerald-600/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      DeltaIcon = ArrowDownRight;
    } else if (isPositive) {
      deltaStyle = 'text-red-400 bg-red-950/80 border border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.25)]';
      DeltaIcon = ArrowUpRight;
    }
  } else if (deltaColor === 'normal') {
    if (isPositive) {
      deltaStyle = 'text-emerald-300 bg-emerald-950/80 border border-emerald-600/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
      DeltaIcon = ArrowUpRight;
    } else if (isNegative) {
      deltaStyle = 'text-red-400 bg-red-950/80 border border-red-700/60 shadow-[0_0_8px_rgba(239,68,68,0.25)]';
      DeltaIcon = ArrowDownRight;
    }
  }

  return (
    <div
      id={id}
      className="relative bg-[#051108]/90 rounded-xl border border-emerald-500/25 p-5 shadow-lg backdrop-blur-md transition-all hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] group matrix-grid-bg"
    >
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-emerald-400/80 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-500">&gt;</span>
          {label}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 group-hover:bg-emerald-400 group-hover:shadow-[0_0_6px_#10b981]" />
      </div>
      <div className="text-2xl sm:text-3xl font-black text-emerald-200 tracking-tight font-mono matrix-glow">
        {value}
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md ${deltaStyle}`}
          >
            <DeltaIcon className="w-3 h-3" />
            {delta}
          </span>
        </div>
      )}
    </div>
  );
};
