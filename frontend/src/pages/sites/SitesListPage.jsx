import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Eye, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { sitesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultSiteImages = [
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=300&auto=format&fit=crop&q=80',
];

const cleanPhotoUrl = (url) => {
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

export default function SitesListPage() {
  const { canManage } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['sites', { search, period, status, page }],
    queryFn: () => sitesAPI.getAll({ search, period, status, page, limit: 7 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => sitesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['sites']);
      toast.success('Site deleted');
    },
    onError: () => toast.error('Failed to delete site'),
  });

  const handleDelete = (e, id, name) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const sites = data?.sites || [];
  const totalPages = data?.pages || 1;

  const getStatusBadge = (s) => {
    const st = (s || '').toLowerCase();
    if (st.includes('active') || st.includes('ongoing')) {
      return (
        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
          Active
        </span>
      );
    }
    if (st.includes('plan')) {
      return (
        <span style={{ background: '#FFF3E0', color: '#E65100', padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
          Planning
        </span>
      );
    }
    return (
      <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '2px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 600 }}>
        {s || 'Completed'}
      </span>
    );
  };

  // Center coordinate for India
  const mapCenter = [22.5937, 78.9629];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Page Title Header ────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D20', marginBottom: 4 }}>
            Archaeological Sites
          </h1>
          <p style={{ fontSize: 13.5, color: '#6E7872', margin: 0 }}>
            Browse and manage all archaeological sites.
          </p>
        </div>

        {canManage && (
          <Link
            to="/sites/new"
            style={{
              padding: '9px 16px',
              background: '#31543D',
              color: '#FFFFFF',
              borderRadius: 6,
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#24432E'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#31543D'}
          >
            <Plus size={16} /> Add Site
          </Link>
        )}
      </div>

      {/* ─── Filter Bar ───────────────────────────────────────────── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5DF',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} color="#8A948E" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              border: '1px solid #D8D4CC',
              borderRadius: 6,
              fontSize: 13,
              color: '#1A1D20',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Periods */}
        <select
          value={period}
          onChange={(e) => { setPeriod(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Periods</option>
          <option value="Bronze Age">Bronze Age</option>
          <option value="Iron Age">Iron Age</option>
          <option value="Late Bronze Age">Late Bronze Age</option>
          <option value="Nabataean">Nabataean</option>
          <option value="Roman">Roman</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Status</option>
          <option value="Ongoing">Active</option>
          <option value="Planned">Planning</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Locations */}
        <select
          value={location}
          onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          style={{ padding: '7px 12px', border: '1px solid #D8D4CC', borderRadius: 6, fontSize: 13, color: '#1A1D20', background: '#FFFFFF', outline: 'none' }}
        >
          <option value="">All Locations</option>
          <option value="Jordan">Jordan</option>
          <option value="Pakistan">Pakistan</option>
          <option value="Egypt">Egypt</option>
          <option value="Greece">Greece</option>
        </select>
      </div>

      {/* ─── Split View: Table on Left (68%), Map on Right (32%) ──── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 20,
          alignItems: 'start',
        }}
        className="sites-split-layout"
      >
        {/* Left: Sites Table */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#FAF9F6', color: '#7A8680', borderBottom: '1px solid #EFECE6' }}>
                  <th style={{ padding: '12px 14px', width: 108, fontWeight: 600 }}>Site Photo</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Location</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Period</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="6" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>Loading sites...</td></tr>
                ) : isError ? (
                  <tr><td colSpan="6" style={{ padding: 36, textAlign: 'center', color: '#9E2A2B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <AlertTriangle size={16} />
                      <span>Failed to load sites. Please refresh or log in again.</span>
                    </div>
                  </td></tr>
                ) : sites.length === 0 ? (
                  <tr><td colSpan="6" style={{ padding: 36, textAlign: 'center', color: '#9AA49E' }}>No sites found matching criteria</td></tr>
                ) : (
                  sites.map((site, index) => {
                    const fallback = defaultSiteImages[index % defaultSiteImages.length];
                    const rawThumb = site.coverImage || site.photos?.[0]?.url || fallback;
                    const thumbnail = cleanPhotoUrl(rawThumb);
                    return (
                      <tr
                        key={site._id}
                        onClick={() => navigate(`/sites/${site._id}`)}
                        style={{ borderBottom: '1px solid #F3F1EC', cursor: 'pointer', transition: 'background-color 0.12s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Large Visible Thumbnail */}
                        <td style={{ padding: '10px 14px', width: 108 }}>
                          <div
                            style={{
                              width: 90,
                              height: 60,
                              borderRadius: 6,
                              overflow: 'hidden',
                              border: '1px solid #E2DED6',
                              background: '#F5F3EE',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
                        </td>

                        {/* Name */}
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1A1D20' }}>
                          {site.name}
                        </td>

                        {/* Location */}
                        <td style={{ padding: '12px 14px', color: '#556059' }}>
                          {site.location?.country || 'Jordan'}
                        </td>

                        {/* Period */}
                        <td style={{ padding: '12px 14px', color: '#7E8883' }}>
                          {site.period || site.era || 'Bronze Age'}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          {getStatusBadge(site.status)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                            <button
                              onClick={() => navigate(`/sites/${site._id}`)}
                              title="View dossier"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A746E', padding: 4 }}
                            >
                              <Eye size={15} />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={() => navigate(`/sites/${site._id}/edit`)}
                                  title="Edit site"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#31543D', padding: 4 }}
                                >
                                  <Edit size={15} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, site._id, site.name)}
                                  title="Delete site"
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C53030', padding: 4 }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '14px 16px', borderTop: '1px solid #EFECE6' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '4px 10px', background: 'none', border: '1px solid #D8D4CC', borderRadius: 4, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    border: page === i + 1 ? '1px solid #31543D' : '1px solid #D8D4CC',
                    background: page === i + 1 ? '#31543D' : '#FFFFFF',
                    color: page === i + 1 ? '#FFFFFF' : '#1A1D20',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '4px 10px', background: 'none', border: '1px solid #D8D4CC', borderRadius: 4, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
              >
                &gt;
              </button>
            </div>
          )}
        </div>

        {/* Right: Site Map Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E8E5DF',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EFECE6' }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
              Site Map
            </h3>
          </div>

          <div style={{ height: 380, width: '100%', position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {sites.map((site) => {
                const lat = site.location?.coordinates?.lat || 31.95;
                const lng = site.location?.coordinates?.lng || 35.93;
                return (
                  <Marker key={site._id} position={[lat, lng]}>
                    <Popup>
                      <div style={{ fontSize: 12, fontFamily: 'var(--font-sans)' }}>
                        <strong>{site.name}</strong>
                        <div>{site.location?.country}</div>
                        <div>{site.period}</div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Map Legend */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #EFECE6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              fontSize: 12,
              color: '#556059',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E7D32' }} />
              <span>Active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E65100' }} />
              <span>Planning</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1565C0' }} />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .sites-split-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
