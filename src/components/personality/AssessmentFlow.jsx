import React, { useEffect, useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  ASSESSMENT_CLUSTERS,
  FUNCTION_KEYS,
  QUESTION_BANK
} from '../../data/questionBank';
import { scoreAssessmentDiagnostics } from '../../services/psychometrics/irtEngine';
import { projectArchetype } from '../../services/psychometrics/archetypeProjector';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import { trackEvent } from '../../services/telemetry';
import AnswerReview from './AnswerReview';
import QuestionCluster from './QuestionCluster';

const {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiKeyboard,
  FiLock
} = FiIcons;

function AssessmentFlow() {
  const currentClusterIndex = usePersonalityStore(
    (state) => state.currentClusterIndex
  );
  const answers = usePersonalityStore((state) => state.answers);
  const setAnswer = usePersonalityStore((state) => state.setAnswer);
  const nextCluster = usePersonalityStore((state) => state.nextCluster);
  const prevCluster = usePersonalityStore((state) => state.prevCluster);
  const setClusterIndex = usePersonalityStore(
    (state) => state.setClusterIndex
  );
  const setResults = usePersonalityStore((state) => state.setResults);
  const [message, setMessage] = useState('');
  const [reviewMode, setReviewMode] = useState(false);

  const items = ASSESSMENT_CLUSTERS[currentClusterIndex] || [];
  const isLast = currentClusterIndex === ASSESSMENT_CLUSTERS.length - 1;
  const answeredCount = Object.keys(answers).filter((itemId) =>
    QUESTION_BANK.some(
      (item) =>
        item.id === itemId && Number.isInteger(answers[itemId])
    )
  ).length;
  const progress = Math.round(
    (answeredCount / QUESTION_BANK.length) * 100
  );

  const unansweredItems = useMemo(
    () => items.filter((item) => !Number.isInteger(answers[item.id])),
    [items, answers]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentClusterIndex, reviewMode]);

  useEffect(() => {
    const handleKeyboardAnswer = (event) => {
      if (!/^[1-5]$/.test(event.key)) return;

      const activeElement = document.activeElement;
      if (
        activeElement?.matches('input, textarea, select') ||
        activeElement?.isContentEditable
      ) {
        return;
      }

      const question = activeElement?.closest('[data-question-id]');
      if (!question) return;

      setAnswer(question.dataset.questionId, Number(event.key));
      setMessage('');
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [setAnswer]);

  const revealResults = () => {
    trackEvent('assessment_completed');
    const metrics = scoreAssessmentDiagnostics(
      QUESTION_BANK,
      answers,
      FUNCTION_KEYS
    );

    setResults(
      metrics.thetaScores,
      projectArchetype(metrics.thetaScores),
      metrics
    );
  };

  const editAnswer = (itemId) => {
    const itemIndex = QUESTION_BANK.findIndex((item) => item.id === itemId);
    if (itemIndex < 0) return;

    const targetCluster = Math.floor(itemIndex / 6);
    setClusterIndex(targetCluster);
    setReviewMode(false);
    setMessage('');

    window.setTimeout(() => {
      const question = document.querySelector(
        `[data-question-id="${CSS.escape(itemId)}"]`
      );

      if (!question) return;

      question.scrollIntoView({ behavior: 'smooth', block: 'center' });
      question.focus({ preventScroll: true });
    }, 80);
  };

  const advance = () => {
    trackEvent('assessment_advance', { clusterIndex: currentClusterIndex });
    if (unansweredItems.length > 0) {
      const count = unansweredItems.length;
      setMessage(
        `${count} statement${count === 1 ? '' : 's'} still need${
          count === 1 ? 's' : ''
        } an answer.`
      );

      document
        .querySelector(
          `[data-question-id="${CSS.escape(unansweredItems[0].id)}"]`
        )
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setMessage('');

    if (!isLast) {
      nextCluster();
      return;
    }

    setReviewMode(true);
  };

  if (reviewMode) {
    return (
      <AnswerReview
        items={QUESTION_BANK}
        answers={answers}
        onEdit={editAnswer}
        onBack={() => setReviewMode(false)}
        onReveal={revealResults}
      />
    );
  }

  return (
    <main className="assessment-shell">
      <div className="assessment-heading">
        <div>
          <span className="eyebrow">
            <span />
            Cognitive profile
          </span>
          <h1>Choose what feels most true.</h1>
          <p>
            Answer from your usual behavior—not who you think you should be.
          </p>
        </div>

        <div className="progress-copy" aria-live="polite">
          <strong>{progress}%</strong>
          <span>complete</span>
        </div>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Assessment progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="cluster-label">
        <span>
          Section {currentClusterIndex + 1} of {ASSESSMENT_CLUSTERS.length}
        </span>
        <span>
          <SafeIcon icon={FiLock} />
          Saved locally
        </span>
      </div>

      <div className="keyboard-hint">
        <SafeIcon icon={FiKeyboard} />
        <span>Focus a statement, then press 1–5 to answer quickly.</span>
      </div>

      <QuestionCluster
        items={items}
        answers={answers}
        onAnswer={(itemId, value) => {
          setAnswer(itemId, value);
          setMessage('');
        }}
        clusterIndex={currentClusterIndex}
      />

      <div className="assessment-actions">
        <button
          className="secondary-button"
          type="button"
          disabled={currentClusterIndex === 0}
          onClick={prevCluster}
        >
          <SafeIcon icon={FiArrowLeft} />
          Previous
        </button>

        {message && (
          <p className="form-error" role="alert">
            {message}
          </p>
        )}

        <button className="primary-button" type="button" onClick={advance}>
          {isLast ? 'Review answers' : 'Continue'}
          <SafeIcon icon={isLast ? FiCheck : FiArrowRight} />
        </button>
      </div>
    </main>
  );
}

export default AssessmentFlow;