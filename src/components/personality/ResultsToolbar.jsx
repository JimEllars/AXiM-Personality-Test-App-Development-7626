import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import './ResultsToolbar.css';

const { FiCheck, FiCopy, FiPrinter, FiShield, FiTrash2 } = FiIcons;

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  return copied;
}

function ResultsToolbar({ archetype, title }) {
  const resetAssessment = usePersonalityStore(
    (state) => state.resetAssessment
  );
  const [copied, setCopied] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const summary = `My AXiM cognitive archetype is ${
    archetype || 'Profile'
  } — ${title}.`;

  const copySummary = async () => {
    try {
      const didCopy = await copyText(summary);
      if (!didCopy) return;

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const printResults = () => {
    window.print();
  };

  const clearSession = () => {
    resetAssessment();
    window.localStorage.removeItem('axim_personality_session');
    setShowReset(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="results-toolbar" aria-label="Result actions">
      <div className="results-toolbar-status">
        <span className="results-toolbar-icon">
          <SafeIcon icon={FiShield} />
        </span>
        <div>
          <strong>Private session</strong>
          <span>Your result is saved only in this browser.</span>
        </div>
      </div>

      <div className="results-toolbar-actions">
        <button type="button" onClick={copySummary}>
          <SafeIcon icon={copied ? FiCheck : FiCopy} />
          {copied ? 'Copied' : 'Copy summary'}
        </button>
        <button type="button" onClick={printResults}>
          <SafeIcon icon={FiPrinter} />
          Print
        </button>
        <button
          className="danger-action"
          type="button"
          onClick={() => setShowReset(true)}
        >
          <SafeIcon icon={FiTrash2} />
          Clear session
        </button>
      </div>

      {showReset && (
        <div className="reset-confirmation" role="alertdialog">
          <div>
            <strong>Clear this assessment?</strong>
            <p>
              Your answers, result, reflections, and saved insights will be
              removed from this browser.
            </p>
          </div>
          <div className="reset-confirmation-actions">
            <button type="button" onClick={() => setShowReset(false)}>
              Keep session
            </button>
            <button className="danger-action" type="button" onClick={clearSession}>
              Clear everything
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ResultsToolbar;