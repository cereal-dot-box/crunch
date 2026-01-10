import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  const baseClasses = 'bg-white overflow-hidden shadow rounded-lg p-4 sm:p-6 sm:rounded-xl';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
