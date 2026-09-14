import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, Package, BookOpen, Map,
  BarChart2, User, Settings, LogOut, Landmark, X, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const baseNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: MapPin, label: 'Sites', path: '/sites' },
  { icon: Package, label: 'Artifacts', path: '/artifacts' },
  { icon: BookOpen, label: 'Field Logs', path: '/logs' },
  { icon: Map, label: 'Maps', path: '/map' },
  { icon: BarChart2, label: 'Reports', path: '/reports' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    ...baseNavItems.slice(0, 6),
    ...(isAdmin ? [{ icon: Shield, label: 'Team & Users', path: '/users' }] : []),
    ...baseNavItems.slice(6),
  ];

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'open' : ''}`}
      style={{
        background: '#FFFFFF',
        borderRight: '1px solid #E8E5DF',
        width: 220,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          onClick={() => navigate('/')}
          title="Go to Landing Page"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          <Landmark size={22} color="#31543D" strokeWidth={2.2} />
          <span
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: '#1A1D20',
              letterSpacing: '-0.02em',
            }}
          >
            ArchaeoTrack
          </span>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#66707A',
            padding: 4,
          }}
          className="sidebar-close-btn"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#FFFFFF' : '#556059',
              background: isActive ? '#31543D' : 'transparent',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = '#F4F1EB';
                e.currentTarget.style.color = '#1A1D20';
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#556059';
              }
            }}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile & Logout at bottom */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid #E8E5DF', marginTop: 'auto' }}>
        {user && (
          <div
            onClick={() => navigate('/profile')}
            title="View & edit your profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
              padding: '8px 10px',
              background: '#F7F9F7',
              borderRadius: 8,
              cursor: 'pointer',
              border: '1px solid #E5ECE7',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#EEF4F0')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#F7F9F7')}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1.5px solid #31543D',
                }}
              />
            ) : (
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#31543D',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1D20', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: user.role === 'Admin' ? '#7E22CE' : user.role === 'Lead Archaeologist' ? '#047857' : user.role === 'Field Assistant' ? '#1D4ED8' : '#6B7280' }}>
                {user.role}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'transparent',
            border: 'none',
            color: '#6E7873',
            fontSize: 13.5,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FDEEEE';
            e.currentTarget.style.color = '#C53030';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6E7873';
          }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </aside>
  );
}
