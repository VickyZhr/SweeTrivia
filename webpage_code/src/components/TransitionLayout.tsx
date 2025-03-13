import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TransitionLayoutProps {
  children: ReactNode;
  className?: string;
}

const TransitionLayout: React.FC<TransitionLayoutProps> = ({ children, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center p-6',
      'bg-green-900',
      className
    )}>
      <div
        className={cn(
          'w-full max-w-4xl transition-all duration-700 ease-out transform',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default TransitionLayout;