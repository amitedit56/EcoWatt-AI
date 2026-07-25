import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span className={clsx('px-2.5 py-0.5 rounded-md text-xs font-semibold border', variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;