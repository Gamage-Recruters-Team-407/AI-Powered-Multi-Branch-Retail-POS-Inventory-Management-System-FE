import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: '#f1f5f9',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            <h1 style={{ margin: '0 0 12px', fontSize: '1.25rem', color: '#0f172a' }}>
              Something went wrong
            </h1>
            <p style={{ margin: '0 0 16px', color: '#475569', lineHeight: 1.5 }}>
              The page could not load. Try refreshing, or go back to login.
            </p>
            <pre
              style={{
                margin: '0 0 16px',
                padding: 12,
                background: '#f8fafc',
                borderRadius: 8,
                fontSize: '0.75rem',
                overflow: 'auto',
                color: '#b91c1c',
              }}
            >
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginRight: 8,
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Refresh
            </button>
            <a
              href="/login"
              style={{
                padding: '10px 16px',
                color: '#2563eb',
                fontWeight: 600,
              }}
            >
              Login
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
