import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/styles/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <a href="#main" className="skip-link">Skip to main content</a>
    <main id="main">
      <h1 className="text-h1" style={{ color: 'var(--lm-ink)' }}>Last Mile</h1>
      <p className="text-body" style={{ color: 'var(--lm-text-muted)' }}>Loading…</p>
    </main>
  </React.StrictMode>
);
