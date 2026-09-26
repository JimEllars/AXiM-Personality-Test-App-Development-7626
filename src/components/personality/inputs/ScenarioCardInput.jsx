import React from 'react';
import { resolveLikertKey } from '../LikertInput';

function ScenarioCardInput({ item, value, onChange }) {
  const { id, options } = item;

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
    const btn = document.getElementById(`${id}-scenario-${val}`);
    if (btn) btn.focus();
    if (navigator.vibrate) navigator.vibrate(20);
    onChange(val);
  };

  const choices = [
    { value: 1, label: `Strongly ${options.left || 'A'}` },
    { value: 2, label: `Lean ${options.left || 'A'}` },
    { value: 3, label: 'Equal / Both' },
    { value: 4, label: `Lean ${options.right || 'B'}` },
    { value: 5, label: `Strongly ${options.right || 'B'}` }
  ];

  return (
    <fieldset className="scenario-input" role="radiogroup" aria-label="Select your path" onKeyDown={handleKeyDown}>
      <legend className="sr-only">Select your path from 1 to 5</legend>
      <div className="flex flex-col items-center gap-4 w-full mt-4">
        <div className="flex justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="text-left w-1/3">{options.left}</span>
          <span className="text-center w-1/3 text-gray-400">vs</span>
          <span className="text-right w-1/3">{options.right}</span>
        </div>

        <div className="flex justify-between w-full max-w-lg gap-2">
          {choices.map((choice) => (
            <label
              key={choice.value}
              id={`${id}-scenario-${choice.value}`}
              role="radio"
              aria-checked={value === choice.value}
              tabIndex={value === choice.value || (!value && choice.value === 1) ? 0 : -1}
              onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   handleChange(choice.value);
                 }
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500 dark:focus-visible:ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-2 min-h-[48px] min-w-[48px] transition-all
                ${value === choice.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}
              `}
              onClick={() => handleChange(choice.value)}
              title={choice.label}
            >
              <input type="radio" name={id} value={choice.value} checked={value === choice.value} readOnly tabIndex={-1} aria-hidden="true" className="hidden" />
              <span className="font-bold">{choice.value}</span>
            </label>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

export default ScenarioCardInput;
