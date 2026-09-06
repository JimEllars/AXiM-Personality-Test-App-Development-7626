import React from 'react';
import { trackError } from '../../services/telemetry';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AXiM interface error:', error, errorInfo);
    trackError(error, errorInfo);
  }

  reloadApp() {
    window.location.reload();
  }

  resetApp() {
    window.localStorage.removeItem('axim_personality_session');
    this.reloadApp();
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
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
          <div className="error-state-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                  this.setState({ hasError: false });
              }}
            >
              Resume Assessment
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => this.reloadApp()}
            >
              Reload page
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => this.resetApp()}
            >
              Clear local session
            </button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
