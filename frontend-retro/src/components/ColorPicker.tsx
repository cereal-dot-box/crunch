import { BUDGET_COLOR_OPTIONS } from '../config/budgets';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {BUDGET_COLOR_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              h-12 border border-black transition-all
              ${option.value}
              ${value === option.value
                ? 'border-black border-4'
                : 'hover:opacity-80'
              }
            `}
            aria-label={option.label}
            title={option.label}
          />
        ))}
      </div>
    </div>
  );
}
