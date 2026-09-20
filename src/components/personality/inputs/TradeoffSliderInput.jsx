import React from 'react';
import { resolveLikertKey } from '../LikertInput';

function TradeoffSliderInput({ item, value, onChange }) {
  const { id, options } = item;

  const handleKeyDown = (e) => {
    const currentValue = value || 0;

    if (e.key === 'Enter' || e.key === ' ') {
      if (currentValue >= 1 && currentValue <= 7) {
        const event = new CustomEvent('axim-likert-confirm', { bubbles: true });
        e.currentTarget.dispatchEvent(event);
      }
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowLeft') {
      handleChange(Math.max(1, currentValue - 1));
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowRight') {
      handleChange(Math.min(7, currentValue === 0 ? 2 : currentValue + 1));
      e.preventDefault();
      return;
    }
    if (e.key === 'Home') {
      handleChange(1);
      e.preventDefault();
      return;
    }
    if (e.key === 'End') {
      handleChange(7);
      e.preventDefault();
      return;
    }

    const nextValue = resolveLikertKey(currentValue, e.key);
    if (nextValue !== null) {
      handleChange(nextValue);
      e.preventDefault();
    }
  };

  const handleChange = (val) => {
    const btn = document.getElementById(`${id}-tradeoff-${val}`);
    if (btn) btn.focus();
    if (navigator.vibrate) navigator.vibrate(15);
    onChange(val);
  };

  const segments = [1, 2, 3, 4, 5, 6, 7];

  return (
    <fieldset className="tradeoff-input" role="radiogroup" aria-label="Select tradeoff level" onKeyDown={handleKeyDown}>
      <legend className="sr-only">Select tradeoff level from 1 to 7</legend>
      <div className="flex flex-col items-center gap-6 w-full mt-6">
        <div className="flex justify-between w-full text-base font-semibold text-gray-800 dark:text-gray-100">
          <span className="w-5/12 text-left">{options.left}</span>
          <span className="w-5/12 text-right">{options.right}</span>
        </div>

        <div className="relative flex justify-between items-center w-full max-w-xl h-2 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ touchAction: 'pan-y' }} role="slider" aria-valuemin="1" aria-valuemax="7" aria-valuenow={value || 4} tabIndex={0} onKeyDown={handleKeyDown}>
          {segments.map((segment) => (
            <label
              key={segment}
              id={`${id}-tradeoff-${segment}`}
              role="radio"
              aria-checked={value === segment}
              tabIndex={value === segment || (!value && segment === 1) ? 0 : -1}
              onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   handleChange(segment);
                 }
              }}
              className={`absolute flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 w-8 h-8 -ml-4 rounded-full transition-transform
                ${value === segment
                  ? 'bg-blue-600 shadow-lg scale-125 z-10'
                  : 'bg-white border-2 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 z-0'}
              `}
              style={{ left: `${(segment - 1) * 16.666}%` }}
              onClick={() => handleChange(segment)}
              title={`Level ${segment}`}
            >
              <input type="radio" name={id} value={segment} checked={value === segment} readOnly tabIndex={-1} aria-hidden="true" className="hidden" />
              <span className={`text-xs font-bold ${value === segment ? 'text-white' : 'text-transparent'}`}>
                {segment}
              </span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

export default TradeoffSliderInput;
