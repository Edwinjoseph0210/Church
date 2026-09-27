import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ParishSettings } from '../types';
import { apiRequest } from '../services/api';

interface SettingsContextType {
  settings: ParishSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<ParishSettings>) => Promise<ParishSettings>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ParishSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await apiRequest<ParishSettings>('/parish-settings');
      setSettings(data);
    } catch (err) {
      console.error('Failed to load parish settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = async (newSettings: Partial<ParishSettings>): Promise<ParishSettings> => {
    const updated = await apiRequest<ParishSettings>('/parish-settings', {
      method: 'PUT',
      body: JSON.stringify(newSettings),
    });
    setSettings(updated);
    return updated;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
