import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className }) => {
  return (
    <div className={clsx('bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md', className)}>
      {children}
    </div>
  );
};

export default Card;