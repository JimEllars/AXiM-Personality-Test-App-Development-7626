import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { LIKERT_ANCHORS } from '../../data/questionBank';
import './AnswerReview.css';

const { FiArrowLeft, FiCheck, FiEdit3, FiLock } = FiIcons;

function getAnswerLabel(item, value) {
  if (value === undefined || value === null || !Number.isInteger(Number(value))) {
    return 'Not answered';
  }

  const num = Number(value);

  if (item.type === 'scenario') {
    if (num === 1) return `Strongly ${item.options.left}`;
    if (num === 2) return `Lean ${item.options.left}`;
    if (num === 3) return 'Equal / Both';
    if (num === 4) return `Lean ${item.options.right}`;
    if (num === 5) return `Strongly ${item.options.right}`;
  }

  if (item.type === 'tradeoff') {
    let discreteValue = num;
    if (num > 5) {
      if (num <= 15) discreteValue = 1;
      else if (num <= 35) discreteValue = 2;
      else if (num <= 65) discreteValue = 3;
      else if (num <= 85) discreteValue = 4;
      else discreteValue = 5;
    }

    if (discreteValue === 1) return item.options.left;
    if (discreteValue === 5) return item.options.right;
    if (discreteValue === 3) return 'Neutral';
    return `Level ${discreteValue}`;
  }

  if (item.type === 'reaction') {
    if (num === 1) return item.options.choices[0].label;
    if (num === 2) return `Lean ${item.options.choices[0].label}`;
    if (num === 3) return 'Unsure / Middle';
    if (num === 4) return `Lean ${item.options.choices[1].label}`;
    if (num === 5) return item.options.choices[1].label;
  }

  // fallback / likert
  return LIKERT_ANCHORS.find((anchor) => anchor.value === num)?.label || `Selected ${num}`;
}

function AnswerReview({ items, answers, onEdit, onReveal, onBack }) {
  const answeredCount = items.filter((item) =>
    Number.isInteger(answers[item.id])
  ).length;

  return (
    <main className="assessment-shell answer-review-shell">
      <div className="answer-review-heading">
        <span className="eyebrow">
          <span />
          Final review
        </span>
        <h1>Review your answers.</h1>
        <p>
          Make sure each response reflects your usual behavior. You can edit
          any answer before revealing your profile.
        </p>
      </div>

      <div className="answer-review-summary" role="status" aria-live="polite">
        <SafeIcon icon={FiCheck} />
        <span>
          <strong>
            {answeredCount} of {items.length}
          </strong>{' '}
          statements answered
        </span>
        <span className="review-private">
          <SafeIcon icon={FiLock} />
          Saved locally
        </span>
      </div>

      <div className="answer-review-list">
        {items.map((item, index) => (
          <article className="answer-review-item" key={item.id}>
            <span className="answer-review-number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="answer-review-copy">
              <p id={`review-${item.id}`}>{item.prompt}</p>
              <strong>{getAnswerLabel(item, answers[item.id])}</strong>
            </div>

            <button
              className="answer-review-edit"
              type="button"
              onClick={() => onEdit(item.id)}
              aria-label={`Edit answer ${index + 1}: ${item.prompt}`}
              aria-describedby={`review-${item.id}`}
            >
              <SafeIcon icon={FiEdit3} />
              Edit
            </button>
          </article>
        ))}
      </div>

      <div className="assessment-actions answer-review-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          <SafeIcon icon={FiArrowLeft} />
          Back to answers
        </button>
        <button
          className="primary-button"
          type="button"
          onClick={onReveal}
          disabled={answeredCount !== items.length}
        >
          Reveal my profile
          <SafeIcon icon={FiCheck} />
        </button>
      </div>
    </main>
  );
}

export default AnswerReview;
