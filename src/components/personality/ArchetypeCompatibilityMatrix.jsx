import React, { useEffect, useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { ARCHETYPE_DETAILS } from '../../data/archetypes';
import { ARCHETYPE_REFERENCE_VECTORS } from '../../services/psychometrics/archetypeProjector';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import './ArchetypeCompatibilityMatrix.css';

const { FiCompass, FiHeart, FiInfo, FiSearch, FiUsers } = FiIcons;

function cosineSimilarity(first = {}, second = {}) {
  const keys = Object.keys(first);
  let dot = 0;
  let firstNorm = 0;
  let secondNorm = 0;

  keys.forEach((key) => {
    const firstValue = Number(first[key]) || 0;
    const secondValue = Number(second[key]) || 0;

    dot += firstValue * secondValue;
    firstNorm += firstValue * firstValue;
    secondNorm += secondValue * secondValue;
  });

  if (!firstNorm || !secondNorm) return 0;

  return dot / (Math.sqrt(firstNorm) * Math.sqrt(secondNorm));
}

function getCompatibilityScore(first, second) {
  const similarity = cosineSimilarity(
    ARCHETYPE_REFERENCE_VECTORS[first],
    ARCHETYPE_REFERENCE_VECTORS[second]
  );

  return Math.round(Math.max(0, Math.min(1, (similarity + 1) / 2)) * 100);
}

function getCompatibilityLabel(score) {
  if (score >= 82) return 'Highly aligned';
  if (score >= 65) return 'Naturally complementary';
  if (score >= 48) return 'Balanced contrast';
  return 'Growth contrast';
}

function getScoreClass(score) {
  if (score >= 82) return 'high';
  if (score >= 65) return 'positive';
  if (score >= 48) return 'balanced';
  return 'contrast';
}

function ArchetypeCompatibilityMatrix() {
  const assignedArchetype = usePersonalityStore(
    (state) => state.assignedArchetype
  );
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState(assignedArchetype);

  useEffect(() => {
    setSelectedType(assignedArchetype);
  }, [assignedArchetype]);

  const matrix = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return Object.keys(ARCHETYPE_REFERENCE_VECTORS)
      .filter((archetype) => {
        if (!normalizedQuery) return true;

        const title = ARCHETYPE_DETAILS[archetype]?.[0] || '';

        return (
          archetype.toLowerCase().includes(normalizedQuery) ||
          title.toLowerCase().includes(normalizedQuery)
        );
      })
      .map((archetype) => {
        const score = getCompatibilityScore(
          assignedArchetype || archetype,
          archetype
        );

        return {
          archetype,
          score,
          title: ARCHETYPE_DETAILS[archetype]?.[0] || 'Cognitive archetype'
        };
      })
      .sort((first, second) => second.score - first.score);
  }, [assignedArchetype, query]);

  const selected = matrix.find((item) => item.archetype === selectedType);
  const selectedDetails = ARCHETYPE_DETAILS[selectedType] || [
    'Cognitive archetype',
    'Explore how different cognitive patterns may interact.'
  ];
  const selectedScore = selected?.score || 0;
  const selectedLabel = getCompatibilityLabel(selectedScore);

  return (
    <section
      className="result-panel compatibility-matrix"
      aria-labelledby="compatibility-title"
    >
      <div className="compatibility-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiHeart} />
            Archetype dynamics
          </span>
          <h3 id="compatibility-title">Who brings out your range?</h3>
          <p>
            Explore the interaction potential between your profile and every
            reference archetype. This describes pattern contrast, not
            relationship certainty.
          </p>
        </div>

        <span className="compatibility-badge">
          <SafeIcon icon={FiUsers} />
          {matrix.length} patterns
        </span>
      </div>

      <div className="compatibility-controls">
        <div className="compatibility-search">
          <SafeIcon icon={FiSearch} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search archetypes"
            aria-label="Search compatibility archetypes"
          />
        </div>

        <span className="compatibility-scale">
          <i className="high" />
          Higher alignment
          <i className="contrast" />
          More contrast
        </span>
      </div>

      <div className="compatibility-layout">
        <div
          className="compatibility-grid"
          role="grid"
          aria-label="Archetype compatibility scores"
        >
          {matrix.map((item) => {
            const isSelected = selectedType === item.archetype;
            const scoreClass = getScoreClass(item.score);

            return (
              <button
                key={item.archetype}
                className={`compatibility-cell ${scoreClass} ${
                  isSelected ? 'selected' : ''
                }`}
                type="button"
                role="gridcell"
                onClick={() => setSelectedType(item.archetype)}
                aria-pressed={isSelected}
                title={`${item.archetype}: ${item.score}% compatibility`}
              >
                <strong>{item.archetype}</strong>
                <span>{item.score}%</span>
              </button>
            );
          })}
        </div>

        <div className="compatibility-detail">
          <span className="compatibility-detail-label">
            {selectedType === assignedArchetype
              ? 'Your profile'
              : 'Selected pattern'}
          </span>

          <strong>{selectedType || assignedArchetype || 'Profile'}</strong>
          <h4>{selectedDetails[0]}</h4>
          <p>{selectedDetails[1]}</p>

          <div className="compatibility-meter">
            <div>
              <span>Interaction alignment</span>
              <b>{selectedScore}%</b>
            </div>
            <i
              className={getScoreClass(selectedScore)}
              style={{ width: `${Math.max(4, selectedScore)}%` }}
            />
          </div>

          <span className={`compatibility-label ${getScoreClass(selectedScore)}`}>
            <SafeIcon icon={FiCompass} />
            {selectedLabel}
          </span>

          <p className="compatibility-detail-note">
            <SafeIcon icon={FiInfo} />
            {selectedType === assignedArchetype
              ? 'This is your reference baseline.'
              : `Compare ${assignedArchetype || 'your profile'} with ${
                  selectedType || 'this pattern'
                } to notice shared strengths and useful friction.`}
          </p>
        </div>
      </div>

      <p className="compatibility-note">
        Higher alignment may feel familiar and effortless. Lower alignment can
        create useful perspective when both people make room for difference.
      </p>
    </section>
  );
}

export default ArchetypeCompatibilityMatrix;