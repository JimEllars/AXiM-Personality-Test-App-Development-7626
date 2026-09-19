import React from 'react';
import { resolveLikertKey } from '../LikertInput';

function ReactionDilemmaInput({ item, value, onChange }) {
  const { id, options } = item;

  // A standard reaction usually has two extremes mapped to 1 and 5.
  // We'll generate 5 buttons to keep the 1-5 scale consistent.
  const choices = [
    { value: 1, label: options.choices[0].label, desc: options.choices[0].description },
    { value: 2, label: `Lean ${options.choices[0].label}`, desc: '' },
    { value: 3, label: 'Unsure / Middle', desc: '' },
    { value: 4, label: `Lean ${options.choices[1].label}`, desc: '' },
    { value: 5, label: options.choices[1].label, desc: options.choices[1].description }
  ];

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
    const btn = document.getElementById(`${id}-reaction-${val}`);
    if (btn) btn.focus();
    if (navigator.vibrate) navigator.vibrate(20);
    onChange(val);
  };

  return (
    <fieldset className="reaction-input" role="radiogroup" aria-label="Select your reaction" onKeyDown={handleKeyDown}>
      <legend className="sr-only">Select your reaction from 1 to 5</legend>
      <div className="flex flex-col gap-3 mt-4">
        {choices.map((choice) => (
          <label
            key={choice.value}
            id={`${id}-reaction-${choice.value}`}
            role="radio"
            aria-checked={value === choice.value}
            tabIndex={value === choice.value || (!value && choice.value === 1) ? 0 : -1}
            onKeyDown={(e) => {
               if (e.key === 'Enter' || e.key === ' ') {
                 e.preventDefault();
                 handleChange(choice.value);
               }
            }}
            className={`flex flex-col justify-center p-4 rounded-xl cursor-pointer border-2 focus-visible:ring-2 transition-all min-h-[60px]
              ${value === choice.value
                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30 dark:border-blue-400 shadow-md'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'}
            `}
            onClick={() => handleChange(choice.value)}
          >
            <input type="radio" name={id} value={choice.value} checked={value === choice.value} readOnly tabIndex={-1} aria-hidden="true" className="hidden" />
            <span className={`text-base font-bold ${value === choice.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
              {choice.label}
            </span>
            {choice.desc && (
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {choice.desc}
              </span>
            )}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default ReactionDilemmaInput;
