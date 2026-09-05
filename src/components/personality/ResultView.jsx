import React, { useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { ARCHETYPE_DETAILS, FUNCTION_NAMES } from '../../data/archetypes';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import PersonalityReportDocument from '../../lib/pdf/PersonalityReportDocument';
import RadarProfileChart from './RadarProfileChart';
import ArchetypeComparisonView from './ArchetypeComparisonView';

const { FiCheck, FiDownload, FiRefreshCw, FiShare2 } = FiIcons;

function ResultView() {
  const store = usePersonalityStore();
  const [name, description] = ARCHETYPE_DETAILS[store.assignedArchetype];
  const [shareMessage, setShareMessage] = useState('');
  const confidence = Math.max(0, Math.round(store.confidence * 100));
  const sortedScores = Object.entries(store.thetaScores).sort(
    (a, b) => b[1] - a[1]
  );

  const share = async () => {
    const text = `My AXiM cognitive archetype is ${store.assignedArchetype} — ${name}.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My AXiM profile', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShareMessage('Profile summary copied.');
      } else {
        setShareMessage('Sharing is not available in this browser.');
      }
    } catch {
      setShareMessage('Sharing was cancelled.');
    }
  };

  return (
    <main className="results-shell">
      <motion.section
        className="result-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="result-check">
          <SafeIcon icon={FiCheck} />
        </span>
        <span className="eyebrow">
          <span /> Assessment complete
        </span>
        <p>Your closest cognitive archetype is</p>
        <h1>{store.assignedArchetype}</h1>
        <h2>{name}</h2>
        <p className="result-description">{description}</p>

        <div className="result-actions">
          <PDFDownloadLink
            className="primary-button"
            document={
              <PersonalityReportDocument
                archetype={store.assignedArchetype}
                thetaScores={store.thetaScores}
                generatedAt={new Date().toLocaleDateString()}
              />
            }
            fileName={`AXiM-${store.assignedArchetype}-Profile.pdf`}
          >
            {({ loading }) => (
              <>
                {loading ? 'Preparing report…' : 'Download report'}
                <SafeIcon icon={FiDownload} />
              </>
            )}
          </PDFDownloadLink>

          <button className="secondary-button" onClick={share}>
            Share result <SafeIcon icon={FiShare2} />
          </button>
        </div>

        {shareMessage && <p className="share-message">{shareMessage}</p>}
      </motion.section>

      <section className="profile-grid">
        <div className="result-panel radar-panel">
          <div className="panel-heading">
            <div>
              <span>Function signature</span>
              <h3>Your cognitive landscape</h3>
            </div>
            <div className="match-score">
              <strong>{confidence}%</strong>
              <small>pattern match</small>
            </div>
          </div>
          <RadarProfileChart scores={store.thetaScores} />
        </div>

        <div className="result-panel">
          <span className="card-kicker">Continuous trait estimates</span>
          <h3>Eight functions, one profile</h3>
          <div className="score-list">
            {sortedScores.map(([key, value]) => (
              <div className="score-row" key={key}>
                <div>
                  <strong>{key}</strong>
                  <span>{FUNCTION_NAMES[key]}</span>
                </div>
                <div className="score-bar">
                  <i
                    style={{
                      width: `${Math.max(5, ((value + 4) / 8) * 100)}%`
                    }}
                  />
                </div>
                <b>{value > 0 ? '+' : ''}{value}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ArchetypeComparisonView
        assignedArchetype={store.assignedArchetype}
        ranking={store.proximityRanking}
      />

      <section className="result-panel growth-panel">
        <span className="card-kicker">Development direction</span>
        <h3>Use the profile as a map, not a limit.</h3>
        <div className="growth-columns">
          <p>
            <strong>Lean into flow</strong>
            Design important work around your strongest functions, where
            attention and decisions feel most natural.
          </p>
          <p>
            <strong>Build range</strong>
            Practice lower-scoring functions in small, low-pressure situations
            instead of forcing a total personality change.
          </p>
          <p>
            <strong>Review context</strong>
            Your scores are continuous and may evolve. Retake the assessment
            when your circumstances meaningfully change.
          </p>
        </div>
      </section>

      <button className="text-button" onClick={store.resetAssessment}>
        <SafeIcon icon={FiRefreshCw} /> Retake assessment
      </button>
    </main>
  );
}

export default ResultView;