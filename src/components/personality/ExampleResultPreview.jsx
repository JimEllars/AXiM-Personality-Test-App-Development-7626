import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import RadarProfileChart from './RadarProfileChart';
import './ExampleResultPreview.css';

const { FiArrowRight } = FiIcons;

const mockScores = {
  Ni: 3.2,
  Te: 2.8,
  Fi: 0.5,
  Se: -1.2,
  Ne: 1.5,
  Ti: 1.8,
  Fe: -0.5,
  Si: -0.8
};

const mockFunctionalStack = [
  { label: 'Ni', score: 94, name: 'Introverted Intuition' },
  { label: 'Te', score: 82, name: 'Extraverted Thinking' },
  { label: 'Fi', score: 58, name: 'Introverted Feeling' },
  { label: 'Se', score: 32, name: 'Extraverted Sensing' },
];

function ExampleResultPreview({ onStart }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.section
      className="example-result-preview"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="preview-header">
        <h2>Your Cognitive Signature</h2>
        <p>A multidimensional view of your mind's natural flow.</p>
      </div>

      <div className="preview-content">
        <motion.div className="preview-section" variants={itemVariants}>
          <div className="annotation-badge annotation-1">
            <strong>Continuous Function Trait Spectrum</strong>
            Measures all 8 cognitive energies independently on a continuous scale—no binary forced choices.
          </div>
          <div className="annotation-badge annotation-2">
            <strong>Multi-Axis Functional Landscape</strong>
            Visualizes your mental flow, cognitive balance, and dominant-versus-inferior axes at a glance.
          </div>

          <div className="mock-profile-header">
            <h3>INTJ — The Strategist</h3>
            <span className="match-rate">94% Pattern Match</span>
          </div>

          <RadarProfileChart scores={mockScores} />
        </motion.div>

        <motion.div className="preview-section" variants={itemVariants}>
          <div className="annotation-badge annotation-3">
            <strong>Probabilistic IRT Confidence</strong>
            Calibrated using Samejima's Graded Response Model with standard error validation.
          </div>
          <div className="annotation-badge annotation-4">
            <strong>Actionable Behavioral Blueprints</strong>
            Includes personalized growth exercises, communication strategies, and interpersonal compatibility maps.
          </div>

          <div className="mock-functional-stack">
            {mockFunctionalStack.map(func => (
              <div key={func.label} className="mock-function-row">
                <span className="mock-function-label">{func.label} &middot; {func.name}</span>
                <div className="mock-function-bar-bg">
                  <div
                    className="mock-function-bar-fill"
                    style={{ width: `${func.score}%`, opacity: func.score / 100 }}
                  />
                </div>
                <span className="mock-function-score">{func.score}</span>
              </div>
            ))}
          </div>

          <div className="mock-growth-exercise">
            <h4>Growth Exercise: Engaging Se</h4>
            <p>Practice being fully present in physical activities without analyzing the experience. Allow yourself to respond to immediate sensory input.</p>
          </div>
        </motion.div>
      </div>

      <motion.div className="cta-card" variants={itemVariants}>
        <h3>Ready to uncover your cognitive signature?</h3>
        <button className="primary-button" onClick={onStart}>
          Begin Your Assessment
          <SafeIcon icon={FiArrowRight} />
        </button>
        <div className="cta-subtext">
          64 calibrated questions · 10–12 minutes · Completely private
        </div>
        <div className="annotation-badge annotation-5" style={{ display: 'block', position: 'relative', margin: '2rem auto 0', transform: 'none', maxWidth: '300px' }}>
           <strong>Executive PDF Dossier</strong>
           Instant on-the-fly downloadable PDF briefing and shareable archetype cards.
        </div>
      </motion.div>
    </motion.section>
  );
}

export default ExampleResultPreview;
