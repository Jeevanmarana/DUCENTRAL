import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export function BackButton({ onClick, className = '' }: BackButtonProps) {
  const handle = () => {
    if (onClick) return onClick();
    // default: navigate back if possible, else go to root
    try {
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/';
    } catch (e) {
      window.location.href = '/';
    }
  };

  return (
    <button
      onClick={handle}
      className={`inline-flex items-center space-x-2 text-du hover:opacity-90 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm">Back</span>
    </button>
  );
}

export default BackButton;
