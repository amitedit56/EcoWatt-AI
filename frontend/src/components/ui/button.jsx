import React from 'react';
import clsx from 'clsx';

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold shadow-lg shadow-emerald-500/20',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700',
    danger: 'bg-red-500 text-slate-950 hover:bg-red-400 font-semibold',
  };

  return (
    <button
      className={clsx('px-4 py-2 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;