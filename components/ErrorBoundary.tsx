import React from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface State { error: Error | null; }

export default class ErrorBoundary extends React.Component<Props, State> {
  declare props: Readonly<Props>;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary
      key={pathname}
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>This page couldn't load</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 420 }}>
            Something went wrong talking to the server. Try again in a moment, or go to another page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 8, padding: '10px 20px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
};
