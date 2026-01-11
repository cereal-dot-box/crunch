import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputClasses = 'appearance-none relative block w-full min-h-[48px] px-4 py-3 border border-black placeholder-gray-500 text-black text-base focus:outline-none focus:border-[#0000EE] disabled:opacity-50 disabled:cursor-not-allowed';

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${inputClasses} ${error ? 'border-red-600' : ''} ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
