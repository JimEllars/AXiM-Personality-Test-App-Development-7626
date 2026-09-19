import React from 'react';
import { LIKERT_ANCHORS } from '../../../data/questionBank';
import { resolveLikertKey } from '../LikertInput';

function ModernLikertInput({ item, value, onChange }) {
  const { id } = item;

  const handleKeyDown = (e) => {
    const currentValue = value || 0;

    if (e.key === 'Enter' || e.key === ' ') {
      if (currentValue >= 1 && currentValue <= 5) {
        const event = new CustomEvent('axim-likert-confirm', { bubbles: true });
        e.currentTarget.dispatchEvent(event);
      }
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
    const btn = document.getElementById(`${id}-likert-${val}`);
    if (btn) btn.focus();
    if (navigator.vibrate) navigator.vibrate(20);
    onChange(val);
  };

  return (
    <fieldset className="modern-likert-input" role="radiogroup" aria-label="Select agreement level" onKeyDown={handleKeyDown}>
      <legend className="sr-only">Select agreement level from 1 to 5</legend>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {LIKERT_ANCHORS.map((anchor) => (
          <label
            key={anchor.value}
            id={`${id}-likert-${anchor.value}`}
            role="radio"
            aria-checked={value === anchor.value}
            tabIndex={value === anchor.value || (!value && anchor.value === 1) ? 0 : -1}
            onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 handleChange(anchor.value);
               }
            }}
            className={`flex flex-col items-center justify-center p-3 rounded-full cursor-pointer border-2 focus-visible:ring-2 transition-all min-h-[44px] min-w-[80px]
              ${value === anchor.value
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-700'}
            `}
            onClick={() => handleChange(anchor.value)}
            title={`${anchor.label}. Keyboard shortcut: ${anchor.value}`}
          >
            <input type="radio" name={id} value={anchor.value} checked={value === anchor.value} readOnly tabIndex={-1} aria-hidden="true" className="hidden" />
            <span className="text-sm font-semibold text-center leading-tight">
              {anchor.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default ModernLikertInput;
