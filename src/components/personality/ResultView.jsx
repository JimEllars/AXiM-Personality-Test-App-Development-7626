import React, { useState, Suspense, lazy } from 'react';

const PDFDownloadLink = lazy(() => import('@react-pdf/renderer').then(module => ({ default: module.PDFDownloadLink })));
const PersonalityReportDocument = lazy(() => import('../../lib/pdf/PersonalityReportDocument'));


import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { ARCHETYPE_DETAILS, FUNCTION_NAMES } from '../../data/archetypes';
import { usePersonalityStore } from '../../store/usePersonalityStore';

import RadarProfileChart from './RadarProfileChart';
import ArchetypeComparisonView from './ArchetypeComparisonView';
import ArchetypeCompatibilityMatrix from './ArchetypeCompatibilityMatrix';
import ArchetypeConversationGuide from './ArchetypeConversationGuide';
import ArchetypeShareCard from './ArchetypeShareCard';
import GrowthExercises from './GrowthExercises';
import InsightBookmarks from './InsightBookmarks';
import MethodologyPanel from './MethodologyPanel';
import PsychometricConfidencePanel from './PsychometricConfidencePanel';
import ResultsToolbar from './ResultsToolbar';
import ScoreComparisonPanel from './ScoreComparisonPanel';
import ThetaTrendCharts from './ThetaTrendCharts';

const { FiCheck, FiDownload, FiRefreshCw, FiShare2, FiUserPlus } = FiIcons;

function ResultView() {
  const store = usePersonalityStore();
  const details = ARCHETYPE_DETAILS[store.assignedArchetype] || [
    'Your cognitive profile',
    'Your assessment results are ready to explore.'
  ];
  const [name, description] = details;
  const [shareMessage, setShareMessage] = useState('');
  const confidence = Math.max(0, Math.round(store.confidence * 100));
  const sortedScores = Object.entries(store.thetaScores || {}).sort(
    (first, second) => second[1] - first[1]
  );

  const isAuthenticated = !!localStorage.getItem('axim_passport_token');

  const share = async () => {
    const text = `My AXiM cognitive archetype is ${store.assignedArchetype} — ${name}.`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AXiM profile',
          text
        });
        setShareMessage('Profile shared.');
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
          <span />
          Assessment complete
        </span>
        <p>Your closest cognitive archetype is</p>
        <h1>{store.assignedArchetype || 'Profile'}</h1>
        <h2>{name}</h2>
        <p className="result-description">{description}</p>

        <div className="result-actions">
          <Suspense fallback={<button className="primary-button" disabled>Preparing report... <SafeIcon icon={FiDownload} /></button>}>
          <PDFDownloadLink
            className="primary-button"
            document={
              <PersonalityReportDocument
                archetype={store.assignedArchetype}
                thetaScores={store.thetaScores}
                generatedAt={new Date().toLocaleDateString()}
              />
            }
            fileName={`AXiM-${store.assignedArchetype || 'Profile'}-Profile.pdf`}
          >
            {({ loading, error }) => (
              <>
                {error
                  ? 'Report unavailable'
                  : loading
                    ? 'Preparing report…'
                    : 'Download report'}
                <SafeIcon icon={FiDownload} />
              </>
            )}
          </PDFDownloadLink>
        </Suspense>

          <button className="secondary-button" type="button" onClick={share}>
            Share result
            <SafeIcon icon={FiShare2} />
          </button>
        </div>

        {shareMessage && (
          <p className="share-message" role="status">
            {shareMessage}
          </p>
        )}
      </motion.section>

      {!isAuthenticated && (
        <section className="guest-cta-banner" style={{
          background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px',
          border: '1px solid #e9ecef', margin: '2rem auto', maxWidth: '800px',
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Save Your Cognitive Evolution</h3>
            <p style={{ margin: 0, color: '#495057' }}>
              Connect AXiM Passport to save your cognitive function profile and track your evolution over time.
            </p>
          </div>
          <a
            href={`https://passport.axim.us.com/login?redirect=${encodeURIComponent(window.location.href)}`}
            className="primary-button"
            style={{ textDecoration: 'none' }}
          >
            <SafeIcon icon={FiUserPlus} />
            Connect AXiM Passport
          </a>
        </section>
      )}

      <ResultsToolbar
        archetype={store.assignedArchetype}
        title={name}
      />

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
                <b>
                  {value > 0 ? '+' : ''}
                  {value}
                </b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PsychometricConfidencePanel
        confidence={store.confidence}
        ranking={store.proximityRanking}
        assignedArchetype={store.assignedArchetype}
        assessmentMetrics={store.assessmentMetrics}
      />

      <ThetaTrendCharts />
      <ScoreComparisonPanel />
      <MethodologyPanel />
      <ArchetypeComparisonView
        assignedArchetype={store.assignedArchetype}
        ranking={store.proximityRanking}
      />
      <ArchetypeCompatibilityMatrix />
      <ArchetypeConversationGuide />
      <ArchetypeShareCard />
      <InsightBookmarks />
      <GrowthExercises />

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

      {/* Teachable Partner CTA */}
      <section className="result-panel teachable-cta" style={{
        background: '#eef2ff',
        border: '1px solid #c7d2fe',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h3 style={{ color: '#3730a3', marginBottom: '0.5rem' }}>
          Master Your {store.assignedArchetype || 'Profile'} Cognitive Strengths on Teachable
        </h3>
        <p style={{ color: '#4f46e5', maxWidth: '600px', marginBottom: '1.5rem' }}>
          Explore structured video masterclasses and operational blueprints designed for your dominant cognitive function stack.
        </p>
        <a
          href="https://swiy.co/Teach1"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button"
          style={{ background: '#4f46e5', borderColor: '#4f46e5' }}
        >
          Explore Recommended Courses on Teachable
        </a>
      </section>

      <button className="text-button" type="button" onClick={store.startRetake} style={{ marginTop: '2rem' }}>
        <SafeIcon icon={FiRefreshCw} />
        Retake assessment
      </button>
    </main>
  );
}

export default ResultView;
