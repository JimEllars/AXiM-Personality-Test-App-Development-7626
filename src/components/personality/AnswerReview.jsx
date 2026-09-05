import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { LIKERT_ANCHORS } from '../../data/questionBank';
import './AnswerReview.css';

const { FiArrowLeft, FiCheck, FiEdit3, FiLock } = FiIcons;

function getAnswerLabel(value) {
  return (
    LIKERT_ANCHORS.find((anchor) => anchor.value === value)?.label ||
    'Not answered'
  );
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
              <strong>{getAnswerLabel(answers[item.id])}</strong>
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