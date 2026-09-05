import React, { useState } from 'react';
import AppHeader from './components/layout/AppHeader';
import AssessmentFlow from './components/personality/AssessmentFlow';
import DemographicGateModal from './components/personality/DemographicGateModal';
import IntroView from './components/personality/IntroView';
import ResultView from './components/personality/ResultView';
import { QUESTION_BANK } from './data/questionBank';
import { usePersonalityStore } from './store/usePersonalityStore';
import './App.css';

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

  const beginAssessment = () => setShowGate(true);

  const resumeAssessment = () => {
    setScreen('assessment');
  };

  const restartAssessment = () => {
    resetAssessment();
    setShowGate(true);
  };

  return (
    <div className="app-container">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <AppHeader />

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

      {showGate && (
        <DemographicGateModal
          onClose={() => setShowGate(false)}
          onContinue={() => {
            setShowGate(false);
            setScreen('assessment');
          }}
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
        <span>Educational self-reflection, not a clinical assessment.</span>
      </footer>
    </div>
  );
}

export default App;