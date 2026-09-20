import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-center my-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Visualization temporarily unavailable</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Raw scores are preserved.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
