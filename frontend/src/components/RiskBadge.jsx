import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RiskBadge({ risk, percentage, showIcon = true }) {
  const isHigh = risk === 'High' || (percentage !== undefined && percentage >= 40);
  const isMed = risk === 'Medium' || (percentage !== undefined && percentage >= 15 && percentage < 40);

  if (isHigh) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
        {showIcon && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
        <span>High Risk {percentage !== undefined && `(${percentage}%)`}</span>
      </span>
    );
  }

  if (isMed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
        {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        <span>Medium Risk {percentage !== undefined && `(${percentage}%)`}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
      {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
      <span>Low Risk {percentage !== undefined && `(${percentage}%)`}</span>
    </span>
  );
}
