import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import { emailReport } from '../../services/personalityApi';
import './ResultsToolbar.css';

const { FiCheck, FiCopy, FiPrinter, FiShield, FiTrash2, FiMail } = FiIcons;

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState(''); // 'sending', 'sent', 'error'

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

  const sendEmailReport = async (e) => {
    e.preventDefault();
    setEmailStatus('sending');
    const result = await emailReport({ email, archetype });
    if (result.success) {
      setEmailStatus('sent');
      setTimeout(() => setShowEmailModal(false), 2000);
    } else {
      setEmailStatus('error');
    }
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
        <button type="button" onClick={() => {
          setShowEmailModal(true);
          setEmailStatus('');
        }}>
          <SafeIcon icon={FiMail} />
          Email Report
        </button>
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

      {showEmailModal && (
        <div className="reset-confirmation" role="dialog">
          <form onSubmit={sendEmailReport}>
            <strong>Email My PDF Report</strong>
            <p>Enter your email to receive a branded report briefing.</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            {emailStatus === 'sending' && <p>Sending...</p>}
            {emailStatus === 'sent' && <p style={{color: 'green'}}>Report sent!</p>}
            {emailStatus === 'error' && <p className="form-error">Failed to send email. Please try again.</p>}

            <div className="reset-confirmation-actions" style={{ marginTop: '1rem' }}>
              <button type="button" onClick={() => setShowEmailModal(false)}>
                Cancel
              </button>
              <button className="primary-button" type="submit" disabled={emailStatus === 'sending'}>
                Send Email
              </button>
            </div>
          </form>
        </div>
      )}

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
