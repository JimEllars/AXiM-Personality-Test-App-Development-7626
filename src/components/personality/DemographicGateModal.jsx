import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePersonalityStore } from '../../store/usePersonalityStore';

const { FiArrowRight, FiLock, FiX } = FiIcons;

function DemographicGateModal({ onClose, onContinue }) {
  const { demographics, setDemographics } = usePersonalityStore();
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const age = Number(demographics.age);

    if (!age || age < 13) {
      setError('This assessment is available only to people age 13 or older.');
      return;
    }
    if (!demographics.region || !demographics.explicitConsent) {
      setError('Please complete each field and confirm your consent.');
      return;
    }
    onContinue();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="gate-modal" onSubmit={submit}>
        <button type="button" className="icon-button modal-close" onClick={onClose}>
          <SafeIcon icon={FiX} />
        </button>
        <span className="card-kicker">Before you begin</span>
        <h2>Eligibility & privacy</h2>
        <p>These details apply the correct privacy safeguards. They are kept only in this browser.</p>

        <label>
          Age
          <input
            type="number"
            min="13"
            max="120"
            value={demographics.age}
            onChange={(event) => setDemographics({ age: event.target.value })}
            placeholder="Enter your age"
          />
        </label>
        <label>
          Region
          <select
            value={demographics.region}
            onChange={(event) => setDemographics({ region: event.target.value })}
          >
            <option value="">Select your region</option>
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="Europe">Europe</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="consent-row">
          <input
            type="checkbox"
            checked={demographics.explicitConsent}
            onChange={(event) =>
              setDemographics({ explicitConsent: event.target.checked })
            }
          />
          <span>
            I consent to local processing of my answers to generate this profile.
          </span>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button full-button" type="submit">
          Continue securely <SafeIcon icon={FiArrowRight} />
        </button>
        <small className="privacy-note">
          <SafeIcon icon={FiLock} /> No account required. Clear browser data to remove your session.
        </small>
      </form>
    </div>
  );
}

export default DemographicGateModal;