import React, { useMemo, useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { getConversationGuide } from '../../data/conversationGuides';
import { usePersonalityStore } from '../../store/usePersonalityStore';
import { trackEvent } from '../../services/telemetry';
import './ArchetypeConversationGuide.css';

const { FiCheck, FiCopy, FiEdit3, FiMessageCircle, FiUsers } = FiIcons;

const TAB_ICONS = {
  explain: FiMessageCircle,
  discuss: FiUsers,
  reflect: FiEdit3
};

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

function ArchetypeConversationGuide() {
  const { assignedArchetype, thetaScores } = usePersonalityStore();
  const [activeTab, setActiveTab] = useState('explain');
  const [copiedPrompt, setCopiedPrompt] = useState('');

  const guide = useMemo(
    () => getConversationGuide(assignedArchetype, thetaScores),
    [assignedArchetype, thetaScores]
  );

  const activeGuide = guide[activeTab];

  const handleTabChange = (key) => {
    setActiveTab(key);
    trackEvent('conversation_guide_tab_changed', {
      tab: key,
      archetype: assignedArchetype
    });
  };

  const copyPrompt = async (prompt) => {
    try {
      await copyText(prompt);
      setCopiedPrompt(prompt);
      trackEvent('conversation_prompt_copied', {
        prompt,
        tab: activeTab,
        archetype: assignedArchetype
      });
      window.setTimeout(() => setCopiedPrompt(''), 2200);
    } catch {
      setCopiedPrompt('');
    }
  };

  return (
    <section className="result-panel conversation-guide">
      <div className="conversation-guide-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiMessageCircle} />
            Conversation guide
          </span>
          <h3>Make the profile useful with other people.</h3>
          <p>
            Use these prompts to explain your result, invite a perspective, or
            turn the profile into a private reflection.
          </p>
        </div>
        <span className="conversation-guide-badge">No right answer</span>
      </div>

      <div className="conversation-guide-tabs" role="tablist">
        {Object.entries(guide).map(([key, item]) => {
          const Icon = TAB_ICONS[key];

          return (
            <button
              key={key}
              id={`tab-${key}`}
              className={activeTab === key ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              aria-controls={`panel-${key}`}
              onClick={() => handleTabChange(key)}
            >
              <SafeIcon icon={Icon} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="conversation-guide-list"
      >
        {activeGuide.prompts.map((prompt, index) => (
          <article className="conversation-prompt" key={prompt}>
            <span className="conversation-prompt-number">
              {String(index + 1).padStart(2, '0')}
            </span>
            <p>{prompt}</p>
            <button
              className="conversation-copy"
              type="button"
              onClick={() => copyPrompt(prompt)}
              aria-label={`Copy prompt: ${prompt}`}
            >
              <SafeIcon icon={copiedPrompt === prompt ? FiCheck : FiCopy} />
              {copiedPrompt === prompt ? 'Copied' : 'Copy'}
            </button>
          </article>
        ))}
      </div>

      <p className="conversation-guide-note">
        Share only what feels comfortable. This profile is a conversation
        starter, not a definition of who you are.
      </p>
    </section>
  );
}

export default ArchetypeConversationGuide;