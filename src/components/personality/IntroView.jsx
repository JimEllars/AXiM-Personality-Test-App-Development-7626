import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiArrowRight, FiClock, FiShield, FiActivity } = FiIcons;

function IntroView({ onStart }) {
  return (
    <main className="intro-shell">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="eyebrow"><span /> Cognitive profile assessment</div>
        <h1>Understand how your mind naturally <em>moves.</em></h1>
        <p className="hero-copy">
          Go beyond a four-letter label. Map eight cognitive functions on a
          continuous spectrum and reveal your closest Jungian archetype.
        </p>
        <button className="primary-button" onClick={onStart}>
          Begin assessment
          <SafeIcon icon={FiArrowRight} />
        </button>
        <div className="hero-meta">
          <span><SafeIcon icon={FiClock} /> 10–12 minutes</span>
          <span><SafeIcon icon={FiShield} /> Private by design</span>
          <span><SafeIcon icon={FiActivity} /> 64 calibrated prompts</span>
        </div>
      </motion.section>

      <section className="method-card">
        <div className="orbital-graphic" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="core">θ</span>
          {['Ti', 'Ne', 'Fi', 'Se'].map((key, index) => (
            <i key={key} className={`satellite satellite-${index + 1}`}>{key}</i>
          ))}
        </div>
        <div>
          <span className="card-kicker">A more dimensional view</span>
          <h2>Not a box. A cognitive signature.</h2>
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