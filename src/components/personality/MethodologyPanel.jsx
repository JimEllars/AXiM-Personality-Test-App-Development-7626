import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import './MethodologyPanel.css';

const { FiChevronDown, FiDatabase, FiInfo, FiLock } = FiIcons;

function MethodologyPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="methodology-panel">
      <button
        className="methodology-toggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="methodology-content"
      >
        <span className="methodology-title">
          <SafeIcon icon={FiInfo} />
          How your result was generated
        </span>
        <SafeIcon icon={FiChevronDown} className={open ? 'is-open' : ''} />
      </button>

      {open && (
        <div className="methodology-content" id="methodology-content">
          <div className="methodology-grid">
            <div>
              <SafeIcon icon={FiDatabase} />
              <strong>Continuous scoring</strong>
              <p>
                Each response contributes to an estimated score from -4 to
                +4 rather than forcing a binary category.
              </p>
            </div>
            <div>
              <SafeIcon icon={FiLock} />
              <strong>Local by design</strong>
              <p>
                Your answers are processed in this browser and are not sent to
                a server by this experience.
              </p>
            </div>
          </div>
          <p className="methodology-note">
            This is an educational self-reflection tool, not a clinical,
            diagnostic, employment, or medical assessment. Results can change
            with context, development, and repeated reflection.
          </p>
        </div>
      )}
    </section>
  );
}

export default MethodologyPanel;