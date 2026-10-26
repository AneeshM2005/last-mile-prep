import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '@/styles/tokens.css';
import { AppProviders, useAppContext } from './app/providers';
import { AppRouter } from './app/router';
import { ToastProvider } from './ui/Toast';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorScreen } from './ui/ErrorScreen';

function RootApp(): React.ReactElement {
  const { loading, configErrors } = useAppContext();

  if (loading) {
    return <LoadingScreen />;
  }

  if (configErrors.length > 0) {
    return (
      <ErrorScreen
        errors={configErrors}
        onRetry={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <HashRouter>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </HashRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <RootApp />
    </AppProviders>
  </React.StrictMode>
);
