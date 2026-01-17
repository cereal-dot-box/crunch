import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'large';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center border font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    default: 'min-h-[44px] px-4 py-3 text-sm',
    large: 'min-h-[48px] px-6 py-4 text-base',
  };

  const variantClasses = {
    primary: 'border-black text-white bg-emerald-600 hover:bg-emerald-700',
    secondary: 'border-black text-black bg-white',
    ghost: 'border-transparent text-[#0000EE] hover:underline',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`.trim();

  return (
    <button
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
