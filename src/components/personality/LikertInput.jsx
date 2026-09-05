import React from 'react';
import { LIKERT_ANCHORS } from '../../data/questionBank';

function LikertInput({ itemId, value, onChange }) {
  return (
    <fieldset className="likert" aria-label="Select agreement level">
      <legend className="sr-only">Select agreement level from 1 to 5</legend>
      {LIKERT_ANCHORS.map((anchor) => (
        <label
          key={anchor.value}
          className={`likert-option ${value === anchor.value ? 'selected' : ''}`}
          title={`${anchor.label}. Keyboard shortcut: ${anchor.value}`}
        >
          <input
            type="radio"
            name={itemId}
            value={anchor.value}
            checked={value === anchor.value}
            onChange={() => onChange(anchor.value)}
          />
          <span className="likert-circle">{anchor.value}</span>
          <small>{anchor.short}</small>
        </label>
      ))}
    </fieldset>
  );
}

export default LikertInput;