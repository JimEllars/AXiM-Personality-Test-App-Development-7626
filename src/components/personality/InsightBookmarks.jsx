import React,{useMemo,useState} from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import {getAssessmentInsights} from '../../data/assessmentInsights';
import {usePersonalityStore} from '../../store/usePersonalityStore';
import './InsightBookmarks.css';

const {FiBookmark,FiCheck,FiCopy,FiInfo,FiTrash2}=FiIcons;

function InsightBookmarks(){
  const {thetaScores,bookmarkedInsights,toggleInsightBookmark,clearInsightBookmarks}=usePersonalityStore();
  const [showSaved,setShowSaved]=useState(false);
  const [copied,setCopied]=useState(false);
  const insights=useMemo(()=> getAssessmentInsights(thetaScores),[thetaScores]);
  const saved=insights.filter((insight)=> bookmarkedInsights[insight.id]);

  const copySaved=async ()=>{
    const text=saved.map((insight)=> `${insight.title}: ${insight.body}`).join('\n\n');
    if (!text || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(()=> setCopied(false),2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="result-panel insight-bookmarks">
      <div className="insight-heading">
        <div>
          <span className="card-kicker">
            <SafeIcon icon={FiBookmark} /> Insight library
          </span>
          <h3>Keep what resonates.</h3>
          <p>
            Bookmark observations you want to revisit while your assessment
            becomes a practical tool for self-reflection.
          </p>
        </div>
        <span className="bookmark-count">
          {saved.length} saved
        </span>
      </div>

      <div className="insight-actions">
        <button
          className={`insight-filter ${showSaved ? 'active' : ''}`}
          type="button"
          onClick={()=> setShowSaved((value)=> !value)}
          aria-pressed={showSaved}
        >
          <SafeIcon icon={FiBookmark} />
          {showSaved ? 'Show all insights' : 'Show saved only'}
        </button>
        {saved.length > 0 && (
          <>
            <button className="insight-action" type="button" onClick={copySaved}>
              <SafeIcon icon={copied ? FiCheck : FiCopy} />
              {copied ? 'Copied' : 'Copy saved'}
            </button>
            <button className="insight-action danger" type="button" onClick={clearInsightBookmarks}>
              <SafeIcon icon={FiTrash2} /> Clear
            </button>
          </>
        )}
      </div>

      <div className="insight-list">
        {(showSaved ? saved : insights).map((insight)=> {
          const bookmarked=Boolean(bookmarkedInsights[insight.id]);
          return (
            <article className={`insight-card ${bookmarked ? 'bookmarked' : ''}`} key={insight.id}>
              <div className="insight-card-icon">
                <SafeIcon icon={FiInfo} />
              </div>
              <div>
                <div className="insight-card-meta">
                  <span>{insight.tag}</span>
                  {insight.functionKey && <b>{insight.functionKey}</b>}
                </div>
                <h4>{insight.title}</h4>
                <p>{insight.body}</p>
              </div>
              <button
                className="insight-bookmark-button"
                type="button"
                onClick={()=> toggleInsightBookmark(insight.id)}
                aria-label={`${bookmarked ? 'Remove' : 'Save'} ${insight.title}`}
                aria-pressed={bookmarked}
              >
                <SafeIcon icon={FiBookmark} />
              </button>
            </article>
          );
        })}
      </div>

      {showSaved && saved.length===0 && (
        <p className="insight-empty">Your saved insights will appear here.</p>
      )}
    </section>
  );
}

export default InsightBookmarks;