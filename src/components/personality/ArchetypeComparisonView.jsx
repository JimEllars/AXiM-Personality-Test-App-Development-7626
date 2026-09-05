import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { ARCHETYPE_DETAILS } from '../../data/archetypes';
import { ARCHETYPE_REFERENCE_VECTORS } from '../../services/psychometrics/archetypeProjector';
import './ArchetypeComparisonView.css';

const {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiCompass,
  FiCopy,
  FiSearch
} = FiIcons;

function formatSimilarity(value) {
  return `${Math.max(0, Math.round((value || 0) * 100))}%`;
}

function ArchetypeComparisonView({ assignedArchetype, ranking = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedType, setSelectedType] = useState(assignedArchetype);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const completeRanking = useMemo(() => {
    if (ranking.length) return ranking;

    return Object.keys(ARCHETYPE_REFERENCE_VECTORS).map((archetype) => ({
      archetype,
      similarity: 0
    }));
  }, [ranking]);

  const comparison = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = completeRanking.filter((item) => {
      if (!normalizedQuery) return true;

      const details = ARCHETYPE_DETAILS[item.archetype];
      const title = details?.[0] || '';

      return item.archetype.toLowerCase().includes(normalizedQuery)
        || title.toLowerCase().includes(normalizedQuery);
    });

    return expanded || normalizedQuery ? filtered : filtered.slice(0, 3);
  }, [completeRanking, expanded, query]);

  const selectedDetails = ARCHETYPE_DETAILS[selectedType] || [
    'Unknown archetype',
    'No description is available for this profile.'
  ];
  const selectedReference = ARCHETYPE_REFERENCE_VECTORS[selectedType] || {};
  const selectedRank = completeRanking.find(
    (item) => item.archetype === selectedType
  );
  const isShowingAll = expanded || Boolean(query.trim());

  const strongestFunctions = Object.entries(selectedReference)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 3);

  const copyComparison = async () => {
    const summary = `AXiM comparison: ${assignedArchetype} is closest to ${selectedType} (${formatSimilarity(selectedRank?.similarity)} similarity).`;

    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="result-panel comparison-panel">
      <div className="comparison-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiCompass} /> Archetype proximity
          </span>
          <h3>What else is nearby?</h3>
          <p>
            Your result is a gradient. Explore the reference patterns that
            share the closest cognitive signature with your profile.
          </p>
        </div>

        <div className="comparison-heading-actions">
          <button
            className="comparison-copy"
            type="button"
            onClick={copyComparison}
            title="Copy comparison summary"
          >
            <SafeIcon icon={copied ? FiCheck : FiCopy} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            className="comparison-toggle"
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={isShowingAll}
          >
            {isShowingAll ? 'Show less' : 'View all'}
            <SafeIcon icon={isShowingAll ? FiChevronUp : FiChevronDown} />
          </button>
        </div>
      </div>

      <div className="comparison-search">
        <SafeIcon icon={FiSearch} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search an archetype"
          aria-label="Search archetypes"
        />
      </div>

      <div className="comparison-layout">
        <div className="comparison-list">
          {comparison.length ? (
            comparison.map((item) => {
              const title = ARCHETYPE_DETAILS[item.archetype]?.[0]
                || 'Unknown archetype';
              const rank = completeRanking.findIndex(
                (ranked) => ranked.archetype === item.archetype
              ) + 1;
              const isSelected = selectedType === item.archetype;

              return (
                <button
                  className={`comparison-item ${isSelected ? 'selected' : ''}`}
                  key={item.archetype}
                  type="button"
                  onClick={() => setSelectedType(item.archetype)}
                  aria-pressed={isSelected}
                >
                  <span className="comparison-rank">
                    {String(rank || 1).padStart(2, '0')}
                  </span>
                  <span className="comparison-type">
                    <strong>{item.archetype}</strong>
                    <small>{title}</small>
                  </span>
                  <span className="comparison-similarity">
                    {formatSimilarity(item.similarity)}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="comparison-empty">No archetypes match that search.</p>
          )}
        </div>

        <div className="comparison-detail">
          <span className="comparison-detail-label">Selected profile</span>
          <strong>{selectedType}</strong>
          <h4>{selectedDetails[0]}</h4>
          <p>{selectedDetails[1]}</p>

          <div className="comparison-meter">
            <div>
              <span>Reference proximity</span>
              <b>{formatSimilarity(selectedRank?.similarity)}</b>
            </div>
            <i
              style={{
                width: `${Math.max(
                  4,
                  (selectedRank?.similarity || 0) * 100
                )}%`
              }}
            />
          </div>

          <div className="comparison-functions">
            {strongestFunctions.map(([key, value]) => (
              <span key={key}>
                {key} <b>{value > 0 ? '+' : ''}{value.toFixed(2)}</b>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArchetypeComparisonView;