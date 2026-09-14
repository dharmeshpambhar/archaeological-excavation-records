import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, X, MapPin, Package, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { searchAPI } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const { unreadCount, notifications, fetchNotifications, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await searchAPI.global(searchQuery);
        setSearchResults(data.results);
      } catch { /* silent */ }
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotifClick = () => {
    setShowNotifications((v) => !v);
    if (!showNotifications) fetchNotifications();
  };

  const { formatDate } = useSettings();

  // Formatted date string formatted according to user settings
  const todayFormatted = formatDate(new Date());

  return (
    <nav
      className="app-navbar"
      style={{
        height: 64,
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E5DF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Mobile hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-icon"
          style={{ display: 'none', padding: 6 }}
          id="sidebar-toggle"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} color="#1A1D20" />
        </button>
      </div>

      {/* Center/Left: Search Bar */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#FAF8F5',
            border: '1px solid #E5E1D8',
            borderRadius: 8,
            padding: '7px 12px',
            cursor: 'text',
          }}
          onClick={() => { setShowSearch(true); searchRef.current?.querySelector('input')?.focus(); }}
        >
          <Search size={15} color="#8A948E" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            placeholder="Search..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              flex: 1,
              color: '#1A1D20',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {searchQuery && (
            <button
              onClick={(e) => { e.stopPropagation(); setSearchQuery(''); setSearchResults(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A948E', padding: 2, display: 'flex' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearch && (searchResults || searchLoading || searchQuery.length >= 2) && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              borderRadius: 8,
              border: '1px solid #E5E1D8',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              zIndex: 300,
              overflow: 'hidden',
              maxHeight: 400,
              overflowY: 'auto',
            }}
          >
            {searchLoading && (
              <div style={{ padding: 20, display: 'flex', justifyContent: 'center' }}>
                <div className="spinner spinner-sm" />
              </div>
            )}
            {!searchLoading && searchResults && (
              <>
                {searchResults.sites?.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: '#8A948E', textTransform: 'uppercase', background: '#F8F6F2' }}>
                      Sites
                    </div>
                    {searchResults.sites.map((s) => (
                      <div
                        key={s._id}
                        onClick={() => { navigate(`/sites/${s._id}`); setShowSearch(false); setSearchQuery(''); }}
                        style={{ padding: '9px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, borderBottom: '1px solid #EFECE6' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9F8F5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <MapPin size={14} color="#31543D" />
                        <span style={{ fontWeight: 600, color: '#1A1D20' }}>{s.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7E8883' }}>{s.location?.country}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.artifacts?.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: '#8A948E', textTransform: 'uppercase', background: '#F8F6F2', borderTop: '1px solid #EFECE6' }}>
                      Artifacts
                    </div>
                    {searchResults.artifacts.map((a) => (
                      <div
                        key={a._id}
                        onClick={() => { navigate(`/artifacts/${a._id}`); setShowSearch(false); setSearchQuery(''); }}
                        style={{ padding: '9px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, borderBottom: '1px solid #EFECE6' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9F8F5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Package size={14} color="#5C656E" />
                        <span style={{ fontWeight: 600, color: '#1A1D20' }}>{a.name}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#7E8883' }}>{a.category}</span>
                      </div>
                    ))}
                  </div>
                )}
                {searchResults.logs?.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: '#8A948E', textTransform: 'uppercase', background: '#F8F6F2', borderTop: '1px solid #EFECE6' }}>
                      Logs
                    </div>
                    {searchResults.logs.map((l) => (
                      <div
                        key={l._id}
                        onClick={() => { navigate(`/logs/${l._id}`); setShowSearch(false); setSearchQuery(''); }}
                        style={{ padding: '9px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, borderBottom: '1px solid #EFECE6' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9F8F5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <BookOpen size={14} color="#31543D" />
                        <span style={{ fontWeight: 500, color: '#1A1D20' }}>{l.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Side: Date, Notification Bell, User Avatar & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {/* Date Display */}
        <span
          style={{
            fontSize: 13,
            color: '#717C76',
            fontWeight: 500,
            display: 'none',
          }}
          className="navbar-date"
        >
          {todayFormatted}
        </span>


        {/* Notifications Bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={handleNotifClick}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#556059',
              padding: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              borderRadius: '50%',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#31543D',
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E5E1D8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 300,
                width: 320,
                maxHeight: 400,
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #EFECE6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#31543D', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#8A948E', fontSize: 13 }}>No unread notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => { markRead(n._id); navigate(n.link || '/dashboard'); setShowNotifications(false); }}
                      style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #EFECE6', fontSize: 12.5 }}
                    >
                      <div style={{ color: '#1A1D20', fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                      <div style={{ fontSize: 10.5, color: '#8A948E', marginTop: 2 }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar + Name + Role (Matches Mockup: Dr. Sarah Johnson / Researcher) */}
        <div
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user?.name || 'User Profile'}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid #31543D',
              }}
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#31543D',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                border: '1.5px solid #D8D4CC',
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1D20', lineHeight: 1.2 }}>
              {user?.name || 'Dr. Rajesh Sharma'}
            </span>
            <span style={{ fontSize: 11, color: '#7E8883', lineHeight: 1.2 }}>
              {user?.role === 'Admin' ? 'Director General (ASI)' : (user?.role || 'Researcher')}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #sidebar-toggle { display: flex !important; }
        }
        @media (min-width: 768px) {
          .navbar-date { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
