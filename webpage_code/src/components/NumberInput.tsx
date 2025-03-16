
import React from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  label?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min = 1,
  max,
  className,
  label,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue)) {
      if (min !== undefined && newValue < min) {
        onChange(min);
      } else if (max !== undefined && newValue > max) {
        onChange(max);
      } else {
        onChange(newValue);
      }
    }
  };

  const increment = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      <div className="flex">
        <button
          type="button"
          onClick={decrement}
          className="px-3 rounded-l-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          disabled={value <= min}
        >
          -
        </button>
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className={cn(
            "input-field rounded-none border-l-0 border-r-0 text-center",
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={increment}
          className="px-3 rounded-r-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          disabled={max !== undefined && value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default NumberInput;
