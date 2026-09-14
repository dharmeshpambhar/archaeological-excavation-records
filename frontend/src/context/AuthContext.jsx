import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('arch_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('arch_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user);
        localStorage.setItem('arch_user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  const setAuthSession = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('arch_token', authToken);
    localStorage.setItem('arch_user', JSON.stringify(userData));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setAuthSession(data.user, data.token);
    return data;
  }, [setAuthSession]);

  const register = useCallback(async (name, email, password, role) => {
    const { data } = await authAPI.register({ name, email, password, role });
    setAuthSession(data.user, data.token);
    return data;
  }, [setAuthSession]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('arch_token');
    localStorage.removeItem('arch_user');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('arch_user', JSON.stringify(updatedUser));
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    const { data } = await authAPI.updateProfile(profileData);
    setUser(data.user);
    localStorage.setItem('arch_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  const switchDemoRole = useCallback(async (roleName) => {
    const roleEmailMap = {
      Admin: 'admin@archrecords.com',
      'Lead Archaeologist': 'lead@archrecords.com',
      'Field Assistant': 'field@archrecords.com',
      Viewer: 'viewer@archrecords.com',
    };
    const email = roleEmailMap[roleName] || 'admin@archrecords.com';
    try {
      const { data } = await authAPI.login({ email, password: 'password123' });
      setAuthSession(data.user, data.token);
      return data.user;
    } catch (err) {
      console.error('Failed to switch role:', err);
      throw err;
    }
  }, [setAuthSession]);

  // Permission helpers
  const isAdmin = user?.role === 'Admin';
  const isLead = user?.role === 'Lead Archaeologist';
  const isFieldAssistant = user?.role === 'Field Assistant';
  const isViewer = user?.role === 'Viewer';

  // Granular capability helpers
  const canManageUsers = isAdmin;
  const canManageSites = isAdmin || isLead;
  const canCreateSite = isAdmin || isLead;
  const canEditSite = isAdmin || isLead;
  const canDeleteSite = isAdmin || isLead;
  const canManageTeam = isAdmin || isLead;

  const canCreateArtifact = isAdmin || isLead || isFieldAssistant;
  const canEditArtifact = isAdmin || isLead || isFieldAssistant;
  const canDeleteArtifact = isAdmin || isLead;

  const canCreateLog = isAdmin || isLead || isFieldAssistant;
  const canEditLog = isAdmin || isLead || isFieldAssistant;
  const canDeleteLog = isAdmin || isLead;

  const canUploadPhoto = isAdmin || isLead || isFieldAssistant;

  // General backward-compatible helpers
  const canEdit = isAdmin || isLead || isFieldAssistant;
  const canManage = isAdmin || isLead;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
        setAuthSession,
        switchDemoRole,
        isAdmin,
        isLead,
        isFieldAssistant,
        isViewer,
        canManageUsers,
        canManageSites,
        canCreateSite,
        canEditSite,
        canDeleteSite,
        canManageTeam,
        canCreateArtifact,
        canEditArtifact,
        canDeleteArtifact,
        canCreateLog,
        canEditLog,
        canDeleteLog,
        canUploadPhoto,
        canEdit,
        canManage,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
