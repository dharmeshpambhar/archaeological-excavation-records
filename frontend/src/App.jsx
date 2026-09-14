import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import SitesListPage from './pages/sites/SitesListPage';
import SiteDetailPage from './pages/sites/SiteDetailPage';
import CreateSitePage from './pages/sites/CreateSitePage';
import EditSitePage from './pages/sites/EditSitePage';
import ArtifactsPage from './pages/artifacts/ArtifactsPage';
import ArtifactDetailPage from './pages/artifacts/ArtifactDetailPage';
import CreateArtifactPage from './pages/artifacts/CreateArtifactPage';
import EditArtifactPage from './pages/artifacts/EditArtifactPage';
import FieldLogsPage from './pages/logs/FieldLogsPage';
import LogDetailPage from './pages/logs/LogDetailPage';
import CreateLogPage from './pages/logs/CreateLogPage';
import MapDashboardPage from './pages/MapDashboardPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import BookmarksPage from './pages/BookmarksPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

import UsersManagementPage from './pages/admin/UsersManagementPage';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Admin Only Route
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Lead Archaeologist or Admin Only Route (Sites creation/editing)
const LeadOrAdminRoute = ({ children }) => {
  const { canManageSites, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!canManageSites) return <Navigate to="/dashboard" replace />;
  return children;
};

// Staff / Contributors Only Route (Admin, Lead Archaeologist, Field Assistant - Viewers blocked)
const CanEditRoute = ({ children }) => {
  const { canEdit, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!canEdit) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public Only Route (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected App Routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sites" element={<SitesListPage />} />
        <Route path="sites/new" element={<LeadOrAdminRoute><CreateSitePage /></LeadOrAdminRoute>} />
        <Route path="sites/:id" element={<SiteDetailPage />} />
        <Route path="sites/:id/edit" element={<LeadOrAdminRoute><EditSitePage /></LeadOrAdminRoute>} />
        <Route path="artifacts" element={<ArtifactsPage />} />
        <Route path="artifacts/new" element={<CanEditRoute><CreateArtifactPage /></CanEditRoute>} />
        <Route path="artifacts/:id" element={<ArtifactDetailPage />} />
        <Route path="artifacts/:id/edit" element={<CanEditRoute><EditArtifactPage /></CanEditRoute>} />
        <Route path="logs" element={<FieldLogsPage />} />
        <Route path="logs/new" element={<CanEditRoute><CreateLogPage /></CanEditRoute>} />
        <Route path="logs/:id" element={<LogDetailPage />} />
        <Route path="map" element={<MapDashboardPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="users" element={<AdminRoute><UsersManagementPage /></AdminRoute>} />
        <Route path="admin/users" element={<AdminRoute><UsersManagementPage /></AdminRoute>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
