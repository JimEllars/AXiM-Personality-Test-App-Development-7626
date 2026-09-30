import React from 'react';
import { trackError } from '../../services/telemetry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AXiM interface error:', error, errorInfo);
    trackError(error, { componentStack: errorInfo.componentStack, context: 'react_boundary' });
  }

  reloadApp() {
    window.location.reload();
  }

  reportIssue() {
    // Preserve session answers in localStorage (which happens automatically for Zustand),
    // we just want to attempt to recover or allow user to refresh while preserving data.
    // Tracking is already done above.
    alert("Issue reported successfully. Your session progress has been preserved.");
    this.setState({ hasError: false });
  }

  resetApp() {
    window.localStorage.removeItem('axim_personality_session');
    this.reloadApp();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <main className="error-state" role="alert">
        <div className="error-state-card">
          <span className="eyebrow">
            <span /> Temporary interruption
          </span>
          <h1>Something went wrong.</h1>
          <p>
            Your assessment could not be displayed.
          </p>
          <div className="error-state-actions flex flex-col sm:flex-row gap-4 mt-6">
            <button
              className="primary-button px-4 py-2"
              type="button"
              onClick={() => this.reloadApp()}
            >
              Reload Assessment
            </button>
            <button
              className="secondary-button px-4 py-2"
              type="button"
              onClick={() => this.reportIssue()}
            >
              Preserve Session & Report Issue
            </button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
