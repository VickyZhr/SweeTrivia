
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div 
      className={cn(
        "glass-card p-8 md:p-10 w-full max-w-md mx-auto animate-in scale-in", 
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
