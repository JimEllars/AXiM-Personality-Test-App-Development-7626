import React, { useEffect, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {
  ASSESSMENT_CLUSTERS,
  FUNCTION_KEYS,
  QUESTION_BANK
} from '../../data/questionBank';
import { scoreAssessment } from '../../services/psychometrics/irtEngine';
import { projectArchetype } from '../../services/psychometrics/archetypeProjector';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import QuestionCluster from './QuestionCluster';

const { FiArrowLeft, FiArrowRight, FiCheck, FiKeyboard, FiLock } = FiIcons;

function AssessmentFlow() {
  const store = usePersonalityStore();
  const [message, setMessage] = useState('');
  const items = ASSESSMENT_CLUSTERS[store.currentClusterIndex];
  const isLast = store.currentClusterIndex === ASSESSMENT_CLUSTERS.length - 1;
  const answeredCount = Object.keys(store.answers).length;
  const progress = Math.round((answeredCount / QUESTION_BANK.length) * 100);
  const complete = items.every((item) => Number.isInteger(store.answers[item.id]));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [store.currentClusterIndex]);

  useEffect(() => {
    const handleKeyboardAnswer = (event) => {
      if (!/^[1-5]$/.test(event.key)) return;

      const activeElement = document.activeElement;
      const question = activeElement?.closest('[data-question-id]');
      if (!question) return;

      const itemId = question.dataset.questionId;
      store.setAnswer(itemId, Number(event.key));
      setMessage('');
    };

    window.addEventListener('keydown', handleKeyboardAnswer);
    return () => window.removeEventListener('keydown', handleKeyboardAnswer);
  }, [store]);

  const advance = () => {
    if (!complete) {
      setMessage('Answer each statement before continuing.');
      return;
    }

    setMessage('');

    if (!isLast) {
      store.nextCluster();
      return;
    }

    const thetaScores = scoreAssessment(
      QUESTION_BANK,
      store.answers,
      FUNCTION_KEYS
    );

    store.setResults(thetaScores, projectArchetype(thetaScores));
  };

  return (
    <main className="assessment-shell">
      <div className="assessment-heading">
        <div>
          <span className="eyebrow">
            <span /> Cognitive profile
          </span>
          <h1>Choose what feels most true.</h1>
          <p>Answer from your usual behavior—not who you think you should be.</p>
        </div>
        <div className="progress-copy">
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
          Section {store.currentClusterIndex + 1} of {ASSESSMENT_CLUSTERS.length}
        </span>
        <span>
          <SafeIcon icon={FiLock} /> Saved locally
        </span>
      </div>

      <div className="keyboard-hint">
        <SafeIcon icon={FiKeyboard} />
        <span>Tip: focus a statement, then press 1–5 to answer quickly.</span>
      </div>

      <QuestionCluster
        items={items}
        answers={store.answers}
        onAnswer={store.setAnswer}
        clusterIndex={store.currentClusterIndex}
      />

      <div className="assessment-actions">
        <button
          className="secondary-button"
          disabled={store.currentClusterIndex === 0}
          onClick={store.prevCluster}
        >
          <SafeIcon icon={FiArrowLeft} /> Previous
        </button>

        {message && <p className="form-error">{message}</p>}

        <button className="primary-button" onClick={advance}>
          {isLast ? 'Reveal my profile' : 'Continue'}
          <SafeIcon icon={isLast ? FiCheck : FiArrowRight} />
        </button>
      </div>
    </main>
  );
}

export default AssessmentFlow;