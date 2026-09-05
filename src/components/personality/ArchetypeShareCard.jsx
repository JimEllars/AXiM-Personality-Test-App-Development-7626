import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { ARCHETYPE_DETAILS, FUNCTION_NAMES } from '../../data/archetypes';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import {
  createArchetypeCard,
  downloadDataUrl
} from '../../lib/share/createArchetypeCard';
import './ArchetypeShareCard.css';

const { FiCheck, FiCopy, FiDownload, FiShare2, FiZap } = FiIcons;

async function copyText(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

function ArchetypeShareCard() {
  const { assignedArchetype, thetaScores } = usePersonalityStore();
  const [message, setMessage] = useState('');

  const [title, description] = ARCHETYPE_DETAILS[assignedArchetype] || [
    'Your Cognitive Profile',
    'Explore your unique cognitive-function signature.'
  ];

  const strongestFunction = useMemo(
    () =>
      Object.entries(thetaScores || {})
        .filter(([, value]) => Number.isFinite(value))
        .sort(([, first], [, second]) => second - first)[0]?.[0],
    [thetaScores]
  );

  const strongestName = strongestFunction
    ? FUNCTION_NAMES[strongestFunction]
    : 'Cognitive flexibility';

  const shareText = `My AXiM archetype is ${
    assignedArchetype || 'Profile'
  } — ${title}.`;

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 2400);
  };

  const copySummary = async () => {
    try {
      await copyText(shareText);
      showMessage('Summary copied.');
    } catch {
      showMessage('Could not copy the summary.');
    }
  };

  const shareSummary = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `My AXiM profile: ${assignedArchetype || 'Profile'}`,
          text: shareText
        });
        showMessage('Profile shared.');
        return;
      }

      await copyText(shareText);
      showMessage('Summary copied.');
    } catch {
      showMessage('Sharing was cancelled.');
    }
  };

  const downloadCard = () => {
    try {
      const dataUrl = createArchetypeCard({
        archetype: assignedArchetype,
        title,
        description,
        strongestFunction,
        strongestName
      });

      const safeArchetype = (assignedArchetype || 'Profile')
        .replace(/[^a-z0-9-_]/gi, '-')
        .replace(/-+/g, '-');

      downloadDataUrl(dataUrl, `AXiM-${safeArchetype}-Share-Card.png`);
      showMessage('Share card downloaded.');
    } catch {
      showMessage('Share card generation is unavailable.');
    }
  };

  return (
    <section className="result-panel share-card-panel">
      <div className="share-card-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiZap} /> Share your profile
          </span>
          <h3>A snapshot worth keeping.</h3>
          <p>
            Download a visual card or share a concise summary of your archetype
            with someone you trust.
          </p>
        </div>
      </div>

      <div className="share-card-preview">
        <div className="share-card-brand">AXiM / PERSONAL DEVELOPMENT</div>
        <span className="share-card-label">My cognitive archetype</span>
        <strong>{assignedArchetype || 'PROFILE'}</strong>
        <h4>{title}</h4>
        <p>{description}</p>

        <div className="share-card-orbit" aria-hidden="true">
          <span className="share-card-orbit-ring ring-one" />
          <span className="share-card-orbit-ring ring-two" />
          <span className="share-card-core">θ</span>
        </div>

        <div className="share-card-function">
          <span>{strongestFunction || '—'}</span>
          <small>{strongestName}</small>
        </div>

        <span className="share-card-url">axim.us.com</span>
      </div>

      <div className="share-card-actions">
        <button className="primary-button" type="button" onClick={downloadCard}>
          <SafeIcon icon={FiDownload} /> Download card
        </button>
        <button className="secondary-button" type="button" onClick={shareSummary}>
          <SafeIcon icon={FiShare2} /> Share summary
        </button>
        <button className="share-card-copy" type="button" onClick={copySummary}>
          <SafeIcon icon={message === 'Summary copied.' ? FiCheck : FiCopy} />
          {message === 'Summary copied.' ? 'Copied' : 'Copy text'}
        </button>
      </div>

      {message && (
        <p className="share-card-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}

export default ArchetypeShareCard;