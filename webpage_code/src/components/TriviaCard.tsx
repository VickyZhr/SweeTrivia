
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TriviaCardProps {
  children: ReactNode;
  className?: string;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ children, className }) => {
  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto p-8 rounded-2xl glass border border-white/20 shadow-lg',
      'animate-fade-in transition-all-200 hover:shadow-xl',
      className
    )}>
      {children}
    </div>
  );
};

export default TriviaCard;
