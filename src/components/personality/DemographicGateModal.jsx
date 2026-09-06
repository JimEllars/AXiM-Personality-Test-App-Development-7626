import React, { useEffect, useRef, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePersonalityStore } from '../../store/usePersonalityStore';

const { FiArrowRight, FiLock, FiX } = FiIcons;

function DemographicGateModal({ onClose, onContinue }) {
  const { demographics, setDemographics } = usePersonalityStore();
  const [error, setError] = useState('');
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    modalRef.current?.querySelector('input')?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, [onClose]);

  const submit = (event) => {
    event.preventDefault();

    const age = Number(demographics.age);
    if (!age || age < 13 || age > 120) {
      setError('Enter a valid age between 13 and 120.');
      return;
    }

    if (!demographics.region || !demographics.explicitConsent) {
      setError('Please complete each field and confirm your consent.');
      return;
    }

    setError('');
    onContinue();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-describedby="gate-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form className="gate-modal" ref={modalRef} onSubmit={submit}>
        <button
          type="button"
          className="icon-button modal-close"
          onClick={onClose}
          aria-label="Close eligibility dialog"
        >
          <SafeIcon icon={FiX} />
        </button>

        <span className="card-kicker">Before you begin</span>
        <h2 id="gate-title">Eligibility & privacy</h2>
        <p id="gate-description">
          These details apply the correct privacy safeguards. They are kept
          only in this browser.
        </p>

        <label htmlFor="gate-age">
          Age
          <input
            id="gate-age"
            type="number"
            min="13"
            max="120"
            inputMode="numeric"
            value={demographics.age}
            onChange={(event) => {
              setDemographics({ age: event.target.value });
              setError('');
            }}
            placeholder="Enter your age"
            aria-invalid={Boolean(error && (!demographics.age || Number(demographics.age) < 13 || Number(demographics.age) > 120))}
            aria-describedby={error ? 'gate-error' : undefined}
          />
        </label>

        <label htmlFor="gate-region">
          Region
          <select
            id="gate-region"
            value={demographics.region}
            onChange={(event) => {
              setDemographics({ region: event.target.value });
              setError('');
            }}
            aria-invalid={Boolean(error && !demographics.region)}
            aria-describedby={error ? 'gate-error' : undefined}
          >
            <option value="">Select your region</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="Europe">Europe</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="consent-row" htmlFor="gate-consent">
          <input
            id="gate-consent"
            type="checkbox"
            checked={demographics.explicitConsent}
            onChange={(event) => {
              setDemographics({ explicitConsent: event.target.checked });
              setError('');
            }}
            aria-invalid={Boolean(error && !demographics.explicitConsent)}
            aria-describedby={error ? 'gate-error' : undefined}
          />
          <span>
            I consent to local processing of my answers to generate this
            profile.
          </span>
        </label>

        {error && (
          <p className="form-error" id="gate-error" role="alert">
            {error}
          </p>
        )}

        <button className="primary-button full-button" type="submit">
          Continue securely
          <SafeIcon icon={FiArrowRight} />
        </button>

        <button
          type="button"
          className="text-button full-button"
          onClick={() => {
            setError('');
            onContinue();
          }}
          style={{ marginTop: '0.5rem' }}
        >
          Skip for now
        </button>

        <small className="privacy-note">
          <SafeIcon icon={FiLock} />
          No account required. Clear browser data to remove your session.
        </small>
      </form>
    </div>
  );
}

export default DemographicGateModal;