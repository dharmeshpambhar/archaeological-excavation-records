import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Save, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { sitesAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const ERAS = ['Prehistoric', 'Ancient', 'Classical', 'Medieval', 'Early Modern', 'Modern', 'Unknown'];
const STATUSES = ['Planned', 'Ongoing', 'Completed', 'On Hold'];

const HERITAGE_PRESETS = [
  { label: 'Nalanda Ruins', url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Sandstone Ruins', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Stone Columns', url: 'https://images.unsplash.com/photo-1608371945786-d47d3cdd31da?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Desert Trench', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Temple Masonry', url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Red Sandstone', url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80' },
];

const initialForm = {
  name: '', description: '', period: '', era: 'Unknown', status: 'Planned',
  coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
  location: { country: '', region: '', city: '', address: '', coordinates: { lat: null, lng: null } },
  startDate: '', totalDepth: '', areaSize: '', tags: '',
};

export default function CreateSitePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [markerPos, setMarkerPos] = useState(null);
  const [loading, setLoading] = useState(false);

  const setField = (path, value) => {
    setForm((prev) => {
      const parts = path.split('.');
      const updated = { ...prev };
      let cur = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  const handleMapClick = (coords) => {
    setMarkerPos(coords);
    setField('location.coordinates.lat', coords.lat);
    setField('location.coordinates.lng', coords.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cover = form.coverImage?.trim() || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80';
      const payload = {
        ...form,
        coverImage: cover,
        photos: [{ url: cover, caption: `${form.name || 'Site'} Cover Photo` }],
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        totalDepth: form.totalDepth ? Number(form.totalDepth) : 0,
        areaSize: form.areaSize ? Number(form.areaSize) : 0,
      };
      const { data } = await sitesAPI.create(payload);
      toast.success(`Site "${data.site.name}" created successfully!`);
      navigate(`/sites/${data.site._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button onClick={() => navigate('/sites')} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to Sites
          </button>
          <h1 className="page-title">Create Excavation Site</h1>
          <p className="page-subtitle">Document a new excavation location</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Site Information</h3>
              <div className="form-group">
                <label className="form-label">Site Name *</label>
                <input className="form-input" placeholder="e.g. Mohenjo-daro Extension Alpha" value={form.name}
                  onChange={(e) => setField('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" placeholder="Describe the excavation site, its significance, and what has been discovered..." style={{ minHeight: 140 }}
                  value={form.description} onChange={(e) => setField('description', e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Historical Period</label>
                  <input className="form-input" placeholder="e.g. Bronze Age, Roman Period" value={form.period}
                    onChange={(e) => setField('period', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Era</label>
                  <select className="form-select" value={form.era} onChange={(e) => setField('era', e.target.value)}>
                    {ERAS.map((era) => <option key={era} value={era}>{era}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Depth (m)</label>
                  <input type="number" className="form-input" placeholder="0.0" value={form.totalDepth}
                    onChange={(e) => setField('totalDepth', e.target.value)} min="0" step="0.1" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(comma-separated)</span></label>
                <input className="form-input" placeholder="Bronze Age, Urban, Harappan" value={form.tags}
                  onChange={(e) => setField('tags', e.target.value)} />
              </div>
            </div>

            {/* Cover Photo & Imagery */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 6 }}>Site Cover Photo</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Select an archaeological preset or enter a direct image URL. This photo will be featured in directory cards and the site header.
              </p>

              <div className="form-group">
                <label className="form-label">Cover Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={form.coverImage}
                  onChange={(e) => setField('coverImage', e.target.value)}
                />
              </div>

              {/* Quick Presets */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontSize: 12, marginBottom: 8 }}>Quick Heritage Presets</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {HERITAGE_PRESETS.map((p) => {
                    const isSelected = form.coverImage === p.url;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setField('coverImage', p.url)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #31543D' : '1px solid #D5DCD6',
                          background: isSelected ? '#EBF3ED' : '#FAFAF8',
                          color: isSelected ? '#1E3D2B' : '#495057',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {form.coverImage && (
                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E1D8', background: '#F8F6F1', position: 'relative', height: 180 }}>
                  <img
                    src={form.coverImage}
                    alt="Cover Preview"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.65)', color: '#FFF', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                    Live Cover Preview
                  </span>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', marginBottom: 20 }}>Location</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" placeholder="e.g. Pakistan" value={form.location.country}
                    onChange={(e) => setField('location.country', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Region / State</label>
                  <input className="form-input" placeholder="e.g. Sindh" value={form.location.region}
                    onChange={(e) => setField('location.region', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="e.g. Larkana" value={form.location.city}
                    onChange={(e) => setField('location.city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Area (sq. meters)</label>
                  <input type="number" className="form-input" placeholder="0" value={form.areaSize}
                    onChange={(e) => setField('areaSize', e.target.value)} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Address</label>
                <input className="form-input" placeholder="Near Mohenjo-daro Archaeological Site" value={form.location.address}
                  onChange={(e) => setField('location.address', e.target.value)} />
              </div>

              {/* Map Picker */}
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--color-terracotta)' }} />
                Click on the map to set coordinates
                {markerPos && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
                  </span>
                )}
              </label>
              <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', height: 280 }}>
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationPicker onSelect={handleMapClick} />
                  {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
                </MapContainer>
              </div>
              {markerPos && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Latitude</label>
                    <input className="form-input" value={markerPos.lat.toFixed(6)} readOnly style={{ background: 'var(--color-sand)' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Longitude</label>
                    <input className="form-input" value={markerPos.lng.toFixed(6)} readOnly style={{ background: 'var(--color-sand)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ position: 'sticky', top: 90 }}
          >
            <div className="card" style={{ padding: 28, marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginBottom: 16 }}>Site Summary</h3>
              {form.coverImage && (
                <div style={{ width: '100%', height: 120, borderRadius: 6, overflow: 'hidden', marginBottom: 14, border: '1px solid #E5E1D8' }}>
                  <img
                    src={form.coverImage}
                    alt="Summary Thumbnail"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=500&auto=format&fit=crop&q=80';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Name', value: form.name || 'Not set' },
                  { label: 'Era', value: form.era },
                  { label: 'Status', value: form.status },
                  { label: 'Location', value: form.location.country || 'Not set' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }} disabled={loading}>
              {loading ? (
                <><div className="spinner spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Creating Site...</>
              ) : (
                <><Save size={16} /> Create Excavation Site</>
              )}
            </button>
          </motion.div>
        </div>
      </form>

      <style>{`
        @media (max-width: 900px) {
          form > div { grid-template-columns: 1fr !important; }
          form > div > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  );
}
