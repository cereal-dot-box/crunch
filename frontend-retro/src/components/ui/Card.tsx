import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showArrow?: boolean;
  clickable?: boolean;
}

export function Card({ className = '', children, showArrow = true, clickable = true, ...props }: CardProps) {
  const baseClasses = clickable
    ? 'group bg-[#fffffc] border border-[#999] p-[10px_12px] cursor-pointer transition-colors duration-150 hover:bg-[#ffffcc] hover:border-[#666] [&_h3]:text-[#0000EE] [&_h3]:underline [&_h3]:font-bold group-hover:[&_h3]:text-[#FF0000]'
    : 'bg-[#fffffc] border border-[#999] p-[10px_12px]';
  const classes = `${baseClasses} ${className}`.trim();

  return (
    <div className={classes} {...props}>
      {showArrow && clickable && (
        <span className="arrow float-right text-[#999] font-sans opacity-0 group-hover:opacity-100 group-hover:text-[#333] transition-opacity duration-150">
          →
        </span>
      )}
      {children}
    </div>
  );
}
