import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin, Package, BookOpen, Edit, Trash2,
  ChevronRight, ChevronLeft, ExternalLink, Calendar, Plus, FileText,
  Users, UserPlus, X as CloseIcon, Layers, Sun, Loader2, Camera, Upload, Image as ImageIcon
} from 'lucide-react';
import { sitesAPI, artifactsAPI, logsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultGallery = [
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800&auto=format&fit=crop&q=80',
];

const EXCAVATION_PROJECT_ROLES = [
  'Field Assistant',
  'Trench Supervisor',
  'Co-Director',
  'Site Archaeologist',
  'Epigraphist & Inscriptions Specialist',
  'Pottery & Ceramic Analyst',
  'Bioarchaeologist / Osteologist',
  'Conservator & Restorer',
  'Surveyor & Cartographer',
  'Stratigraphy Specialist',
  'Other / Custom Duty',
];

export default function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canEdit, canManage } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoInputType, setPhotoInputType] = useState('upload'); // 'upload' | 'url'
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState('Field Assistant');
  const [customRole, setCustomRole] = useState('');

  const addPhotoMutation = useMutation({
    mutationFn: async ({ file, url, caption }) => {
      if (file) {
        const formData = new FormData();
        formData.append('photo', file);
        if (caption) formData.append('caption', caption);
        return sitesAPI.addPhoto(id, formData);
      } else {
        return sitesAPI.addPhoto(id, { url, caption });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['site', id]);
      toast.success('Photo added to excavation site!');
      setShowAddPhotoModal(false);
      setNewPhotoFile(null);
      setNewPhotoUrl('');
      setNewPhotoCaption('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add photo');
    },
  });

  const { data: site, isLoading } = useQuery({
    queryKey: ['site', id],
    queryFn: () => sitesAPI.getOne(id).then((r) => r.data.site),
  });

  const { data: researchers } = useQuery({
    queryKey: ['researchers'],
    queryFn: () => usersAPI.getResearchers().then((r) => r.data.users),
    enabled: showAddMemberModal,
  });

  const { data: siteArtifacts, isLoading: artifactsLoading } = useQuery({
    queryKey: ['site-artifacts', id],
    queryFn: () => artifactsAPI.getAll({ site: id }).then((r) => r.data.artifacts),
    enabled: !!id,
  });

  const { data: siteLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['site-logs', id],
    queryFn: () => logsAPI.getAll({ site: id }).then((r) => r.data.logs),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => sitesAPI.delete(id),
    onSuccess: () => {
      toast.success('Site record deleted');
      navigate('/sites');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete site'),
  });

  const addMemberMutation = useMutation({
    mutationFn: (data) => sitesAPI.addTeamMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['site', id]);
      toast.success('Team member assigned to site');
      setShowAddMemberModal(false);
      setSelectedUserId('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to assign member'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => sitesAPI.removeTeamMember(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['site', id]);
      toast.success('Team member removed from site');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${site?.name}?`)) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading site dossier...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <h2>Site record not found</h2>
        <Link to="/sites" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Sites</Link>
      </div>
    );
  }

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

  // ONLY real photos uploaded or saved for this excavation site! NO fake default gallery photos!
  const rawPhotos = [];
  if (site.coverImage) rawPhotos.push(site.coverImage);
  if (site.photos && site.photos.length > 0) {
    site.photos.forEach((p) => {
      const u = typeof p === 'string' ? p : p.url;
      if (u && !rawPhotos.includes(u)) {
        rawPhotos.push(u);
      }
    });
  }
  const photos = rawPhotos.map(cleanPhotoUrl).filter(Boolean);
  const currentPhoto = photos[selectedPhotoIndex] || photos[0] || '';
  const lat = site.location?.coordinates?.lat || 25.8681;
  const lng = site.location?.coordinates?.lng || 86.0899;

  const getStatusBadge = (s) => {
    const st = (s || '').toLowerCase();
    if (st.includes('active') || st.includes('ongoing')) {
      return (
        <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
          Active
        </span>
      );
    }
    if (st.includes('plan')) {
      return (
        <span style={{ background: '#FFF3E0', color: '#E65100', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
          Planning
        </span>
      );
    }
    return (
      <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>
        {s || 'Completed'}
      </span>
    );
  };

  const tabs = ['Overview', 'Artifacts', 'Field Logs', 'Team', 'Map', 'Documents'];

  const tabCounts = {
    Artifacts: siteArtifacts?.length,
    'Field Logs': siteLogs?.length,
    Team: (site?.teamMembers?.length || 0) + (site?.createdBy ? 1 : 0),
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1440, margin: '0 auto', fontFamily: 'var(--font-sans)' }}>
      {/* ─── Breadcrumbs ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6A746E', marginBottom: 14 }}>
        <Link to="/sites" style={{ color: '#6A746E', textDecoration: 'none' }}>Sites</Link>
        <ChevronRight size={13} />
        <span style={{ color: '#1A1D20', fontWeight: 600 }}>{site.name}</span>
      </div>

      {/* ─── Top Header (Title + Status + Actions) ────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
            {site.name}
          </h1>
          {getStatusBadge(site.status)}
        </div>

        {canManage && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate(`/sites/${site._id}/edit`)}
              style={{
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #D8D4CC',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#1A1D20',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Edit size={14} /> Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: '8px 14px',
                background: '#FFFFFF',
                border: '1px solid #F5C6C6',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: '#C53030',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ─── Tab Navigation Bar ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          borderBottom: '1px solid #E8E5DF',
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#31543D' : '#6A746E',
                cursor: 'pointer',
                position: 'relative',
                borderBottom: isActive ? '2.5px solid #31543D' : '2.5px solid transparent',
                marginBottom: -1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{tab}</span>
              {count != null && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: 10,
                    background: isActive ? '#E2ECE5' : '#F0EFEA',
                    color: isActive ? '#31543D' : '#738077',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Tab 1: Overview (Spacious Hero Showcase + 2-Column Info) ─────── */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Prominent Hero Showcase Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E8E5DF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                position: 'relative',
                height: 460,
                background: '#1A1D20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={site.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8A948E', gap: 12 }}>
                  <ImageIcon size={48} color="#8A948E" />
                  <p style={{ margin: 0, fontSize: 14 }}>No cover photo uploaded for this excavation site.</p>
                </div>
              )}

              {/* Badges on Hero */}
              <div style={{ position: 'absolute', bottom: 16, left: 18, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', zIndex: 2 }}>
                <span style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#FFFFFF', fontSize: 12.5, fontWeight: 600, padding: '5px 14px', borderRadius: 20 }}>
                  {selectedPhotoIndex === 0 ? 'Site Cover View' : `Site Photo #${selectedPhotoIndex + 1}`}
                </span>
                {photos.length > 1 && (
                  <span style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#E5EDE7', fontSize: 12, padding: '5px 12px', borderRadius: 20 }}>
                    {selectedPhotoIndex + 1} of {photos.length} uploaded photos
                  </span>
                )}
              </div>

              {/* Top-Right Quick Action: Upload Photo */}
              {canEdit && (
                <div style={{ position: 'absolute', top: 16, right: 18, zIndex: 2 }}>
                  <button
                    onClick={() => setShowAddPhotoModal(true)}
                    style={{
                      background: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: 6,
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1A1D20',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    }}
                  >
                    <Camera size={15} color="#31543D" /> Upload / Add Photo
                  </button>
                </div>
              )}

              {/* Prev / Next Arrows if multiple photos */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                    title="Previous Photo"
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: 42,
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                    title="Next Photo"
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: 42,
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.85)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Uploaded Photos Strip (ONLY user's uploaded photos, plus Add button!) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
              {photos.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhotoIndex(idx)}
                  style={{
                    width: 120,
                    height: 76,
                    borderRadius: 6,
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: selectedPhotoIndex === idx ? '3px solid #31543D' : '1px solid #E8E5DF',
                    cursor: 'pointer',
                    boxShadow: selectedPhotoIndex === idx ? '0 2px 8px rgba(49,84,61,0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={p}
                    alt={`Site Photo ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=300&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}

              {canEdit && (
                <button
                  onClick={() => setShowAddPhotoModal(true)}
                  style={{
                    width: 120,
                    height: 76,
                    borderRadius: 6,
                    border: '1.5px dashed #B0BCB3',
                    background: '#FAFBFA',
                    color: '#31543D',
                    fontSize: 12,
                    fontWeight: 600,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#31543D';
                    e.currentTarget.style.background = '#EEF5F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#B0BCB3';
                    e.currentTarget.style.background = '#FAFBFA';
                  }}
                >
                  <Plus size={18} color="#31543D" />
                  <span>Add Photo</span>
                </button>
              )}
            </div>
          </div>

          {/* 2-Column Info & Location Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.3fr 1fr',
              gap: 24,
              alignItems: 'start',
            }}
            className="dossier-grid"
          >
            {/* Left: Site Information & Full Description */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 10,
                padding: '24px 26px',
              }}
            >
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1D20', marginBottom: 18 }}>
                Site Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Site Name</span>
                  <span style={{ fontWeight: 600, color: '#1A1D20' }}>{site.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Location</span>
                  <span style={{ fontWeight: 600, color: '#1A1D20' }}>
                    {[site.location?.city, site.location?.region, site.location?.country].filter(Boolean).join(', ') || 'India'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Coordinates</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#1A1D20' }}>
                    {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Period</span>
                  <span style={{ fontWeight: 600, color: '#1A1D20' }}>{site.period || 'Ancient'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Discovery Date</span>
                  <span style={{ fontWeight: 600, color: '#1A1D20' }}>
                    {site.startDate ? site.startDate.split('T')[0] : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                  <span style={{ color: '#7A8680' }}>Status</span>
                  <span>{getStatusBadge(site.status)}</span>
                </div>
                {site.totalDepth > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                    <span style={{ color: '#7A8680' }}>Excavation Depth</span>
                    <span style={{ fontWeight: 600, color: '#1A1D20' }}>{site.totalDepth} m</span>
                  </div>
                )}
                {site.areaSize > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F5F3EE', paddingBottom: 10 }}>
                    <span style={{ color: '#7A8680' }}>Area Size</span>
                    <span style={{ fontWeight: 600, color: '#1A1D20' }}>{site.areaSize} m²</span>
                  </div>
                )}
                <div style={{ marginTop: 6 }}>
                  <span style={{ color: '#7A8680', display: 'block', marginBottom: 6, fontWeight: 600 }}>Description</span>
                  <p style={{ color: '#3A423D', lineHeight: 1.6, margin: 0, fontSize: 13.5 }}>
                    {site.description || 'No detailed excavation description recorded yet.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Site Location Card with Leaflet Map */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E8E5DF',
                borderRadius: 10,
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1D20', margin: 0 }}>
                  Site Location
                </h3>
                <span style={{ fontSize: 12, color: '#6A746E' }}>
                  {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </div>

              <div style={{ height: 280, borderRadius: 8, overflow: 'hidden', border: '1px solid #E8E5DF' }}>
                <MapContainer center={[lat, lng]} zoom={9} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>{site.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <button
                onClick={() => navigate('/map')}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#F9F8F5',
                  border: '1px solid #D8D4CC',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1A1D20',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#EFECE6')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#F9F8F5')}
              >
                <MapPin size={14} color="#31543D" /> View on Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab 2: Artifacts ─────────────────────────────────────── */}
      {activeTab === 'Artifacts' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 10, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={20} color="#31543D" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1D20' }}>
                  Artifacts Cataloged at this Site
                </h3>
              </div>
              <p style={{ fontSize: 13, color: '#6A746E', margin: '4px 0 0 0' }}>
                Inventory of recovered specimens, pottery, numismatics, and structural elements found at {site.name}.
              </p>
            </div>

            {canEdit && (
              <Link
                to={`/artifacts/new?site=${site._id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  background: '#31543D',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(49,84,61,0.15)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#254230')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#31543D')}
              >
                <Plus size={15} /> Catalog New Artifact
              </Link>
            )}
          </div>

          {artifactsLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6A746E' }}>
              <Loader2 size={32} color="#31543D" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Loading cataloged artifacts...</p>
            </div>
          ) : !siteArtifacts || siteArtifacts.length === 0 ? (
            <div
              style={{
                border: '1.5px dashed #D5DDD7',
                borderRadius: 10,
                padding: '48px 24px',
                textAlign: 'center',
                background: '#FAF9F6',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#EAE5DC',
                  color: '#31543D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Package size={26} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: '0 0 6px 0' }}>
                No Artifacts Cataloged Yet
              </h4>
              <p style={{ fontSize: 13.5, color: '#6A746E', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Catalog individual discoveries, seals, pottery sherds, numismatics, and architectural fragments registered under {site.name}.
              </p>
              {canEdit && (
                <Link
                  to={`/artifacts/new?site=${site._id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: '#31543D',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 13.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(49,84,61,0.2)',
                  }}
                >
                  <Plus size={16} /> Catalog First Artifact
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
              {siteArtifacts.map((art) => {
                const imgUrl = art.images?.[0]?.url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&auto=format&fit=crop&q=80';
                return (
                  <div
                    key={art._id}
                    onClick={() => navigate(`/artifacts/${art._id}`)}
                    style={{
                      border: '1px solid #E8E5DF',
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#31543D';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E8E5DF';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ height: 160, background: '#EAE5DC', overflow: 'hidden', position: 'relative' }}>
                      <img
                        src={imgUrl}
                        alt={art.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {art.artifactNumber && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'rgba(26,29,32,0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFF',
                            fontSize: 11,
                            padding: '2px 7px',
                            borderRadius: 4,
                            fontWeight: 600,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {art.artifactNumber}
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#1A1D20', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {art.name}
                      </h4>
                      <div style={{ fontSize: 12, color: '#6A746E', marginBottom: 10 }}>
                        {art.category} • {art.material || 'Archaeological Specimen'}
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F5F3EE' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: art.condition === 'Excellent' || art.condition === 'Good' ? '#E8F5E9' : '#FFF3E0',
                            color: art.condition === 'Excellent' || art.condition === 'Good' ? '#2E7D32' : '#E65100',
                          }}
                        >
                          {art.condition || 'Cataloged'}
                        </span>
                        <span style={{ fontSize: 12, color: '#31543D', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          Details <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 3: Field Logs ────────────────────────────────────── */}
      {activeTab === 'Field Logs' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 10, padding: '24px 28px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color="#31543D" />
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1A1D20' }}>
                  Field Excavation Logs
                </h3>
              </div>
              <p style={{ fontSize: 13, color: '#6A746E', margin: '4px 0 0 0' }}>
                Daily journals, stratigraphy recordings, environmental context, and findspot documentation for {site.name}.
              </p>
            </div>

            {canEdit && (
              <Link
                to={`/logs/new?site=${site._id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  background: '#31543D',
                  color: '#FFFFFF',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 2px 4px rgba(49,84,61,0.15)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#254230')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#31543D')}
              >
                <Plus size={15} /> Add Field Log
              </Link>
            )}
          </div>

          {logsLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6A746E' }}>
              <Loader2 size={32} color="#31543D" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Loading excavation logs...</p>
            </div>
          ) : !siteLogs || siteLogs.length === 0 ? (
            <div
              style={{
                border: '1.5px dashed #D5DDD7',
                borderRadius: 10,
                padding: '48px 24px',
                textAlign: 'center',
                background: '#FAF9F6',
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#EAE5DC',
                  color: '#31543D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <BookOpen size={26} />
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: '0 0 6px 0' }}>
                No Field Logs Recorded Yet
              </h4>
              <p style={{ fontSize: 13.5, color: '#6A746E', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Start recording daily excavation progress, trench layers, soil conditions, and discoveries made at {site.name}.
              </p>
              {canEdit && (
                <Link
                  to={`/logs/new?site=${site._id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: '#31543D',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    fontSize: 13.5,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(49,84,61,0.2)',
                  }}
                >
                  <Plus size={16} /> Record First Field Log
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {siteLogs.map((log) => {
                const logDate = log.date
                  ? new Date(log.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                const authorName = log.createdBy?.name || 'Field Researcher';
                const authorAvatar = log.createdBy?.avatar;
                const authorRole = log.createdBy?.role || 'Archaeologist';
                const plainFindings =
                  log.findings ||
                  (log.content
                    ? log.content.replace(/<[^>]+>/g, '').trim().slice(0, 180) + '...'
                    : '');

                return (
                  <div
                    key={log._id}
                    onClick={() => navigate(`/logs/${log._id}`)}
                    style={{
                      border: '1px solid #E8E5DF',
                      borderRadius: 8,
                      padding: '18px 20px',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#31543D';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E8E5DF';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1D20', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                          {log.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#6A746E' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} color="#31543D" />
                            <span>{logDate}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {authorAvatar ? (
                              <img
                                src={authorAvatar}
                                alt={authorName}
                                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  background: '#31543D',
                                  color: '#FFF',
                                  fontSize: 10,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                }}
                              >
                                {authorName.charAt(0)}
                              </div>
                            )}
                            <span style={{ fontWeight: 600, color: '#31543D' }}>{authorName}</span>
                            <span style={{ color: '#8A948E' }}>({authorRole})</span>
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#31543D',
                          whiteSpace: 'nowrap',
                          marginTop: 2,
                        }}
                      >
                        View Log <ChevronRight size={14} />
                      </span>
                    </div>

                    {plainFindings && (
                      <p
                        style={{
                          fontSize: 13.5,
                          color: '#4B5563',
                          lineHeight: 1.5,
                          margin: '0 0 12px 0',
                        }}
                      >
                        {plainFindings}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid #F5F3EE' }}>
                      {log.depth && (log.depth.layer || log.depth.from != null) && (
                        <span
                          style={{
                            fontSize: 11.5,
                            background: '#F0EFEA',
                            color: '#414942',
                            padding: '3px 9px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 500,
                          }}
                        >
                          <Layers size={12} color="#6A746E" />
                          <span>
                            {log.depth.from != null && log.depth.to != null
                              ? `Depth ${log.depth.from}m - ${log.depth.to}m`
                              : ''}
                            {log.depth.layer ? ` • ${log.depth.layer}` : ''}
                          </span>
                        </span>
                      )}

                      {log.weather && (log.weather.condition || log.weather.temperature != null) && (
                        <span
                          style={{
                            fontSize: 11.5,
                            background: '#E8F5E9',
                            color: '#2E7D32',
                            padding: '3px 9px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 500,
                          }}
                        >
                          <Sun size={12} />
                          <span>
                            {log.weather.condition || 'Clear'}
                            {log.weather.temperature != null ? ` • ${log.weather.temperature}°C` : ''}
                          </span>
                        </span>
                      )}

                      {log.attachments?.length > 0 && (
                        <span
                          style={{
                            fontSize: 11.5,
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            padding: '3px 9px',
                            borderRadius: 4,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontWeight: 500,
                          }}
                        >
                          <FileText size={12} />
                          <span>{log.attachments.length} file(s) attached</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Team ────────────────────────────────────────────── */}
      {activeTab === 'Team' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 8, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1A1D20' }}>
                Excavation Team & Research Staff
              </h3>
              <p style={{ fontSize: 13, color: '#6E7872', margin: '4px 0 0 0' }}>
                Field directors, archaeologists, and specialist researchers assigned to this project.
              </p>
            </div>

            {canManage && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: '#31543D',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <UserPlus size={14} /> Assign Team Member
              </button>
            )}
          </div>

          {/* Team Members List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {/* Site Creator Card */}
            {site.createdBy && (
              <div style={{ border: '1px solid #D1FAE5', background: '#F0FDF4', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {site.createdBy.avatar ? (
                    <img
                      src={site.createdBy.avatar}
                      alt={site.createdBy.name}
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #047857' }}
                    />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#047857', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                      {site.createdBy.name?.charAt(0) || 'P'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1D20' }}>{site.createdBy.name}</div>
                    <div style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>Principal Investigator / Director</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                  Project Lead
                </span>
              </div>
            )}

            {/* Assigned Members */}
            {site.teamMembers?.map((m) => {
              const u = m.user;
              if (!u) return null;
              return (
                <div key={m._id || u._id} style={{ border: '1px solid #E8E5DF', background: '#FFFFFF', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {u.avatar ? (
                      <img
                        src={u.avatar}
                        alt={u.name}
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #31543D' }}
                      />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#31543D', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                        {u.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D20' }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: '#6E7872' }}>{m.role || u.role || 'Field Assistant'}</div>
                      {u.expertise && u.expertise.length > 0 && (
                        <div style={{ fontSize: 11, color: '#8A948E', marginTop: 2 }}>{u.expertise[0]}</div>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${u.name} from this project?`)) {
                          removeMemberMutation.mutate(u._id);
                        }
                      }}
                      title="Remove from team"
                      style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: 6 }}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Team Member Modal */}
          {showAddMemberModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
              <div style={{ background: '#FFFFFF', borderRadius: 10, width: '100%', maxWidth: 460, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1D20', margin: 0 }}>Assign Team Member</h3>
                  <button onClick={() => setShowAddMemberModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6E7872' }}>
                    <CloseIcon size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                      Select Personnel / Field Staff Member
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #D5DDD7', fontSize: 13, background: '#FFF' }}
                    >
                      <option value="">-- Choose authorized staff member --</option>
                      {researchers
                        ?.filter((r) => r.role !== 'Viewer')
                        .map((r) => (
                          <option key={r._id} value={r._id}>
                            {r.name} ({r.role} - {r.institution || 'ASI'})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                      Select Excavation Project Assignment Role
                    </label>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #D5DDD7', fontSize: 13, background: '#FFF' }}
                    >
                      {EXCAVATION_PROJECT_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {memberRole === 'Other / Custom Duty' && (
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                        Specify Custom Duty / Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Archaeobotanist, Aerial Drone Specialist"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #D5DDD7', fontSize: 13 }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddMemberModal(false);
                        setSelectedUserId('');
                        setMemberRole('Field Assistant');
                        setCustomRole('');
                      }}
                      style={{ padding: '8px 16px', background: '#F3F4F6', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600, color: '#4B5563' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!selectedUserId || addMemberMutation.isLoading}
                      onClick={() => {
                        const finalRole = memberRole === 'Other / Custom Duty'
                          ? (customRole.trim() || 'Field Assistant')
                          : memberRole;
                        addMemberMutation.mutate({ userId: selectedUserId, role: finalRole });
                      }}
                      style={{ padding: '8px 18px', background: '#31543D', color: '#FFF', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer', fontWeight: 600, opacity: selectedUserId ? 1 : 0.5 }}
                    >
                      {addMemberMutation.isLoading ? 'Assigning...' : 'Assign Member'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 4: Map ───────────────────────────────────────────── */}
      {activeTab === 'Map' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 8, padding: 20, height: 500 }}>
          <MapContainer center={[lat, lng]} zoom={12} style={{ height: '100%', width: '100%', borderRadius: 6 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <Marker position={[lat, lng]}><Popup>{site.name}</Popup></Marker>
          </MapContainer>
        </div>
      )}

      {/* ─── Tab 5: Documents ─────────────────────────────────────── */}
      {activeTab === 'Documents' && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E5DF', borderRadius: 8, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Archival Documentation &amp; Permits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FAF9F6', borderRadius: 6, border: '1px solid #E8E5DF' }}>
              <FileText size={16} color="#31543D" />
              <span>Department of Antiquities Official Excavation Permit ({site.name})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#FAF9F6', borderRadius: 6, border: '1px solid #E8E5DF' }}>
              <FileText size={16} color="#31543D" />
              <span>Topographic Survey Elevation Data &amp; Benchmark Report</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Photo to Site Modal ─────────────────────────────── */}
      {showAddPhotoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#FFFFFF', borderRadius: 10, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A1D20', margin: 0 }}>Add Photo to Excavation Site</h3>
              <button onClick={() => setShowAddPhotoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6E7872' }}>
                <CloseIcon size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setPhotoInputType('upload')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: photoInputType === 'upload' ? '2px solid #31543D' : '1px solid #D8D4CC',
                  background: photoInputType === 'upload' ? '#EBF3ED' : '#FFF',
                  color: photoInputType === 'upload' ? '#1E3D2B' : '#495057',
                }}
              >
                Upload from Computer
              </button>
              <button
                type="button"
                onClick={() => setPhotoInputType('url')}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: photoInputType === 'url' ? '2px solid #31543D' : '1px solid #D8D4CC',
                  background: photoInputType === 'url' ? '#EBF3ED' : '#FFF',
                  color: photoInputType === 'url' ? '#1E3D2B' : '#495057',
                }}
              >
                Image URL
              </button>
            </div>

            {photoInputType === 'upload' ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                  Select Image File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #D5DDD7', borderRadius: 6, fontSize: 13 }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                  Direct Image Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #D5DDD7', borderRadius: 6, fontSize: 13 }}
                />
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: '#414942', display: 'block', marginBottom: 6 }}>
                Photo Caption (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. North Trench Stupa Foundation"
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #D5DDD7', borderRadius: 6, fontSize: 13 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                style={{ flex: 1, padding: '9px', background: '#F3F4F6', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={addPhotoMutation.isPending || (!newPhotoFile && !newPhotoUrl.trim())}
                onClick={() => {
                  addPhotoMutation.mutate({
                    file: photoInputType === 'upload' ? newPhotoFile : null,
                    url: photoInputType === 'url' ? newPhotoUrl.trim() : null,
                    caption: newPhotoCaption.trim(),
                  });
                }}
                style={{
                  flex: 1,
                  padding: '9px',
                  background: '#31543D',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: addPhotoMutation.isPending || (!newPhotoFile && !newPhotoUrl.trim()) ? 0.7 : 1,
                }}
              >
                {addPhotoMutation.isPending ? 'Uploading...' : 'Add Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1100px) {
          .dossier-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
