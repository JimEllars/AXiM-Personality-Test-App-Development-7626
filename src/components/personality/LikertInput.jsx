import React from 'react';
import { LIKERT_ANCHORS } from '../../data/questionBank';

export function resolveLikertKey(currentValue = 0, key) {
  let nextValue = currentValue;

  if (key === 'ArrowRight' || key === 'ArrowUp') {
    nextValue = Math.min(5, currentValue + 1);
  } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
    nextValue = Math.max(1, currentValue - 1);
  } else if (key >= '1' && key <= '5') {
    nextValue = parseInt(key, 10);
  } else if (key === '7') {
    nextValue = 5; // Support 7-point keyboard scale mapping to 5
  }

  return nextValue !== currentValue && nextValue >= 1 && nextValue <= 5
    ? nextValue
    : null;
}

function LikertInput({ itemId, value, onChange }) {
  const handleKeyDown = (e) => {
    const currentValue = value || 0;

    if (e.key === 'Enter' || e.key === ' ') {
      // Let the parent QuestionCluster handle scrolling to the next item
      if (currentValue >= 1 && currentValue <= 5) {
        // Find the closest question card and fire a custom event
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
    const label = document.getElementById(`${itemId}-option-${val}`);
    if (label) {
      label.focus();
    }

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
          id={`${itemId}-option-${anchor.value}`}
          role="radio"
          aria-checked={value === anchor.value}
          tabIndex={value === anchor.value || (!value && anchor.value === 1) ? 0 : -1}
          onKeyDown={(e) => {
             if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               handleChange(anchor.value);
             }
          }}
          className={`likert-option focus-visible:ring-2 ${value === anchor.value ? 'selected' : ''}`}
          title={`${anchor.label}. Keyboard shortcut: ${anchor.value}`}
          onClick={() => handleChange(anchor.value)}
        >
          <input type="radio" name={itemId} value={anchor.value} checked={value === anchor.value} readOnly tabIndex={-1} aria-hidden="true" />
          <span className="likert-circle">{anchor.value}</span>
          <small>{anchor.short}</small>
        </label>
      ))}
    </fieldset>
  );
}

export default LikertInput;
