import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark, Package, BookOpen, Users, ChevronRight, Plus,
  MapPin, Calendar, Layers, Sun, ArrowRight, ExternalLink,
  Sparkles, Compass, BarChart2, Search, Eye, ShieldCheck, Map
} from 'lucide-react';
import { analyticsAPI, sitesAPI, artifactsAPI, logsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const cleanText = (str) => {
  if (!str) return '';
  return str
    .replace(/â€"/g, '–')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"');
};

const defaultSiteImages = [
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=300&auto=format&fit=crop&q=80',
];

const cleanSitePhotoUrl = (url) => {
  if (!url) return '';
  let clean = typeof url === 'string' ? url : url.url;
  if (!clean) return '';
  if (clean.includes('google.com/imgres') && clean.includes('imgurl=')) {
    try {
      const match = clean.match(/imgurl=([^&]+)/);
      if (match && match[1]) clean = decodeURIComponent(match[1]);
    } catch (e) {}
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${backendBase}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

const defaultArtifactImages = [
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500&auto=format&fit=crop&q=80',
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, canManageSites, canCreateArtifact, canCreateLog, isViewer } = useAuth();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsAPI.getDashboard().then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentSitesData } = useQuery({
    queryKey: ['recent-sites-dashboard'],
    queryFn: () => sitesAPI.getAll({ limit: 6 }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentArtifactsData } = useQuery({
    queryKey: ['recent-artifacts-dashboard'],
    queryFn: () => artifactsAPI.getAll({ limit: 4 }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  const { data: recentLogsData } = useQuery({
    queryKey: ['recent-logs-dashboard'],
    queryFn: () => logsAPI.getAll({ limit: 5 }).then((r) => r.data),
    staleTime: 1000 * 60 * 5,
  });

  if (analyticsLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading ArchaeoTrack records...</p>
      </div>
    );
  }

  const { stats = {} } = analyticsData || {};
  const recentSites = recentSitesData?.sites || [];
  const recentArtifacts = recentArtifactsData?.artifacts || [];
  const recentLogs = recentLogsData?.logs || [];

  const statCards = [
    {
      title: 'Excavation Sites',
      value: stats.totalSites || recentSites.length || 10,
      icon: Landmark,
      color: '#2E6F40',
      bg: '#EAF4ED',
      link: '/sites',
    },
    {
      title: 'Cataloged Artifacts',
      value: stats.totalArtifacts || recentArtifacts.length || 22,
      icon: Package,
      color: '#B45309',
      bg: '#FDF6E2',
      link: '/artifacts',
    },
    {
      title: 'Field Journal Logs',
      value: stats.totalLogs || recentLogs.length || 25,
      icon: BookOpen,
      color: '#1D4ED8',
      bg: '#EFF6FF',
      link: '/logs',
    },
    {
      title: 'Research Personnel',
      value: stats.totalUsers || 8,
      icon: Users,
      color: '#6D28D9',
      bg: '#F5F3FF',
      link: isAdmin ? '/users' : null,
    },
  ];

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('active') || s.includes('ongoing')) {
      return (
        <span style={{ background: '#E8F5E9', color: '#166534', padding: '3px 9px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
          Active
        </span>
      );
    }
    if (s.includes('plan')) {
      return (
        <span style={{ background: '#FFF3E0', color: '#C2410C', padding: '3px 9px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
          Planning
        </span>
      );
    }
    if (s.includes('hold')) {
      return (
        <span style={{ background: '#FEF3C7', color: '#B45309', padding: '3px 9px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
          On Hold
        </span>
      );
    }
    return (
      <span style={{ background: '#EFF6FF', color: '#1E40AF', padding: '3px 9px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
        {status || 'Recorded'}
      </span>
    );
  };

  return (
    <div style={{ padding: '24px 32px 48px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Hero Header with Quick Actions ───────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, color: '#6A746E', marginBottom: 4, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="#31543D" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
            Excavation Command Center
          </h1>
          <p style={{ fontSize: 13.5, color: '#6A746E', margin: '3px 0 0 0' }}>
            Live excavation monitoring, artifact catalogue, and stratigraphic trench journals.
          </p>
        </div>

        {/* Quick Action Buttons - Conditioned by Role */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {canManageSites && (
            <Link
              to="/sites/new"
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
                color: '#31543D',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#31543D'; e.currentTarget.style.background = '#FAF9F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D5DDD7'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <Plus size={14} /> New Site
            </Link>
          )}

          {canCreateArtifact && (
            <Link
              to="/artifacts/new"
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
                color: '#B45309',
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B45309'; e.currentTarget.style.background = '#FAF9F6'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D5DDD7'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <Plus size={14} /> Catalog Artifact
            </Link>
          )}

          {canCreateLog && (
            <Link
              to="/logs/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 15px',
                background: '#31543D',
                color: '#FFFFFF',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 2px 5px rgba(49,84,61,0.18)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#254230')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#31543D')}
            >
              <Plus size={14} /> Write Field Log
            </Link>
          )}
        </div>
      </div>

      {/* ─── 4 Metric Stat Cards ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
        className="dashboard-stats-grid"
      >
        {statCards.map((card, i) => (
          <div
            key={i}
            onClick={() => navigate(card.link)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 8,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E8E5DF';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                flexShrink: 0,
              }}
            >
              <card.icon size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#6A746E', marginBottom: 2 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', lineHeight: 1.1 }}>
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── 2-Column Master Layout (63% Left / 37% Right) ─────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.28fr 1fr',
          gap: 24,
          alignItems: 'start',
        }}
        className="dashboard-main-grid"
      >
        {/* ─── LEFT COLUMN (Primary Content) ──────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Active Excavation Projects (Spacious, Beautiful List) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 10,
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Active Excavation Projects
                </h3>
                <p style={{ fontSize: 12, color: '#7A847E', margin: '2px 0 0 0' }}>
                  Leading field sites currently under active survey and stratigraphic research
                </p>
              </div>
              <Link
                to="/sites"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#31543D',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View all {stats.totalSites || 10} sites <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentSites.slice(0, 5).map((site, index) => {
                const fallback = defaultSiteImages[index % defaultSiteImages.length];
                const rawThumb = site.coverImage || site.photos?.[0]?.url || fallback;
                const thumbnail = cleanSitePhotoUrl(rawThumb);

                return (
                  <div
                    key={site._id}
                    onClick={() => navigate(`/sites/${site._id}`)}
                    style={{
                      border: '1px solid #EFECE6',
                      borderRadius: 8,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: '#FFFFFF',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#31543D';
                      e.currentTarget.style.background = '#FAF8F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EFECE6';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          width: 54,
                          height: 44,
                          borderRadius: 6,
                          overflow: 'hidden',
                          border: '1px solid #E2DED6',
                          background: '#F5F3EE',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={thumbnail}
                          alt={site.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = fallback;
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1D20' }}>
                          {cleanText(site.name)}
                        </span>
                        {site.siteCode && (
                          <span
                            style={{
                              fontSize: 10.5,
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              background: '#F0EFEA',
                              color: '#556059',
                              padding: '1px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {site.siteCode}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6A746E', marginTop: 3 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={12} color="#8A948E" />
                          {site.location?.city || site.location?.region ? `${site.location.city || ''}, ${site.location.region || site.location.country || 'India'}` : 'India'}
                        </span>
                        <span>•</span>
                        <span style={{ color: '#8A948E' }}>
                          {cleanText(site.period || site.era || 'Bronze Age')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {getStatusBadge(site.status)}
                    <ChevronRight size={16} color="#9CA3AF" />
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Section 2: Recent Artifact Discoveries (Visual Showcase Grid) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 10,
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Recent Artifact Discoveries
                </h3>
                <p style={{ fontSize: 12, color: '#7A847E', margin: '2px 0 0 0' }}>
                  Newly registered specimens, inscriptions, numismatics, and pottery
                </p>
              </div>
              <Link
                to="/artifacts"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#31543D',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View all artifacts <ChevronRight size={14} />
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 14,
              }}
            >
              {recentArtifacts.slice(0, 4).map((art, idx) => {
                const imgUrl = art.images?.[0]?.url || defaultArtifactImages[idx % defaultArtifactImages.length];
                return (
                  <div
                    key={art._id}
                    onClick={() => navigate(`/artifacts/${art._id}`)}
                    style={{
                      border: '1px solid #EFECE6',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#31543D';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EFECE6';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ height: 130, background: '#EAE5DC', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={imgUrl}
                        alt={art.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {art.catalogNumber && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            background: 'rgba(26,29,32,0.8)',
                            color: '#FFF',
                            fontSize: 10.5,
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {art.catalogNumber}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1D20', margin: '0 0 3px 0', lineHeight: 1.3 }}>
                        {cleanText(art.name)}
                      </h4>
                      <div style={{ fontSize: 11.5, color: '#6A746E', marginBottom: 8 }}>
                        {art.category} • {cleanText(art.material || 'Specimen')}
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid #F5F3EE' }}>
                        <span style={{ fontSize: 11, color: '#8A948E' }}>
                          {art.site?.name ? cleanText(art.site.name) : 'Excavation Site'}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: art.condition === 'Excellent' || art.condition === 'Good' ? '#E8F5E9' : '#FFF3E0',
                            color: art.condition === 'Excellent' || art.condition === 'Good' ? '#2E7D32' : '#C2410C',
                          }}
                        >
                          {art.condition || 'Cataloged'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN (Timeline & Quick Access) ──────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 3: Live Trench Activity Feed (Field Logs) */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 10,
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Recent Field Logs
                </h3>
                <p style={{ fontSize: 12, color: '#7A847E', margin: '2px 0 0 0' }}>
                  Stratigraphy, daily trench findings &amp; weather records
                </p>
              </div>
              <Link
                to="/logs"
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#31543D',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentLogs.slice(0, 5).map((log) => {
                const authorName = log.createdBy?.name || log.author?.name || 'Field Researcher';
                const authorAvatar = log.createdBy?.avatar;
                const logDate = log.date ? new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

                return (
                  <div
                    key={log._id}
                    onClick={() => navigate(`/logs/${log._id}`)}
                    style={{
                      border: '1px solid #EFECE6',
                      borderRadius: 8,
                      padding: '12px 14px',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#31543D';
                      e.currentTarget.style.background = '#FAF8F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EFECE6';
                      e.currentTarget.style.background = '#FFFFFF';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#1A1D20', margin: 0, lineHeight: 1.3 }}>
                        {cleanText(log.title)}
                      </h4>
                      <span style={{ fontSize: 11, color: '#8A948E', whiteSpace: 'nowrap', marginLeft: 8 }}>
                        {logDate}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {authorAvatar ? (
                          <img src={authorAvatar} alt="" style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#31543D', color: '#FFF', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {authorName.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: '#4B5563' }}>{authorName}</span>
                      </div>

                      {log.site?.name && (
                        <span style={{ fontSize: 11, background: '#F0EFEA', color: '#556059', padding: '1px 6px', borderRadius: 4 }}>
                          {cleanText(log.site.name)}
                        </span>
                      )}
                    </div>

                    {log.findings && (
                      <p style={{ fontSize: 12, color: '#6A746E', margin: 0, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {cleanText(log.findings)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Archaeological Intelligence Shortlinks */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 10,
              padding: '20px 22px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1A1D20', margin: '0 0 12px 0' }}>
              Archaeological Field Tools
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                onClick={() => navigate('/map')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = '#93C5FD'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: '#DBEAFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Map size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D20' }}>Interactive GIS Map</div>
                    <div style={{ fontSize: 11.5, color: '#6B7280' }}>Explore GPS coordinates &amp; terrain layers</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#6B7280" />
              </div>

              <div
                onClick={() => navigate('/reports')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.borderColor = '#86EFAC'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D20' }}>Scientific Reports &amp; CSV</div>
                    <div style={{ fontSize: 11.5, color: '#6B7280' }}>Export analytical rosters &amp; charts</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#6B7280" />
              </div>

              <div
                onClick={() => navigate('/search')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAF5FF'; e.currentTarget.style.borderColor = '#D8B4FE'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Search size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1D20' }}>Archive Multi-Search</div>
                    <div style={{ fontSize: 11.5, color: '#6B7280' }}>Query ceramics, layers, and sites</div>
                  </div>
                </div>
                <ChevronRight size={16} color="#6B7280" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr !important;
          }
          .dashboard-stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
