import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './IntroView.css';

const {
  FiActivity,
  FiArrowRight,
  FiClock,
  FiPlay,
  FiShield,
  FiRotateCcw
} = FiIcons;

function IntroView({
  onStart,
  onResume,
  onRestart,
  hasSavedAssessment,
  answeredCount = 0,
  totalQuestions = 64
}) {
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <main className="intro-shell">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="eyebrow">
          <span />
          Cognitive profile assessment
        </div>

        <h1>
          Understand how your mind naturally <em>moves.</em>
        </h1>

        <p className="hero-copy">
          Go beyond a four-letter label. Map eight cognitive functions on a
          continuous spectrum and reveal your closest personality type.
        </p>

        {hasSavedAssessment ? (
          <div className="resume-card" style={{ padding: '1.5rem', background: '#fff', border: '1px solid #eaeaea', borderRadius: '8px', marginBottom: '2rem', textAlign: 'left' }}>
            <div className="resume-card-copy" style={{ marginBottom: '1.5rem' }}>
              <span className="card-kicker" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                <SafeIcon icon={FiPlay} />
                Resume In-Progress Assessment
              </span>

              <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '1rem' }}>
                {answeredCount} of {totalQuestions} questions completed
              </strong>

              <div
                className="resume-progress"
                role="progressbar"
                aria-label="Saved assessment progress"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progress}
                style={{ height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}
              >
                <span style={{ display: 'block', height: '100%', width: `${progress}%`, background: '#0066cc', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            <div className="resume-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                className="primary-button"
                type="button"
                onClick={onResume}
              >
                Resume assessment
                <SafeIcon icon={FiArrowRight} />
              </button>

              <button
                className="resume-reset"
                type="button"
                onClick={onRestart}
                style={{ background: 'none', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <SafeIcon icon={FiRotateCcw} />
                Start Fresh
              </button>
            </div>
          </div>
        ) : (
          <button
            className="primary-button"
            type="button"
            onClick={onStart}
          >
            Begin assessment
            <SafeIcon icon={FiArrowRight} />
          </button>
        )}

        <div className="hero-meta">
          <span>
            <SafeIcon icon={FiClock} />
            10–12 minutes
          </span>
          <span>
            <SafeIcon icon={FiShield} />
            Private by design
          </span>
          <span>
            <SafeIcon icon={FiActivity} />
            64 calibrated prompts
          </span>
        </div>
      </motion.section>

      <section className="method-card" aria-labelledby="method-title">
        <div className="orbital-graphic" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="core">θ</span>
          {['Ti', 'Ne', 'Fi', 'Se'].map((key, index) => (
            <i
              key={key}
              className={`satellite satellite-${index + 1}`}
            >
              {key}
            </i>
          ))}
        </div>

        <div>
          <span className="card-kicker">A more dimensional view</span>
          <h2 id="method-title">Not a box. A cognitive signature.</h2>
          <p>
            Your answers are estimated with a graded-response model, then
            compared with 16 reference patterns. The result keeps the nuance
            of your complete eight-function profile.
          </p>
        </div>
      </section>
    </main>
  );
}

export default IntroView;
