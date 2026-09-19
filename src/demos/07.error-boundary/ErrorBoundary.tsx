import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return this.renderDefaultFallback(this.state.error);
    }
    return this.props.children;
  }

  renderDefaultFallback(error: Error) {
    return (
      <div style={{
        padding: '24px',
        border: '1px solid #ffcccc',
        borderRadius: '8px',
        backgroundColor: '#fff5f5',
        color: '#cc0000'
      }}>
        <h3>Something went wrong</h3>
        <p>{error.message}</p>
        <button onClick={this.reset} style={{
          padding: '8px 16px',
          backgroundColor: '#cc0000',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
