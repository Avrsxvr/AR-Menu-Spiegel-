import React from 'react';
import { trackError } from '../utils/analytics.js';

class EmergencyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Emergency Error Boundary caught an error:', error, errorInfo);
    
    // Track error in analytics
    trackError('app_crash', `${error.name}: ${error.message}`);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Send error report for monitoring
    this.sendErrorReport(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Track retry attempt
    trackError('error_recovery', `User retry attempt ${this.state.retryCount + 1}`);
  }

  handleReload = () => {
    trackError('error_recovery', 'Full page reload requested');
    window.location.reload();
  }

  sendErrorReport = (error, errorInfo) => {
    // Send error report to monitoring service
    const errorReport = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'anonymous', // Could be replaced with actual user ID
      sessionId: sessionStorage.getItem('sessionId') || 'unknown'
    };

    // Send via beacon API if available
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/error-report', JSON.stringify(errorReport));
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We've encountered an unexpected error, but don't worry - your data is safe.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
              
              {this.state.retryCount >= 2 && (
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              )}
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                💡 <strong>Tip:</strong> If this keeps happening, try using a different browser 
                or clearing your browser cache.
              </p>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-700 mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EmergencyErrorBoundary;