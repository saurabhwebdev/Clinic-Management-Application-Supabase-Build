import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SettingsStatus, checkSettingsStatus } from './utils';

type SettingsContextType = {
  settingsStatus: SettingsStatus;
  refreshSettingsStatus: () => Promise<void>;
  lastChecked: number;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus>({
    profileComplete: false,
    clinicComplete: false,
    doctorComplete: false,
    regionComplete: false,
    allComplete: false
  });
  const [lastChecked, setLastChecked] = useState<number>(0);

  const refreshSettingsStatus = async () => {
    if (user) {
      const status = await checkSettingsStatus(user.id);
      setSettingsStatus(status);
      setLastChecked(Date.now());
    }
  };

  // Check settings status when user changes
  useEffect(() => {
    if (user) {
      refreshSettingsStatus();
    }
  }, [user]);

  // Refresh settings status when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        // If it's been more than 5 seconds since the last check, check again
        if (Date.now() - lastChecked > 5000) {
          refreshSettingsStatus();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, lastChecked]);

  const value = {
    settingsStatus,
    refreshSettingsStatus,
    lastChecked
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 