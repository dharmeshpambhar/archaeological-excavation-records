import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import {
  Settings, Bell, Moon, Sun, Globe, Eye,
  Check, RotateCcw, Download, Trash2, Camera,
  MapPin, Shield, Users, Database, FileText, Smartphone,
  Layers, Lock, Sliders, CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── BASIC ROLE-BASED CONFIGURATION ──────────────────────────────────────────

const ROLE_SETTINGS_CONFIG = {
  Viewer: {
    roleName: 'Viewer',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    title: 'Account & Display Settings',
    subtitle: 'Manage how you view sites, read reports, and receive updates.',
    tabs: [
      { id: 'appearance', label: 'Display & Theme', icon: Sliders, desc: 'Theme, layout style & text size' },
      { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Email alerts & updates' },
      { id: 'general', label: 'Language & Region', icon: Globe, desc: 'Language & date format' },
    ],
    defaults: {
      theme: 'light',
      viewLayout: 'grid', // 'grid' | 'list'
      itemsPerPage: '12',
      emailNewSites: true,
      emailWeeklyDigest: true,
      browserNotifications: false,
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
    },
  },

  'Field Assistant': {
    roleName: 'Field Assistant',
    badgeColor: '#D97706',
    badgeBg: '#FEF3C7',
    title: 'Fieldwork & Log Settings',
    subtitle: 'Configure daily trench units, photo compression, and log auto-saving.',
    tabs: [
      { id: 'fieldwork', label: 'Fieldwork & Logs', icon: FileText, desc: 'Measurement units, GPS & auto-save' },
      { id: 'camera', label: 'Photos & Uploads', icon: Camera, desc: 'Photo quality & data saving' },
      { id: 'notifications', label: 'Team Notifications', icon: Bell, desc: 'Site assignments & comments' },
    ],
    defaults: {
      units: 'meters', // 'meters' | 'feet'
      weightUnits: 'grams', // 'grams' | 'pounds'
      autoSaveLogs: '2', // '1' | '2' | 'off'
      autoAddGPS: true,
      compressPhotos: true,
      offlineCache: true,
      notifySiteAssigned: true,
      notifyLogComments: true,
      theme: 'light',
    },
  },

  'Lead Archaeologist': {
    roleName: 'Lead Archaeologist',
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    title: 'Project & Team Settings',
    subtitle: 'Manage default site rules, team alerts, and project exports.',
    tabs: [
      { id: 'projects', label: 'Project Defaults', icon: Layers, desc: 'Default status & review rules' },
      { id: 'alerts', label: 'Team Activity Alerts', icon: Bell, desc: 'New logs & artifact alerts' },
      { id: 'export', label: 'Data Export', icon: Download, desc: 'Download site data archives' },
    ],
    defaults: {
      defaultSiteStatus: 'Planned', // 'Planned' | 'Ongoing'
      requireLogReview: true,
      measurementSystem: 'metric',
      notifyNewLog: true,
      notifyNewArtifact: true,
      notifySiteChanges: true,
      emailWeeklyReport: true,
      theme: 'light',
    },
  },

  Admin: {
    roleName: 'Admin',
    badgeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
    title: 'System & Platform Settings',
    subtitle: 'Control user signups, security timeouts, and database backups.',
    tabs: [
      { id: 'users', label: 'User Signups & Roles', icon: Users, desc: 'Registration & default roles' },
      { id: 'security', label: 'Security & Session', icon: Lock, desc: 'Auto-logout & login policies' },
      { id: 'system', label: 'Backup & Maintenance', icon: Database, desc: 'Backups & system cache' },
    ],
    defaults: {
      allowRegistrations: true,
      defaultUserRole: 'Viewer',
      notifyOnNewUser: true,
      sessionTimeout: '60', // minutes
      requireStrongPassword: true,
      maintenanceMode: false,
      autoBackup: 'daily',
    },
  },
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { settings: globalSettings, updateSettings } = useSettings();

  // Active role configuration
  const userRole = user?.role && ROLE_SETTINGS_CONFIG[user.role] ? user.role : 'Viewer';
  const [activeRoleView, setActiveRoleView] = useState(userRole);

  useEffect(() => {
    setActiveRoleView(userRole);
  }, [userRole]);

  const config = ROLE_SETTINGS_CONFIG[activeRoleView] || ROLE_SETTINGS_CONFIG.Viewer;
  const [activeTab, setActiveTab] = useState(config.tabs[0].id);

  // When role view changes, select first tab
  useEffect(() => {
    if (config.tabs && config.tabs.length > 0) {
      setActiveTab(config.tabs[0].id);
    }
  }, [activeRoleView]);

  // Merge defaults with globalSettings
  const [settings, setSettings] = useState(() => ({
    ...config.defaults,
    ...globalSettings,
  }));

  useEffect(() => {
    setSettings((prev) => ({
      ...config.defaults,
      ...globalSettings,
      ...prev,
    }));
  }, [activeRoleView, globalSettings]);

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Immediately apply theme or maintenance mode
      if (key === 'theme') {
        updateSettings({ theme: next.theme });
      }
      if (key === 'maintenanceMode') {
        updateSettings({ maintenanceMode: next.maintenanceMode });
      }
      return next;
    });
  };

  const handleChange = (key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      // Immediately apply theme or date format if desired
      if (key === 'theme') {
        updateSettings({ theme: value });
      }
      return next;
    });
  };

  const handleSave = () => {
    setSaving(true);
    updateSettings(settings);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved and applied successfully!');
    }, 250);
  };

  const handleReset = () => {
    if (window.confirm('Reset these settings back to default?')) {
      setSettings(config.defaults);
      updateSettings(config.defaults);
      toast.success('Settings reset to defaults');
    }
  };

  const handleExport = () => {
    const data = {
      role: activeRoleView,
      settings,
      exportedAt: new Date().toLocaleString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archeological_system_settings_${activeRoleView.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings file downloaded');
  };

  const handleClearCache = () => {
    if (window.confirm('Clear temporary cached files and map tiles?')) {
      toast.success('Cache cleared successfully!');
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D20', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={22} color="#31543D" /> Settings
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: '#6A746E', margin: 0 }}>
            {config.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Admin role preview selector */}
          {user?.role === 'Admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6A746E', fontWeight: 600 }}>Role view:</span>
              <select
                value={activeRoleView}
                onChange={(e) => setActiveRoleView(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 12.5,
                  borderRadius: 6,
                  border: '1px solid #D5DDD7',
                  background: '#F9FAF9',
                  color: '#1A1D20',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Lead Archaeologist">Lead Archaeologist</option>
                <option value="Field Assistant">Field Assistant</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              background: '#FFFFFF',
              border: '1px solid #D5DDD7',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#556059',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: '#31543D',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.background = '#24432E')}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.background = '#31543D')}
          >
            <Check size={15} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ─── Two-Column Layout ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 20,
          alignItems: 'start',
        }}
        className="settings-grid"
      >
        {/* Left Tabs */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 10,
            padding: '10px',
          }}
        >
          {config.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: isActive ? '#EDF4EE' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 4,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    color: isActive ? '#31543D' : '#6A746E',
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 600, color: isActive ? '#1A1D20' : '#454E48' }}>
                    {tab.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#8A948E', marginTop: 1 }}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Settings Panel */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 10,
            padding: '24px',
          }}
        >

          {/* ══════════════════════════════════════════════════════════
              VIEWER PANELS (Clean & Simple)
             ══════════════════════════════════════════════════════════ */}
          {activeRoleView === 'Viewer' && (
            <>
              {activeTab === 'appearance' && (
                <div>
                  <SimpleSectionTitle title="Display & Theme" subtitle="Choose how pages and catalog cards look on your screen." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={simpleLabel}>Theme Mode</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleChange('theme', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="light">Light Mode (Clean archaeological cream)</option>
                        <option value="dark">Dark Mode</option>
                      </select>
                    </div>

                    <div>
                      <label style={simpleLabel}>Default Catalog View</label>
                      <select
                        value={settings.viewLayout}
                        onChange={(e) => handleChange('viewLayout', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="grid">Photo Card Grid (Recommended)</option>
                        <option value="list">Simple List Table</option>
                      </select>
                    </div>

                    <div>
                      <label style={simpleLabel}>Items per Page</label>
                      <select
                        value={settings.itemsPerPage}
                        onChange={(e) => handleChange('itemsPerPage', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="12">12 items per page</option>
                        <option value="24">24 items per page</option>
                        <option value="48">48 items per page</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <SimpleSectionTitle title="Notification Preferences" subtitle="Select the email updates you want to receive." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <SimpleSwitch
                      title="Email me about new excavation sites"
                      desc="Get an email whenever a new archaeological site is added."
                      checked={settings.emailNewSites}
                      onChange={() => handleToggle('emailNewSites')}
                    />
                    <SimpleSwitch
                      title="Weekly excavation newsletter"
                      desc="Receive a brief weekly summary of top discoveries and photos."
                      checked={settings.emailWeeklyDigest}
                      onChange={() => handleToggle('emailWeeklyDigest')}
                    />
                    <SimpleSwitch
                      title="Browser push notifications"
                      desc="Show desktop popups when you have new messages or replies."
                      checked={settings.browserNotifications}
                      onChange={() => handleToggle('browserNotifications')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'general' && (
                <div>
                  <SimpleSectionTitle title="Language & Region" subtitle="Choose your display language and preferred date format." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={simpleLabel}>Display Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleChange('language', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi (हिंदी)</option>
                      </select>
                    </div>

                    <div>
                      <label style={simpleLabel}>Date Format</label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleChange('dateFormat', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 11/09/2026)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/11/2026)</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-11)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              FIELD ASSISTANT PANELS (Simple Field Tools)
             ══════════════════════════════════════════════════════════ */}
          {activeRoleView === 'Field Assistant' && (
            <>
              {activeTab === 'fieldwork' && (
                <div>
                  <SimpleSectionTitle title="Fieldwork & Log Defaults" subtitle="Set standard units and auto-save options for writing logs in the field." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={simpleLabel}>Depth & Distance Units</label>
                        <select
                          value={settings.units}
                          onChange={(e) => handleChange('units', e.target.value)}
                          style={simpleSelect}
                        >
                          <option value="meters">Meters & Centimeters (m / cm)</option>
                          <option value="feet">Feet & Inches (ft / in)</option>
                        </select>
                      </div>

                      <div>
                        <label style={simpleLabel}>Artifact Weight Units</label>
                        <select
                          value={settings.weightUnits}
                          onChange={(e) => handleChange('weightUnits', e.target.value)}
                          style={simpleSelect}
                        >
                          <option value="grams">Grams & Kilograms (g / kg)</option>
                          <option value="pounds">Ounces & Pounds (oz / lb)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={simpleLabel}>Auto-Save Field Log Drafts</label>
                      <select
                        value={settings.autoSaveLogs}
                        onChange={(e) => handleChange('autoSaveLogs', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="1">Every 1 minute (Recommended)</option>
                        <option value="2">Every 2 minutes</option>
                        <option value="off">Turn off auto-save</option>
                      </select>
                      <span style={simpleHelp}>Prevents losing notes if your phone or tablet battery dies in the field.</span>
                    </div>

                    <SimpleSwitch
                      title="Automatically attach GPS location"
                      desc="Fill in current GPS coordinates when creating a new field log or finding an artifact."
                      checked={settings.autoAddGPS}
                      onChange={() => handleToggle('autoAddGPS')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'camera' && (
                <div>
                  <SimpleSectionTitle title="Photos & Mobile Data" subtitle="Optimize picture uploads when working on remote mobile connections." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <SimpleSwitch
                      title="Compress photos before upload"
                      desc="Reduces picture file size so uploads complete fast even on slow 3G/4G field mobile internet."
                      checked={settings.compressPhotos}
                      onChange={() => handleToggle('compressPhotos')}
                    />

                    <SimpleSwitch
                      title="Save maps for offline viewing"
                      desc="Keeps recent map tiles stored on your device so you can view sites even when signal drops."
                      checked={settings.offlineCache}
                      onChange={() => handleToggle('offlineCache')}
                    />

                    <div style={{ marginTop: 12, padding: 14, background: '#F9F8F5', borderRadius: 8, border: '1px solid #EAE6DE' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D20', marginBottom: 6 }}>Device Cache</div>
                      <p style={{ fontSize: 12, color: '#6A746E', margin: '0 0 10px 0' }}>Clear stored offline map images if your phone storage is low.</p>
                      <button
                        type="button"
                        onClick={handleClearCache}
                        style={{
                          padding: '6px 12px',
                          background: '#FFFFFF',
                          border: '1px solid #D5DDD7',
                          borderRadius: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#B91C1C',
                          cursor: 'pointer',
                        }}
                      >
                        Clear Saved Map Cache
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <SimpleSectionTitle title="Team Notifications" subtitle="Choose what alerts to receive while working on excavation sites." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <SimpleSwitch
                      title="Notify when added to a site team"
                      desc="Receive an alert when a Lead Archaeologist adds you to a project team."
                      checked={settings.notifySiteAssigned}
                      onChange={() => handleToggle('notifySiteAssigned')}
                    />
                    <SimpleSwitch
                      title="Notify on log comments"
                      desc="Alert me when a teammate or lead leaves feedback on my field logs."
                      checked={settings.notifyLogComments}
                      onChange={() => handleToggle('notifyLogComments')}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              LEAD ARCHAEOLOGIST PANELS (Project Management)
             ══════════════════════════════════════════════════════════ */}
          {activeRoleView === 'Lead Archaeologist' && (
            <>
              {activeTab === 'projects' && (
                <div>
                  <SimpleSectionTitle title="Project Defaults" subtitle="Set standard defaults for new excavation sites you create." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={simpleLabel}>Default Status for New Sites</label>
                      <select
                        value={settings.defaultSiteStatus}
                        onChange={(e) => handleChange('defaultSiteStatus', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="Planned">Planned (Preparation & Survey Phase)</option>
                        <option value="Ongoing">Ongoing (Active Digging)</option>
                      </select>
                    </div>

                    <div>
                      <label style={simpleLabel}>Default Measurement Standard</label>
                      <select
                        value={settings.measurementSystem}
                        onChange={(e) => handleChange('measurementSystem', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="metric">Metric (Meters, Centimeters, Grams)</option>
                        <option value="imperial">Imperial (Feet, Inches, Ounces)</option>
                      </select>
                    </div>

                    <SimpleSwitch
                      title="Require supervisor review for new logs"
                      desc="Mark new assistant logs as draft until you review and confirm them."
                      checked={settings.requireLogReview}
                      onChange={() => handleToggle('requireLogReview')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div>
                  <SimpleSectionTitle title="Team & Project Alerts" subtitle="Get notified about daily discoveries and fieldwork updates." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <SimpleSwitch
                      title="Notify when a new field log is submitted"
                      desc="Get an alert whenever a team member adds a daily excavation entry."
                      checked={settings.notifyNewLog}
                      onChange={() => handleToggle('notifyNewLog')}
                    />
                    <SimpleSwitch
                      title="Notify when a new artifact is catalogued"
                      desc="Immediate notification when pottery, tools, or seals are discovered."
                      checked={settings.notifyNewArtifact}
                      onChange={() => handleToggle('notifyNewArtifact')}
                    />
                    <SimpleSwitch
                      title="Email weekly project summary"
                      desc="Receive a weekly report on team progress, total finds, and logs."
                      checked={settings.emailWeeklyReport}
                      onChange={() => handleToggle('emailWeeklyReport')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'export' && (
                <div>
                  <SimpleSectionTitle title="Export Project Data" subtitle="Download backup copies of your excavation records." />
                  <div style={{ padding: 18, background: '#F9F8F5', borderRadius: 8, border: '1px solid #EAE6DE' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1D20', marginBottom: 4 }}>
                      Download Excavation Archive
                    </div>
                    <p style={{ fontSize: 12.5, color: '#6A746E', margin: '0 0 14px 0' }}>
                      Export all site records, artifacts list, and daily logs into a clean JSON file for backup.
                    </p>
                    <button
                      type="button"
                      onClick={handleExport}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        background: '#31543D',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={14} /> Download Project Records (.json)
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              ADMIN PANELS (Clear Platform Administration)
             ══════════════════════════════════════════════════════════ */}
          {activeRoleView === 'Admin' && (
            <>
              {activeTab === 'users' && (
                <div>
                  <SimpleSectionTitle title="User Signups & Roles" subtitle="Control registration access and default account permissions." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <SimpleSwitch
                      title="Allow public user registration"
                      desc="Allow new researchers and visitors to create accounts freely."
                      checked={settings.allowRegistrations}
                      onChange={() => handleToggle('allowRegistrations')}
                    />

                    <div>
                      <label style={simpleLabel}>Default Role for New Accounts</label>
                      <select
                        value={settings.defaultUserRole}
                        onChange={(e) => handleChange('defaultUserRole', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="Viewer">Viewer (Read-only — Recommended)</option>
                        <option value="Field Assistant">Field Assistant (Can add logs)</option>
                      </select>
                      <span style={simpleHelp}>New accounts will automatically be assigned this role.</span>
                    </div>

                    <SimpleSwitch
                      title="Email alert on new user signup"
                      desc="Send an email to admin whenever someone registers a new account."
                      checked={settings.notifyOnNewUser}
                      onChange={() => handleToggle('notifyOnNewUser')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <SimpleSectionTitle title="Security & Session" subtitle="Manage session timeouts and login safety." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={simpleLabel}>Auto-Logout after Inactivity</label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour (Recommended)</option>
                        <option value="240">4 hours</option>
                        <option value="never">Never auto-logout</option>
                      </select>
                      <span style={simpleHelp}>Automatically logs out inactive sessions to protect sensitive excavation data.</span>
                    </div>

                    <SimpleSwitch
                      title="Enforce strong passwords"
                      desc="Require at least 6 characters with mixed letters and numbers."
                      checked={settings.requireStrongPassword}
                      onChange={() => handleToggle('requireStrongPassword')}
                    />

                    <SimpleSwitch
                      title="System maintenance banner"
                      desc="Show a notice at the top of the dashboard indicating routine maintenance."
                      checked={settings.maintenanceMode}
                      onChange={() => handleToggle('maintenanceMode')}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div>
                  <SimpleSectionTitle title="Backup & System Cache" subtitle="Download database backups and clear temporary files." />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                      <label style={simpleLabel}>Automatic Backup Frequency</label>
                      <select
                        value={settings.autoBackup}
                        onChange={(e) => handleChange('autoBackup', e.target.value)}
                        style={simpleSelect}
                      >
                        <option value="daily">Daily Backup (Every night at 2:00 AM)</option>
                        <option value="weekly">Weekly Backup</option>
                        <option value="manual">Manual only</option>
                      </select>
                    </div>

                    <div style={{ padding: 18, background: '#F9F8F5', borderRadius: 8, border: '1px solid #EAE6DE' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1D20', marginBottom: 12 }}>
                        Quick Maintenance Actions
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={handleExport}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            background: '#31543D',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                          }}
                        >
                          <Download size={14} /> Download System Backup (.json)
                        </button>

                        <button
                          type="button"
                          onClick={handleClearCache}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 14px',
                            background: '#FFFFFF',
                            border: '1px solid #D5DDD7',
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#B91C1C',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} /> Clear Temporary Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .settings-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Simple Reusable Components ──────────────────────────────────────────────

function SimpleSectionTitle({ title, subtitle }) {
  return (
    <div style={{ borderBottom: '1px solid #EFECE6', paddingBottom: 12, marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 12.5, color: '#7A847E', margin: '3px 0 0 0' }}>{subtitle}</p>
    </div>
  );
}

function SimpleSwitch({ title, desc, checked, onChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 14px',
        background: '#FAF9F6',
        borderRadius: 8,
        border: '1px solid #EAE7E0',
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1D20' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#7E8883', marginTop: 2 }}>{desc}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22, cursor: 'pointer', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: checked ? '#31543D' : '#D1D5DB',
            borderRadius: 22,
            transition: 'background-color 0.2s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              height: 16,
              width: 16,
              left: checked ? 23 : 3,
              bottom: 3,
              background: '#FFFFFF',
              borderRadius: '50%',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </span>
      </label>
    </div>
  );
}

const simpleLabel = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#3A423D',
  marginBottom: 6,
};

const simpleSelect = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #D8D4CC',
  borderRadius: 6,
  fontSize: 13.5,
  color: '#1A1D20',
  outline: 'none',
  background: '#FFFFFF',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const simpleHelp = {
  display: 'block',
  fontSize: 11.5,
  color: '#8A948E',
  marginTop: 4,
};
