import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { FUNCTION_NAMES } from '../../data/archetypes';
import { FUNCTION_KEYS } from '../../data/questionBank';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import TrendLineChart from './TrendLineChart';
import './ThetaTrendCharts.css';

const { FiActivity, FiArrowUpRight, FiBarChart2, FiTrendingDown, FiTrendingUp } =
  FiIcons;

function formatDate(value, index) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return `Attempt ${index + 1}`;

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function getChangeLabel(change) {
  if (Math.abs(change) < 0.01) return 'No meaningful change';
  return change > 0 ? `Up ${change.toFixed(2)}` : `Down ${Math.abs(change).toFixed(2)}`;
}

function ThetaTrendCharts() {
  const thetaScores = usePersonalityStore((state) => state.thetaScores);
  const confidence = usePersonalityStore((state) => state.confidence);
  const resultHistory = usePersonalityStore((state) => state.resultHistory);
  const [selectedFunction, setSelectedFunction] = useState('Ne');

  const attempts = useMemo(() => {
    const previous = (resultHistory || []).map((snapshot, index) => ({
      id: snapshot.id || `previous-${index}`,
      date: snapshot.generatedAt,
      scores: snapshot.thetaScores || {},
      confidenceValue: Number(snapshot.confidence) || 0
    }));

    return [
      ...previous,
      {
        id: 'current-result',
        date: new Date().toISOString(),
        scores: thetaScores || {},
        confidenceValue: Number(confidence) || 0
      }
    ];
  }, [confidence, resultHistory, thetaScores]);

  const scoreValues = attempts.map((attempt) => ({
    date: attempt.date,
    value: Number(attempt.scores[selectedFunction]) || 0
  }));

  const confidenceValues = attempts.map((attempt) => ({
    date: attempt.date,
    value: attempt.confidenceValue * 100
  }));

  const latestScore = scoreValues.at(-1)?.value || 0;
  const previousScore = scoreValues.at(-2)?.value;
  const scoreChange =
    previousScore === undefined ? 0 : latestScore - previousScore;
  const latestConfidence = confidenceValues.at(-1)?.value || 0;
  const hasMultipleAttempts = attempts.length > 1;
  const scoreChangeLabel = hasMultipleAttempts
    ? getChangeLabel(scoreChange)
    : 'First snapshot';
  const ChangeIcon =
    scoreChange > 0 ? FiTrendingUp : scoreChange < 0 ? FiTrendingDown : FiActivity;

  return (
    <section
      className="result-panel theta-trends"
      aria-labelledby="theta-trends-title"
    >
      <div className="theta-trends-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiActivity} />
            Longitudinal view
          </span>
          <h3 id="theta-trends-title">
            Notice the direction, not just the result.
          </h3>
          <p>
            Repeated snapshots can show how your estimated functions move with
            context, experience, and reflection.
          </p>
        </div>
        <span className="theta-trends-badge">
          <SafeIcon icon={FiBarChart2} />
          {attempts.length} {attempts.length === 1 ? 'snapshot' : 'snapshots'}
        </span>
      </div>

      <div
        className="theta-function-picker"
        role="tablist"
        aria-label="Choose a function"
      >
        {FUNCTION_KEYS.map((functionKey) => (
          <button
            key={functionKey}
            type="button"
            role="tab"
            aria-selected={selectedFunction === functionKey}
            className={selectedFunction === functionKey ? 'active' : ''}
            onClick={() => setSelectedFunction(functionKey)}
          >
            {functionKey}
          </button>
        ))}
      </div>

      <div className="theta-chart-grid">
        <div className="theta-chart-card">
          <div className="theta-chart-title">
            <span>
              {selectedFunction} · {FUNCTION_NAMES[selectedFunction]}
            </span>
            <strong>{latestScore.toFixed(2)}</strong>
          </div>

          <TrendLineChart
            values={scoreValues}
            min={-4}
            max={4}
            color="#62e5c5"
            label={`${selectedFunction} theta score trend`}
          />

          <div className="theta-chart-scale">
            <span>-4 lower signal</span>
            <span>+4 higher signal</span>
          </div>

          <div className="theta-trend-change">
            <SafeIcon icon={ChangeIcon} />
            <span>{scoreChangeLabel}</span>
          </div>
        </div>

        <div className="theta-chart-card">
          <div className="theta-chart-title">
            <span>Pattern match</span>
            <strong>{Math.round(latestConfidence)}%</strong>
          </div>

          <TrendLineChart
            values={confidenceValues}
            min={0}
            max={100}
            color="#72aaff"
            label="Pattern match trend"
          />

          <div className="theta-chart-scale">
            <span>Open</span>
            <span>Strong</span>
          </div>
        </div>
      </div>

      {!hasMultipleAttempts && (
        <p className="theta-trends-note">
          Complete another assessment to activate the comparison trend.
          <SafeIcon icon={FiArrowUpRight} />
        </p>
      )}

      <div className="theta-attempt-labels" aria-label="Assessment snapshot dates">
        {attempts.map((attempt, index) => (
          <span key={attempt.id}>{formatDate(attempt.date, index)}</span>
        ))}
      </div>

      <p className="theta-trends-disclaimer">
        Trends are reflective estimates, not evidence of clinical change or
        permanent personality change.
      </p>
    </section>
  );
}

export default ThetaTrendCharts;