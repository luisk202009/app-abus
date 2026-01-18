import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface IncomeSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const IncomeSlider = ({ value, onChange }: IncomeSliderProps) => {
  const [localValue, setLocalValue] = useState(value);
  
  const min = 0;
  const max = 15000;
  const step = 100;

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-4xl font-semibold tracking-tight">
          {formatCurrency(localValue)}
        </span>
        <span className="text-muted-foreground ml-1">/mes</span>
      </div>

      <div className="relative pt-2 pb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-6
            [&::-moz-range-thumb]:h-6
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--secondary)) ${percentage}%, hsl(var(--secondary)) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{formatCurrency(min)}</span>
          <span>{formatCurrency(max)}+</span>
        </div>
      </div>
    </div>
  );
};
