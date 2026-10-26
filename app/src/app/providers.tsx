import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadConfig, getConfig, getConfigErrors, type LoadedConfig, type ConfigError } from '../data/configLoader';
import { storageAvailable } from '../data/storage';

export interface AppContextValue {
  config: LoadedConfig | null;
  configErrors: ConfigError[];
  loading: boolean;
  storageAvailable: boolean;
}

export const AppContext = createContext<AppContextValue>({
  config: null,
  configErrors: [],
  loading: true,
  storageAvailable: true,
});

export function useAppContext(): AppContextValue {
  return useContext(AppContext);
}

export function AppProviders({ children }: { children: React.ReactNode }): React.ReactElement {
  const [loading, setLoading] = useState(true);
  const [configErrors, setConfigErrors] = useState<ConfigError[]>([]);
  const [config, setConfig] = useState<LoadedConfig | null>(null);

  useEffect(() => {
    // Inject self-hosted fonts stylesheet if enabled
    // (Checked after config loads; on first render use system fonts)
    void loadConfig().then(() => {
      const loaded = getConfig();
      const errors = getConfigErrors();
      setConfig(loaded);
      setConfigErrors(errors);
      setLoading(false);

      // Inject fonts CSS if selfHostedFonts is enabled
      if (loaded?.app.assets.selfHostedFonts) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/fonts/fonts.css';
        document.head.appendChild(link);
      }
    });
  }, []);

  return (
    <AppContext.Provider value={{ config, configErrors, loading, storageAvailable }}>
      {children}
    </AppContext.Provider>
  );
}
