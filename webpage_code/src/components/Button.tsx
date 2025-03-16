
import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  ...props 
}) => {
  const baseClasses = "px-6 py-3 rounded-xl font-medium focus:outline-none transition-all duration-300 button-hover";
  
  const variantClasses = {
    primary: "bg-trivia-pink text-white hover:shadow-[0_0_15px_rgba(255,92,173,0.5)]",
    secondary: "bg-trivia-yellow text-trivia-darkGreen hover:shadow-[0_0_15px_rgba(255,235,59,0.5)]",
    outline: "bg-transparent border-2 border-white/30 text-white hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/10",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        isLoading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <span className="flex items-center justify-center">{children}</span>
      )}
    </button>
  );
};

export default Button;
