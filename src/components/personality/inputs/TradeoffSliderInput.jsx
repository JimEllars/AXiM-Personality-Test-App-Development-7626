import React from 'react';

function TradeoffSliderInput({ item, value, onChange }) {
  const { id, options } = item;
  // value is expected 0-100. Default to 50 if null.
  const currentValue = value !== null && value !== undefined ? value : 50;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const event = new CustomEvent('axim-likert-confirm', { bubbles: true });
      e.currentTarget.dispatchEvent(event);
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      handleChange(Math.max(0, currentValue - 5));
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      handleChange(Math.min(100, currentValue + 5));
      e.preventDefault();
      return;
    }
    if (e.key === 'Home') {
      handleChange(0);
      e.preventDefault();
      return;
    }
    if (e.key === 'End') {
      handleChange(100);
      e.preventDefault();
      return;
    }
  };

  const handleChange = (val) => {
    if (navigator.vibrate) navigator.vibrate(15);
    onChange(val);
  };

  // Convert click on the track to a 0-100 value
  const handleTrackClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    // snap to nearest 5
    const val = Math.round((percent * 100) / 5) * 5;
    handleChange(val);
  };

  return (
    <fieldset className="tradeoff-input w-full" role="group" aria-label="Select tradeoff level">
      <legend className="sr-only">Select tradeoff level from 0 to 100</legend>
      <div className="flex flex-col items-center gap-6 w-full mt-6">
        <div className="flex justify-between w-full text-base font-semibold text-gray-800 dark:text-gray-100">
          <span className="w-5/12 text-left">{options.left}</span>
          <span className="w-5/12 text-right">{options.right}</span>
        </div>

        <div
          className="relative flex items-center w-full max-w-xl h-4 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
          style={{ touchAction: 'none', transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          role="slider"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={currentValue}
          aria-label={`${options.left} vs ${options.right}`}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleTrackClick}
        >
          {/* Active Track */}
          <div className="absolute h-full bg-blue-300 dark:bg-blue-800 rounded-full" style={{ width: `${currentValue}%` }}></div>

          {/* Thumb */}
          <div
            className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing w-8 h-8 -ml-4 bg-blue-600 shadow-lg rounded-full z-10 hover:scale-110 active:scale-95 transition-transform"
            style={{ left: `${currentValue}%`, transition: 'left 100ms ease-out, transform 150ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span className="sr-only">{currentValue}</span>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

export default TradeoffSliderInput;
