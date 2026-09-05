import React, { useEffect, useState } from 'react';
import AppHeader from './components/layout/AppHeader';
import ErrorBoundary from './components/common/ErrorBoundary';
import AssessmentFlow from './components/personality/AssessmentFlow';
import DemographicGateModal from './components/personality/DemographicGateModal';
import IntroView from './components/personality/IntroView';
import ResultView from './components/personality/ResultView';
import { QUESTION_BANK } from './data/questionBank';
import { usePersonalityStore } from './store/usePersonalityStore';
import './App.css';
import './styles/production-polish.css';

function App() {
  const [showGate, setShowGate] = useState(false);
  const {
    screen,
    setScreen,
    answers,
    resetAssessment
  } = usePersonalityStore();

  const answeredCount = Object.keys(answers).length;
  const hasSavedAssessment = screen === 'intro' && answeredCount > 0;

  useEffect(() => {
    const titles = {
      intro: 'Personality Type Test | AXiM Personal Development',
      assessment: 'Assessment | AXiM Personal Development',
      results: 'Your Profile | AXiM Personal Development'
    };

    document.title = titles[screen] || titles.intro;
  }, [screen]);

  const beginAssessment = () => setShowGate(true);

  const resumeAssessment = () => {
    setScreen('assessment');
  };

  const restartAssessment = () => {
    resetAssessment();
    setShowGate(true);
  };

  const continueFromGate = () => {
    setShowGate(false);
    setScreen('assessment');
  };

  return (
    <div className="app-container">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <a className="sr-only" href="#main-content">
        Skip to main content
      </a>

      <AppHeader />

      <div id="main-content">
        <ErrorBoundary>
          {screen === 'intro' && (
            <IntroView
              onStart={beginAssessment}
              onResume={resumeAssessment}
              onRestart={restartAssessment}
              hasSavedAssessment={hasSavedAssessment}
              answeredCount={answeredCount}
              totalQuestions={QUESTION_BANK.length}
            />
          )}

          {screen === 'assessment' && <AssessmentFlow />}
          {screen === 'results' && <ResultView />}
        </ErrorBoundary>
      </div>

      {showGate && (
        <DemographicGateModal
          onClose={() => setShowGate(false)}
          onContinue={continueFromGate}
        />
      )}

      <div
        className="collection-placeholder"
        data-greta-form-placeholder="personality-assessment"
      >
        This form is not collecting yet.
      </div>

      <footer>
        <span>© {new Date().getFullYear()} AXiM Personal Development</span>
        <span>
          Educational self-reflection, not a clinical assessment.
        </span>
      </footer>
    </div>
  );
}

export default App;