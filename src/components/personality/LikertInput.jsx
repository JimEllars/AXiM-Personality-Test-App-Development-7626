import React from 'react';
import { LIKERT_ANCHORS } from '../../data/questionBank';

function LikertInput({ itemId, value, onChange }) {
  const handleKeyDown = (e) => {
    const currentValue = value || 0;
    let nextValue = currentValue;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextValue = Math.min(5, currentValue + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextValue = Math.max(1, currentValue - 1);
    }

    if (nextValue !== currentValue && nextValue >= 1 && nextValue <= 5) {
      handleChange(nextValue);
      e.preventDefault();
    }
  };

  const handleChange = (val) => {
    // Add mobile haptics
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
    onChange(val);
  };

  return (
    <fieldset className="likert" role="radiogroup" aria-label="Select agreement level" onKeyDown={handleKeyDown}>
      <legend className="sr-only">Select agreement level from 1 to 5</legend>
      {LIKERT_ANCHORS.map((anchor) => (
        <label
          key={anchor.value}
          role="radio"
          aria-checked={value === anchor.value}
          className={`likert-option ${value === anchor.value ? 'selected' : ''}`}
          title={`${anchor.label}. Keyboard shortcut: ${anchor.value}`}
        >
          <input
            type="radio"
            name={itemId}
            value={anchor.value}
            checked={value === anchor.value}
            onChange={() => handleChange(anchor.value)}
          />
          <span className="likert-circle">{anchor.value}</span>
          <small>{anchor.short}</small>
        </label>
      ))}
    </fieldset>
  );
}

export default LikertInput;
