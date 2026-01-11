import React, { useState } from 'react';

export interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  mobileOnly?: boolean;
}

export function Collapsible({
  title,
  children,
  defaultOpen = true,
  mobileOnly = false,
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // If mobileOnly is true, always show content on desktop (md and up)
  const contentClass = mobileOnly
    ? `${isOpen ? 'block' : 'hidden'} md:block`
    : isOpen
    ? 'block'
    : 'hidden';

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className={`w-full flex items-center justify-between min-h-[48px] py-3 text-left focus:outline-none border-b border-black ${
          mobileOnly ? 'md:cursor-default' : ''
        }`}
        {...(mobileOnly ? { 'aria-disabled': 'true', tabIndex: -1 } : {})}
      >
        <h2 className="text-xl font-semibold text-black">{title}</h2>
        <svg
          className={`w-5 h-5 text-black transition-transform ${
            isOpen ? 'rotate-180' : 'rotate-0'
          } ${mobileOnly ? 'md:hidden' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className={contentClass}>{children}</div>
    </div>
  );
}
