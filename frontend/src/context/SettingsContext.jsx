import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SettingsContext = createContext(null);

export const DEFAULT_APP_SETTINGS = {
  // Appearance & Display
  theme: 'light', // 'light' | 'dark'
  viewLayout: 'grid', // 'grid' | 'list'
  itemsPerPage: '12',

  // Language & Date
  language: 'en',
  dateFormat: 'DD/MM/YYYY', // 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

  // Measurement
  units: 'meters', // 'meters' | 'feet'
  weightUnits: 'grams', // 'grams' | 'pounds'

  // Field & Device
  autoSaveLogs: '2', // '1' | '2' | 'off'
  autoAddGPS: true,
  compressPhotos: true,
  offlineCache: true,

  // Notifications
  emailNewSites: true,
  emailWeeklyDigest: true,
  browserNotifications: false,
  notifySiteAssigned: true,
  notifyLogComments: true,
  notifyNewLog: true,
  notifyNewArtifact: true,
  notifySiteChanges: true,
  emailWeeklyReport: true,

  // Admin & System
  allowRegistrations: true,
  defaultUserRole: 'Viewer',
  notifyOnNewUser: true,
  sessionTimeout: '60', // minutes or 'never'
  requireStrongPassword: true,
  maintenanceMode: false,
  autoBackup: 'daily',
};

export function SettingsProvider({ children }) {
  const { user, logout } = useAuth();
  const userRole = user?.role || 'Viewer';

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`app_settings_${userRole}`) || localStorage.getItem('app_settings');
      return saved ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) } : DEFAULT_APP_SETTINGS;
    } catch {
      return DEFAULT_APP_SETTINGS;
    }
  });

  // Re-sync when user role changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`app_settings_${userRole}`) || localStorage.getItem('app_settings');
      if (saved) {
        setSettings({ ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }, [userRole]);

  // 1. APPLY THEME TO DOCUMENT
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }, [settings.theme]);

  // 2. INACTIVITY AUTO-LOGOUT
  useEffect(() => {
    if (!settings.sessionTimeout || settings.sessionTimeout === 'never' || !user) return;
    const timeoutMs = parseInt(settings.sessionTimeout, 10) * 60 * 1000;
    if (isNaN(timeoutMs) || timeoutMs <= 0) return;

    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        toast('Session expired due to inactivity.', { icon: '⏱️' });
        logout();
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [settings.sessionTimeout, user, logout]);

  // 3. BROWSER NOTIFICATIONS PERMISSION
  useEffect(() => {
    if (settings.browserNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            toast.success('Desktop browser alerts enabled');
          }
        });
      }
    }
  }, [settings.browserNotifications]);

  // Update a single setting
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(`app_settings_${userRole}`, JSON.stringify(updated));
        localStorage.setItem('app_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [userRole]);

  // Update multiple settings at once
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(`app_settings_${userRole}`, JSON.stringify(updated));
        localStorage.setItem('app_settings', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [userRole]);

  // Helper: Format date according to settings
  const formatDate = useCallback((dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    if (settings.dateFormat === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    }
    if (settings.dateFormat === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }
    return `${day}/${month}/${year}`;
  }, [settings.dateFormat]);

  // Helper: Format distance
  const formatDistance = useCallback((meters) => {
    if (meters === null || meters === undefined || isNaN(Number(meters))) return '0 m';
    const num = Number(meters);
    if (settings.units === 'feet') {
      const ft = (num * 3.28084).toFixed(1);
      return `${ft} ft`;
    }
    return `${num} m`;
  }, [settings.units]);

  // Helper: Format weight
  const formatWeight = useCallback((grams) => {
    if (grams === null || grams === undefined || isNaN(Number(grams))) return '0 g';
    const num = Number(grams);
    if (settings.weightUnits === 'pounds') {
      const lb = (num * 0.00220462).toFixed(2);
      return `${lb} lb`;
    }
    return `${num} g`;
  }, [settings.weightUnits]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateSettings,
        formatDate,
        formatDistance,
        formatWeight,
        isDark: settings.theme === 'dark',
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
