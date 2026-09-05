import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { FUNCTION_NAMES } from '../../data/archetypes';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import './ScoreComparisonPanel.css';

const {
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiRefreshCw,
  FiTrendingDown,
  FiTrendingUp
} = FiIcons;

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Earlier attempt';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function formatScore(value) {
  return Number(value).toFixed(2);
}

function ComparisonRow({ functionKey, current, previous }) {
  const change = current - previous;
  const sign = change > 0 ? '+' : '';
  const Icon = change > 0 ? FiTrendingUp : FiTrendingDown;

  return (
    <div className="comparison-score-row">
      <div>
        <strong>{functionKey}</strong>
        <span>{FUNCTION_NAMES[functionKey]}</span>
      </div>
      <b>{formatScore(previous)}</b>
      <SafeIcon icon={FiArrowRight} />
      <b>{formatScore(current)}</b>
      <em
        className={
          change === 0 ? 'neutral' : change > 0 ? 'positive' : 'negative'
        }
      >
        {change !== 0 && <SafeIcon icon={Icon} />}
        {sign}
        {formatScore(change)}
      </em>
    </div>
  );
}

function ScoreComparisonPanel() {
  const thetaScores = usePersonalityStore((state) => state.thetaScores);
  const confidence = usePersonalityStore((state) => state.confidence);
  const assignedArchetype = usePersonalityStore(
    (state) => state.assignedArchetype
  );
  const resultHistory = usePersonalityStore((state) => state.resultHistory);
  const startRetake = usePersonalityStore((state) => state.startRetake);
  const [selectedId, setSelectedId] = useState('');

  const previousResult = useMemo(() => {
    if (!resultHistory?.length) return null;

    return (
      resultHistory.find((snapshot) => snapshot.id === selectedId) ||
      resultHistory[resultHistory.length - 1]
    );
  }, [resultHistory, selectedId]);

  const rows = Object.keys(thetaScores || {}).filter(
    (key) =>
      Number.isFinite(thetaScores[key]) &&
      Number.isFinite(previousResult?.thetaScores?.[key])
  );

  const confidenceChange =
    Number(confidence || 0) - Number(previousResult?.confidence || 0);

  if (!previousResult) {
    return (
      <section className="result-panel score-comparison-panel">
        <div className="comparison-empty-state">
          <span className="card-kicker">
            <SafeIcon icon={FiRefreshCw} />
            Retake comparison
          </span>
          <h3>Track how your profile changes.</h3>
          <p>
            Complete another assessment to compare your function scores,
            archetype, and pattern match side by side.
          </p>
          <button
            className="secondary-button"
            type="button"
            onClick={startRetake}
          >
            Retake assessment
            <SafeIcon icon={FiArrowRight} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="result-panel score-comparison-panel">
      <div className="comparison-panel-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiBarChart2} />
            Retake comparison
          </span>
          <h3>See what shifted.</h3>
          <p>
            Compare this result with an earlier assessment to notice movement
            without treating change as a correction or diagnosis.
          </p>
        </div>

        <button
          className="secondary-button comparison-retake"
          type="button"
          onClick={startRetake}
        >
          <SafeIcon icon={FiRefreshCw} />
          Retake again
        </button>
      </div>

      <div className="comparison-select-row">
        <label htmlFor="comparison-attempt">
          <SafeIcon icon={FiClock} />
          Compare with
        </label>
        <select
          id="comparison-attempt"
          value={previousResult.id}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          {resultHistory
            .slice()
            .reverse()
            .map((snapshot, index) => (
              <option key={snapshot.id} value={snapshot.id}>
                Attempt {resultHistory.length - index} ·{' '}
                {formatDate(snapshot.generatedAt)} ·{' '}
                {snapshot.assignedArchetype || 'Profile'}
              </option>
            ))}
        </select>
      </div>

      <div className="comparison-summary">
        <div>
          <span>Previous archetype</span>
          <strong>{previousResult.assignedArchetype}</strong>
        </div>

        <SafeIcon icon={FiArrowRight} />

        <div>
          <span>Current archetype</span>
          <strong>{assignedArchetype}</strong>
        </div>

        <div>
          <span>Pattern match change</span>
          <strong className={confidenceChange >= 0 ? 'positive' : 'negative'}>
            {confidenceChange >= 0 ? '+' : ''}
            {Math.round(confidenceChange * 100)} pts
          </strong>
        </div>
      </div>

      <div className="comparison-score-list">
        <div className="comparison-score-labels">
          <span>Function</span>
          <span>Earlier</span>
          <span>Current</span>
          <span>Change</span>
        </div>

        {rows.length ? (
          rows.map((functionKey) => (
            <ComparisonRow
              key={functionKey}
              functionKey={functionKey}
              current={thetaScores[functionKey]}
              previous={previousResult.thetaScores[functionKey]}
            />
          ))
        ) : (
          <p className="comparison-empty">
            Function scores are unavailable for this attempt.
          </p>
        )}
      </div>

      <p className="comparison-disclaimer">
        Small score changes can reflect context, interpretation, or normal
        response variation. Look for meaningful patterns across time.
      </p>
    </section>
  );
}

export default ScoreComparisonPanel;