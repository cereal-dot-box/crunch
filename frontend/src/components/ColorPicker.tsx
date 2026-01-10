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
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
              h-12 rounded-lg transition-all
              ${option.value}
              ${value === option.value
                ? 'ring-4 ring-offset-2 ring-gray-900 scale-105'
                : 'hover:scale-105 hover:ring-2 hover:ring-offset-2 hover:ring-gray-400'
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
