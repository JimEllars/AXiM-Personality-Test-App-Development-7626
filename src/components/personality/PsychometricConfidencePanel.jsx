import React, { useMemo } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './PsychometricConfidencePanel.css';

const {
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiInfo,
  FiShield
} = FiIcons;

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round((value || 0) * 100)));
}

function getConfidenceLabel(value) {
  if (value >= 0.75) return 'Strong pattern';
  if (value >= 0.5) return 'Moderate pattern';
  return 'Open pattern';
}

function PsychometricConfidencePanel({
  confidence = 0,
  ranking = [],
  assignedArchetype,
  assessmentMetrics = {}
}) {
  const confidencePercent = clampPercent(confidence);
  const confidenceLabel = getConfidenceLabel(confidence);

  const orderedRanking = useMemo(
    () =>
      [...ranking].sort(
        (first, second) => second.similarity - first.similarity
      ),
    [ranking]
  );

  const selectedIndex = orderedRanking.findIndex(
    (item) => item.archetype === assignedArchetype
  );

  const selectedSimilarity =
    orderedRanking[selectedIndex]?.similarity ?? confidence;
  const runnerUp =
    orderedRanking.find((item) => item.archetype !== assignedArchetype) ||
    null;

  const separation = runnerUp
    ? Math.max(
        0,
        Math.round((selectedSimilarity - runnerUp.similarity) * 100)
      )
    : 0;

  const coveragePercent = Math.max(
    0,
    Math.min(
      100,
      Math.round((assessmentMetrics.coverage || 0) * 100)
    )
  );

  const averageSem = Number(assessmentMetrics.averageSem) || 0;

  return (
    <section
      className="result-panel confidence-panel"
      aria-labelledby="confidence-title"
    >
      <div className="confidence-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiBarChart2} />
            Psychometric confidence
          </span>
          <h3 id="confidence-title">How clearly does the pattern fit?</h3>
        </div>

        <span className="confidence-badge">
          <SafeIcon icon={FiShield} />
          {confidenceLabel}
        </span>
      </div>

      <div className="confidence-main">
        <div className="confidence-score">
          <strong>{confidencePercent}%</strong>
          <span>pattern match</span>
        </div>

        <div className="confidence-meter">
          <div
            className="confidence-meter-track"
            role="progressbar"
            aria-label="Psychometric pattern match"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={confidencePercent}
          >
            <span style={{ width: `${confidencePercent}%` }} />
          </div>

          <div className="confidence-scale" aria-hidden="true">
            <span>Open</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
        </div>
      </div>

      <div className="confidence-stats" aria-label="Assessment quality indicators">
        <div>
          <SafeIcon icon={FiCheckCircle} />
          <span>
            <strong>{coveragePercent}%</strong>
            response coverage
          </span>
        </div>

        <div>
          <SafeIcon icon={FiBarChart2} />
          <span>
            <strong>{averageSem.toFixed(2)}</strong>
            average uncertainty
          </span>
        </div>

        <div>
          <SafeIcon icon={FiShield} />
          <span>
            <strong>
              {runnerUp ? `${separation} pts` : '—'}
            </strong>
            lead over next pattern
          </span>
        </div>
      </div>

      <div className="confidence-details">
        <div>
          <SafeIcon icon={FiInfo} />
          <p>
            This score describes how closely your eight-function profile
            resembles the selected reference pattern. It is not a probability
            that the type is objectively correct.
          </p>
        </div>

        <div>
          <SafeIcon icon={FiBarChart2} />
          <p>
            {runnerUp
              ? `The leading pattern is ${separation} percentage points ahead of ${runnerUp.archetype} in this comparison.`
              : 'The result is based on the available reference patterns in this assessment.'}
          </p>
        </div>
      </div>

      <div className="confidence-note">
        <SafeIcon icon={FiAlertCircle} />
        <span>
          Treat this as an educational reflection signal. Context, life stage,
          and future responses can change the result.
        </span>
      </div>
    </section>
  );
}

export default PsychometricConfidencePanel;